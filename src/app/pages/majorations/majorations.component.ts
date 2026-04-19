import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseChartDirective } from 'ng2-charts';
import { ChartData, ChartOptions } from 'chart.js';
import { CentreDeGestionService } from '../../services/centre-de-gestion.service';
import {
  MajorationTaxationAnalyseDto,
  MajorationTaxationFilterDto,
} from '../../models/majoration-taxation-analyse.model';
import { CentreLookupDto } from '../../models/lookups.model';

@Component({
  selector: 'app-majorations',
  standalone: true,
  imports: [CommonModule, FormsModule, BaseChartDirective],
  templateUrl: './majorations.component.html',
  styleUrls: ['./majorations.component.css'],
})
export class MajorationsComponent implements OnInit {
  private readonly service = inject(CentreDeGestionService);

  readonly showGuide = signal(false);
  readonly data    = signal<MajorationTaxationAnalyseDto[]>([]);
  readonly loading = signal(false);
  readonly error   = signal<string | null>(null);
  readonly centres = signal<CentreLookupDto[]>([]);

  readonly selectedPeriode = signal<MajorationTaxationAnalyseDto | null>(null);

  filter: MajorationTaxationFilterDto = {
    anneeDebut:          new Date().getFullYear(),
    anneeFin:            new Date().getFullYear(),
    moisDebut:           '01',
    moisFin:             String(new Date().getMonth() + 1).padStart(2, '0'),
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
  // Totaux
  // -------------------------------------------------------------------------
  readonly totaux = computed(() => {
    const d = this.data();
    if (!d.length) return null;
    return {
      nombreMajorations:        d.reduce((s, i) => s + i.nombreMajorations, 0),
      montantMajoration:        d.reduce((s, i) => s + i.montantMajoration, 0),
      nombreEmployeursMajores:  new Set(d.flatMap(() => [])).size || d.reduce((s, i) => s + i.nombreEmployeursMajores, 0),
      nombreTaxations:          d.reduce((s, i) => s + i.nombreTaxations, 0),
      montantTaxation:          d.reduce((s, i) => s + i.montantTaxation, 0),
      nombreEmployeursTaxes:    d.reduce((s, i) => s + i.nombreEmployeursTaxes, 0),
      montantTotal:             d.reduce((s, i) => s + i.montantTotal, 0),
      montantMajorationRecouvre: d.reduce((s, i) => s + i.montantMajorationRecouvre, 0),
      montantTaxationRecouvre:  d.reduce((s, i) => s + i.montantTaxationRecouvre, 0),
      taxationsValidees:        d.reduce((s, i) => s + i.taxationsValidees, 0),
      taxationsAnnulees:        d.reduce((s, i) => s + i.taxationsAnnulees, 0),
    };
  });

  readonly tauxRecouvrementGlobalMaj = computed(() => {
    const t = this.totaux();
    if (!t || t.montantMajoration === 0) return null;
    return Math.round(t.montantMajorationRecouvre / t.montantMajoration * 100 * 100) / 100;
  });

  readonly tauxRecouvrementGlobalTax = computed(() => {
    const t = this.totaux();
    if (!t || t.montantTaxation === 0) return null;
    return Math.round(t.montantTaxationRecouvre / t.montantTaxation * 100 * 100) / 100;
  });

  // -------------------------------------------------------------------------
  // Chart — stacked bar (majoration + taxation)
  // -------------------------------------------------------------------------
  readonly chartData = computed<ChartData<'bar'>>(() => {
    const d = this.data();
    return {
      labels: d.map(i => `${this.moisLabel(i.mois).substring(0, 3)} ${i.annee}`),
      datasets: [
        {
          label: 'Majorations',
          data: d.map(i => i.montantMajoration),
          backgroundColor: 'rgba(239,68,68,0.70)',
          borderColor: 'rgba(239,68,68,1)',
          borderWidth: 1,
          borderRadius: 4,
          stack: 'montants',
        },
        {
          label: 'Taxations',
          data: d.map(i => i.montantTaxation),
          backgroundColor: 'rgba(245,158,11,0.70)',
          borderColor: 'rgba(245,158,11,1)',
          borderWidth: 1,
          borderRadius: 4,
          stack: 'montants',
        },
        {
          type: 'line' as const,
          label: 'Recouvrement maj.',
          data: d.map(i => i.montantMajorationRecouvre),
          borderColor: '#10b981',
          backgroundColor: 'rgba(16,185,129,0.08)',
          pointBackgroundColor: '#10b981',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 4,
          tension: 0.35,
          fill: false,
          borderWidth: 2,
          yAxisID: 'y',
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
        labels: { usePointStyle: true, font: { size: 12 } },
      },
      tooltip: {
        callbacks: {
          label: ctx => ` ${ctx.dataset.label}: ${(ctx.parsed.y as number).toLocaleString('fr-FR')}`,
        },
      },
    },
    scales: {
      x: { stacked: true, grid: { display: false }, ticks: { font: { size: 11 } } },
      y: { stacked: true, beginAtZero: true, ticks: { precision: 0 }, position: 'left' },
    },
  };

  // -------------------------------------------------------------------------
  // Lifecycle
  // -------------------------------------------------------------------------
  ngOnInit(): void {
    this.service.getLookups().subscribe({
      next: lk => this.centres.set(lk.centres),
    });
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.selectedPeriode.set(null);
    this.service.getMajorationTaxationAnalyse(this.filter).subscribe({
      next:  d => { this.data.set(d); this.loading.set(false); },
      error: err => {
        this.error.set(err?.error?.message ?? err?.message ?? 'Erreur réseau');
        this.loading.set(false);
      },
    });
  }

  // -------------------------------------------------------------------------
  // Interaction
  // -------------------------------------------------------------------------
  toggleDetail(p: MajorationTaxationAnalyseDto): void {
    this.selectedPeriode.update(cur =>
      cur?.mois === p.mois && cur?.annee === p.annee ? null : p);
  }

  isSelected(p: MajorationTaxationAnalyseDto): boolean {
    const s = this.selectedPeriode();
    return s?.annee === p.annee && s?.mois === p.mois;
  }

  // -------------------------------------------------------------------------
  // Helpers
  // -------------------------------------------------------------------------
  moisLabel(m: string): string {
    return this.mois.find(x => x.value === m)?.label ?? m;
  }

  fmtMontant(v: number | null | undefined): string {
    if (v == null) return '—';
    return v.toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  }

  fmtPct(v: number | null | undefined): string {
    if (v == null) return '—';
    return v.toLocaleString('fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + ' %';
  }

  fmtTaux(v: number | null | undefined): string {
    if (v == null) return '—';
    return (v * 100).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' %';
  }

  barWidth(v: number): string {
    return `${Math.min(100, Math.max(0, v))}%`;
  }

  tendanceClass(d: MajorationTaxationAnalyseDto): string {
    if (d.tendance === 'hausse') return 'trend-up';
    if (d.tendance === 'baisse') return 'trend-down';
    if (d.tendance === 'stable') return 'trend-stable';
    return 'trend-none';
  }

  tendanceIcon(d: MajorationTaxationAnalyseDto): string {
    if (d.tendance === 'hausse') return '↑';
    if (d.tendance === 'baisse') return '↓';
    if (d.tendance === 'stable') return '→';
    return '—';
  }

  varClass(v: number | null): string {
    if (v == null) return 'var-none';
    if (v > 0) return 'var-up';
    if (v < 0) return 'var-down';
    return 'var-stable';
  }

  fmt(v: number | null): string {
    if (v == null) return '—';
    return v > 0 ? `+${this.fmtMontant(v)}` : this.fmtMontant(v);
  }
}
