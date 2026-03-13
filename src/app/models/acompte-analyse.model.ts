export interface AcompteParCentreDto {
  centreId: number;
  centreCode: string | null;
  centreLibelle: string | null;
  nombreAcomptes: number;
  montantInitial: number;
  montantConsomme: number;
  montantRestant: number;
  tauxConsommation: number | null;
}

export interface AcompteAnalyseDto {
  annee: number;
  mois: string;
  periode: string;

  nombreAcomptes: number;
  nombreEmployeurs: number;

  montantInitial: number;
  montantConsomme: number;
  montantRestant: number;
  tauxConsommation: number | null;

  nonConsommes: number;
  consommes: number;

  montantAcompteRecouvre: number;
  tauxRecouvrement: number | null;

  variationMontantInitial: number | null;
  tendance: string | null;

  parCentre: AcompteParCentreDto[];
}

export interface AcompteFilterDto {
  anneeDebut?: number;
  anneeFin?: number;
  moisDebut?: string;
  moisFin?: string;
  centreDeGestionId?: number | null;
  tenantId?: number;
  avecDetailParCentre?: boolean;
}
