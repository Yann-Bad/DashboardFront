import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CentreDeGestionService } from '../../services/centre-de-gestion.service';
import { DeviseBreakdownDto } from '../../models/centre-de-gestion.model';
import { ExecutionByClasseurPeriodDto } from '../../models/document-payment.model';
import { SoldeParDeviseDto } from '../../models/summary-account.model';
import { LiquidationBrancheSummary } from '../../models/liquidation-trend.model';
import { HomeDashboardDto } from '../../models/home-dashboard.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class DashboardComponent implements OnInit {
  private readonly service = inject(CentreDeGestionService);

  readonly Math = Math;
  readonly today = new Date();

  data: HomeDashboardDto | null = null;
  loading = true;
  error: string | null = null;

  ngOnInit(): void {
    this.service.getHomeDashboard().subscribe({
      next: (d) => { this.data = d; this.loading = false; },
      error: () => { this.error = 'Impossible de charger le tableau de bord.'; this.loading = false; },
    });
  }

  /** Compteurs globaux affichés dans la grille de tuiles */
  get statCards(): { label: string; value: number; icon: string; color: string }[] {
    if (!this.data) return [];
    return [
      { label: 'Centres de Gestion',    value: this.data.totalCentres,              icon: '🏢', color: 'blue'   },
      { label: 'Employeurs',            value: this.data.totalEmployeurs,           icon: '👔', color: 'green'  },
      { label: 'Employés déclarés',     value: this.data.totalEmployes,             icon: '👤', color: 'purple' },
      { label: 'Effectifs déclarés',    value: this.data.effectifDeclareTotal ?? 0, icon: '📋', color: 'teal'   },
      { label: 'Déclarations',          value: this.data.totalDeclarations ?? 0,    icon: '📄', color: 'indigo' },
    ];
  }

  /** Ventilation des déclarations et encaissements par devise */
  get deviseBreakdown(): DeviseBreakdownDto[] {
    return this.data?.breakdownParDevise ?? [];
  }
  /** Formate un montant avec séparateurs (ex : 1 234 567) */
  fmtMontant(v: number | null | undefined): string {
    if (v === null || v === undefined) return '—';
    return v.toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  }

  /** Bloque une valeur entre 0 et 100 pour les barres de progression */
  clampPct(v: number): number {
    return Math.min(100, Math.max(0, v ?? 0));
  }

  // ── Execution pivot helpers ─────────────────────────────────────

  get docExec() { return this.data?.execution ?? null; }

  /** Classeur names from execResult, sorted by totalMontant descending */
  get execClasseurs(): string[] {
    if (!this.docExec) return [];
    const map = new Map<string, number>();
    for (const d of this.docExec.details) {
      const name = d.nomClasseur ?? '—';
      map.set(name, (map.get(name) ?? 0) + d.totalMontant);
    }
    return [...map.entries()].sort((a, b) => b[1] - a[1]).map(e => e[0]);
  }

  /** Cell value for a given classeur + period */
  execCell(classeur: string, period: string): ExecutionByClasseurPeriodDto | null {
    if (!this.docExec) return null;
    const [y, m] = period.split('-').map(Number);
    return this.docExec.details.find(
      d => (d.nomClasseur ?? '—') === classeur && d.annee === y && d.mois === m
    ) ?? null;
  }

  /** Max totalMontant across all cells — used for intensity scaling */
  get execMaxMontant(): number {
    if (!this.docExec?.details.length) return 1;
    return Math.max(...this.docExec.details.map(d => d.totalMontant), 1);
  }

  /** Opacity 0–1 for a cell based on its amount vs max */
  execIntensity(montant: number): number {
    return Math.min(1, Math.max(0.07, montant / this.execMaxMontant));
  }

  /** Sum of totalMontant for a given classeur (row total) */
  execRowTotal(classeur: string): number {
    if (!this.docExec) return 0;
    return this.docExec.details
      .filter(d => (d.nomClasseur ?? '\u2014') === classeur)
      .reduce((s, d) => s + d.totalMontant, 0);
  }

  /** Sum of nombreDocuments for a given classeur */
  execRowDocs(classeur: string): number {
    if (!this.docExec) return 0;
    return this.docExec.details
      .filter(d => (d.nomClasseur ?? '\u2014') === classeur)
      .reduce((s, d) => s + d.nombreDocuments, 0);
  }

  /** Sum of totalMontant for a given period (column total) */
  execColTotal(period: string): number {
    if (!this.docExec) return 0;
    const [y, m] = period.split('-').map(Number);
    return this.docExec.details
      .filter(d => d.annee === y && d.mois === m)
      .reduce((s, d) => s + d.totalMontant, 0);
  }

  // ── Treasury helpers ────────────────────────────────────────────

  get soldesBanque(): SoldeParDeviseDto[] {
    return this.data?.soldesBanque ?? [];
  }

  // ── Liquidation helpers ─────────────────────────────────────

  get liqSummaries(): { label: string; icon: string; color: string; s: LiquidationBrancheSummary }[] {
    if (!this.data) return [];
    return [
      { label: 'Prestations Familiales', icon: '👨‍👩‍👧‍👦', color: 'indigo',  s: this.data.totalPf },
      { label: 'Pensions (PVID)',         icon: '🏛️',    color: 'emerald', s: this.data.totalPension },
      { label: 'Risques Professionnels',  icon: '⚠️',    color: 'amber',   s: this.data.totalRp },
    ];
  }

  fmtLiqMontant(v: number | null | undefined): string {
    if (v == null) return '—';
    return Math.round(v).toLocaleString('fr-FR') + ' CDF';
  }

  fmtPct(v: number | null | undefined): string {
    if (v == null) return '—';
    return v.toFixed(1) + ' %';
  }

  fmtCount(v: number | null | undefined): string {
    if (v == null) return '—';
    return v.toLocaleString('fr-FR');
  }

  barWidth(v: number | null | undefined): string {
    if (v == null) return '0%';
    return Math.min(100, Math.max(0, v)).toFixed(1) + '%';
  }

}
