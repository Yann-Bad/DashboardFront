import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseChartDirective } from 'ng2-charts';
import { ChartData, ChartOptions } from 'chart.js';
import { CentreDeGestionService } from '../../services/centre-de-gestion.service';
import { DeclarationAnalyseDto, DeclarationFilterDto, MontantParDeviseDto } from '../../models/declaration-analyse.model';

@Component({
  selector: 'app-declarations',
  standalone: true,
  imports: [CommonModule, FormsModule, BaseChartDirective],
  templateUrl: './declarations.component.html',
  styleUrls: ['./declarations.component.css'],
})
export class DeclarationsComponent implements OnInit {
  private readonly service = inject(CentreDeGestionService);

  // -------------------------------------------------------------------------
  // Signaux d'état
  // -------------------------------------------------------------------------
  readonly declarations = signal<DeclarationAnalyseDto[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  /** Période sélectionnée pour le panneau de tendance détaillé */
  readonly selectedPeriode = signal<DeclarationAnalyseDto | null>(null);

  /** Panneau d'aide / guide des métriques */
  readonly showGuide = signal(false);

  // -------------------------------------------------------------------------
  // Filtre courant — initialisé sur l'année courante
  // -------------------------------------------------------------------------
  filter: DeclarationFilterDto = {
    anneeDebut:          new Date().getFullYear(),
    anneeFin:            new Date().getFullYear(),
    moisDebut:           '01',
    moisFin:             '12',
    valideesSeulement:   null,
    avecDetailParCentre: false,
  };

  readonly mois = [
    { value: '01', label: 'Janvier' },
    { value: '02', label: 'Février' },
    { value: '03', label: 'Mars' },
    { value: '04', label: 'Avril' },
    { value: '05', label: 'Mai' },
    { value: '06', label: 'Juin' },
    { value: '07', label: 'Juillet' },
    { value: '08', label: 'Août' },
    { value: '09', label: 'Septembre' },
    { value: '10', label: 'Octobre' },
    { value: '11', label: 'Novembre' },
    { value: '12', label: 'Décembre' },
  ];

  // -------------------------------------------------------------------------
  // Statistiques globales calculées à partir des résultats
  // -------------------------------------------------------------------------
  readonly totaux = computed(() => {
    const data = this.declarations();
    if (!data.length) return null;

    // Aggregate per-currency amounts across all periods
    const deviseMap = new Map<number, MontantParDeviseDto & { montantNonValide: number }>();
    for (const d of data) {
      for (const m of d.montantsParDevise ?? []) {
        const existing = deviseMap.get(m.deviseId);
        if (existing) {
          existing.montantTotal  += m.montantTotal;
          existing.montantValide += m.montantValide;
          existing.montantNonValide = existing.montantTotal - existing.montantValide;
        } else {
          deviseMap.set(m.deviseId, { ...m, montantNonValide: m.montantTotal - m.montantValide });
        }
      }
    }
    const montantsParDevise = [...deviseMap.values()].sort((a, b) => b.montantTotal - a.montantTotal);

    return {
      totalDeclarations:           data.reduce((s, d) => s + d.totalDeclarations, 0),
      declarationsValidees:        data.reduce((s, d) => s + d.declarationsValidees, 0),
      declarationsNonValidees:     data.reduce((s, d) => s + d.declarationsNonValidees, 0),
      declarationsRattrapage:      data.reduce((s, d) => s + d.declarationsRattrapage, 0),
      declarationsRedressees:      data.reduce((s, d) => s + d.declarationsRedressees, 0),
      declarationsComplementaires: data.reduce((s, d) => s + d.declarationsComplementaires, 0),
      totalTravailleursDeclares:   data.reduce((s, d) => s + d.totalTravailleursDeclares, 0),
      montantTotalDeclare:         data.reduce((s, d) => s + (d.montantTotalDeclare ?? 0), 0),
      montantValide:               data.reduce((s, d) => s + (d.montantValide ?? 0), 0),
      montantNonValide:            data.reduce((s, d) => s + (d.montantNonValide ?? 0), 0),
      montantsParDevise,
    };
  });

  readonly tauxValidationGlobal = computed(() => {
    const t = this.totaux();
    if (!t || t.totalDeclarations === 0) return 0;
    return Math.round((t.declarationsValidees / t.totalDeclarations) * 100 * 100) / 100;
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
    const data = this.declarations();
    return {
      labels: data.map(d => `${this.moisLabel(d.mois).substring(0, 3)} ${d.annee}`),
      datasets: [
        {
          label: 'Déclarations',
          data: data.map(d => d.totalDeclarations),
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
          label: 'Montant déclaré',
          data: data.map(d => d.montantTotalDeclare ?? 0),
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
          yAxisID: 'yMontant',
          order: 1,
        } as any,
        {
          type: 'line' as const,
          label: 'Tendance',
          data: data.map(d => d.totalDeclarations),
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
          filter: (item: any) => item.text === 'Tendance' || item.text === 'Montant déclaré',
          usePointStyle: true,
          pointStyle: 'line',
          font: { size: 12 },
        },
      },
      tooltip: {
        callbacks: {
          label: ctx => {
            if (ctx.dataset.label === 'Montant déclaré')
              return ` ${(ctx.parsed.y as number).toLocaleString('fr-FR', { minimumFractionDigits: 0 })} (montant)`;
            return ` ${(ctx.parsed.y as number).toLocaleString('fr-FR')} déclarations`;
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
        const periode = this.declarations()[elements[0].index];
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

    this.service.getDeclarationAnalyse(this.filter).subscribe({
      next: (data) => {
        this.declarations.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Erreur lors du chargement des déclarations :', err);
        this.error.set('Impossible de charger les données. Veuillez réessayer.');
        this.loading.set(false);
      },
    });
  }

  /** Sélectionne / désélectionne une période pour son panneau de tendance */
  toggleDetail(periode: DeclarationAnalyseDto): void {
    this.selectedPeriode.set(
      this.selectedPeriode() === periode ? null : periode
    );
  }

  /** Libellé du mois à partir de sa valeur */
  moisLabel(value: string): string {
    return this.mois.find((m) => m.value === value)?.label ?? value;
  }

  /** Largeur de la barre de progression (clamped 0–100) */
  barWidth(value: number): string {
    return `${Math.min(100, Math.max(0, value))}%`;
  }

  /** Classe CSS pour une tendance qualitative */
  tendanceClass(t: string | null): string {
    if (t === 'hausse') return 'trend-up';
    if (t === 'baisse') return 'trend-down';
    if (t === 'stable') return 'trend-stable';
    return 'trend-none';
  }

  /** Icône Unicode pour la tendance */
  tendanceIcon(t: string | null): string {
    if (t === 'hausse') return '↑';
    if (t === 'baisse') return '↓';
    if (t === 'stable') return '→';
    return '—';
  }

  /** Classe CSS pour une variation numérique (+/- /0) */
  varClass(v: number | null): string {
    if (v === null || v === undefined) return 'var-none';
    if (v > 0) return 'var-up';
    if (v < 0) return 'var-down';
    return 'var-stable';
  }

  /** Formate une variation avec signe explicite */
  fmt(v: number | null): string {
    if (v === null || v === undefined) return '—';
    return v > 0 ? `+${v}` : `${v}`;
  }

  /** Formate un montant en valeur lisible avec séparateurs (ex: 1 234 567) */
  fmtMontant(v: number | null | undefined): string {
    if (v === null || v === undefined) return '—';
    return v.toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  }

  /** Formate un montant avec son code devise (ex: "1 234 567 XOF") */
  fmtMontantDevise(v: number | null | undefined, devises: MontantParDeviseDto[] | null | undefined): string {
    const amount = this.fmtMontant(v);
    if (!devises?.length) return amount;
    const codes = [...new Set(devises.map(d => d.deviseCode).filter(Boolean))].join(' / ');
    return codes ? `${amount} ${codes}` : amount;
  }

  /** Formate une variation de montant avec signe et séparateurs */
  fmtMontantVar(v: number | null | undefined): string {
    if (v === null || v === undefined) return '—';
    const formatted = Math.abs(v).toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    return v > 0 ? `+${formatted}` : v < 0 ? `-${formatted}` : `${formatted}`;
  }
}
