import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { BudgetAnalyseService } from '../../services/budget-analyse.service';
import {
  BudgetExecutionDto, BudgetExecutionFilterDto, BudgetExecutionResultDto,
  BudgetLookupsDto, BudgetDashboardStatsDto,
  BudgetSyntheseDto, BudgetSyntheseFilterDto,
  BudgetExerciceDto, BudgetTypeBudgetDto,
  BudgetGestionDto, BudgetCentreGestionDto,
} from '../../models/budget-analyse.model';

@Component({
  selector: 'app-budget-execution',
  standalone: true,
  imports: [CommonModule, FormsModule, BaseChartDirective],
  templateUrl: './budget-execution.html',
  styleUrl: './budget-execution.css',
})
export class BudgetExecutionComponent implements OnInit {
  private readonly service = inject(BudgetAnalyseService);

  // ── Active tab ─────────────────────────
  activeTab: 'execution' | 'synthese' = 'execution';

  // ── Lookups ────────────────────────────
  lookups: BudgetLookupsDto | null = null;
  get exercices(): BudgetExerciceDto[] { return this.lookups?.exercices ?? []; }
  get typesBudget(): BudgetTypeBudgetDto[] { return this.lookups?.typesBudget ?? []; }
  get gestions(): BudgetGestionDto[] { return this.lookups?.gestions ?? []; }
  get centres(): BudgetCentreGestionDto[] { return this.lookups?.centres ?? []; }

  // ── Execution tab ──────────────────────
  data: BudgetExecutionDto[] = [];
  loading = false;
  error: string | null = null;
  filter: BudgetExecutionFilterDto = { exercice: new Date().getFullYear(), niveau: 1 };
  selectedNiveau = 1;
  niveauLabels: { value: number; label: string }[] = [
    { value: 1, label: 'Niveau 1 — Par Type Budget' },
    { value: 2, label: 'Niveau 2 — Par Gestion' },
    { value: 3, label: 'Niveau 3 — Par Poste' },
    { value: 4, label: 'Niveau 4 — Détail complet' },
  ];

  totalAssignation = 0;
  totalRealisation = 0;
  totalDepense = 0;
  totalLignes = 0;

  chartData: ChartConfiguration<'bar'>['data'] = { labels: [], datasets: [] };
  chartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      tooltip: {
        callbacks: {
          label: (ctx) => `${ctx.dataset.label}: ${this.fmtMontant(ctx.parsed.y)}`,
        },
      },
    },
    scales: {
      y: { beginAtZero: true, ticks: { callback: (v) => this.fmtMontantShort(+v) } },
      x: { ticks: { maxRotation: 45, minRotation: 30 } },
    },
  };

  centreRows: BudgetExecutionDto[] = [];

  // ── Dashboard stats ────────────────────
  dashboardStats: BudgetDashboardStatsDto | null = null;

  // ── Synthese tab ───────────────────────
  syntheseData: BudgetSyntheseDto[] = [];
  syntheseLoading = false;
  syntheseFilter: BudgetSyntheseFilterDto = { exercice: new Date().getFullYear() };

  ngOnInit(): void {
    this.service.getLookups().subscribe({
      next: (lk) => {
        this.lookups = lk;
        this.loadExecution();
        this.loadDashboardStats();
      },
      error: () => this.loadExecution(),
    });
  }

  // ── Tab switching ──────────────────────
  switchTab(tab: 'execution' | 'synthese'): void {
    this.activeTab = tab;
    if (tab === 'synthese' && this.syntheseData.length === 0) {
      this.loadSynthese();
    }
  }

  // ── Execution ──────────────────────────
  loadExecution(): void {
    this.loading = true;
    this.error = null;
    this.filter.niveau = this.selectedNiveau;
    this.service.getExecution(this.filter).subscribe({
      next: (result) => {
        this.totalAssignation = result.totalAssignation;
        this.totalRealisation = result.totalRealisation;
        this.totalDepense = result.totalDepense;
        this.totalLignes = result.totalLignes;
        this.data = result.rows ?? [];
        this.buildChart();
        this.loading = false;
      },
      error: () => {
        this.error = "Impossible de charger l'exécution budgétaire.";
        this.loading = false;
      },
    });
  }

  onSearch(): void {
    this.loadExecution();
    this.loadDashboardStats();
  }

  onReset(): void {
    this.filter = { exercice: new Date().getFullYear(), niveau: 1 };
    this.selectedNiveau = 1;
    this.loadExecution();
    this.loadDashboardStats();
  }

  // ── Dashboard stats ────────────────────
  loadDashboardStats(): void {
    this.service.getDashboardStats(this.filter.exercice).subscribe({
      next: (stats) => this.dashboardStats = stats,
    });
  }

  // ── Synthese ───────────────────────────
  loadSynthese(): void {
    this.syntheseLoading = true;
    this.service.getSynthese(this.syntheseFilter).subscribe({
      next: (rows) => { this.syntheseData = rows; this.syntheseLoading = false; },
      error: () => this.syntheseLoading = false,
    });
  }

  onSyntheseSearch(): void { this.loadSynthese(); }
  onSyntheseReset(): void {
    this.syntheseFilter = { exercice: new Date().getFullYear() };
    this.loadSynthese();
  }

  private buildChart(): void {
    // Group rows by TypeBudget for summary chart
    const grouped = new Map<string, { a: number; r: number; d: number }>();
    for (const row of this.data) {
      const key = row.typeBudget ?? '—';
      const cur = grouped.get(key) ?? { a: 0, r: 0, d: 0 };
      cur.a += row.assignation;
      cur.r += row.realisation;
      cur.d += row.depense;
      grouped.set(key, cur);
    }
    const entries = [...grouped.entries()].sort((a, b) => a[0].localeCompare(b[0]));
    this.chartData = {
      labels: entries.map(([k]) => k),
      datasets: [
        { label: 'Assignation', data: entries.map(([, v]) => v.a), backgroundColor: 'rgba(59, 130, 246, 0.7)', borderColor: '#3b82f6', borderWidth: 1 },
        { label: 'Réalisation', data: entries.map(([, v]) => v.r), backgroundColor: 'rgba(34, 197, 94, 0.7)', borderColor: '#22c55e', borderWidth: 1 },
        { label: 'Dépense',     data: entries.map(([, v]) => v.d), backgroundColor: 'rgba(249, 115, 22, 0.7)', borderColor: '#f97316', borderWidth: 1 },
      ],
    };
  }

  get tauxGlobalRealisation(): number {
    return this.totalAssignation > 0 ? (this.totalRealisation / this.totalAssignation) * 100 : 0;
  }

  get tauxGlobalDepense(): number {
    return this.totalAssignation > 0 ? (this.totalDepense / this.totalAssignation) * 100 : 0;
  }

  fmtMontant(v: number | null | undefined): string {
    if (v === null || v === undefined) return '—';
    return v.toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  }

  fmtMontantShort(v: number): string {
    if (Math.abs(v) >= 1_000_000_000) return (v / 1_000_000_000).toFixed(1) + ' Md';
    if (Math.abs(v) >= 1_000_000) return (v / 1_000_000).toFixed(1) + ' M';
    if (Math.abs(v) >= 1_000) return (v / 1_000).toFixed(0) + ' K';
    return v.toString();
  }

  clampPct(v: number): number {
    return Math.min(100, Math.max(0, v));
  }
}
