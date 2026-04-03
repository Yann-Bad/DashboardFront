import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  PropertyFilterDto, BillingFilterDto,
  PropertyDashboardStatsDto, BillingSummaryDto,
  ImmeubleDto, UniteLocativeDto, LocataireDto,
  FacturationDto, PaiementDto, ImpayeDto,
  OccupancyByImmeubleDto, PropertyLookupsDto
} from '../models/property-management.model';
import { environment } from '../../environments/environment';

/**
 * HTTP client for the Property Management API (DGI).
 * Base route: /api/PropertyManagement
 */
@Injectable({ providedIn: 'root' })
export class PropertyManagementService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiBaseUrl}/api/PropertyManagement`;

  // ── Helpers ──────────────────────────────────────────────────────────────

  private propertyParams(f: PropertyFilterDto): HttpParams {
    let p = new HttpParams();
    if (f.centreGestionId != null) p = p.set('centreGestionId', f.centreGestionId.toString());
    if (f.annee != null) p = p.set('annee', f.annee.toString());
    return p;
  }

  private billingParams(f: BillingFilterDto): HttpParams {
    let p = this.propertyParams(f);
    if (f.fkNor != null) p = p.set('fkNor', f.fkNor.toString());
    return p;
  }

  // ── Endpoints ────────────────────────────────────────────────────────────

  getDashboardStats(filter: PropertyFilterDto): Observable<PropertyDashboardStatsDto> {
    return this.http.get<PropertyDashboardStatsDto>(`${this.base}/dashboard/stats`, { params: this.propertyParams(filter) });
  }

  getBillingSummary(filter: BillingFilterDto): Observable<BillingSummaryDto> {
    return this.http.get<BillingSummaryDto>(`${this.base}/billing/summary`, { params: this.billingParams(filter) });
  }

  getImmeubles(filter: PropertyFilterDto): Observable<ImmeubleDto[]> {
    return this.http.get<ImmeubleDto[]>(`${this.base}/immeubles`, { params: this.propertyParams(filter) });
  }

  getUnites(filter: PropertyFilterDto): Observable<UniteLocativeDto[]> {
    return this.http.get<UniteLocativeDto[]>(`${this.base}/unites`, { params: this.propertyParams(filter) });
  }

  getLocataires(filter: PropertyFilterDto): Observable<LocataireDto[]> {
    return this.http.get<LocataireDto[]>(`${this.base}/locataires`, { params: this.propertyParams(filter) });
  }

  getFacturations(filter: BillingFilterDto): Observable<FacturationDto[]> {
    return this.http.get<FacturationDto[]>(`${this.base}/facturations`, { params: this.billingParams(filter) });
  }

  getPaiements(filter: BillingFilterDto): Observable<PaiementDto[]> {
    return this.http.get<PaiementDto[]>(`${this.base}/paiements`, { params: this.billingParams(filter) });
  }

  getImpayes(filter: BillingFilterDto): Observable<ImpayeDto[]> {
    return this.http.get<ImpayeDto[]>(`${this.base}/impayes`, { params: this.billingParams(filter) });
  }

  getOccupancy(filter: PropertyFilterDto): Observable<OccupancyByImmeubleDto[]> {
    return this.http.get<OccupancyByImmeubleDto[]>(`${this.base}/occupancy`, { params: this.propertyParams(filter) });
  }

  getLookups(): Observable<PropertyLookupsDto> {
    return this.http.get<PropertyLookupsDto>(`${this.base}/lookups`);
  }
}
