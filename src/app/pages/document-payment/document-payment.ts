import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { DocumentPaymentService } from '../../services/document-payment.service';
import {
  DocumentPaymentFilterDto, DocumentPaymentLookupsDto,
  DocumentOperationDetailDto,
  ExecutionByClasseurResultDto,
} from '../../models/document-payment.model';

type Tab = 'dashboard' | 'details';

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

  details: DocumentOperationDetailDto[] = [];
  execResult: ExecutionByClasseurResultDto | null = null;

  // ── Pagination ─────────────────────────────────────────────────────
  page = 1;
  pageSize = 20;

  // ── Charts ─────────────────────────────────────────────────────────
  classeurChartData: ChartConfiguration<'bar'>['data'] = { labels: [], datasets: [] };
  classeurChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true, maintainAspectRatio: false,
    indexAxis: 'y',
    plugins: { legend: { position: 'top' } },
    scales: { x: { beginAtZero: true } },
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
    if (this.activeTab === 'details') this.loadDetails();
    else this.loadDashboard();
  }

  switchTab(tab: Tab): void {
    this.activeTab = tab;
    if (tab === 'details' && this.details.length === 0) this.loadDetails();
  }

  loadDashboard(): void {
    this.loading = true;
    this.error = null;
    this.svc.getExecutionByClasseur(this.filter).subscribe({
      next: d => { this.execResult = d; this.buildClasseurChart(); this.loading = false; },
      error: () => { this.error = 'Erreur chargement données.'; this.loading = false; },
    });
  }

  loadDetails(): void {
    this.loading = true;
    this.error = null;
    this.svc.getDetails(this.filter).subscribe({
      next: d => { this.details = d; this.page = 1; this.loading = false; },
      error: () => { this.error = 'Erreur chargement détails.'; this.loading = false; },
    });
  }

  get pagedDetails(): DocumentOperationDetailDto[] {
    const start = (this.page - 1) * this.pageSize;
    return this.details.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.details.length / this.pageSize) || 1;
  }

  goToPage(p: number): void {
    if (p >= 1 && p <= this.totalPages) this.page = p;
  }

  // ── Chart builders ─────────────────────────────────────────────────
  private buildClasseurChart(): void {
    if (!this.execResult) return;
    const byClasseur = new Map<string, { montant: number; docs: number }>();
    for (const d of this.execResult.details) {
      const name = d.nomClasseur ?? '—';
      const cur = byClasseur.get(name) ?? { montant: 0, docs: 0 };
      cur.montant += d.totalMontant;
      cur.docs += d.nombreDocuments;
      byClasseur.set(name, cur);
    }
    const sorted = [...byClasseur.entries()].sort((a, b) => b[1].montant - a[1].montant);
    this.classeurChartData = {
      labels: sorted.map(e => e[0]),
      datasets: [{
        label: 'Montant (CDF)',
        data: sorted.map(e => e[1].montant),
        backgroundColor: 'rgba(59,130,246,.7)',
      }],
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
