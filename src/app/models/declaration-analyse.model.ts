// ---------------------------------------------------------------------------
// Modèles TypeScript pour l'analyse des déclarations de cotisations sociales
// Correspondent aux DTOs C# : DeclarationAnalyseDto, DeclarationParCentreDto,
// DeclarationFilterDto (DashboardCore)
// ---------------------------------------------------------------------------

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
