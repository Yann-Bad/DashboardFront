// Modèles de données pour le module Centre de Gestion.
// Chaque interface correspond au DTO exposé par l'API backend (DashboardCore).

/**
 * Statistiques des employeurs d'un centre de gestion par état métier.
 * Retourné par GET /api/CentreDeGestion/:centreId/stats/employeurs
 * États : 1 = En activité | 2 = En cessation | 3 = Inactif
 * Règle : DateDeleted IS NULL, Deleted != true, TagValidate = 1
 */
export interface CentreEmployeurStatsDto {
  centreId: number;
  centreCode: string | null;
  centreLibelle: string | null;
  /** Total employeurs valides (tous états) */
  totalEmployeurs: number;
  /** Etat 1 — En activité */
  enActivite: number;
  /** Etat 2 — En cessation d'activité */
  enCessation: number;
  /** Etat 3 — Inactif */
  inactif: number;
  /** Effectif total des employés du centre */
  totalEmployes: number;
  /** Pourcentages calculés côté backend */
  pourcentageEnActivite: number;
  pourcentageEnCessation: number;
  pourcentageInactif: number;
}

/**
 * Statistiques des employes d'un centre de gestion par statut metier.
 * Retourne par GET /api/CentreDeGestion/:centreId/stats/employes
 * Statuts : 1 = Actif | 2 = Inactif
 * Regle : DateDeleted IS NULL, Deleted != true, TagDeces = 0, TagRetraite = 1, TagValidate = 1
 */
export interface CentreEmployeStatsDto {
  centreId: number;
  centreCode: string | null;
  centreLibelle: string | null;
  /** Total employes valides (tous statuts) */
  totalEmployes: number;
  /** StatutEmployeId = 1 — Actifs */
  actif: number;
  /** StatutEmployeId = 2 — Inactifs */
  inactif: number;
  /** Pourcentages calcules cote backend */
  pourcentageActif: number;
  pourcentageInactif: number;
}

export interface CentreDeGestionDto {
  id: number;
  version: number;
  code: string | null;
  ancienCode: string | null;
  ancienCodePension: string | null;
  libelle: string | null;
  adresse: string | null;
  dateCreated: string;
  lastUpdated: string;
  tenantId: number | null;
  tagProd: number | null;
  etablissementId: number | null;
  etablissementLibelle: string | null;
  organigrammeId: number | null;
  organigrammeLibelle: string | null;
  entiteAdresseId: number | null;
  entiteAdresseLibelle: string | null;
  userCreatedId: number;
  userUpdatedId: number;
  nombreEmployeurs: number;
  nombreEmployes: number;
  nombreCotisationsCompte: number;
  nombreEncaissements: number;
  nombreMajorations: number;
  nombreTaxations: number;
}

export interface CentreDeGestionSummaryDto {
  id: number;
  code: string | null;
  libelle: string | null;
  adresse: string | null;
  tenantId: number | null;
  nombreEmployeurs: number;
  nombreEmployes: number;
}

export interface CentreDeGestionFilterDto {
  code?: string;
  libelle?: string;
  etablissementId?: number;
  tenantId?: number;
  tagProd?: number;
  page: number;
  pageSize: number;
}

export interface PagedResultDto<T> {
  data: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Statistiques globales du tableau de bord.
 * Retourné par GET /api/CentreDeGestion/dashboard/stats
 * États employés : EtatId 1=En activité | 2=En cessation | 3=Inactif
 */
export interface DashboardStatsDto {
  // Centres
  totalCentres: number;

  // Employeurs — compteurs bruts (valides uniquement)
  totalEmployeurs: number;
  /** Etat 1 — En activité */
  employeursEnActivite: number;
  /** Etat 2 — En cessation */
  employeursEnCessation: number;
  /** Etat 3 — Inactifs */
  employeursInactifs: number;

  // Pourcentages calculés côté backend
  pourcentageEnActivite: number;
  pourcentageEnCessation: number;
  pourcentageInactifs: number;

  // Employés
  totalEmployes: number;

  // Cotisations
  totalCotisationsCompte: number;
  totalEncaissements: number;
  totalMajorations: number;
  totalTaxations: number;

  // Employés — états métier (StatutEmployeId)
  employesActifs: number;
  employesInactifs: number;
  pourcentageEmployesActifs: number;
  pourcentageEmployesInactifs: number;

  // Classements
  top5CentresParEmployeurs: CentreDeGestionSummaryDto[];
}
