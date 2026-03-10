// ---------------------------------------------------------------------------
// Modèles TypeScript pour l'analyse des déclarations de cotisations sociales
// Correspondent aux DTOs C# : DeclarationAnalyseDto, DeclarationParCentreDto,
// DeclarationFilterDto (DashboardCore)
// ---------------------------------------------------------------------------

/** Montant agrégé pour une devise donnée */
export interface MontantParDeviseDto {
  deviseId:      number;
  deviseCode:    string | null;
  deviseLibelle: string | null;
  montantTotal:    number;
  montantValide:   number;
  montantNonValide: number;
}

/** Résumé des déclarations d'un centre de gestion sur une période donnée */
export interface DeclarationParCentreDto {
  centreId: number;
  centreCode: string | null;
  centreLibelle: string | null;
  totalDeclarations: number;
  validees: number;
  nonValidees: number;
  nombreEmployeurs: number;
  totalTravailleurs: number;
  /** Montants agrégés (source : Cotisationcompteemployeur) */
  montantTotal: number;
  montantValide: number;
  montantNonValide: number;
  /** Ventilation par devise */
  montantsParDevise: MontantParDeviseDto[];
  /** Calculé côté serveur */
  tauxValidation: number;
}

/** Analyse des déclarations pour une période (Annee + Mois) */
export interface DeclarationAnalyseDto {
  annee: number;
  mois: string;
  periode: string; // ISO date string
  totalDeclarations: number;
  declarationsValidees: number;
  declarationsNonValidees: number;
  declarationsRattrapage: number;
  declarationsRedressees: number;
  declarationsComplementaires: number;
  nombreEmployeursDeclares: number;
  totalTravailleursDeclares: number;
  /** Montants agrégés (source : Cotisationcompteemployeur) */
  montantTotalDeclare: number;
  montantValide: number;
  montantNonValide: number;
  variationMontant: number | null;

  // -----------------------------------------------------------------------
  // Recouvrement — cross-link avec Cotisationencaissement (même plage)
  // KPI securdc : empRecouvre = distinct employeurs ayant payé
  // -----------------------------------------------------------------------
  /** Employeurs distincts ayant effectué au moins un encaissement sur la période */
  employeursAyantPaye: number;
  /** (employeursAyantPaye / nombreEmployeursDeclares) × 100 */
  tauxRecouvrement: number;
  /** Montant total encaissé (champ Montant de Cotisationencaissement) */
  montantEncaisse: number;
  montantPrincipalEncaisse: number;
  montantMajorationEncaisse: number;
  montantTaxationEncaisse: number;
  /** Variation du montant encaissé vs la période précédente */
  variationMontantEncaisse: number | null;

  /** Ventilation par devise */
  montantsParDevise: MontantParDeviseDto[];
  /** Calculés côté serveur */
  tauxValidation: number;
  tauxRattrapage: number;
  /** Tendances vs période précédente — null = première période */
  variationDeclarations: number | null;
  variationEmployeurs: number | null;
  variationTravailleurs: number | null;
  variationTauxValidation: number | null;
  tauxCroissance: number | null;
  tendance: 'hausse' | 'baisse' | 'stable' | null;
  /** Détail par centre — vide sauf si avecDetailParCentre = true */
  parCentre: DeclarationParCentreDto[];
}

/** Critères de filtrage envoyés au backend */
export interface DeclarationFilterDto {
  anneeDebut?: number | null;
  anneeFin?: number | null;
  moisDebut?: string | null;
  moisFin?: string | null;
  centreDeGestionId?: number | null;
  tenantId?: number | null;
  valideesSeulement?: boolean | null;
  avecDetailParCentre?: boolean;
}
