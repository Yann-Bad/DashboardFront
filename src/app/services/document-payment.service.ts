import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  DocumentPaymentFilterDto,
  DocumentPaymentSummaryDto,
  PaymentByDocumentCategoryDto,
  PaymentByClasseurDto,
  DocumentPaymentTrendDto,
  DocumentOperationDetailDto,
  DocumentPaymentLookupsDto,
  ExecutionByClasseurResultDto,
} from '../models/document-payment.model';

@Injectable({ providedIn: 'root' })
export class DocumentPaymentService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiBaseUrl}/api/DocumentPayment`;

  private params(f: DocumentPaymentFilterDto): HttpParams {
    let p = new HttpParams();
    if (f.dateDebut != null) p = p.set('dateDebut', f.dateDebut);
    if (f.dateFin != null) p = p.set('dateFin', f.dateFin);
    if (f.classeurdocumentId != null) p = p.set('classeurdocumentId', f.classeurdocumentId);
    return p;
  }

  getSummary(f: DocumentPaymentFilterDto): Observable<DocumentPaymentSummaryDto> {
    return this.http.get<DocumentPaymentSummaryDto>(`${this.base}/summary`, { params: this.params(f) });
  }

  getByDocumentCategory(f: DocumentPaymentFilterDto): Observable<PaymentByDocumentCategoryDto[]> {
    return this.http.get<PaymentByDocumentCategoryDto[]>(`${this.base}/by-document-category`, { params: this.params(f) });
  }

  getByClasseur(f: DocumentPaymentFilterDto): Observable<PaymentByClasseurDto[]> {
    return this.http.get<PaymentByClasseurDto[]>(`${this.base}/by-classeur`, { params: this.params(f) });
  }

  getMonthlyTrend(f: DocumentPaymentFilterDto): Observable<DocumentPaymentTrendDto[]> {
    return this.http.get<DocumentPaymentTrendDto[]>(`${this.base}/monthly-trend`, { params: this.params(f) });
  }

  getDetails(f: DocumentPaymentFilterDto): Observable<DocumentOperationDetailDto[]> {
    return this.http.get<DocumentOperationDetailDto[]>(`${this.base}/details`, { params: this.params(f) });
  }

  getExecutionByClasseur(f: DocumentPaymentFilterDto): Observable<ExecutionByClasseurResultDto> {
    return this.http.get<ExecutionByClasseurResultDto>(`${this.base}/execution-by-classeur`, { params: this.params(f) });
  }

  getLookups(): Observable<DocumentPaymentLookupsDto> {
    return this.http.get<DocumentPaymentLookupsDto>(`${this.base}/lookups`);
  }
}
