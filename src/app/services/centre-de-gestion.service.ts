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
import {
  DeclarationAnalyseDto,
  DeclarationFilterDto,
} from '../models/declaration-analyse.model';
import {
  DossierAnalyseDto,
  DossierFilterDto,
} from '../models/dossier-analyse.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CentreDeGestionService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = environment.apiBaseUrl; // e.g. https://localhost:5001 or https://api.yourdomain.com
  private readonly base = `${this.apiBaseUrl}/api/CentreDeGestion`;

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

  /**
   * Analyse des déclarations de cotisations sociales par période.
   * Correspond à : GET /api/CentreDeGestion/declarations/analyse
   *
   * Si aucune borne d'année n'est fournie, le backend retourne l'année courante.
   *
   * @param filter - Critères optionnels : plage d'années, mois, centre, tenant, validation
   * @returns Observable contenant la liste des analyses par période
   */
  getDeclarationAnalyse(filter: DeclarationFilterDto = {}): Observable<DeclarationAnalyseDto[]> {
    let params = new HttpParams();
    if (filter.anneeDebut != null)   params = params.set('anneeDebut',   filter.anneeDebut.toString());
    if (filter.anneeFin   != null)   params = params.set('anneeFin',     filter.anneeFin.toString());
    if (filter.moisDebut)            params = params.set('moisDebut',    filter.moisDebut);
    if (filter.moisFin)              params = params.set('moisFin',      filter.moisFin);
    if (filter.centreDeGestionId != null)
      params = params.set('centreDeGestionId', filter.centreDeGestionId.toString());
    if (filter.tenantId != null)     params = params.set('tenantId',     filter.tenantId.toString());
    if (filter.valideesSeulement != null)
      params = params.set('valideesSeulement', filter.valideesSeulement.toString());
    if (filter.avecDetailParCentre)
      params = params.set('avecDetailParCentre', 'true');
    return this.http.get<DeclarationAnalyseDto[]>(`${this.base}/declarations/analyse`, { params });
  }

  /**
   * Analyse des dossiers (Frontofficedossier) par période.
   * Correspond à : GET /api/CentreDeGestion/dossiers/analyse
   *
   * @param filter - Critères optionnels : plage d'années, mois, type, état, centre, tenant
   * @returns Observable contenant la liste des analyses de dossiers par période
   */
  getDossierAnalyse(filter: DossierFilterDto = {}): Observable<DossierAnalyseDto[]> {
    let params = new HttpParams();
    if (filter.anneeDebut        != null) params = params.set('anneeDebut',        filter.anneeDebut.toString());
    if (filter.anneeFin          != null) params = params.set('anneeFin',          filter.anneeFin.toString());
    if (filter.moisDebut)                 params = params.set('moisDebut',         filter.moisDebut);
    if (filter.moisFin)                   params = params.set('moisFin',           filter.moisFin);
    if (filter.typeDossierId     != null) params = params.set('typeDossierId',     filter.typeDossierId.toString());
    if (filter.etatDossierId     != null) params = params.set('etatDossierId',     filter.etatDossierId.toString());
    if (filter.centreDeGestionId != null) params = params.set('centreDeGestionId', filter.centreDeGestionId.toString());
    if (filter.tenantId          != null) params = params.set('tenantId',          filter.tenantId.toString());
    if (filter.avecDetailParCentre)       params = params.set('avecDetailParCentre', 'true');
    return this.http.get<DossierAnalyseDto[]>(`${this.base}/dossiers/analyse`, { params });
  }
}
