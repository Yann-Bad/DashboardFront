import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NgxChartsModule, Color, ScaleType } from '@swimlane/ngx-charts';
import { SummaryAccountService } from '../../services/summary-account.service';
import { TrendFilterDto, TrendResultDto } from '../../models/summary-account.model';

@Component({
  selector: 'app-trends',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, NgxChartsModule],
  templateUrl: './trends.html',
  styleUrl: './trends.css',
})
export class TrendsComponent implements OnInit {
  private readonly service = inject(SummaryAccountService);

  loading = true;
  error: string | null = null;
  result: TrendResultDto | null = null;

  // Filter
  filter: TrendFilterDto = {
    dateFrom: this.toIsoDate(new Date(new Date().getFullYear(), 0, 1)), // Jan 1st
    dateTo: this.toIsoDate(new Date()),
    granularity: 'monthly',
    monnaie: 'CDF',
    typeBank: 'B',
  };

  // Chart dimensions
  view: [number, number] = [900, 300];

  // Color schemes
  fluxColors: Color = { name: 'flux', selectable: true, group: ScaleType.Ordinal, domain: ['#22c55e', '#ef4444'] };
  soldeColors: Color = { name: 'soldes', selectable: true, group: ScaleType.Ordinal, domain: ['#3b82f6', '#8b5cf6'] };
  prevExeColors: Color = { name: 'prevExe', selectable: true, group: ScaleType.Ordinal, domain: ['#f59e0b', '#ef4444', '#06b6d4', '#22c55e'] };
  netColors: Color = { name: 'net', selectable: true, group: ScaleType.Ordinal, domain: ['#22c55e', '#ef4444'] };
  pieColors: Color = { name: 'pie', selectable: true, group: ScaleType.Ordinal, domain: ['#22c55e', '#ef4444', '#f59e0b', '#3b82f6', '#06b6d4', '#8b5cf6', '#ec4899', '#10b981', '#f97316'] };

  // Chart data
  fluxData: any[] = [];
  soldeData: any[] = [];
  prevExeData: any[] = [];
  netData: any[] = [];
  volumeData: any[] = [];
  pieData: any[] = [];

  // Category labels
  private catLabels: Record<string, string> = {
    // Non-split categories
    AE_R: 'Annul. Encaissements',
    BS: 'Prévu Sorties', BSR: 'Extourne Sorties',
    BSE: 'Exécuté Sorties', BE: 'Prévu Entrées',
    BER: 'Extourne Entrées', BEE: 'Exécuté Entrées',
    // AE individual codes
    A01: 'Encaissement Cotisation',
    A02: 'DAT Intérêt',
    A03: 'Reversement',
    A04: 'Reliquats',
    A05: 'Tombée DAT',
    A06: 'Créditer',
    A07: 'Cantonnement Levée',
    D01: 'Report Solde Initial',
    // CS sub-groups
    FRAIS_BANCAIRES: 'Frais Bancaires',
    DEBITS_OPERATIONS: 'Débits Opérations',
    C08: 'DAT Dépôt',
    C09: 'Instruction Permanente',
    C11: 'Pénalités DAT',
    C12: 'Cantonnement Fonds Gelé',
    C13: 'Décaissement PPS',
  };

  get currentUnit(): string {
    return this.filter.monnaie || 'CDF';
  }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = null;
    this.service.getTrends(this.filter).subscribe({
      next: (data) => {
        this.result = data;
        this.buildCharts(data);
        this.loading = false;
      },
      error: () => {
        this.error = 'Impossible de charger les tendances.';
        this.loading = false;
      },
    });
  }

  private buildCharts(r: TrendResultDto): void {
    const periods = r.periods;

    // 1) Flux de trésorerie (line)
    this.fluxData = [
      { name: 'Encaissements', series: periods.map(p => ({ name: p.period, value: p.totalEncaissements })) },
      { name: 'Décaissements', series: periods.map(p => ({ name: p.period, value: p.totalDecaissements })) },
    ];

    // 2) Evolution des soldes (line)
    this.soldeData = [
      { name: 'Solde Disponible', series: periods.map(p => ({ name: p.period, value: p.soldeDisponible })) },
      { name: 'Solde Réel', series: periods.map(p => ({ name: p.period, value: p.soldeReel })) },
    ];

    // 3) Prévisionnel vs Exécuté (grouped bar)
    this.prevExeData = [
      { name: 'Prévu Sorties', series: periods.map(p => ({ name: p.period, value: p.prevuSorties })) },
      { name: 'Exécuté Sorties', series: periods.map(p => ({ name: p.period, value: p.executeSorties })) },
      { name: 'Prévu Entrées', series: periods.map(p => ({ name: p.period, value: p.prevuEntrees })) },
      { name: 'Exécuté Entrées', series: periods.map(p => ({ name: p.period, value: p.executeEntrees })) },
    ];

    // 4) Cash flow net (bar ±)
    this.netData = periods.map(p => ({ name: p.period, value: p.fluxNet }));

    // 5) Volume opérations (bar)
    this.volumeData = periods.map(p => ({ name: p.period, value: p.nombreOperations }));

    // 6) Répartition par catégorie (pie)
    this.pieData = r.categoryBreakdown.map(c => ({
      name: this.catLabels[c.categorie] ?? c.categorie,
      value: c.montant,
    }));
  }

  fmtMontant(v: number): string {
    return v.toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  }

  private toIsoDate(d: Date): string {
    return d.toISOString().substring(0, 10);
  }
}
