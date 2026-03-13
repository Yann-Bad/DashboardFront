import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseChartDirective } from 'ng2-charts';
import { ChartData, ChartOptions } from 'chart.js';
import { CentreDeGestionService } from '../../services/centre-de-gestion.service';
import {
  ImmatriculationAnalyseDto,
  ImmatriculationFilterDto,
} from '../../models/immatriculation-analyse.model';
import { CentreLookupDto } from '../../models/lookups.model';

@Component({
  selector: 'app-immatriculations',
  standalone: true,
  imports: [CommonModule, FormsModule, BaseChartDirective],
  templateUrl: './immatriculations.component.html',
  styleUrls: ['./immatriculations.component.css'],
})
export class ImmatriculationsComponent implements OnInit {
  private readonly service = inject(CentreDeGestionService);

  readonly showGuide = signal(false);
  readonly data    = signal<ImmatriculationAnalyseDto[]>([]);
  readonly loading = signal(false);
  readonly error   = signal<string | null>(null);
  readonly centres = signal<CentreLookupDto[]>([]);

  readonly selectedPeriode = signal<ImmatriculationAnalyseDto | null>(null);

  filter: ImmatriculationFilterDto = {
    anneeDebut:          new Date().getFullYear(),
    anneeFin:            new Date().getFullYear(),
    moisDebut:           '01',
    moisFin:             '12',
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
      nouveauxEmployeurs:  d.reduce((s, r) => s + r.nouveauxEmployeurs, 0),
      employeursValides:   d.reduce((s, r) => s + r.employeursValides, 0),
      employeursEnAttente: d.reduce((s, r) => s + r.employeursEnAttente, 0),
      nouveauxEmployes:    d.reduce((s, r) => s + r.nouveauxEmployes, 0),
      employesValides:     d.reduce((s, r) => s + r.employesValides, 0),
      employesEnAttente:   d.reduce((s, r) => s + r.employesEnAttente, 0),
      sorties:             d.reduce((s, r) => s + r.sorties, 0),
      effectifTotal:       d.reduce((s, r) => s + r.effectifTotal, 0),
      effectifEmploye:     d.reduce((s, r) => s + r.effectifEmploye, 0),
      effectifAssimile:    d.reduce((s, r) => s + r.effectifAssimile, 0),
    };
  });

  readonly tauxValidationEmployeurs = computed(() => {
    const t = this.totaux();
    if (!t || t.nouveauxEmployeurs === 0) return null;
    return Math.round(t.employeursValides / t.nouveauxEmployeurs * 10000) / 100;
  });

  readonly tauxValidationEmployes = computed(() => {
    const t = this.totaux();
    if (!t || t.nouveauxEmployes === 0) return null;
    return Math.round(t.employesValides / t.nouveauxEmployes * 10000) / 100;
  });

  // ── Chart.js ──
  readonly chartData = computed<ChartData<'bar' | 'line'>>(() => {
    const d = this.data();
    return {
      labels: d.map(r => `${this.moisLabel(r.mois)} ${r.annee}`),
      datasets: [
        {
          type: 'bar' as const,
          label: 'Nouveaux employeurs',
          data: d.map(r => r.nouveauxEmployeurs),
          backgroundColor: 'rgba(99,102,241,0.7)',
          borderRadius: 3,
          order: 2,
        },
        {
          type: 'bar' as const,
          label: 'Nouveaux employés',
          data: d.map(r => r.nouveauxEmployes),
          backgroundColor: 'rgba(14,165,233,0.7)',
          borderRadius: 3,
          order: 2,
        },
        {
          type: 'line' as const,
          label: 'Sorties',
          data: d.map(r => r.sorties),
          borderColor: '#ef4444',
          backgroundColor: 'rgba(239,68,68,0.1)',
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
          label: (ctx) => `${ctx.dataset.label}: ${this.fmtNombre(ctx.parsed.y)}`,
        },
      },
    },
    scales: {
      x: { grid: { display: false } },
      y: {
        beginAtZero: true,
        ticks: { callback: (v) => this.fmtNombre(+v) },
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
    this.service.getImmatriculationAnalyse(this.filter).subscribe({
      next: (d)  => { this.data.set(d); this.loading.set(false); },
      error: (e) => { this.error.set(e?.error?.message ?? 'Erreur serveur'); this.loading.set(false); },
    });
  }

  // ── Helpers ──
  toggleDetail(d: ImmatriculationAnalyseDto): void {
    this.selectedPeriode.set(this.isSelected(d) ? null : d);
  }

  isSelected(d: ImmatriculationAnalyseDto): boolean {
    const s = this.selectedPeriode();
    return !!s && s.annee === d.annee && s.mois === d.mois;
  }

  moisLabel(m: string): string {
    return this.mois.find(x => x.value === m)?.label ?? m;
  }

  fmtNombre(v: number | null | undefined): string {
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

  tendanceClass(d: ImmatriculationAnalyseDto): string {
    switch (d.tendance) {
      case 'hausse':  return 'trend-up';
      case 'baisse':  return 'trend-down';
      case 'stable':  return 'trend-stable';
      default:        return 'trend-none';
    }
  }

  tendanceIcon(d: ImmatriculationAnalyseDto): string {
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
