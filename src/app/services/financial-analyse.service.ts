import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  ForecastFilter,
  ForecastResult,
  AnomalyFilter,
  AnomalyResult,
} from '../models/financial-analyse.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class FinancialAnalyseService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiBaseUrl}/api/FinancialAnalyse`;

  /** GET /api/FinancialAnalyse/forecast */
  getForecast(filter: ForecastFilter): Observable<ForecastResult> {
    return this.http.get<ForecastResult>(
      `${this.base}/forecast`,
      { params: this.buildParams(filter as unknown as Record<string, unknown>) },
    );
  }

  /** GET /api/FinancialAnalyse/anomalies */
  detectAnomalies(filter: AnomalyFilter): Observable<AnomalyResult> {
    return this.http.get<AnomalyResult>(
      `${this.base}/anomalies`,
      { params: this.buildParams(filter as unknown as Record<string, unknown>) },
    );
  }

  private buildParams(filter: Record<string, unknown>): HttpParams {
    let params = new HttpParams();
    for (const [key, value] of Object.entries(filter)) {
      if (value != null && value !== '') {
        params = params.set(key, String(value));
      }
    }
    return params;
  }
}
