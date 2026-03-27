// Modèles de données pour le module Centre de Gestion.
// Chaque interface correspond au DTO exposé par l'API backend (DashboardCore).

/** Élément générique de ventilation (forme juridique, régime, secteur, état, type…) */
export interface BreakdownItemDto {
  id: number;
  code: string | null;
  libelle: string | null;
  nombre: number;
  pourcentage: number;
}

/**
 * Statistiques des employeurs d'un centre de gestion par état métier.
 * Retourné par GET /api/CentreDeGestion/:centreId/stats/employeurs?dateReference=…
 * L'état est déterminé via l'historique temporel (immatriculationhistoetatemployeur).
 * Règle : DateDeleted IS NULL, Deleted != true, TagValidate = 1
 */
export interface CentreEmployeurStatsDto {
  centreId: number;
  centreCode: string | null;
  centreLibelle: string | null;
  /** Date de référence utilisée pour déterminer l'état courant */
  dateReference: string;
  /** Total employeurs valides (tous états) */
  totalEmployeurs: number;
  /** EN ACTIVITE — nombre d'employeurs */
  enActivite: number;
  /** EN ACTIVITE — travailleurs validés à la date de référence */
  travailleurs_EnActivite: number;
  /** EN CESSATION — nombre d'employeurs */
  enCessation: number;
  /** EN CESSATION — travailleurs validés à la date de référence */
  travailleurs_EnCessation: number;
  /** INACTIF — nombre d'employeurs */
  inactif: number;
  /** INACTIF — travailleurs validés à la date de référence */
  travailleurs_Inactif: number;
  /** Employeurs sans ligne d'historique valide à la date de référence */
  sansEtatHistorique: number;
  /** Total travailleurs (enActivite + enCessation + inactif) */
  totalTravailleurs: number;
  /** Pourcentages calculés côté backend */
  pourcentageEnActivite: number;
  pourcentageEnCessation: number;
  pourcentageInactif: number;
  /** Ventilations par forme juridique, régime et secteur */
  breakdownParFormeJuridique: BreakdownItemDto[];
  breakdownParRegime: BreakdownItemDto[];
  breakdownParSecteur: BreakdownItemDto[];
}

/**
 * Statistiques globales des employeurs pour TOUS les centres de gestion,
 * groupées par (centre, état).
 * Retourné par GET /api/CentreDeGestion/stats/employeurs/global?dateReference=…
 */
export interface GlobalEmployeurStatsDto {
  dateReference: string;
  lignes: GlobalEmployeurStatsLineDto[];
  /** Total cumulé tous centres / états */
  totalEmployeurs: number;
  totalTravailleurs: number;
}

/** Une ligne de la vue agrégée : couple (centre de gestion, état employeur) */
export interface GlobalEmployeurStatsLineDto {
  centreId: number;
  centreLibelle: string;
  etatEmployeur: string;
  nombreEmployeurs: number;
  nombreTravailleurs: number;
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
  /** Date de référence utilisée pour le calcul via historique */
  dateReference: string;
  /** Total employés valides (DateDeleted IS NULL, Deleted != true, TagValidate = 1) */
  totalEmployes: number;
  /** Employés dont l'état historique contient ACTIVIT */
  enActivite: number;
  /** Employés dont l'état historique contient CESSATION */
  enCessation: number;
  /** Employés dont l'état historique contient INACTIF */
  inactif: number;
  /** Employés sans ligne d'historique à la date de référence */
  sansEtatHistorique: number;
  /** Pourcentages calculés côté backend */
  pourcentageEnActivite: number;
  pourcentageEnCessation: number;
  pourcentageInactif: number;
}

/** Distribution du nombre d'enfants par palier */
export interface EnfantDistributionDto {
  label: string;
  nbEnfants: number;
  nombre: number;
  pourcentage: number;
}

/**
 * Statistiques de la grappe familiale (family cluster) des employés d'un centre.
 * Retourné par GET /api/CentreDeGestion/:centreId/stats/famille
 */
