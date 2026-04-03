// ---------------------------------------------------------------------------
// Modèles TypeScript pour la tendance combinée des liquidations (3 branches)
// Correspond au DTO C# : LiquidationTrendDto (DashboardCore)
// ---------------------------------------------------------------------------

import { PrestationAnalyseDto, PrestationFilterDto } from './prestation-analyse.model';

export type { PrestationAnalyseDto };

/** Résumé synthétique d'une branche sur la période filtrée */
export interface LiquidationBrancheSummary {
  branche: string;
  nombreLiquidations: number;
  nombreBeneficiaires: number;
  montantLiquide: number;
  montantPaye: number;
  montantArriere: number;
  annulees: number;
  tauxPaiement: number | null;
}

/** Réponse combinée pour les 3 branches */
export interface LiquidationTrendDto {
  pf: PrestationAnalyseDto[];
  pension: PrestationAnalyseDto[];
  rp: PrestationAnalyseDto[];
  totalPf: LiquidationBrancheSummary;
  totalPension: LiquidationBrancheSummary;
  totalRp: LiquidationBrancheSummary;
}

/** Filtre pour la vue tendance combinée */
export interface LiquidationTrendFilterDto {
  anneeDebut?: number;
  anneeFin?: number;
  moisDebut?: string;
  moisFin?: string;
  centreDeGestionId?: number | null;
  tenantId?: number;
  granularite?: string;
}
