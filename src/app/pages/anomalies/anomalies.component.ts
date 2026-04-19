import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgxChartsModule, Color, ScaleType } from '@swimlane/ngx-charts';
import { FinancialAnalyseService } from '../../services/financial-analyse.service';
import {
  AnomalyFilter,
  AnomalyResult,
  AnomalyPoint,
  SUPPORTED_METRICS,
} from '../../models/financial-analyse.model';

@Component({
  selector: 'app-anomalies',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxChartsModule],
  templateUrl: './anomalies.component.html',
  styleUrl: './anomalies.component.css',
})
export class AnomaliesComponent implements OnInit {
  private readonly service = inject(FinancialAnalyseService);

  readonly metrics = SUPPORTED_METRICS;

  showGuide = false;
  loading = false;
  error: string | null = null;
  result: AnomalyResult | null = null;
  anomalies: AnomalyPoint[] = [];

  filter: AnomalyFilter = {
    metric: 'Encaissements',
    confidence: 95,
    anneeDebut: new Date().getFullYear() - 1,
    anneeFin: new Date().getFullYear(),
  };

  // Chart
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
        this.error = err?.error?.message ?? 'Impossible de charger la détection d\'anomalies.';
        this.loading = false;
      },
    });
  }

  private buildChart(r: AnomalyResult): void {
    const fmtDate = (d: string) => new Date(d).toLocaleDateString('fr-FR', { year: 'numeric', month: 'short' });

    const normalSeries = r.points.map(p => ({
      name: fmtDate(p.date),
      value: p.value,
    }));

    const anomalySeries = r.points
      .filter(p => p.isAnomaly)
      .map(p => ({
        name: fmtDate(p.date),
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

  get currentUnit(): string {
    return this.metrics.find(m => m.value === this.filter.metric)?.unit ?? '';
  }

  get yAxisLabel(): string {
    return `Valeur (${this.currentUnit})`;
  }

  fmtValue(v: number | null | undefined): string {
    if (v == null) return '—';
    return v.toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  }
}
