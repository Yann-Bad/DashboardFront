export interface PrestationParTypeDto {
  typePfId: number;
  code: string | null;
  libelle: string | null;
  nombreLiquidations: number;
  montantLiquide: number;
  montantPaye: number;
  totalEnfants: number;
}

export interface PrestationParCentreDto {
  centreId: number;
  centreCode: string | null;
  centreLibelle: string | null;
  nombreLiquidations: number;
  montantLiquide: number;
  montantPaye: number;
}

export interface PrestationAnalyseDto {
  annee: number;
  mois: string;
  periode: string;

  nombreLiquidations: number;
  nombreEmployes: number;

  montantLiquide: number;
  montantArriere: number;
  montantPaye: number;
  tauxPaiement: number | null;

  calculees: number;
  payees: number;
  annulees: number;

  totalEnfants: number;

  variationMontant: number | null;
  tendance: string | null;

  parType: PrestationParTypeDto[];
  parCentre: PrestationParCentreDto[];
}

export interface PrestationFilterDto {
  anneeDebut?: number;
  anneeFin?: number;
  moisDebut?: string;
  moisFin?: string;
  centreDeGestionId?: number | null;
  typePfId?: number | null;
  tenantId?: number;
  avecDetailParType?: boolean;
  avecDetailParCentre?: boolean;
}
