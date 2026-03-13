// ---------------------------------------------------------------------------
// Modèles TypeScript pour l'analyse des majorations & taxations.
// Correspondent aux DTOs C# : MajorationTaxationAnalyseDto,
// MajorationTaxationParCentreDto, MajorationTaxationFilterDto
// ---------------------------------------------------------------------------

export interface MajorationTaxationParCentreDto {
  centreId:           number;
  centreCode:         string | null;
  centreLibelle:      string | null;
  nombreMajorations:  number;
  montantMajoration:  number;
  nombreTaxations:    number;
  montantTaxation:    number;
  montantTotal:       number;
}

export interface MajorationTaxationAnalyseDto {
  annee:   number;
  mois:    string;
  periode: string;

  // Majorations
  nombreMajorations:        number;
  nombreEmployeursMajores:  number;
  montantMajoration:        number;
  montantBaseMajoration:    number;
  tauxMoyenMajoration:      number | null;

  // Taxations
  nombreTaxations:          number;
  nombreEmployeursTaxes:    number;
  montantTaxation:          number;
  montantBaseTaxation:      number;
  tauxMoyenTaxation:        number | null;
  taxationsValidees:        number;
  taxationsAnnulees:        number;

  // Totaux
  montantTotal:             number;

  // Recouvrement
  montantMajorationRecouvre: number;
  montantTaxationRecouvre:   number;
  tauxRecouvrementMajoration: number | null;
  tauxRecouvrementTaxation:   number | null;

  // Tendances
  variationMontantMajoration: number | null;
  variationMontantTaxation:   number | null;
  tendance: 'hausse' | 'baisse' | 'stable' | null;

  // Par centre
  parCentre: MajorationTaxationParCentreDto[];
}

export interface MajorationTaxationFilterDto {
  anneeDebut?:          number | null;
  anneeFin?:            number | null;
  moisDebut?:           string | null;
  moisFin?:             string | null;
  centreDeGestionId?:   number | null;
  tenantId?:            number | null;
  avecDetailParCentre?: boolean;
}
