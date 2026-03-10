import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseChartDirective } from 'ng2-charts';
import { ChartData, ChartOptions } from 'chart.js';
import { CentreDeGestionService } from '../../services/centre-de-gestion.service';
import { DossierAnalyseDto, DossierFilterDto } from '../../models/dossier-analyse.model';

@Component({
  selector: 'app-dossiers',
  standalone: true,
  imports: [CommonModule, FormsModule, BaseChartDirective],
  templateUrl: './dossiers.component.html',
  styleUrls: ['./dossiers.component.css'],
})
export class DossiersComponent implements OnInit {
  private readonly service = inject(CentreDeGestionService);

  // -------------------------------------------------------------------------
  // Signaux d'état
  // -------------------------------------------------------------------------
  readonly dossiers  = signal<DossierAnalyseDto[]>([]);
  readonly loading   = signal(false);
  readonly error     = signal<string | null>(null);

  /** Période sélectionnée pour le panneau de tendance détaillé */
  readonly selectedPeriode = signal<DossierAnalyseDto | null>(null);

  /** Panneau d'aide / guide des métriques */
  readonly showGuide = signal(false);

  // -------------------------------------------------------------------------
  // Filtre courant — initialisé sur l'année courante
  // -------------------------------------------------------------------------
  filter: DossierFilterDto = {
    anneeDebut:          new Date().getFullYear(),
    anneeFin:            new Date().getFullYear(),
    moisDebut:           '01',
    moisFin:             '12',
    typeDossierId:       null,
    etatDossierId:       null,
    centreDeGestionId:   null,
    tenantId:            null,
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

  // -------------------------------------------------------------------------
  // Statistiques globales calculées à partir des résultats
  // -------------------------------------------------------------------------
  readonly totaux = computed(() => {
    const data = this.dossiers();
    if (!data.length) return null;
    return {
      totalDossiers:      data.reduce((s, d) => s + d.totalDossiers,      0),
      dossiersComplets:   data.reduce((s, d) => s + d.dossiersComplets,   0),
      dossiersFermes:     data.reduce((s, d) => s + d.dossiersFermes,     0),
      dossiersRejetes:    data.reduce((s, d) => s + d.dossiersRejetes,    0),
      dossiersDepot:      data.reduce((s, d) => s + d.dossiersDepot,      0),
      dossiersReuverts:   data.reduce((s, d) => s + d.dossiersReuverts,   0),
      dossiersRattrapage: data.reduce((s, d) => s + d.dossiersRattrapage, 0),
    };
  });

  readonly tauxCompletGlobal = computed(() => {
    const t = this.totaux();
    if (!t || t.totalDossiers === 0) return 0;
    return Math.round((t.dossiersComplets / t.totalDossiers) * 100 * 100) / 100;
  });

  // -------------------------------------------------------------------------
  // Chart.js — histogramme d'évolution
  // -------------------------------------------------------------------------
  private trendColor(t: string | null, alpha = 0.8): string {
    if (t === 'hausse') return `rgba(34,197,94,${alpha})`;
    if (t === 'baisse') return `rgba(239,68,68,${alpha})`;
    if (t === 'stable') return `rgba(245,158,11,${alpha})`;
    return `rgba(148,163,184,${alpha})`;
  }

  readonly chartData = computed<ChartData<'bar'>>(() => {
    const data = this.dossiers();
    return {
      labels: data.map(d => `${this.moisLabel(d.mois).substring(0, 3)} ${d.annee}`),
      datasets: [
        {
          label: 'Dossiers',
          data: data.map(d => d.totalDossiers),
          backgroundColor: data.map(d => this.trendColor(d.tendance, 0.75)),
          borderColor:     data.map(d => this.trendColor(d.tendance, 1)),
          borderWidth: 1,
          borderRadius: 5,
          borderSkipped: false,
          yAxisID: 'y',
          order: 2,
        },
        {
          type: 'line' as const,
          label: 'Taux de complétude (%)',
          data: data.map(d => d.tauxComplet),
          borderColor: '#f59e0b',
          backgroundColor: 'rgba(245,158,11,0.08)',
          pointBackgroundColor: '#f59e0b',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
          tension: 0.35,
          fill: false,
          borderWidth: 2,
          yAxisID: 'yTaux',
          order: 1,
        } as any,
        {
          type: 'line' as const,
          label: 'Tendance',
          data: data.map(d => d.totalDossiers),
          borderColor: '#6366f1',
          backgroundColor: 'rgba(99,102,241,0.08)',
          pointBackgroundColor: data.map(d => this.trendColor(d.tendance, 1)),
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 5,
          pointHoverRadius: 7,
          tension: 0.35,
          fill: false,
          borderWidth: 2,
          yAxisID: 'y',
          order: 0,
        } as any,
      ],
    };
  });

  readonly chartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        labels: {
          filter: (item: any) => item.text === 'Tendance' || item.text === 'Taux de complétude (%)',
          usePointStyle: true,
          pointStyle: 'line',
          font: { size: 12 },
        },
      },
      tooltip: {
        callbacks: {
          label: ctx => {
            if (ctx.dataset.label === 'Taux de complétude (%)')
              return ` ${(ctx.parsed.y as number).toLocaleString('fr-FR', { minimumFractionDigits: 1 })} %`;
            return ` ${(ctx.parsed.y as number).toLocaleString('fr-FR')} dossiers`;
          },
        },
      },
    },
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 11 } } },
      y: { beginAtZero: true, ticks: { precision: 0 }, position: 'left' },
      yTaux: {
        beginAtZero: true,
        max: 100,
        position: 'right',
        grid: { drawOnChartArea: false },
        ticks: {
          callback: (v: any) => `${v} %`,
          font: { size: 10 },
        },
      },
    },
    onClick: (_event, elements) => {
      if (elements.length > 0) {
        const periode = this.dossiers()[elements[0].index];
        this.toggleDetail(periode);
      }
    },
  };

  // -------------------------------------------------------------------------
  // Cycle de vie
  // -------------------------------------------------------------------------
  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.selectedPeriode.set(null);

    this.service.getDossierAnalyse(this.filter).subscribe({
      next:  data => { this.dossiers.set(data);  this.loading.set(false); },
      error: err  => { this.error.set(err?.error?.message ?? err?.message ?? 'Erreur réseau'); this.loading.set(false); },
    });
  }

  // -------------------------------------------------------------------------
  // Interaction — panneau de tendance par période
  // -------------------------------------------------------------------------
  toggleDetail(periode: DossierAnalyseDto): void {
    this.selectedPeriode.update(cur => cur?.mois === periode.mois && cur?.annee === periode.annee ? null : periode);
  }

  isSelected(periode: DossierAnalyseDto): boolean {
    const sel = this.selectedPeriode();
    return sel?.annee === periode.annee && sel?.mois === periode.mois;
  }

  // -------------------------------------------------------------------------
  // Helpers d'affichage
  // -------------------------------------------------------------------------
  moisLabel(m: string): string {
    return this.mois.find(x => x.value === m)?.label ?? m;
  }

  barWidth(v: number): string {
    return `${Math.min(100, Math.max(0, v))}%`;
  }

  tendanceClass(d: DossierAnalyseDto): string {
    if (d.tendance === 'hausse') return 'trend-up';
    if (d.tendance === 'baisse') return 'trend-down';
    if (d.tendance === 'stable') return 'trend-stable';
    return 'trend-none';
  }

  tendanceIcon(d: DossierAnalyseDto): string {
    if (d.tendance === 'hausse') return '↑';
    if (d.tendance === 'baisse') return '↓';
    if (d.tendance === 'stable') return '→';
    return '—';
  }

  varClass(v: number | null | undefined): string {
    if (v == null) return 'var-none';
    if (v > 0)     return 'var-up';
    if (v < 0)     return 'var-down';
    return 'var-stable';
  }

  fmt(v: number | null): string {
    if (v === null || v === undefined) return '—';
    return v > 0 ? `+${v}` : `${v}`;
  }
}
