import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseChartDirective } from 'ng2-charts';
import { ChartData, ChartOptions } from 'chart.js';
import { CentreDeGestionService } from '../../services/centre-de-gestion.service';
import {
  RecouvrementAnalyseDto,
  RecouvrementFilterDto,
} from '../../models/recouvrement-analyse.model';
import { CentreDeGestionSummaryDto } from '../../models/centre-de-gestion.model';

@Component({
  selector: 'app-recouvrement',
  standalone: true,
  imports: [CommonModule, FormsModule, BaseChartDirective],
  templateUrl: './recouvrement.component.html',
  styleUrls: ['./recouvrement.component.css'],
})
export class RecouvrementComponent implements OnInit {
  private readonly svc = inject(CentreDeGestionService);

  // ── State ──
  showGuide = signal(false);
  data = signal<RecouvrementAnalyseDto[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  centres = signal<CentreDeGestionSummaryDto[]>([]);
  selectedRow = signal<number | null>(null);

  // ── Filter ──
  filter: RecouvrementFilterDto = {
    anneeDebut: new Date().getFullYear(),
    anneeFin: new Date().getFullYear(),
    moisDebut: 1,
    moisFin: new Date().getMonth() + 1,
    topEmployeurs: 10,
    avecDetailParCentre: false,
  };

  readonly mois = [
    { value: 1,  label: 'Janvier'   }, { value: 2,  label: 'Février'   },
    { value: 3,  label: 'Mars'      }, { value: 4,  label: 'Avril'     },
    { value: 5,  label: 'Mai'       }, { value: 6,  label: 'Juin'      },
    { value: 7,  label: 'Juillet'   }, { value: 8,  label: 'Août'      },
    { value: 9,  label: 'Septembre' }, { value: 10, label: 'Octobre'   },
    { value: 11, label: 'Novembre'  }, { value: 12, label: 'Décembre'  },
  ];

  // ── Totaux ──
  totaux = computed(() => {
    const d = this.data();
    return {
      facturation: d.reduce((s, r) => s + r.totalFacturation, 0),
      recouvrement: d.reduce((s, r) => s + r.totalRecouvrement, 0),
      solde: d.reduce((s, r) => s + r.totalSolde, 0),
      soldeDebit: d.reduce((s, r) => s + r.totalSoldeDebit, 0),
      soldeCredit: d.reduce((s, r) => s + r.totalSoldeCredit, 0),
      employeurs: d.reduce((s, r) => s + r.nombreEmployeurs, 0),
      liaisons: d.reduce((s, r) => s + r.nombreLiaisons, 0),
      liaisonsValidees: d.reduce((s, r) => s + r.liaisonsValidees, 0),
      liaisonsPayees: d.reduce((s, r) => s + r.liaisonsPayees, 0),
      balances: d.reduce((s, r) => s + r.nombreBalances, 0),
      montantLiaison: d.reduce((s, r) => s + r.totalMontantLiaison, 0),
      montantRestant: d.reduce((s, r) => s + r.totalMontantRestant, 0),
    };
  });

  tauxGlobal = computed(() => {
    const t = this.totaux();
    return t.facturation > 0
      ? Math.round((t.recouvrement / t.facturation) * 10000) / 100
      : 0;
  });

  tauxLiaisonValidation = computed(() => {
    const t = this.totaux();
    return t.liaisons > 0
      ? Math.round((t.liaisonsValidees / t.liaisons) * 10000) / 100
      : 0;
  });

  tauxLiaisonPaiement = computed(() => {
    const t = this.totaux();
    return t.liaisons > 0
      ? Math.round((t.liaisonsPayees / t.liaisons) * 10000) / 100
      : 0;
  });

  // ── Chart ──
  chartData = computed<ChartData<'bar' | 'line'>>(() => {
    const d = this.data();
    return {
      labels: d.map((r) => r.periode),
      datasets: [
        {
          type: 'bar' as const,
          label: 'Facturation',
          data: d.map((r) => r.totalFacturation),
          backgroundColor: '#6366f1',
          borderRadius: 4,
          order: 2,
        },
        {
          type: 'bar' as const,
          label: 'Recouvrement',
          data: d.map((r) => r.totalRecouvrement),
          backgroundColor: '#22c55e',
          borderRadius: 4,
          order: 2,
        },
        {
          type: 'line' as const,
          label: 'Solde impayé',
          data: d.map((r) => r.totalSolde),
          borderColor: '#ef4444',
          backgroundColor: 'rgba(239,68,68,0.08)',
          fill: true,
          tension: 0.3,
          pointRadius: 3,
          order: 1,
        },
      ],
    };
  });

  chartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { position: 'bottom', labels: { usePointStyle: true, padding: 16 } },
      tooltip: {
        callbacks: {
          label: (ctx) => `${ctx.dataset.label}: ${this.fmtNombre(ctx.parsed.y ?? 0)}`,
        },
      },
    },
    scales: {
      x: { grid: { display: false } },
      y: {
        beginAtZero: true,
        ticks: { callback: (v) => this.fmtNombre(v as number) },
      },
    },
  };

  // ── Lifecycle ──
  ngOnInit(): void {
    this.svc
      .getAll({ page: 1, pageSize: 200 })
      .subscribe({ next: (r) => this.centres.set(r.data) });
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.selectedRow.set(null);
    this.svc.getRecouvrementAnalyse(this.filter).subscribe({
      next: (d) => {
        this.data.set(d);
        this.loading.set(false);
      },
      error: (e) => {
        this.error.set(e?.error?.message ?? 'Erreur lors du chargement');
        this.loading.set(false);
      },
    });
  }

  toggleRow(i: number): void {
    this.selectedRow.set(this.selectedRow() === i ? null : i);
  }

  // ── Helpers ──
  fmtNombre(n: number): string {
    if (n == null) return '—';
    return n.toLocaleString('fr-FR');
  }

  fmtPct(n: number): string {
    return n.toFixed(2).replace('.', ',') + ' %';
  }

  barWidth(pct: number): string {
    return Math.min(Math.max(pct, 0), 100) + '%';
  }

  tendanceClass(t: string): string {
    if (t === 'hausse') return 'trend-up';
    if (t === 'baisse') return 'trend-down';
    if (t === 'stable') return 'trend-stable';
    return 'trend-none';
  }

  tendanceIcon(t: string): string {
    if (t === 'hausse') return '▲';
    if (t === 'baisse') return '▼';
    if (t === 'stable') return '●';
    return '—';
  }

  varClass(v: number): string {
    if (v > 0) return 'var-up';
    if (v < 0) return 'var-down';
    return 'var-stable';
  }

  fmt(v: number): string {
    const sign = v > 0 ? '+' : '';
    return sign + v.toFixed(2).replace('.', ',') + ' %';
  }
}
