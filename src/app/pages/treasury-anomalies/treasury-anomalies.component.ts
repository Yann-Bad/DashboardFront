import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgxChartsModule, Color, ScaleType } from '@swimlane/ngx-charts';
import { TreasuryAnalyseService } from '../../services/treasury-analyse.service';
import {
  TreasuryAnomalyFilter,
  TreasuryAnomalyResult,
  TreasuryAnomalyPoint,
  TREASURY_METRICS,
  TREASURY_CURRENCIES,
} from '../../models/treasury-analyse.model';

@Component({
  selector: 'app-treasury-anomalies',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxChartsModule],
  templateUrl: './treasury-anomalies.component.html',
  styleUrl: './treasury-anomalies.component.css',
})
export class TreasuryAnomaliesComponent implements OnInit {
  private readonly service = inject(TreasuryAnalyseService);

  readonly metrics = TREASURY_METRICS;
  readonly currencies = TREASURY_CURRENCIES;

  showGuide = false;
  loading = false;
  error: string | null = null;
  result: TreasuryAnomalyResult | null = null;
  anomalies: TreasuryAnomalyPoint[] = [];

  filter: TreasuryAnomalyFilter = {
    metric: 'NetCashFlow',
    confidence: 95,
  };

  view: [number, number] = [1000, 360];
  chartData: any[] = [];
  chartColors: Color = {
    name: 'anomaly',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#3b82f6', '#ef4444'],
  };

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = null;
    this.service.detectAnomalies(this.filter).subscribe({
      next: (data) => {
        this.result = data;
        this.anomalies = data.points.filter(p => p.isAnomaly);
        this.buildChart(data);
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error?.message ?? 'Impossible de charger la détection d\'anomalies de trésorerie.';
        this.loading = false;
      },
    });
  }

  private buildChart(r: TreasuryAnomalyResult): void {
    const normalSeries = r.points.map(p => ({
      name: this.fmtDate(p.date),
      value: p.value,
    }));

    const anomalySeries = r.points
      .filter(p => p.isAnomaly)
      .map(p => ({
        name: this.fmtDate(p.date),
        value: p.value,
      }));

    this.chartData = [
      { name: 'Valeurs', series: normalSeries },
      { name: 'Anomalies', series: anomalySeries },
    ];
  }

  fmtDate(d: string): string {
    return new Date(d).toLocaleDateString('fr-FR', { year: 'numeric', month: 'short' });
  }

  fmtValue(v: number | null | undefined): string {
    if (v == null) return '—';
    return v.toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  }
}
