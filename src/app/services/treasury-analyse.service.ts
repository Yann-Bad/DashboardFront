import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  TreasuryForecastFilter,
  TreasuryForecastResult,
  TreasuryAnomalyFilter,
  TreasuryAnomalyResult,
} from '../models/treasury-analyse.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class TreasuryAnalyseService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiBaseUrl}/api/TreasuryAnalyse`;

  getForecast(filter: TreasuryForecastFilter): Observable<TreasuryForecastResult> {
    return this.http.get<TreasuryForecastResult>(
      `${this.base}/forecast`,
      { params: this.buildParams(filter as unknown as Record<string, unknown>) },
    );
  }

  detectAnomalies(filter: TreasuryAnomalyFilter): Observable<TreasuryAnomalyResult> {
    return this.http.get<TreasuryAnomalyResult>(
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
