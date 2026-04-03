import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { PropertyManagementService } from '../../services/property-management.service';
import {
  PropertyFilterDto, BillingFilterDto,
  PropertyDashboardStatsDto, BillingSummaryDto,
  OccupancyByImmeubleDto, PropertyLookupsDto
} from '../../models/property-management.model';

@Component({
  selector: 'app-property-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, BaseChartDirective],
  templateUrl: './property-dashboard.html',
  styleUrl: './property-dashboard.css',
})
export class PropertyDashboardComponent implements OnInit {
  private readonly service = inject(PropertyManagementService);

  // ── State ──────────────────────────────────────────────────────────────
  lookups: PropertyLookupsDto | null = null;
  stats: PropertyDashboardStatsDto | null = null;
  billing: BillingSummaryDto | null = null;
  occupancy: OccupancyByImmeubleDto[] = [];

  filter: PropertyFilterDto = {};
  billingFilter: BillingFilterDto = {};

  loading = false;
  error: string | null = null;

  // Charts
  billingChartData: ChartConfiguration<'bar'>['data'] = { labels: [], datasets: [] };
  billingChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'top' } },
    scales: {
      y: { beginAtZero: true, ticks: { callback: v => this.fmtShort(+v) } },
      x: { ticks: { maxRotation: 45, minRotation: 20 } }
    }
  };

  occupancyChartData: ChartConfiguration<'bar'>['data'] = { labels: [], datasets: [] };
  occupancyChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y',
    plugins: { legend: { position: 'top' } },
    scales: {
      x: { beginAtZero: true, stacked: true },
      y: { stacked: true, ticks: { font: { size: 11 } } }
    }
  };

  // ── Lifecycle ──────────────────────────────────────────────────────────

  ngOnInit(): void {
    this.service.getLookups().subscribe({
      next: lk => { this.lookups = lk; this.loadAll(); },
      error: () => this.loadAll()
    });
  }

  // ── Actions ────────────────────────────────────────────────────────────

  onSearch(): void {
    this.billingFilter = { ...this.filter, annee: this.billingFilter.annee };
    this.loadAll();
  }

  loadAll(): void {
    this.loading = true;
    this.error = null;

    // Dashboard stats
    this.service.getDashboardStats(this.filter).subscribe({
      next: s => this.stats = s,
      error: () => this.error = 'Erreur lors du chargement des statistiques.'
    });

    // Billing summary
    this.service.getBillingSummary(this.billingFilter).subscribe({
      next: b => { this.billing = b; this.buildBillingChart(); },
      error: () => {}
    });

    // Occupancy
    this.service.getOccupancy(this.filter).subscribe({
      next: o => { this.occupancy = o; this.buildOccupancyChart(); this.loading = false; },
      error: () => this.loading = false
    });
  }

  // ── Charts ─────────────────────────────────────────────────────────────

  private buildBillingChart(): void {
    if (!this.billing) return;
    const natures = this.billing.parNature;
    this.billingChartData = {
      labels: natures.map(n => n.libelle ?? '—'),
      datasets: [
        { label: 'Facturation', data: natures.map(n => n.facturation), backgroundColor: 'rgba(59,130,246,0.7)', borderColor: '#3b82f6', borderWidth: 1 },
        { label: 'Paiement', data: natures.map(n => n.paiement), backgroundColor: 'rgba(34,197,94,0.7)', borderColor: '#22c55e', borderWidth: 1 },
        { label: 'Solde', data: natures.map(n => n.solde), backgroundColor: 'rgba(249,115,22,0.7)', borderColor: '#f97316', borderWidth: 1 },
      ]
    };
  }

  private buildOccupancyChart(): void {
    const top = this.occupancy.slice(0, 15);
    this.occupancyChartData = {
      labels: top.map(o => o.immeuble ?? o.cdIm ?? '—'),
      datasets: [
        { label: 'Occupées', data: top.map(o => o.unitesOccupees), backgroundColor: 'rgba(34,197,94,0.75)' },
        { label: 'Vacantes', data: top.map(o => o.unitesVacantes), backgroundColor: 'rgba(239,68,68,0.55)' },
      ]
    };
  }

  // ── Helpers ─────────────────────────────────────────────────────────────

  fmtShort(v: number): string {
    if (Math.abs(v) >= 1_000_000_000) return (v / 1_000_000_000).toFixed(1) + ' Md';
    if (Math.abs(v) >= 1_000_000) return (v / 1_000_000).toFixed(1) + ' M';
    if (Math.abs(v) >= 1_000) return (v / 1_000).toFixed(0) + ' K';
    return v.toString();
  }

  pct(rate: number | undefined): string {
    return (rate ?? 0).toFixed(1) + ' %';
  }
}
