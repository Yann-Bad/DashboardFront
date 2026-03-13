import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  TreasurySummaryDto,
  CompteComptableSummaryDto,
  ExerciceComptableSummaryDto,
  AccountSummaryDto,
  SummaryAccountFilterDto,
  PagedResultDto,
  TrendFilterDto,
  TrendResultDto,
} from '../models/summary-account.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SummaryAccountService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiBaseUrl}/api/SummaryAccount`;

  /** GET /api/SummaryAccount/treasury/summary */
  getTreasurySummary(): Observable<TreasurySummaryDto> {
    return this.http.get<TreasurySummaryDto>(`${this.base}/treasury/summary`);
  }

  /** GET /api/SummaryAccount/comptes-comptables */
  getComptesComptables(filter: SummaryAccountFilterDto): Observable<PagedResultDto<CompteComptableSummaryDto>> {
    return this.http.get<PagedResultDto<CompteComptableSummaryDto>>(
      `${this.base}/comptes-comptables`,
      { params: this.buildParams(filter) }
    );
  }

  /** GET /api/SummaryAccount/exercices */
  getExercices(): Observable<ExerciceComptableSummaryDto[]> {
    return this.http.get<ExerciceComptableSummaryDto[]>(`${this.base}/exercices`);
  }

  /** GET /api/SummaryAccount/summaryaccounts */
  getSummaryAccounts(filter: SummaryAccountFilterDto): Observable<PagedResultDto<AccountSummaryDto>> {
    return this.http.get<PagedResultDto<AccountSummaryDto>>(
      `${this.base}/summaryaccounts`,
      { params: this.buildParams(filter) }
    );
  }

  /** GET /api/SummaryAccount/trends */
  getTrends(filter: TrendFilterDto): Observable<TrendResultDto> {
    let params = new HttpParams()
      .set('dateFrom', filter.dateFrom)
      .set('dateTo', filter.dateTo)
      .set('granularity', filter.granularity);
    if (filter.typeBank) params = params.set('typeBank', filter.typeBank);
    if (filter.monnaie) params = params.set('monnaie', filter.monnaie);
    if (filter.centre) params = params.set('centre', filter.centre);
    return this.http.get<TrendResultDto>(`${this.base}/trends`, { params });
  }

  private buildParams(filter: SummaryAccountFilterDto): HttpParams {
    let params = new HttpParams()
      .set('page', filter.page.toString())
      .set('pageSize', filter.pageSize.toString());

    if (filter.exercicecomptableId != null)
      params = params.set('exercicecomptableId', filter.exercicecomptableId.toString());
    if (filter.centre) params = params.set('centre', filter.centre);
    if (filter.typeBank) params = params.set('typeBank', filter.typeBank);
    if (filter.monnaie) params = params.set('monnaie', filter.monnaie);
    if (filter.sensoperation) params = params.set('sensoperation', filter.sensoperation);
    if (filter.codebank) params = params.set('codebank', filter.codebank);
    if (filter.typeSearch) params = params.set('typeSearch', filter.typeSearch);
    if (filter.dateoperation) params = params.set('dateoperation', filter.dateoperation);
    if (filter.dateFrom) params = params.set('dateFrom', filter.dateFrom);
    if (filter.dateTo) params = params.set('dateTo', filter.dateTo);

    return params;
  }
}
