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
  GlobalEmployeurStatsDto,
  GrappeFamilleStatsDto,
} from '../models/centre-de-gestion.model';
import {
  DeclarationAnalyseDto,
  DeclarationFilterDto,
} from '../models/declaration-analyse.model';
import {
  EncaissementAnalyseDto,
  EncaissementFilterDto,
} from '../models/encaissement-analyse.model';
import {
  DossierAnalyseDto,
  DossierFilterDto,
} from '../models/dossier-analyse.model';
import {
  BalanceAnalyseDto,
  BalanceFilterDto,
} from '../models/balance-analyse.model';
import { LookupsDto } from '../models/lookups.model';
import {
  MajorationTaxationAnalyseDto,
  MajorationTaxationFilterDto,
} from '../models/majoration-taxation-analyse.model';
import {
  AcompteAnalyseDto,
  AcompteFilterDto,
} from '../models/acompte-analyse.model';
import {
  PrestationAnalyseDto,
  PrestationFilterDto,
} from '../models/prestation-analyse.model';
import {
  ImmatriculationAnalyseDto,
  ImmatriculationFilterDto,
} from '../models/immatriculation-analyse.model';
import {
  RecouvrementAnalyseDto,
  RecouvrementFilterDto,
} from '../models/recouvrement-analyse.model';
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
   * Correspond à : GET /api/CentreDeGestion/:centreId/stats/employeurs?dateReference=…
   *
   * @param centreId      Identifiant du centre de gestion
   * @param dateReference Date de référence ISO (yyyy-MM-dd). Défaut : aujourd'hui côté backend
   */
  getEmployeurStats(centreId: number, dateReference?: string): Observable<CentreEmployeurStatsDto> {
    let params = new HttpParams();
    if (dateReference) params = params.set('dateReference', dateReference);
    return this.http.get<CentreEmployeurStatsDto>(
      `${this.base}/${centreId}/stats/employeurs`,
      { params }
    );
  }

  /**
   * Récupère les statistiques globales des employeurs pour TOUS les centres.
   * Correspond à : GET /api/CentreDeGestion/stats/employeurs/global?dateReference=…
   *
   * @param dateReference Date de référence ISO (yyyy-MM-dd). Défaut : aujourd'hui côté backend
   */
  getGlobalEmployeurStats(dateReference?: string): Observable<GlobalEmployeurStatsDto> {
    let params = new HttpParams();
    if (dateReference) params = params.set('dateReference', dateReference);
    return this.http.get<GlobalEmployeurStatsDto>(
      `${this.base}/stats/employeurs/global`,
      { params }
    );
  }

  /**
   * Récupère les statistiques des employés rattachés au centre de gestion.
   * Correspond à : GET /api/CentreDeGestion/:centreId/stats/employes
   *
   * @param centreId - Identifiant du centre de gestion
   * @returns Observable contenant le DTO de statistiques employés
   */
  getEmployeStats(centreId: number, dateReference?: string): Observable<CentreEmployeStatsDto> {
    const params: Record<string, string> = {};
    if (dateReference) params['dateReference'] = dateReference;
    return this.http.get<CentreEmployeStatsDto>(
      `${this.base}/${centreId}/stats/employes`, { params }
    );
  }

  /**
   * Statistiques de la grappe familiale des employés d'un centre.
   * Correspond à : GET /api/CentreDeGestion/:centreId/stats/famille
   */
  getGrappeFamilleStats(centreId: number): Observable<GrappeFamilleStatsDto> {
    return this.http.get<GrappeFamilleStatsDto>(`${this.base}/${centreId}/stats/famille`);
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

  /**
   * Analyse des encaissements de cotisations (Cotisationencaissement) par période.
   * Correspond à : GET /api/CentreDeGestion/encaissements/analyse
   *
   * Si aucune borne d'année n'est fournie, le backend retourne l'année courante.
   */
  getEncaissementAnalyse(filter: EncaissementFilterDto = {}): Observable<EncaissementAnalyseDto[]> {
    let params = new HttpParams();
    if (filter.anneeDebut        != null) params = params.set('anneeDebut',        filter.anneeDebut.toString());
    if (filter.anneeFin          != null) params = params.set('anneeFin',          filter.anneeFin.toString());
    if (filter.moisDebut)                 params = params.set('moisDebut',         filter.moisDebut);
    if (filter.moisFin)                   params = params.set('moisFin',           filter.moisFin);
    if (filter.centreDeGestionId != null) params = params.set('centreDeGestionId', filter.centreDeGestionId.toString());
    if (filter.tenantId          != null) params = params.set('tenantId',          filter.tenantId.toString());
    if (filter.avecDetailParCentre)       params = params.set('avecDetailParCentre', 'true');
    return this.http.get<EncaissementAnalyseDto[]>(`${this.base}/encaissements/analyse`, { params });
  }

  /**
   * Analyse des soldes employeurs (Cotisationbalance).
   * Correspond à : GET /api/CentreDeGestion/balance/analyse
   */
  getBalanceAnalyse(filter: BalanceFilterDto = {}): Observable<BalanceAnalyseDto> {
    let params = new HttpParams();
    if (filter.centreDeGestionId != null)
      params = params.set('centreDeGestionId', filter.centreDeGestionId.toString());
    if (filter.tenantId != null)
      params = params.set('tenantId', filter.tenantId.toString());
    if (filter.topN != null)
      params = params.set('topN', filter.topN.toString());
    return this.http.get<BalanceAnalyseDto>(`${this.base}/balance/analyse`, { params });
  }

  /** GET /api/CentreDeGestion/lookups — reference data for dropdowns */
  getLookups(): Observable<LookupsDto> {
    return this.http.get<LookupsDto>(`${this.base}/lookups`);
  }

  /** GET /api/CentreDeGestion/majorations-taxations/analyse */
  getMajorationTaxationAnalyse(
    filter: MajorationTaxationFilterDto = {},
  ): Observable<MajorationTaxationAnalyseDto[]> {
    let params = new HttpParams();
    if (filter.anneeDebut        != null) params = params.set('anneeDebut',        filter.anneeDebut.toString());
    if (filter.anneeFin          != null) params = params.set('anneeFin',          filter.anneeFin.toString());
    if (filter.moisDebut)                 params = params.set('moisDebut',         filter.moisDebut);
    if (filter.moisFin)                   params = params.set('moisFin',           filter.moisFin);
    if (filter.centreDeGestionId != null) params = params.set('centreDeGestionId', filter.centreDeGestionId.toString());
    if (filter.tenantId          != null) params = params.set('tenantId',          filter.tenantId.toString());
    if (filter.avecDetailParCentre)       params = params.set('avecDetailParCentre', 'true');
    return this.http.get<MajorationTaxationAnalyseDto[]>(
      `${this.base}/majorations-taxations/analyse`, { params },
    );
  }

  /** GET /api/CentreDeGestion/acomptes/analyse */
  getAcompteAnalyse(
    filter: AcompteFilterDto = {},
  ): Observable<AcompteAnalyseDto[]> {
    let params = new HttpParams();
    if (filter.anneeDebut        != null) params = params.set('anneeDebut',        filter.anneeDebut.toString());
    if (filter.anneeFin          != null) params = params.set('anneeFin',          filter.anneeFin.toString());
    if (filter.moisDebut)                 params = params.set('moisDebut',         filter.moisDebut);
    if (filter.moisFin)                   params = params.set('moisFin',           filter.moisFin);
    if (filter.centreDeGestionId != null) params = params.set('centreDeGestionId', filter.centreDeGestionId.toString());
    if (filter.tenantId          != null) params = params.set('tenantId',          filter.tenantId.toString());
    if (filter.avecDetailParCentre)       params = params.set('avecDetailParCentre', 'true');
    return this.http.get<AcompteAnalyseDto[]>(
      `${this.base}/acomptes/analyse`, { params },
    );
  }

  /** GET /api/CentreDeGestion/prestations/analyse */
  getPrestationAnalyse(
    filter: PrestationFilterDto = {},
  ): Observable<PrestationAnalyseDto[]> {
    let params = new HttpParams();
    if (filter.anneeDebut        != null) params = params.set('anneeDebut',        filter.anneeDebut.toString());
    if (filter.anneeFin          != null) params = params.set('anneeFin',          filter.anneeFin.toString());
    if (filter.moisDebut)                 params = params.set('moisDebut',         filter.moisDebut);
    if (filter.moisFin)                   params = params.set('moisFin',           filter.moisFin);
    if (filter.centreDeGestionId != null) params = params.set('centreDeGestionId', filter.centreDeGestionId.toString());
    if (filter.typePfId          != null) params = params.set('typePfId',          filter.typePfId.toString());
    if (filter.tenantId          != null) params = params.set('tenantId',          filter.tenantId.toString());
    if (filter.branche)                   params = params.set('branche',           filter.branche);
    if (filter.avecDetailParType)         params = params.set('avecDetailParType', 'true');
    if (filter.avecDetailParCentre)       params = params.set('avecDetailParCentre', 'true');
    return this.http.get<PrestationAnalyseDto[]>(
      `${this.base}/prestations/analyse`, { params },
    );
  }

  /** GET /api/CentreDeGestion/immatriculations/analyse */
  getImmatriculationAnalyse(
    filter: ImmatriculationFilterDto = {},
  ): Observable<ImmatriculationAnalyseDto[]> {
    let params = new HttpParams();
    if (filter.anneeDebut        != null) params = params.set('anneeDebut',        filter.anneeDebut.toString());
    if (filter.anneeFin          != null) params = params.set('anneeFin',          filter.anneeFin.toString());
    if (filter.moisDebut)                 params = params.set('moisDebut',         filter.moisDebut);
    if (filter.moisFin)                   params = params.set('moisFin',           filter.moisFin);
    if (filter.centreDeGestionId != null) params = params.set('centreDeGestionId', filter.centreDeGestionId.toString());
    if (filter.tenantId          != null) params = params.set('tenantId',          filter.tenantId.toString());
    if (filter.avecDetailParCentre)       params = params.set('avecDetailParCentre', 'true');
    return this.http.get<ImmatriculationAnalyseDto[]>(
      `${this.base}/immatriculations/analyse`, { params },
    );
  }

  /** GET /api/CentreDeGestion/recouvrement/analyse */
  getRecouvrementAnalyse(
    filter: RecouvrementFilterDto = {},
  ): Observable<RecouvrementAnalyseDto[]> {
    let params = new HttpParams();
    if (filter.anneeDebut        != null) params = params.set('anneeDebut',        filter.anneeDebut.toString());
    if (filter.anneeFin          != null) params = params.set('anneeFin',          filter.anneeFin.toString());
    if (filter.moisDebut         != null) params = params.set('moisDebut',         filter.moisDebut.toString());
    if (filter.moisFin           != null) params = params.set('moisFin',           filter.moisFin.toString());
    if (filter.centreDeGestionId != null) params = params.set('centreDeGestionId', filter.centreDeGestionId.toString());
    if (filter.tenantId          != null) params = params.set('tenantId',          filter.tenantId.toString());
    if (filter.topEmployeurs     != null) params = params.set('topEmployeurs',     filter.topEmployeurs.toString());
    if (filter.avecDetailParCentre)       params = params.set('avecDetailParCentre', 'true');
    return this.http.get<RecouvrementAnalyseDto[]>(
      `${this.base}/recouvrement/analyse`, { params },
    );
  }
}
