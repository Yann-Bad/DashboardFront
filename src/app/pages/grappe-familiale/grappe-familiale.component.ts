import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseChartDirective } from 'ng2-charts';
import { ChartData, ChartOptions } from 'chart.js';
import { CentreDeGestionService } from '../../services/centre-de-gestion.service';
import {
  GlobalGrappeFamilleStatsDto,
  GrappeFamilleStatsDto,
} from '../../models/global-grappe-famille.model';
import { CentreLookupDto } from '../../models/lookups.model';

@Component({
  selector: 'app-grappe-familiale',
  standalone: true,
  imports: [CommonModule, FormsModule, BaseChartDirective],
  templateUrl: './grappe-familiale.component.html',
  styleUrls: ['./grappe-familiale.component.css'],
})
export class GrappeFamilialeComponent implements OnInit {
  private readonly service = inject(CentreDeGestionService);

  readonly data    = signal<GlobalGrappeFamilleStatsDto | null>(null);
  readonly loading = signal(false);
  readonly error   = signal<string | null>(null);
  readonly centres = signal<CentreLookupDto[]>([]);

  selectedCentreId: number | null = null;

  // ── Global summary cards ──
  readonly summaryCards = computed(() => {
    const d = this.data();
    if (!d) return [];
    return [
      { label: 'Employés validés',     value: d.totalEmployesValides,  icon: '👤', color: 'indigo' },
      { label: 'Membres de famille',   value: d.totalMembresFamille,   icon: '👨‍👩‍👧‍👦', color: 'teal' },
      { label: 'Conjoints',            value: d.totalConjoints,         icon: '💍', color: 'blue' },
      { label: 'Enfants',              value: d.totalEnfants,           icon: '👶', color: 'emerald' },
      { label: 'Ascendants',           value: d.totalAscendants,        icon: '👴', color: 'amber' },
      { label: 'Moy. enfants/employé', value: d.moyenneEnfants,         icon: '📊', color: 'purple', isDecimal: true },
    ];
  });

  // ── Validation by branch ──
  readonly validationBranches = computed(() => {
    const d = this.data();
    if (!d || d.totalEmployesValides === 0) return [];
    const total = d.totalEmployesValides;
    return [
      { label: 'Pension',               valide: d.avecGrappeValidePension, pct: Math.round(d.avecGrappeValidePension / total * 100), color: 'teal',   total },
      { label: 'Prestations Familiales', valide: d.avecGrappeValidePf,     pct: Math.round(d.avecGrappeValidePf / total * 100),     color: 'indigo', total },
      { label: 'Risques Professionnels', valide: d.avecGrappeValideRp,     pct: Math.round(d.avecGrappeValideRp / total * 100),     color: 'amber',  total },
    ];
  });

  // ── Family composition bars ──
  readonly familleComposition = computed(() => {
    const d = this.data();
    if (!d) return [];
    const total = d.totalEmployesValides || 1;
    return [
      { label: 'Conjoints',  icon: '💍', total: d.totalConjoints,  employesConcernes: d.employesAvecConjoint,  pct: Math.round(d.employesAvecConjoint / total * 100),  color: 'blue' },
      { label: 'Enfants',    icon: '👶', total: d.totalEnfants,    employesConcernes: d.employesAvecEnfants,   pct: Math.round(d.employesAvecEnfants / total * 100),   color: 'emerald' },
      { label: 'Ascendants', icon: '👴', total: d.totalAscendants, employesConcernes: d.employesAvecAscendants, pct: Math.round(d.employesAvecAscendants / total * 100), color: 'amber' },
    ];
  });

  // ── Charts ──

  // Bar chart: employees per centre
  readonly chartEmployeesData = computed<ChartData<'bar'>>(() => {
    const d = this.data();
    if (!d) return { labels: [], datasets: [] };
    const centres = d.parCentre.slice(0, 15); // top 15
    return {
      labels: centres.map(c => c.centreCode ?? `#${c.centreId}`),
      datasets: [
        {
          label: 'Employés validés',
          data: centres.map(c => c.totalEmployesValides),
          backgroundColor: 'rgba(99,102,241,0.7)',
          borderRadius: 3,
        },
        {
          label: 'Membres famille',
          data: centres.map(c => c.totalMembresFamille),
          backgroundColor: 'rgba(20,184,166,0.7)',
          borderRadius: 3,
        },
      ],
    };
  });

  readonly chartEmployeesOptions: ChartOptions<'bar'> = {
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

  // Doughnut: global family composition
  readonly chartCompositionData = computed<ChartData<'doughnut'>>(() => {
    const d = this.data();
    if (!d) return { labels: [], datasets: [] };
    return {
      labels: ['Conjoints', 'Enfants', 'Ascendants'],
      datasets: [{
        data: [d.totalConjoints, d.totalEnfants, d.totalAscendants],
        backgroundColor: ['#3b82f6', '#10b981', '#f59e0b'],
        borderWidth: 2,
        borderColor: '#fff',
      }],
    };
  });

  readonly chartCompositionOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { boxWidth: 12, padding: 16, font: { size: 12 } } },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const val = ctx.parsed ?? 0;
            const total = (ctx.dataset.data as number[]).reduce((a, b) => a + b, 0);
            const pct = total > 0 ? ((val / total) * 100).toFixed(1) : '0';
            return `${ctx.label}: ${val.toLocaleString('fr-FR')} (${pct} %)`;
          },
        },
      },
    },
  };

  // Bar chart: validation rates per centre
  readonly chartValidationData = computed<ChartData<'bar'>>(() => {
    const d = this.data();
    if (!d) return { labels: [], datasets: [] };
    const centres = d.parCentre.slice(0, 15);
    return {
      labels: centres.map(c => c.centreCode ?? `#${c.centreId}`),
      datasets: [
        {
          label: 'Pension',
          data: centres.map(c => c.totalEmployesValides > 0 ? Math.round(c.avecGrappeValidePension / c.totalEmployesValides * 100) : 0),
          backgroundColor: 'rgba(20,184,166,0.7)',
          borderRadius: 3,
        },
        {
          label: 'PF',
          data: centres.map(c => c.totalEmployesValides > 0 ? Math.round(c.avecGrappeValidePf / c.totalEmployesValides * 100) : 0),
          backgroundColor: 'rgba(99,102,241,0.7)',
          borderRadius: 3,
        },
        {
          label: 'RP',
          data: centres.map(c => c.totalEmployesValides > 0 ? Math.round(c.avecGrappeValideRp / c.totalEmployesValides * 100) : 0),
          backgroundColor: 'rgba(245,158,11,0.7)',
          borderRadius: 3,
        },
      ],
    };
  });

  readonly chartValidationOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { position: 'bottom', labels: { boxWidth: 12, padding: 16, font: { size: 12 } } },
      tooltip: {
        callbacks: {
          label: (ctx) => `${ctx.dataset.label}: ${ctx.parsed.y} %`,
        },
      },
    },
    scales: {
      x: { grid: { display: false } },
      y: { beginAtZero: true, max: 100, ticks: { callback: (v) => `${v} %` } },
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
    this.service.getGlobalGrappeFamilleStats(this.selectedCentreId).subscribe({
      next: (d)  => { this.data.set(d); this.loading.set(false); },
      error: (e) => { this.error.set(e?.error?.message ?? 'Erreur serveur'); this.loading.set(false); },
    });
  }

  // ── Helpers ──
  fmt(v: number): string {
    return v.toLocaleString('fr-FR');
  }

  clampPct(v: number): number {
    return Math.min(100, Math.max(0, v));
  }
}
