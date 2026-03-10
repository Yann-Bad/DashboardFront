// ---------------------------------------------------------------------------
// Modèles TypeScript pour l'analyse des encaissements de cotisations sociales
// Correspondent aux DTOs C# : EncaissementAnalyseDto, EncaissementParCentreDto,
// EncaissementFilterDto (DashboardCore)
// Inspiré des KPIs du dashboard securdc :
//   sum(montantPrincipal), sum(montantMajoration), sum(montantTaxation)
//   count(distinct employeur) = empRecouvre
// ---------------------------------------------------------------------------

/** Ventilation par devise d'un encaissement
 *  Expose les montants en devise d'origine (champs *Devise de securdc/Encaissement.groovy)
 *  ainsi que l'équivalent monnaie locale après application du taux de change.
 */
export interface EncaissementParDeviseDto {
  deviseId:      number;
  deviseCode:    string | null;
  deviseLibelle: string | null;
  totalEncaissements: number;
  // Montants en devise d'origine (avant conversion)
  montantPrincipalDevise:  number;
  montantMajorationDevise: number;
  montantTaxationDevise:   number;
  montantDevise:           number;
  // Équivalent monnaie locale (sum(Montant) après taux de change)
  montantLocal: number;
}

/** Résumé des encaissements d'un centre de gestion sur une période donnée */
export interface EncaissementParCentreDto {
  centreId:          number;
  centreCode:        string | null;
  centreLibelle:     string | null;
  totalEncaissements: number;
  nombreEmployeurs:  number;
  montantPrincipal:  number;
  montantMajoration: number;
  montantTaxation:   number;
  montant:           number;
  /** Calculé côté serveur = Principal + Majoration + Taxation */
  montantComposantes: number;
}

/** Analyse des encaissements pour une période (Annee + Mois de Cotisationencaissement.Periode) */
export interface EncaissementAnalyseDto {
  annee:   number;
  mois:    string;         // "01"–"12"
  periode: string;         // ISO date, premier jour du mois

  // Compteurs
  totalEncaissements:        number;
  nombreEmployeursAyantPaye: number;

  // Montants agrégés (source : Cotisationencaissement)
  montantPrincipal:  number;
  montantMajoration: number;
  montantTaxation:   number;
  montant:           number;
  /** Calculé côté serveur = Principal + Majoration + Taxation */
  montantComposantes: number;

  // Ventilation par devise (montants en devise d'origine + équivalent local).
  // DeviseId = 0 → monnaie locale (enregistrements sans devise renseignée).
  // Les montants en devise d'origine (montantDevise, *Devise) ne peuvent PAS
  // être additionnés entre devises différentes.
  montantsParDevise: EncaissementParDeviseDto[];

  /**
   * True si la période contient des enregistrements dans plusieurs devises.
   * Quand true, les montants agrégés (montantPrincipal, montant…) sont des équivalents
   * en monnaie locale (convertis via tauxchange) et ne doivent pas être présentés sans
   * annotation indiquant leur nature de conversion.
   */
  hasMultipleCurrencies: boolean;

  // Détail par centre — vide sauf si avecDetailParCentre = true
  parCentre: EncaissementParCentreDto[];

  // Tendances vs période précédente — null = première période
  variationEncaissements: number | null;
  variationMontant:       number | null;
  tauxCroissance:         number | null;
  tendance: 'hausse' | 'baisse' | 'stable' | null;

  // Ventilation par mode de paiement (Referentielmodepaie)
  parModePaiement: EncaissementParModePaiementDto[];
}

/** Synthèse d'encaissements pour un mode de paiement sur une période */
export interface EncaissementParModePaiementDto {
  modePaiementId: number | null;
  modeCode:       string | null;
  modeNature:     string | null;
  totalEncaissements: number;
  montantPrincipal:   number;
  montantMajoration:  number;
  montantTaxation:    number;
  montant:            number;
  /** Calculé côté serveur = Principal + Majoration + Taxation */
  montantComposantes: number;
}

/** Critères de filtrage envoyés au backend */
export interface EncaissementFilterDto {
  anneeDebut?:          number | null;
  anneeFin?:            number | null;
  moisDebut?:           string | null;
  moisFin?:             string | null;
  centreDeGestionId?:   number | null;
  tenantId?:            number | null;
  avecDetailParCentre?: boolean;
}
