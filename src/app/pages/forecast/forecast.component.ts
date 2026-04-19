import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgxChartsModule, Color, ScaleType } from '@swimlane/ngx-charts';
import { FinancialAnalyseService } from '../../services/financial-analyse.service';
import {
  ForecastFilter,
  ForecastResult,
  SUPPORTED_METRICS,
} from '../../models/financial-analyse.model';

@Component({
  selector: 'app-forecast',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxChartsModule],
  templateUrl: './forecast.component.html',
  styleUrl: './forecast.component.css',
})
export class ForecastComponent implements OnInit {
  private readonly service = inject(FinancialAnalyseService);

  readonly metrics = SUPPORTED_METRICS;

  showGuide = false;
  loading = false;
  error: string | null = null;
  result: ForecastResult | null = null;

  filter: ForecastFilter = {
    metric: 'Encaissements',
    horizon: 6,
    anneeDebut: new Date().getFullYear() - 1,
    anneeFin: new Date().getFullYear(),
  };

  // Chart
  view: [number, number] = [1000, 360];
  chartData: any[] = [];
  historyColors: Color = {
    name: 'history',
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
        this.error = err?.error?.message ?? 'Impossible de charger les prévisions.';
        this.loading = false;
      },
    });
  }

  private buildChart(r: ForecastResult): void {
    const fmtDate = (d: string) => new Date(d).toLocaleDateString('fr-FR', { year: 'numeric', month: 'short' });

    const historySeries = r.historicalData.map(p => ({
      name: fmtDate(p.date),
      value: p.value,
    }));

    const forecastSeries = r.forecasts.map(p => ({
      name: fmtDate(p.date),
      value: p.predictedValue,
    }));

    const upperSeries = r.forecasts.map(p => ({
      name: fmtDate(p.date),
      value: p.upperBound,
    }));

    const lowerSeries = r.forecasts.map(p => ({
      name: fmtDate(p.date),
      value: p.lowerBound,
    }));

    this.chartData = [
      { name: 'Historique', series: historySeries },
      { name: 'Prévision', series: forecastSeries },
      { name: 'Borne supérieure', series: upperSeries },
      { name: 'Borne inférieure', series: lowerSeries },
    ];
  }

  get currentUnit(): string {
    return this.metrics.find(m => m.value === this.filter.metric)?.unit ?? '';
  }

  get yAxisLabel(): string {
    return `Valeur (${this.currentUnit})`;
  }

  fmtDate(d: string): string {
    return new Date(d).toLocaleDateString('fr-FR', { year: 'numeric', month: 'short' });
  }

  fmtValue(v: number | null | undefined): string {
    if (v == null) return '—';
    return v.toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  }
}
