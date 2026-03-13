import { BreakdownItemDto } from './centre-de-gestion.model';

// ---------------------------------------------------------------------------
// Modèles TypeScript pour l'analyse des dossiers (Frontofficedossier)
// Correspondent aux DTOs C# : DossierAnalyseDto, DossierParCentreDto,
// DossierFilterDto (DashboardCore)
// ---------------------------------------------------------------------------

/** Résumé des dossiers d'un centre de gestion sur une période donnée */
export interface DossierParCentreDto {
  centreId:      number;
  centreCode:    string | null;
  centreLibelle: string | null;
  totalDossiers: number;
  complets:      number;
  fermes:        number;
  rejetes:       number;
  reuverts:      number;
  /** Calculés côté serveur */
  tauxComplet: number;
  tauxFerme:   number;
}

/** Analyse des dossiers pour une période (Année + Mois) */
export interface DossierAnalyseDto {
  annee:   number;
  mois:    string;
  periode: string; // ISO date string (premier jour du mois)

  totalDossiers:      number;
  dossiersComplets:   number;
  dossiersFermes:     number;
  dossiersRejetes:    number;
  dossiersDepot:      number;
  dossiersReuverts:   number;
  dossiersRattrapage: number;

  /** Calculés côté serveur */
  tauxComplet: number;
  tauxFerme:   number;
  tauxRejet:   number;

  /** Tendances vs période précédente — null = première période */
  variationDossiers:    number | null;
  variationTauxComplet: number | null;
  tauxCroissance:       number | null;
  tendance: 'hausse' | 'baisse' | 'stable' | null;

  /** Détail par centre — vide sauf si avecDetailParCentre = true */
  parCentre: DossierParCentreDto[];
  /** Ventilation par état de dossier (code + libellé depuis Frontofficeetatdossier) */
  breakdownParEtat: BreakdownItemDto[];
  /** Ventilation par type de dossier (code + libellé depuis Frontofficetypedossier) */
  breakdownParType: BreakdownItemDto[];

  /** Compteurs nommés par état réel (EtatDossier.Code) */
  dossiersDeposes:             number;
  dossiersPrisEnCharge:        number;
  dossiersEnAttenteValidation: number;
  dossiersDeclarationRejetes:  number;  // code 03
  dossiersValidesATraiter:     number;
  dossiersBonPourLiquidation:  number;  // code 05 — DECOMPTE EFFECTUE, BON POUR LIQUIDATION
  dossiersDroitActive:         number;  // code 06 — DROIT ACTIVE
  dossiersLiquides:            number;  // code 07
  dossiersDroitDesactive:      number;  // code 10
  dossiersClotures:            number;  // code 20 — DOSSIER CLOTURE
  dossiersAccidentTrajet:      number;
  dossiersAccidentTravail:     number;
  dossiersAnticipeVolontaire:  number;
  dossiersAnticipeParUsure:    number;
  breakdownParTypeAccident:    BreakdownItemDto[];
  breakdownParTypeAnticipe:    BreakdownItemDto[];
}

/** Critères de filtrage envoyés au backend */
export interface DossierFilterDto {
  anneeDebut?:         number | null;
  anneeFin?:           number | null;
  moisDebut?:          string | null;
  moisFin?:            string | null;
  typeDossierId?:      number | null;
  etatDossierId?:      number | null;
  centreDeGestionId?:  number | null;
  tenantId?:           number | null;
  avecDetailParCentre?: boolean;
}
