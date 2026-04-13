import { SoldeParDeviseDto } from './summary-account.model';
import { ExecutionByClasseurResultDto } from './document-payment.model';
import { DeviseBreakdownDto } from './centre-de-gestion.model';
import { LiquidationBrancheSummary } from './liquidation-trend.model';

/**
 * DTO allégé pour la page d'accueil du tableau de bord.
 * Retourné par GET /api/CentreDeGestion/dashboard/home
 */
export interface HomeDashboardDto {
  // Section 1: Trésorerie — soldes bancaires par devise
  soldesBanque: SoldeParDeviseDto[];

  // Section 2: Exécution par classeur
  execution: ExecutionByClasseurResultDto | null;

  // Section 3: KPI Centres de gestion
  totalCentres: number;
  totalEmployeurs: number;
  totalEmployes: number;
  effectifDeclareTotal: number;
  totalDeclarations: number;

  // Recouvrement annuel
  tauxRecouvrementAnnuel: number;
  employeursAyantPaye: number;
  employeursDeclares: number;
  montantTotalDeclare: number;
  montantPrincipalEncaisse: number;
  montantMajorationEncaisse: number;
  montantTaxationEncaisse: number;
  montantTotalEncaisse: number;

  // Ventilation devises
  breakdownParDevise: DeviseBreakdownDto[];

  // Section 4: Liquidation summaries
  totalPf: LiquidationBrancheSummary;
  totalPension: LiquidationBrancheSummary;
  totalRp: LiquidationBrancheSummary;
}
