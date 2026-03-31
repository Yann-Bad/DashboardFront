import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  BudgetExecutionDto, BudgetExecutionFilterDto, BudgetExecutionResultDto,
  BudgetDashboardStatsDto, BudgetLookupsDto,
  BudgetSyntheseDto, BudgetSyntheseFilterDto
} from '../models/budget-analyse.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class BudgetAnalyseService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiBaseUrl}/api/BudgetAnalyse`;

  getExecution(filter: BudgetExecutionFilterDto): Observable<BudgetExecutionResultDto> {
    let params = new HttpParams();
    if (filter.exercice != null) params = params.set('exercice', filter.exercice.toString());
    if (filter.codeCentreGestion) params = params.set('codeCentreGestion', filter.codeCentreGestion);
    if (filter.typeBudget) params = params.set('typeBudget', filter.typeBudget);
    if (filter.codeGestion) params = params.set('codeGestion', filter.codeGestion);
    if (filter.niveau != null) params = params.set('niveau', filter.niveau.toString());
    return this.http.get<BudgetExecutionResultDto>(`${this.base}/execution`, { params });
  }

  getLookups(): Observable<BudgetLookupsDto> {
    return this.http.get<BudgetLookupsDto>(`${this.base}/lookups`);
  }

  getDashboardStats(exercice?: number): Observable<BudgetDashboardStatsDto> {
    let params = new HttpParams();
    if (exercice != null) params = params.set('exercice', exercice.toString());
    return this.http.get<BudgetDashboardStatsDto>(`${this.base}/dashboard/stats`, { params });
  }

  getSynthese(filter: BudgetSyntheseFilterDto): Observable<BudgetSyntheseDto[]> {
    let params = new HttpParams();
    if (filter.exercice != null) params = params.set('exercice', filter.exercice.toString());
    if (filter.codeCentreGestion) params = params.set('codeCentreGestion', filter.codeCentreGestion);
    if (filter.typeBudget) params = params.set('typeBudget', filter.typeBudget);
    return this.http.get<BudgetSyntheseDto[]>(`${this.base}/synthese`, { params });
  }
}
