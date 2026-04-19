import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseChartDirective } from 'ng2-charts';
import { ChartData, ChartOptions } from 'chart.js';
import { CentreDeGestionService } from '../../services/centre-de-gestion.service';
import {
  LiquidationTrendDto,
  LiquidationTrendFilterDto,
  LiquidationBrancheSummary,
  PrestationAnalyseDto,
} from '../../models/liquidation-trend.model';
import { CentreLookupDto } from '../../models/lookups.model';

@Component({
  selector: 'app-liquidation-trends',
  standalone: true,
  imports: [CommonModule, FormsModule, BaseChartDirective],
  templateUrl: './liquidation-trends.component.html',
  styleUrls: ['./liquidation-trends.component.css'],
})
export class LiquidationTrendsComponent implements OnInit {
  private readonly service = inject(CentreDeGestionService);

  readonly data    = signal<LiquidationTrendDto | null>(null);
  readonly loading = signal(false);
  readonly error   = signal<string | null>(null);
  readonly centres = signal<CentreLookupDto[]>([]);

  filter: LiquidationTrendFilterDto = {
    anneeDebut: new Date().getFullYear(),
    anneeFin:   new Date().getFullYear(),
    moisDebut:  '01',
    moisFin:    String(new Date().getMonth() + 1).padStart(2, '0'),
    centreDeGestionId: null,
    granularite: 'trimestriel',
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

  // ── Summaries ──
  readonly summaryPf      = computed(() => this.data()?.totalPf ?? null);
  readonly summaryPension = computed(() => this.data()?.totalPension ?? null);
  readonly summaryRp      = computed(() => this.data()?.totalRp ?? null);

  readonly summaries = computed<{ label: string; icon: string; color: string; s: LiquidationBrancheSummary }[]>(() => {
    const d = this.data();
    if (!d) return [];
    return [
      { label: 'Prestations Familiales',  icon: '👨‍👩‍👧‍👦', color: 'indigo', s: d.totalPf },
      { label: 'Pensions (PVID)',          icon: '🏛️',    color: 'emerald', s: d.totalPension },
      { label: 'Risques Professionnels',   icon: '⚠️',    color: 'amber',   s: d.totalRp },
    ];
  });

  // ── Chart: Nombre de liquidations par période (3 séries) ──
  readonly chartCountData = computed<ChartData<'bar'>>(() => {
    const d = this.data();
    if (!d) return { labels: [], datasets: [] };
    const labels = d.pf.map(r => this.shortPeriodLabel(r.mois, r.annee));
    return {
      labels,
      datasets: [
        {
          label: 'PF',
          data: d.pf.map(r => r.nombreLiquidations),
          backgroundColor: 'rgba(99,102,241,0.7)',
          borderRadius: 3,
        },
        {
          label: 'PVID',
          data: d.pension.map(r => r.nombreLiquidations),
          backgroundColor: 'rgba(16,185,129,0.7)',
          borderRadius: 3,
        },
        {
          label: 'RP',
          data: d.rp.map(r => r.nombreLiquidations),
          backgroundColor: 'rgba(245,158,11,0.7)',
          borderRadius: 3,
        },
      ],
    };
  });

  readonly chartCountOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { position: 'bottom', labels: { boxWidth: 12, padding: 16, font: { size: 12 } } },
      tooltip: {
        callbacks: {
          label: (ctx) => `${ctx.dataset.label}: ${(ctx.parsed.y ?? 0).toLocaleString('fr-FR')}`,
        },
      },
    },
    scales: {
      x: { grid: { display: false } },
      y: { beginAtZero: true, ticks: { callback: (v) => (+v).toLocaleString('fr-FR') } },
    },
  };

  // ── Chart: Montant liquidé par période (3 séries) ──
  readonly chartAmountData = computed<ChartData<'bar'>>(() => {
    const d = this.data();
    if (!d) return { labels: [], datasets: [] };
    const labels = d.pf.map(r => this.shortPeriodLabel(r.mois, r.annee));
    return {
      labels,
      datasets: [
        {
          label: 'PF',
          data: d.pf.map(r => r.montantLiquide),
          backgroundColor: 'rgba(99,102,241,0.7)',
          borderRadius: 3,
        },
        {
          label: 'PVID',
          data: d.pension.map(r => r.montantLiquide),
          backgroundColor: 'rgba(16,185,129,0.7)',
          borderRadius: 3,
        },
        {
          label: 'RP',
          data: d.rp.map(r => r.montantLiquide),
          backgroundColor: 'rgba(245,158,11,0.7)',
          borderRadius: 3,
        },
      ],
    };
  });

  readonly chartAmountOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { position: 'bottom', labels: { boxWidth: 12, padding: 16, font: { size: 12 } } },
      tooltip: {
        callbacks: {
          label: (ctx) => `${ctx.dataset.label}: ${this.fmtMontant(ctx.parsed.y)}`,
        },
      },
    },
    scales: {
      x: { grid: { display: false } },
      y: { beginAtZero: true, ticks: { callback: (v) => this.fmtMontant(+v) } },
    },
  };

  // ── Chart: Taux de paiement par période (3 lignes) ──
  readonly chartRateData = computed<ChartData<'line'>>(() => {
    const d = this.data();
    if (!d) return { labels: [], datasets: [] };
    const labels = d.pf.map(r => this.shortPeriodLabel(r.mois, r.annee));
    return {
      labels,
      datasets: [
        {
          label: 'PF',
          data: d.pf.map(r => r.tauxPaiement ?? 0),
          borderColor: '#6366f1',
          backgroundColor: 'rgba(99,102,241,0.1)',
          pointRadius: 4,
          tension: 0.3,
          fill: false,
        },
        {
          label: 'PVID',
          data: d.pension.map(r => r.tauxPaiement ?? 0),
          borderColor: '#10b981',
          backgroundColor: 'rgba(16,185,129,0.1)',
          pointRadius: 4,
          tension: 0.3,
          fill: false,
        },
        {
          label: 'RP',
          data: d.rp.map(r => r.tauxPaiement ?? 0),
          borderColor: '#f59e0b',
          backgroundColor: 'rgba(245,158,11,0.1)',
          pointRadius: 4,
          tension: 0.3,
          fill: false,
        },
      ],
    };
  });

  readonly chartRateOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { position: 'bottom', labels: { boxWidth: 12, padding: 16, font: { size: 12 } } },
      tooltip: {
        callbacks: {
          label: (ctx) => `${ctx.dataset.label}: ${(ctx.parsed.y ?? 0).toFixed(1)} %`,
        },
      },
    },
    scales: {
      x: { grid: { display: false } },
      y: { beginAtZero: true, max: 100, ticks: { callback: (v) => `${v} %` } },
    },
  };

  // ── Combined table data (periods aligned across 3 branches) ──
  readonly tableData = computed(() => {
    const d = this.data();
    if (!d) return [];
    const map = new Map<string, { key: string; annee: number; mois: string; pf: PrestationAnalyseDto | null; pension: PrestationAnalyseDto | null; rp: PrestationAnalyseDto | null }>();
    const addBranch = (rows: PrestationAnalyseDto[], branch: 'pf' | 'pension' | 'rp') => {
      for (const r of rows) {
        const key = `${r.annee}-${r.mois}`;
        let entry = map.get(key);
        if (!entry) {
          entry = { key, annee: r.annee, mois: r.mois, pf: null, pension: null, rp: null };
          map.set(key, entry);
        }
        entry[branch] = r;
      }
    };
    addBranch(d.pf, 'pf');
    addBranch(d.pension, 'pension');
    addBranch(d.rp, 'rp');
    return [...map.values()].sort((a, b) => a.key.localeCompare(b.key));
  });

  ngOnInit(): void {
    this.service.getLookups().subscribe({
      next: (l) => this.centres.set(l.centres),
    });
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.service.getLiquidationTrend(this.filter).subscribe({
      next: (d)  => { this.data.set(d); this.loading.set(false); },
      error: (e) => { this.error.set(e?.error?.message ?? 'Erreur serveur'); this.loading.set(false); },
    });
  }

  // ── Helpers ──
  moisLabel(m: string): string {
    if (m === 'AN') return 'Annuel';
    if (m.startsWith('T'))  return `Trimestre ${m.substring(1)}`;
    return this.mois.find(x => x.value === m)?.label ?? m;
  }

  shortPeriodLabel(m: string, annee: number): string {
    if (m === 'AN') return `${annee}`;
    if (m.startsWith('T'))  return `${m} ${annee}`;
    return `${this.moisLabel(m).substring(0, 3)} ${annee}`;
  }

  fmtMontant(v: number | null | undefined): string {
    if (v == null) return '—';
    return Math.round(v).toLocaleString('fr-FR') + ' CDF';
  }

  fmtPct(v: number | null | undefined): string {
    if (v == null) return '—';
    return v.toFixed(1) + ' %';
  }

  fmtCount(v: number | null | undefined): string {
    if (v == null) return '—';
    return v.toLocaleString('fr-FR');
  }

  barWidth(v: number | null | undefined): string {
    if (v == null) return '0%';
    return Math.min(100, Math.max(0, v)).toFixed(1) + '%';
  }
}
