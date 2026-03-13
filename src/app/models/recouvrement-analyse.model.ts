export interface RecouvrementParCentreDto {
  centreId: number;
  centreCode: string;
  centreLibelle: string;
  facturation: number;
  recouvrement: number;
  solde: number;
  tauxRecouvrement: number;
  nombreEmployeurs: number;
}

export interface RecouvrementTopEmployeurDto {
  employeurId: number;
  noEmployeur: string;
  raisonSociale: string;
  facturation: number;
  recouvrement: number;
  solde: number;
  soldeDebit: number;
  soldeCredit: number;
  tauxRecouvrement: number;
}

export interface RecouvrementAnalyseDto {
  annee: number;
  mois: number;
  periode: string;

  totalFacturation: number;
  totalRecouvrement: number;
  totalSolde: number;
  totalSoldeDebit: number;
  totalSoldeCredit: number;
  nombreEmployeurs: number;
  tauxRecouvrement: number;

  totalMontantRptDeb: number;
  totalMontantRptCred: number;
  totalMontantMvtDeb: number;
  totalMontantMvtCred: number;
  totalSoldeRpt: number;
  totalSoldeMvt: number;
  nombreBalances: number;

  totalMontantLiaison: number;
  totalMontantPartage: number;
  totalMontantRestant: number;
  nombreLiaisons: number;
  liaisonsValidees: number;
  liaisonsPayees: number;

  variationRecouvrement: number;
  variationSolde: number;
  tendance: string;

  parCentre?: RecouvrementParCentreDto[];
  topEmployeursImpaye?: RecouvrementTopEmployeurDto[];
}

export interface RecouvrementFilterDto {
  anneeDebut?: number;
  anneeFin?: number;
  moisDebut?: number;
  moisFin?: number;
  centreDeGestionId?: number;
  tenantId?: number;
  topEmployeurs?: number;
  avecDetailParCentre?: boolean;
}
