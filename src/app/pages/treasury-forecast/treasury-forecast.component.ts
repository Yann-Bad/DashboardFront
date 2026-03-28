import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgxChartsModule, Color, ScaleType } from '@swimlane/ngx-charts';
import { TreasuryAnalyseService } from '../../services/treasury-analyse.service';
import {
  TreasuryForecastFilter,
  TreasuryForecastResult,
  TREASURY_METRICS,
  TREASURY_CURRENCIES,
} from '../../models/treasury-analyse.model';

@Component({
  selector: 'app-treasury-forecast',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxChartsModule],
  templateUrl: './treasury-forecast.component.html',
  styleUrl: './treasury-forecast.component.css',
})
export class TreasuryForecastComponent implements OnInit {
  private readonly service = inject(TreasuryAnalyseService);

  readonly metrics = TREASURY_METRICS;
  readonly currencies = TREASURY_CURRENCIES;

  showGuide = false;
  loading = false;
  error: string | null = null;
  result: TreasuryForecastResult | null = null;

  filter: TreasuryForecastFilter = {
    metric: 'NetCashFlow',
    horizon: 6,
  };

  view: [number, number] = [1000, 360];
  chartData: any[] = [];
  chartColors: Color = {
    name: 'treasury',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#3b82f6', '#22c55e', '#94a3b8', '#94a3b8'],
  };

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = null;
    this.service.getForecast(this.filter).subscribe({
      next: (data) => {
        this.result = data;
        this.buildChart(data);
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error?.message ?? 'Impossible de charger les prévisions de trésorerie.';
        this.loading = false;
      },
    });
  }

  private buildChart(r: TreasuryForecastResult): void {
    const historySeries = r.historicalData.map(p => ({
      name: this.fmtDate(p.date),
      value: p.value,
    }));

    const forecastSeries = r.forecasts.map(p => ({
      name: this.fmtDate(p.date),
      value: p.predictedValue,
    }));

    const upperSeries = r.forecasts.map(p => ({
      name: this.fmtDate(p.date),
      value: p.upperBound,
    }));

    const lowerSeries = r.forecasts.map(p => ({
      name: this.fmtDate(p.date),
      value: p.lowerBound,
    }));

    this.chartData = [
      { name: 'Historique', series: historySeries },
      { name: 'Prévision', series: forecastSeries },
      { name: 'Borne supérieure', series: upperSeries },
      { name: 'Borne inférieure', series: lowerSeries },
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
