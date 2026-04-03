import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { DocumentPaymentService } from '../../services/document-payment.service';
import {
  DocumentPaymentFilterDto, DocumentPaymentLookupsDto,
  DocumentPaymentSummaryDto,
  PaymentByDocumentCategoryDto,
  PaymentByClasseurDto,
  PaymentByDeviseDto,
  DocumentPaymentTrendDto, DocumentOperationDetailDto,
  ExecutionByClasseurResultDto,
} from '../../models/document-payment.model';

type Tab = 'dashboard' | 'details' | 'execution';

@Component({
  selector: 'app-document-payment',
  standalone: true,
  imports: [CommonModule, FormsModule, BaseChartDirective],
  templateUrl: './document-payment.html',
  styleUrl: './document-payment.css',
})
export class DocumentPaymentComponent implements OnInit {
  private readonly svc = inject(DocumentPaymentService);

  // ── State ──────────────────────────────────────────────────────────
  activeTab: Tab = 'dashboard';
  filter: DocumentPaymentFilterDto = {
    dateDebut: this.toIsoDate(new Date(new Date().getFullYear(), 0, 1)),
    dateFin: this.toIsoDate(new Date()),
  };
  lookups: DocumentPaymentLookupsDto | null = null;
  loading = false;
  error: string | null = null;

  summary: DocumentPaymentSummaryDto | null = null;
  byCategory: PaymentByDocumentCategoryDto[] = [];
  byClasseur: PaymentByClasseurDto[] = [];
  byDevise: PaymentByDeviseDto[] = [];
  trend: DocumentPaymentTrendDto[] = [];
  details: DocumentOperationDetailDto[] = [];
  execResult: ExecutionByClasseurResultDto | null = null;

  // ── Charts ─────────────────────────────────────────────────────────
  classeurChartData: ChartConfiguration<'bar'>['data'] = { labels: [], datasets: [] };
  classeurChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true, maintainAspectRatio: false,
    indexAxis: 'y',
    plugins: { legend: { position: 'top' } },
    scales: { x: { beginAtZero: true } },
  };

  trendChartData: ChartConfiguration<'line'>['data'] = { labels: [], datasets: [] };
  trendChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { position: 'top' } },
    scales: { y: { beginAtZero: true } },
  };

  execChartData: ChartConfiguration<'bar'>['data'] = { labels: [], datasets: [] };
  execChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { position: 'top' } },
    scales: { x: { stacked: true }, y: { stacked: true, beginAtZero: true } },
  };

  // ── Lifecycle ──────────────────────────────────────────────────────
  ngOnInit(): void {
    this.svc.getLookups().subscribe({
      next: lk => { this.lookups = lk; this.loadDashboard(); },
      error: () => this.loadDashboard(),
    });
  }

  // ── Actions ────────────────────────────────────────────────────────
  onSearch(): void {
    if (this.activeTab === 'dashboard') this.loadDashboard();
    else if (this.activeTab === 'execution') this.loadExecution();
    else this.loadDetails();
  }

  switchTab(tab: Tab): void {
    this.activeTab = tab;
    if (tab === 'details' && this.details.length === 0) this.loadDetails();
    if (tab === 'execution' && !this.execResult) this.loadExecution();
  }

  loadDashboard(): void {
    this.loading = true;
    this.error = null;
    const f = { ...this.filter };

    // Fire all queries in parallel
    let pending = 2;
    const done = () => { if (--pending === 0) this.loading = false; };
    const fail = (msg: string) => () => { this.error = msg; done(); };

    this.svc.getSummary(f).subscribe({
      next: d => { this.summary = d; this.byClasseur = d.parClasseur; this.byDevise = d.parDevise; this.buildClasseurChart(); done(); },
      error: fail('Erreur chargement résumé.'),
    });

    this.svc.getMonthlyTrend(f).subscribe({
      next: d => { this.trend = d; this.buildTrendChart(); done(); },
      error: fail('Erreur tendance.'),
    });
  }

  loadDetails(): void {
    this.loading = true;
    this.error = null;
    this.svc.getDetails(this.filter).subscribe({
      next: d => { this.details = d; this.loading = false; },
      error: () => { this.error = 'Erreur chargement détails.'; this.loading = false; },
    });
  }

  loadExecution(): void {
    this.loading = true;
    this.error = null;
    this.svc.getExecutionByClasseur(this.filter).subscribe({
      next: d => { this.execResult = d; this.buildExecChart(); this.loading = false; },
      error: () => { this.error = 'Erreur chargement exécutions par classeur.'; this.loading = false; },
    });
  }

  // ── Chart builders ─────────────────────────────────────────────────
  private buildClasseurChart(): void {
    this.classeurChartData = {
      labels: this.byClasseur.map(c => c.nomClasseur ?? '—'),
      datasets: [{
        label: 'Opérations',
        data: this.byClasseur.map(c => c.nombreOperations),
        backgroundColor: 'rgba(59,130,246,.7)',
      }],
    };
  }

  private buildTrendChart(): void {
    const labels = this.trend.map(t => `${t.annee}-${String(t.mois).padStart(2, '0')}`);
    this.trendChartData = {
      labels,
      datasets: [
        { label: 'Montant total (CDF)', data: this.trend.map(t => t.totalMontant), borderColor: '#3b82f6', backgroundColor: 'rgba(59,130,246,.15)', fill: true, tension: .3 },
      ],
    };
  }

  private buildExecChart(): void {
    if (!this.execResult) return;
    const details = this.execResult.details;

    // Unique periods (labels) and classeurs (datasets)
    const periodSet = new Set<string>();
    const classeurSet = new Map<string, string>(); // key = nomClasseur, value = color
    details.forEach(d => {
      periodSet.add(`${d.annee}-${String(d.mois).padStart(2, '0')}`);
      if (!classeurSet.has(d.nomClasseur ?? '—')) classeurSet.set(d.nomClasseur ?? '—', '');
    });
    const periods = [...periodSet].sort();
    const classeurNames = [...classeurSet.keys()];

    const palette = [
      'rgba(59,130,246,.7)', 'rgba(239,68,68,.7)', 'rgba(34,197,94,.7)',
      'rgba(245,158,11,.7)', 'rgba(139,92,246,.7)', 'rgba(236,72,153,.7)',
      'rgba(20,184,166,.7)', 'rgba(249,115,22,.7)', 'rgba(99,102,241,.7)',
      'rgba(168,85,247,.7)',
    ];

    this.execChartData = {
      labels: periods,
      datasets: classeurNames.map((name, i) => ({
        label: name,
        data: periods.map(p => {
          const [y, m] = p.split('-').map(Number);
          const row = details.find(d => d.annee === y && d.mois === m && (d.nomClasseur ?? '—') === name);
          return row ? Number(row.totalMontant) : 0;
        }),
        backgroundColor: palette[i % palette.length],
      })),
    };
  }

  // ── Helpers ────────────────────────────────────────────────────────
  private toIsoDate(d: Date): string {
    return d.toISOString().substring(0, 10);
  }

  fmtMontant(n: number): string {
    if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + ' Md';
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + ' M';
    if (n >= 1_000) return (n / 1_000).toFixed(1) + ' K';
    return n.toFixed(0);
  }
}
