import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseChartDirective } from 'ng2-charts';
import { ChartData, ChartOptions } from 'chart.js';
import { CentreDeGestionService } from '../../services/centre-de-gestion.service';
import { EncaissementAnalyseDto, EncaissementFilterDto } from '../../models/encaissement-analyse.model';

@Component({
  selector: 'app-encaissements',
  standalone: true,
  imports: [CommonModule, FormsModule, BaseChartDirective],
  templateUrl: './encaissements.component.html',
  styleUrls: ['./encaissements.component.css'],
})
export class EncaissementsComponent implements OnInit {
  private readonly service = inject(CentreDeGestionService);

  // -------------------------------------------------------------------------
  // Signaux d'état
  // -------------------------------------------------------------------------
  readonly showGuide = signal(false);
  readonly encaissements = signal<EncaissementAnalyseDto[]>([]);
  readonly loading        = signal(false);
  readonly error          = signal<string | null>(null);

  /** Période sélectionnée pour le panneau de tendance détaillé */
  readonly selectedPeriode = signal<EncaissementAnalyseDto | null>(null);

  // -------------------------------------------------------------------------
  // Filtre courant — initialisé sur l'année courante
  // -------------------------------------------------------------------------
  filter: EncaissementFilterDto = {
    anneeDebut:          new Date().getFullYear(),
    anneeFin:            new Date().getFullYear(),
    moisDebut:           '01',
    moisFin:             '12',
    avecDetailParCentre: false,
    granularite:         'mensuel',
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
    const data = this.encaissements();
    if (!data.length) return null;
    /** True if at least one period mixes local-currency equivalents from multiple source currencies.
     *  The aggregate amounts (montantPrincipal…) are correct in local currency but must be
     *  displayed with an "éq. local" annotation to avoid confusion. */
    const hasMixedCurrencies = data.some(d => d.hasMultipleCurrencies);
    return {
      totalEncaissements: data.reduce((s, d) => s + d.totalEncaissements, 0),
      totalEmployeurs:    data.reduce((s, d) => s + d.nombreEmployeursAyantPaye, 0),
      montantPrincipal:   data.reduce((s, d) => s + (d.montantPrincipal   ?? 0), 0),
      montantMajoration:  data.reduce((s, d) => s + (d.montantMajoration  ?? 0), 0),
      montantTaxation:    data.reduce((s, d) => s + (d.montantTaxation    ?? 0), 0),
      montant:            data.reduce((s, d) => s + (d.montant            ?? 0), 0),
      hasMixedCurrencies,
    };
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
    const data = this.encaissements();
    return {
      labels: data.map(d => this.shortPeriodLabel(d.mois, d.annee)),
      datasets: [
        {
          label: 'Encaissements',
          data: data.map(d => d.totalEncaissements),
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
          label: 'Montant encaissé',
          data: data.map(d => d.montant ?? 0),
          borderColor: '#14b8a6',
          backgroundColor: 'rgba(20,184,166,0.08)',
          pointBackgroundColor: '#14b8a6',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
          tension: 0.35,
          fill: false,
          borderWidth: 2,
          yAxisID: 'yMontant',
          order: 1,
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
        labels: { usePointStyle: true, pointStyle: 'line', font: { size: 12 } },
      },
      tooltip: {
        callbacks: {
          label: ctx => {
            if (ctx.dataset.label === 'Montant encaissé')
              return ` ${(ctx.parsed.y as number).toLocaleString('fr-FR', { minimumFractionDigits: 0 })} (montant)`;
            return ` ${(ctx.parsed.y as number).toLocaleString('fr-FR')} encaissements`;
          },
        },
      },
    },
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 11 } } },
      y: { beginAtZero: true, ticks: { precision: 0 }, position: 'left' },
      yMontant: {
        beginAtZero: true,
        position: 'right',
        grid: { drawOnChartArea: false },
        ticks: {
          callback: (v: any) => v.toLocaleString('fr-FR', { notation: 'compact' }),
          font: { size: 10 },
        },
      },
    },
    onClick: (_event, elements) => {
      if (elements.length > 0) {
        const periode = this.encaissements()[elements[0].index];
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

    this.service.getEncaissementAnalyse(this.filter).subscribe({
      next: data => {
        this.encaissements.set(data);
        this.loading.set(false);
      },
      error: err => {
        console.error('Erreur lors du chargement des encaissements :', err);
        this.error.set('Impossible de charger les données. Veuillez réessayer.');
        this.loading.set(false);
      },
    });
  }

  toggleDetail(periode: EncaissementAnalyseDto): void {
    this.selectedPeriode.set(this.selectedPeriode() === periode ? null : periode);
  }

  moisLabel(value: string): string {
    if (value === 'AN') return 'Annuel';
    if (value.startsWith('T')) return `Trimestre ${value.substring(1)}`;
    return this.mois.find(m => m.value === value)?.label ?? value;
  }

  shortPeriodLabel(mois: string, annee: number): string {
    if (mois === 'AN') return `${annee}`;
    if (mois.startsWith('T')) return `${mois} ${annee}`;
    return `${this.moisLabel(mois).substring(0, 3)} ${annee}`;
  }

  barWidth(value: number): string {
    return `${Math.min(100, Math.max(0, value))}%`;
  }

  tendanceClass(t: string | null): string {
    if (t === 'hausse') return 'trend-up';
    if (t === 'baisse') return 'trend-down';
    if (t === 'stable') return 'trend-stable';
    return 'trend-none';
  }

  tendanceIcon(t: string | null): string {
    if (t === 'hausse') return '↑';
    if (t === 'baisse') return '↓';
    if (t === 'stable') return '→';
    return '—';
  }

  varClass(v: number | null | undefined): string {
    if (v === null || v === undefined) return 'var-none';
    if (v > 0) return 'var-up';
    if (v < 0) return 'var-down';
    return 'var-stable';
  }

  fmt(v: number | null | undefined): string {
    if (v === null || v === undefined) return '—';
    return v > 0 ? `+${v}` : `${v}`;
  }

  fmtMontant(v: number | null | undefined): string {
    if (v === null || v === undefined) return '—';
    return v.toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  }

  fmtMontantVar(v: number | null | undefined): string {
    if (v === null || v === undefined) return '—';
    const formatted = Math.abs(v).toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    return v > 0 ? `+${formatted}` : v < 0 ? `-${formatted}` : `${formatted}`;
  }
}
