// ---------------------------------------------------------------------------
// Modèles TypeScript pour l'analyse des soldes employeurs (Cotisationbalance)
// Correspondent aux DTOs C# : BalanceAnalyseDto, BalanceParCentreDto,
// BalanceEmployeurDto, BalanceFilterDto (DashboardCore)
// ---------------------------------------------------------------------------

/** Solde d'un employeur individuel (utilisé dans le top employeurs en dette) */
export interface BalanceEmployeurDto {
  employeurId: number;
  noCompte: string | null;
  raisonSociale: string | null;
  centreLibelle: string | null;
  mvtDebit: number;
  mvtCredit: number;
  soldeMvt: number;
  soldeRpt: number;
}

/** Balance agrégée par centre de gestion */
export interface BalanceParCentreDto {
  centreId: number;
  centreCode: string | null;
  centreLibelle: string | null;
  nombreEmployeurs: number;
  employeursEnDette: number;
  employeursCrediteurs: number;
  totalMvtDebit: number;
  totalMvtCredit: number;
  soldeNet: number;
  totalSoldeMvt: number;
}

/** Analyse globale des soldes employeurs */
export interface BalanceAnalyseDto {
  nombreEmployeurs: number;
  employeursEnDette: number;
  employeursCrediteurs: number;
  employeursSoldeNul: number;

  totalMvtDebit: number;
  totalMvtCredit: number;
  soldeNetMouvement: number;

  totalRptDebit: number;
  totalRptCredit: number;
  soldeNetReporte: number;

  totalSoldeMvt: number;
  totalSoldeRpt: number;

  parCentre: BalanceParCentreDto[];
  topEmployeursEnDette: BalanceEmployeurDto[];
}

/** Filtre pour l'analyse des soldes */
export interface BalanceFilterDto {
  centreDeGestionId?: number | null;
  tenantId?: number | null;
  topN?: number;
}
