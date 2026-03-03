import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  CentreDeGestionDto,
  CentreDeGestionSummaryDto,
  CentreDeGestionFilterDto,
  PagedResultDto,
  DashboardStatsDto,
  CentreEmployeurStatsDto,
  CentreEmployeStatsDto,
} from '../models/centre-de-gestion.model';

@Injectable({ providedIn: 'root' })
export class CentreDeGestionService {
  private readonly http = inject(HttpClient);
  private readonly base = '/api/CentreDeGestion';

  /** GET /api/CentreDeGestion — paginated + filtered list */
  getAll(filter: CentreDeGestionFilterDto): Observable<PagedResultDto<CentreDeGestionSummaryDto>> {
    let params = new HttpParams()
      .set('page', filter.page.toString())
      .set('pageSize', filter.pageSize.toString());
    if (filter.code) params = params.set('code', filter.code);
    if (filter.libelle) params = params.set('libelle', filter.libelle);
    if (filter.etablissementId != null)
      params = params.set('etablissementId', filter.etablissementId.toString());
    if (filter.tenantId != null) params = params.set('tenantId', filter.tenantId.toString());
    if (filter.tagProd != null) params = params.set('tagProd', filter.tagProd.toString());
    return this.http.get<PagedResultDto<CentreDeGestionSummaryDto>>(this.base, { params });
  }

  /** GET /api/CentreDeGestion/:id */
  getById(id: number): Observable<CentreDeGestionDto> {
    return this.http.get<CentreDeGestionDto>(`${this.base}/${id}`);
  }

  /** GET /api/CentreDeGestion/code/:code */
  getByCode(code: string): Observable<CentreDeGestionDto> {
    return this.http.get<CentreDeGestionDto>(`${this.base}/code/${code}`);
  }

  /** GET /api/CentreDeGestion/etablissement/:etablissementId */
  getByEtablissement(etablissementId: number): Observable<CentreDeGestionSummaryDto[]> {
    return this.http.get<CentreDeGestionSummaryDto[]>(
      `${this.base}/etablissement/${etablissementId}`
    );
  }

  /** GET /api/CentreDeGestion/tenant/:tenantId */
  getByTenant(tenantId: number): Observable<CentreDeGestionSummaryDto[]> {
    return this.http.get<CentreDeGestionSummaryDto[]>(`${this.base}/tenant/${tenantId}`);
  }

  /** GET /api/CentreDeGestion/dashboard/stats */
  getDashboardStats(): Observable<DashboardStatsDto> {
    return this.http.get<DashboardStatsDto>(`${this.base}/dashboard/stats`);
  }

  /**
   * Récupère les statistiques des employeurs rattachés au centre de gestion.
   * Correspond à : GET /api/CentreDeGestion/:centreId/stats/employeurs
   *
   * @param centreId - Identifiant du centre de gestion
   * @returns Observable contenant le DTO de statistiques employeurs
   */
  getEmployeurStats(centreId: number): Observable<CentreEmployeurStatsDto> {
    return this.http.get<CentreEmployeurStatsDto>(
      `${this.base}/${centreId}/stats/employeurs`
    );
  }

  /**
   * Récupère les statistiques des employés rattachés au centre de gestion.
   * Correspond à : GET /api/CentreDeGestion/:centreId/stats/employes
   *
   * @param centreId - Identifiant du centre de gestion
   * @returns Observable contenant le DTO de statistiques employés
   */
  getEmployeStats(centreId: number): Observable<CentreEmployeStatsDto> {
    return this.http.get<CentreEmployeStatsDto>(
      `${this.base}/${centreId}/stats/employes`
    );
  }
}