export interface GrappeFamilleStatsDto {
  centreId: number;
  centreCode: string | null;
  centreLibelle: string | null;
  /** Total d'employés valides du centre */
  totalEmployesValides: number;
  /** Employés avec grappe validée pour la branche Pension (tagFamille = 0) */
  avecGrappeValidePension: number;
  /** Employés avec grappe validée pour les Prestations Familiales (tagFamillePf = 0) */
  avecGrappeValidePf: number;
  /** Employés avec grappe validée pour les Risques Professionnels (tagFamilleRp = 0) */
  avecGrappeValideRp: number;
  /** Nombre total de conjoints actifs (non décédés) */
  totalConjoints: number;
  /** Nombre total d'enfants actifs (non décédés) */
  totalEnfants: number;
  /** Nombre total d'ascendants actifs (non décédés) */
  totalAscendants: number;
  /** Total de tous les membres de la famille */
  totalMembresFamille: number;
  /** Employés ayant au moins un conjoint actif */
  employesAvecConjoint: number;
  /** Employés ayant au moins un enfant actif */
  employesAvecEnfants: number;
  /** Employés ayant au moins un ascendant actif */
  employesAvecAscendants: number;
  /** % employés avec conjoint */
  pctAvecConjoint: number;
  /** % employés avec enfants */
  pctAvecEnfants: number;
  /** % employés avec ascendants */
  pctAvecAscendants: number;
  /** Moyenne d'enfants par employé */
  moyenneEnfants: number;
  /** Ventilation par nombre d'enfants */
  distributionEnfants: EnfantDistributionDto[];
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

  // Employés — états déduits de l'employeur (EtatId)
  employesEnActivite: number;
  employesEnCessation: number;
  employesInactifs: number;
  employesSansEmployeur: number;
  pourcentageEmployesEnActivite: number;
  pourcentageEmployesEnCessation: number;
  pourcentageEmployesInactifs: number;

  // Encaissements — montants agrégés (Cotisationencaissement actifs, non supprimés)
  montantPrincipalEncaisse: number;
  montantMajorationEncaisse: number;
  montantTaxationEncaisse: number;
  /** Calculé côté backend = Principal + Majoration + Taxation */
  montantTotalEncaisse: number;

  // Taux de recouvrement annuel (année courante)
  /** Employeurs distincts ayant déclaré sur l'année courante */
  employeursDeclares: number;
  /** Employeurs distincts ayant effectué au moins un encaissement sur l'année courante */
  employeursAyantPaye: number;
  /** Calculé côté backend = (employeursAyantPaye / employeursDeclares) × 100 */
  tauxRecouvrementAnnuel: number;

  // Classements
  top5CentresParEmployeurs: CentreDeGestionSummaryDto[];

  // Effectifs déclarés (Immatriculationeffectif — snapshots périodiques)
  /** Somme de EffectifTotal — effectifs réels déclarés par les employeurs */
  effectifDeclareTotal: number;
  /** Somme de EffectifEmploye (hors assimilés) */
  effectifEmployeDeclare: number;
  /** Somme de EffectifEmployeAssimile */
  effectifAssimileDeclare: number;
  /** Ventilations des employeurs par forme juridique, régime et secteur */
  breakdownParFormeJuridique: BreakdownItemDto[];
  breakdownParRegime: BreakdownItemDto[];
  breakdownParSecteur: BreakdownItemDto[];
  /** Ventilation des déclarations et encaissements par devise */
  breakdownParDevise: DeviseBreakdownDto[];
}

export interface DeviseBreakdownDto {
  deviseId: number;
  deviseCode: string | null;
  deviseLibelle: string | null;
  nbDeclarations: number;
  nbEncaissements: number;
  montantEncaisseCdf: number;
  montantEncaisseDevise: number;
  pctDeclarations: number;
  pctMontantCdf: number;
}
