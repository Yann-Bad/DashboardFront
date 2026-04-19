import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseChartDirective } from 'ng2-charts';
import { ChartData, ChartOptions } from 'chart.js';
import { CentreDeGestionService } from '../../services/centre-de-gestion.service';
import {
  PrestationAnalyseDto,
  PrestationFilterDto,
} from '../../models/prestation-analyse.model';
import { CentreLookupDto, TypePrestationLookupDto } from '../../models/lookups.model';

interface BrancheTab {
  code: string;
  label: string;
  icon: string;
  brancheId: number;          // maps to frontofficeprestation.branche_id
  beneficiaireLabel: string;  // contextual label for "Employés" column
}

@Component({
  selector: 'app-prestations',
  standalone: true,
  imports: [CommonModule, FormsModule, BaseChartDirective],
  templateUrl: './prestations.component.html',
  styleUrls: ['./prestations.component.css'],
})
export class PrestationsComponent implements OnInit {
  private readonly service = inject(CentreDeGestionService);

  readonly showGuide = signal(false);
  readonly data    = signal<PrestationAnalyseDto[]>([]);
  readonly loading = signal(false);
  readonly error   = signal<string | null>(null);
  readonly centres = signal<CentreLookupDto[]>([]);
  readonly typesPf = signal<TypePrestationLookupDto[]>([]);

  readonly selectedPeriode = signal<PrestationAnalyseDto | null>(null);

  // ── Branches ──
  readonly branches: BrancheTab[] = [
    { code: 'PF',   label: 'Prestations Familiales',    icon: '👨‍👩‍👧‍👦', brancheId: 5, beneficiaireLabel: 'Employés' },
    { code: 'PVID', label: 'Pensions (PVID)',            icon: '🏛️',    brancheId: 6, beneficiaireLabel: 'Pensionnés' },
    { code: 'RP',   label: 'Risques Professionnels',     icon: '⚠️',    brancheId: 4, beneficiaireLabel: 'Bénéficiaires' },
  ];
  readonly activeBranche = signal<string>('PF');

  readonly activeBrancheTab = computed(() =>
    this.branches.find(b => b.code === this.activeBranche()) ?? this.branches[0],
  );

  /** Types filtered for the currently selected branche */
  readonly filteredTypes = computed(() => {
    const bid = this.activeBrancheTab().brancheId;
    return this.typesPf().filter(t => t.brancheId === bid);
  });

  readonly isPF = computed(() => this.activeBranche() === 'PF');

  filter: PrestationFilterDto = {
    anneeDebut:          new Date().getFullYear(),
    anneeFin:            new Date().getFullYear(),
    moisDebut:           '01',
    moisFin:             String(new Date().getMonth() + 1).padStart(2, '0'),
    centreDeGestionId:   null,
    typePfId:            null,
    tenantId:            undefined,
    branche:             'PF',
    avecDetailParType:   false,
    avecDetailParCentre: false,
    granularite:         'trimestriel',
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
      nombreLiquidations: d.reduce((s, r) => s + r.nombreLiquidations, 0),
      nombreEmployes:     d.reduce((s, r) => s + r.nombreEmployes, 0),
      montantLiquide:     d.reduce((s, r) => s + r.montantLiquide, 0),
      montantArriere:     d.reduce((s, r) => s + r.montantArriere, 0),
      montantMajoration:  d.reduce((s, r) => s + r.montantMajoration, 0),
      montantPaye:        d.reduce((s, r) => s + r.montantPaye, 0),
      calculees:          d.reduce((s, r) => s + r.calculees, 0),
      payees:             d.reduce((s, r) => s + r.payees, 0),
      annulees:           d.reduce((s, r) => s + r.annulees, 0),
      totalEnfants:       d.reduce((s, r) => s + r.totalEnfants, 0),
    };
  });

  readonly tauxPaiementGlobal = computed(() => {
    const t = this.totaux();
    if (!t || t.montantLiquide === 0) return null;
    return Math.round(t.montantPaye / t.montantLiquide * 10000) / 100;
  });

  // ── Chart.js ──
  readonly chartData = computed<ChartData<'bar' | 'line'>>(() => {
    const d = this.data();
    const hasMaj = !this.isPF();
    const datasets: any[] = [
      {
        type: 'bar' as const,
        label: 'Montant liquidé',
        data: d.map(r => r.montantLiquide),
        backgroundColor: 'rgba(99,102,241,0.7)',
        borderRadius: 3,
        order: 2,
      },
      {
        type: 'bar' as const,
        label: 'Montant payé',
        data: d.map(r => r.montantPaye),
        backgroundColor: 'rgba(22,163,106,0.7)',
        borderRadius: 3,
        order: 2,
      },
      {
        type: 'line' as const,
        label: 'Arriérés',
        data: d.map(r => r.montantArriere),
        borderColor: '#d97706',
        backgroundColor: 'rgba(217,119,6,0.1)',
        pointRadius: 4,
        tension: 0.3,
        fill: true,
        order: 1,
      },
    ];
    if (hasMaj) {
      datasets.push({
        type: 'line' as const,
        label: 'Majorations',
        data: d.map(r => r.montantMajoration),
        borderColor: '#dc2626',
        backgroundColor: 'rgba(220,38,38,0.1)',
        pointRadius: 4,
        tension: 0.3,
        fill: true,
        order: 1,
      });
    }
    return { labels: d.map(r => this.shortPeriodLabel(r.mois, r.annee)), datasets };
  });

  readonly chartOptions: ChartOptions = {
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
      y: {
        beginAtZero: true,
        ticks: { callback: (v) => this.fmtMontant(+v) },
      },
    },
  };

  ngOnInit(): void {
    this.service.getLookups().subscribe({
      next: (l) => {
        this.centres.set(l.centres);
        this.typesPf.set(l.typesPrestations);
      },
    });
    this.load();
  }

  selectBranche(code: string): void {
    this.activeBranche.set(code);
    this.filter.branche = code;
    this.filter.typePfId = null;  // reset type filter when switching branch
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.selectedPeriode.set(null);
    this.service.getPrestationAnalyse(this.filter).subscribe({
      next: (d)  => { this.data.set(d); this.loading.set(false); },
      error: (e) => { this.error.set(e?.error?.message ?? 'Erreur serveur'); this.loading.set(false); },
    });
  }

  // ── Helpers ──
  toggleDetail(d: PrestationAnalyseDto): void {
    this.selectedPeriode.set(this.isSelected(d) ? null : d);
  }

  isSelected(d: PrestationAnalyseDto): boolean {
    const s = this.selectedPeriode();
    return !!s && s.annee === d.annee && s.mois === d.mois;
  }

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

  barWidth(v: number): string {
    return Math.min(100, Math.max(0, v)).toFixed(1) + '%';
  }

  tendanceClass(d: PrestationAnalyseDto): string {
    switch (d.tendance) {
      case 'hausse':  return 'trend-up';
      case 'baisse':  return 'trend-down';
      case 'stable':  return 'trend-stable';
      default:        return 'trend-none';
    }
  }

  tendanceIcon(d: PrestationAnalyseDto): string {
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
