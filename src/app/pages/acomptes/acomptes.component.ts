import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseChartDirective } from 'ng2-charts';
import { ChartData, ChartOptions } from 'chart.js';
import { CentreDeGestionService } from '../../services/centre-de-gestion.service';
import {
  AcompteAnalyseDto,
  AcompteFilterDto,
} from '../../models/acompte-analyse.model';
import { CentreLookupDto } from '../../models/lookups.model';

@Component({
  selector: 'app-acomptes',
  standalone: true,
  imports: [CommonModule, FormsModule, BaseChartDirective],
  templateUrl: './acomptes.component.html',
  styleUrls: ['./acomptes.component.css'],
})
export class AcomptesComponent implements OnInit {
  private readonly service = inject(CentreDeGestionService);

  readonly showGuide = signal(false);
  readonly data    = signal<AcompteAnalyseDto[]>([]);
  readonly loading = signal(false);
  readonly error   = signal<string | null>(null);
  readonly centres = signal<CentreLookupDto[]>([]);

  readonly selectedPeriode = signal<AcompteAnalyseDto | null>(null);

  filter: AcompteFilterDto = {
    anneeDebut:          new Date().getFullYear(),
    anneeFin:            new Date().getFullYear(),
    moisDebut:           '01',
    moisFin:             String(new Date().getMonth() + 1).padStart(2, '0'),
    centreDeGestionId:   null,
    tenantId:            undefined,
    avecDetailParCentre: false,
  };

  readonly mois = [
    { value: '01', label: 'Janvier'   },
    { value: '02', label: 'Février'   },
    { value: '03', label: 'Mars'      },
    { value: '04', label: 'Avril'     },
    { value: '05', label: 'Mai'       },
    { value: '06', label: 'Juin'      },
    { value: '07', label: 'Juillet'   },
    { value: '08', label: 'Août'      },
    { value: '09', label: 'Septembre' },
    { value: '10', label: 'Octobre'   },
    { value: '11', label: 'Novembre'  },
    { value: '12', label: 'Décembre'  },
  ];

  // ── Totaux calculés ──
  readonly totaux = computed(() => {
    const d = this.data();
    if (!d.length) return null;
    return {
      nombreAcomptes:   d.reduce((s, r) => s + r.nombreAcomptes, 0),
      montantInitial:   d.reduce((s, r) => s + r.montantInitial, 0),
      montantConsomme:  d.reduce((s, r) => s + r.montantConsomme, 0),
      montantRestant:   d.reduce((s, r) => s + r.montantRestant, 0),
      nonConsommes:     d.reduce((s, r) => s + r.nonConsommes, 0),
      consommes:        d.reduce((s, r) => s + r.consommes, 0),
      montantRecouvre:  d.reduce((s, r) => s + r.montantAcompteRecouvre, 0),
    };
  });

  readonly tauxConsommationGlobal = computed(() => {
    const t = this.totaux();
    if (!t || t.montantInitial === 0) return null;
    return Math.round(t.montantConsomme / t.montantInitial * 10000) / 100;
  });

  readonly tauxRecouvrementGlobal = computed(() => {
    const t = this.totaux();
    if (!t || t.montantInitial === 0) return null;
    return Math.round(t.montantRecouvre / t.montantInitial * 10000) / 100;
  });

  // ── Chart.js ──
  readonly chartData = computed<ChartData<'bar' | 'line'>>(() => {
    const d = this.data();
    return {
      labels: d.map(r => `${this.moisLabel(r.mois)} ${r.annee}`),
      datasets: [
        {
          type: 'bar' as const,
          label: 'Montant initial',
          data: d.map(r => r.montantInitial),
          backgroundColor: 'rgba(99,102,241,0.7)',
          borderRadius: 3,
          order: 2,
        },
        {
          type: 'bar' as const,
          label: 'Montant consommé',
          data: d.map(r => r.montantConsomme),
          backgroundColor: 'rgba(245,158,11,0.7)',
          borderRadius: 3,
          order: 2,
        },
        {
          type: 'line' as const,
          label: 'Solde restant',
          data: d.map(r => r.montantRestant),
          borderColor: '#16a34a',
          backgroundColor: 'rgba(22,163,106,0.1)',
          pointRadius: 4,
          tension: 0.3,
          fill: true,
          order: 1,
        },
      ],
    };
  });

  readonly chartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { position: 'bottom', labels: { boxWidth: 12, padding: 16, font: { size: 12 } } },
      tooltip: {
        callbacks: {
          label: (ctx) => `${ctx.dataset.label}: ${this.fmtMontant(ctx.parsed.y)} CDF`,
        },
      },
    },
    scales: {
      x: { grid: { display: false } },
      y: {
        beginAtZero: true,
        ticks: { callback: (v) => this.fmtMontant(+v) },
      },
    },
  };

  ngOnInit(): void {
    this.service.getLookups().subscribe({
      next: (l) => this.centres.set(l.centres),
    });
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.selectedPeriode.set(null);
    this.service.getAcompteAnalyse(this.filter).subscribe({
      next: (d)  => { this.data.set(d); this.loading.set(false); },
      error: (e) => { this.error.set(e?.error?.message ?? 'Erreur serveur'); this.loading.set(false); },
    });
  }

  // ── Helpers ──
  toggleDetail(d: AcompteAnalyseDto): void {
    this.selectedPeriode.set(this.isSelected(d) ? null : d);
  }

  isSelected(d: AcompteAnalyseDto): boolean {
    const s = this.selectedPeriode();
    return !!s && s.annee === d.annee && s.mois === d.mois;
  }

  moisLabel(m: string): string {
    return this.mois.find(x => x.value === m)?.label ?? m;
  }

  fmtMontant(v: number | null | undefined): string {
    if (v == null) return '—';
    return Math.round(v).toLocaleString('fr-FR');
  }

  fmtPct(v: number | null | undefined): string {
    if (v == null) return '—';
    return v.toFixed(1) + ' %';
  }

  barWidth(v: number): string {
    return Math.min(100, Math.max(0, v)).toFixed(1) + '%';
  }

  tendanceClass(d: AcompteAnalyseDto): string {
    switch (d.tendance) {
      case 'hausse':  return 'trend-up';
      case 'baisse':  return 'trend-down';
      case 'stable':  return 'trend-stable';
      default:        return 'trend-none';
    }
  }

  tendanceIcon(d: AcompteAnalyseDto): string {
    switch (d.tendance) {
      case 'hausse':  return '▲';
      case 'baisse':  return '▼';
      case 'stable':  return '■';
      default:        return '●';
    }
  }

  varClass(v: number | null | undefined): string {
    if (v == null) return 'var-none';
    return v > 0 ? 'var-up' : v < 0 ? 'var-down' : 'var-stable';
  }

  fmt(v: number | null | undefined): string {
    if (v == null) return '—';
    const prefix = v > 0 ? '+' : '';
    return prefix + Math.round(v).toLocaleString('fr-FR');
  }
}
