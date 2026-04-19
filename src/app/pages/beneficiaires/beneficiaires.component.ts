import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseChartDirective } from 'ng2-charts';
import { ChartData, ChartOptions } from 'chart.js';
import { CentreDeGestionService } from '../../services/centre-de-gestion.service';
import {
  BeneficiaireSummaryDto,
  BeneficiaireParBrancheDto,
  BeneficiaireFilterDto,
  BeneficiaireTrendDto,
} from '../../models/beneficiaire.model';
import { LookupsDto } from '../../models/lookups.model';

@Component({
  selector: 'app-beneficiaires',
  standalone: true,
  imports: [CommonModule, FormsModule, BaseChartDirective],
  templateUrl: './beneficiaires.component.html',
  styleUrl: './beneficiaires.component.css',
})
export class BeneficiairesComponent implements OnInit {
  private readonly service = inject(CentreDeGestionService);

  // ── Snapshot state ──
  data    = signal<BeneficiaireSummaryDto | null>(null);
  loading = signal(true);
  error   = signal<string | null>(null);
  lookups = signal<LookupsDto | null>(null);

  // ── Trend state ──
  trend        = signal<BeneficiaireTrendDto[]>([]);
  trendLoading = signal(false);

  // ── Filters ──
  centreId: number | null = null;
  filter: BeneficiaireFilterDto = {
    anneeDebut:  new Date().getFullYear(),
    anneeFin:    new Date().getFullYear(),
    moisDebut:   '01',
    moisFin:     String(new Date().getMonth() + 1).padStart(2, '0'),
    granularite: 'trimestriel',
  };

  /** Branche currently expanded (null = none) */
  expandedBrancheId: number | null = null;

  readonly brancheColors: Record<string, string> = {
    RP: 'green', PF: 'blue', PVID: 'purple',
  };

  readonly mois = [
    { value: '01', label: 'Janvier'   }, { value: '02', label: 'Février'   },
    { value: '03', label: 'Mars'      }, { value: '04', label: 'Avril'     },
    { value: '05', label: 'Mai'       }, { value: '06', label: 'Juin'      },
    { value: '07', label: 'Juillet'   }, { value: '08', label: 'Août'      },
    { value: '09', label: 'Septembre' }, { value: '10', label: 'Octobre'   },
    { value: '11', label: 'Novembre'  }, { value: '12', label: 'Décembre'  },
  ];

  readonly totalActifs = computed(() => this.data()?.totalBeneficiairesActifs ?? 0);

  // ── Chart ──
  readonly chartData = computed<ChartData<'line'>>(() => {
    const d = this.trend();
    return {
      labels: d.map(r => this.periodLabel(r.mois, r.annee)),
      datasets: [
        {
          label: 'Total',
          data: d.map(r => r.totalActifs),
          borderColor: '#6366f1',
          backgroundColor: 'rgba(99,102,241,0.1)',
          fill: true,
          tension: 0.3,
          pointRadius: 3,
          borderWidth: 2,
        },
        {
          label: 'RP',
          data: d.map(r => r.actifsRp),
          borderColor: '#22c55e',
          backgroundColor: 'transparent',
          borderDash: [5, 3],
          tension: 0.3,
          pointRadius: 2,
          borderWidth: 1.5,
        },
        {
          label: 'PF',
          data: d.map(r => r.actifsPf),
          borderColor: '#3b82f6',
          backgroundColor: 'transparent',
          borderDash: [5, 3],
          tension: 0.3,
          pointRadius: 2,
          borderWidth: 1.5,
        },
        {
          label: 'PVID',
          data: d.map(r => r.actifsPvid),
          borderColor: '#8b5cf6',
          backgroundColor: 'transparent',
          borderDash: [5, 3],
          tension: 0.3,
          pointRadius: 2,
          borderWidth: 1.5,
        },
      ],
    };
  });

  readonly chartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { position: 'top', labels: { usePointStyle: true, padding: 16 } },
      tooltip: {
        callbacks: {
          label: ctx => `${ctx.dataset.label}: ${(ctx.parsed.y ?? 0).toLocaleString('fr-FR')}`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        ticks: { callback: v => Number(v).toLocaleString('fr-FR') },
      },
    },
  };

  // ── Selected trend row ──
  readonly selectedPeriode = signal<BeneficiaireTrendDto | null>(null);

  ngOnInit(): void {
    this.service.getLookups().subscribe(l => this.lookups.set(l));
    this.load();
  }

  load(): void {
    this.loadSnapshot();
    this.loadTrend();
  }

  loadSnapshot(): void {
    this.loading.set(true);
    this.error.set(null);
    const f: BeneficiaireFilterDto = { ...this.filter };
    if (this.centreId != null) f.centreDeGestionId = this.centreId;

    this.service.getBeneficiairesParBranche(f).subscribe({
      next: d => { this.data.set(d); this.loading.set(false); },
      error: () => { this.error.set('Impossible de charger les bénéficiaires.'); this.loading.set(false); },
    });
  }

  loadTrend(): void {
    this.trendLoading.set(true);
    const f: BeneficiaireFilterDto = { ...this.filter };
    if (this.centreId != null) f.centreDeGestionId = this.centreId;

    this.service.getBeneficiaireTrend(f).subscribe({
      next: d => { this.trend.set(d); this.trendLoading.set(false); },
      error: () => { this.trendLoading.set(false); },
    });
  }

  toggleBranche(id: number): void {
    this.expandedBrancheId = this.expandedBrancheId === id ? null : id;
  }

  selectPeriode(row: BeneficiaireTrendDto): void {
    this.selectedPeriode.set(this.selectedPeriode() === row ? null : row);
  }

  pct(part: number, total: number): string {
    if (!total) return '0';
    return (part / total * 100).toFixed(1);
  }

  brancheColor(code: string | null): string {
    return this.brancheColors[code ?? ''] ?? 'slate';
  }

  periodLabel(mois: string, annee: number): string {
    if (mois === 'AN') return `${annee}`;
    if (mois.startsWith('T')) return `${mois} ${annee}`;
    const m = this.mois.find(m => m.value === mois);
    return m ? `${m.label.slice(0, 3)} ${annee}` : `${mois}/${annee}`;
  }

  trendColor(tendance: string | null): string {
    if (tendance === 'hausse') return '#22c55e';
    if (tendance === 'baisse') return '#ef4444';
    return '#64748b';
  }
}
