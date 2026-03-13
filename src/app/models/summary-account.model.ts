// Models for the Financial / Summary Account module.
// Each interface mirrors a DTO from DashboardCore's SummaryAccountController.

export interface SummaryAccountFilterDto {
  exercicecomptableId?: number;
  centre?: string;
  typeBank?: string;
  monnaie?: string;
  codebank?: string;
  sensoperation?: string;
  typeSearch?: string;
  dateFrom?: string;
  dateTo?: string;
  dateoperation?: string;
  page: number;
  pageSize: number;
}

export interface PagedResultDto<T> {
  data: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface TreasurySummaryDto {
  totalCompteBanques: number;
  totalComptesComptables: number;
  totalOperations: number;
  totalDocuments: number;
  totalExercices: number;
  soldeDisponible: number;
  soldeEmis: number;
  soldeEncaisse: number;
  soldeReel: number;
  soldePrevisionnel: number;
  totalEncaissements: number;
  totalDecaissements: number;
  totalStandingOrders: number;
  standingOrdersActifs: number;
  totalSinglePaymentRequests: number;
  soldesParDevise: SoldeParDeviseDto[];
}

export interface SoldeParDeviseDto {
  typeBank: string;
  monnaie: string;
  soldeDisponible: number;
  soldeEmis: number;
  soldeEncaisse: number;
  soldeReel: number;
  soldePrevisionnel: number;
  totalEncaissements: number;
  totalDecaissements: number;
  nombreOperations: number;
}

export interface CompteComptableSummaryDto {
  id: number;
  numeroCompte: string;
  intituleCompte: string;
  natureCompte: string;
  typeCompte: string;
  deviseCompte: string;
  etatCompte: boolean;
  nombreOperations: number;
  totalDebit: number;
  totalCredit: number;
  solde: number;
}

export interface ExerciceComptableSummaryDto {
  id: number;
  periodecomptable: number | null;
  nombreOperations: number;
  nombreDocuments: number;
}

export interface AccountSummaryDto {
  comptebanqueId: number;
  codeBank: string | null;
  typeBank: string | null;
  libelleBank: string | null;
  numeroBank: string | null;
  monnaie: string | null;
  soldeDisponible: number;
  soldeEmis: number;
  soldeEncaisse: number;
  soldeReel: number;
  soldePrevisionnel: number;
  totalEncaissements: number;
  totalDecaissements: number;
  nombreOperations: number;
}

// ── Trend DTOs ───────────────────────────────────────────────────────────────

export interface TrendFilterDto {
  dateFrom: string;
  dateTo: string;
  granularity: string; // daily | weekly | monthly
  typeBank?: string;
  monnaie?: string;
  centre?: string;
}

export interface TrendPeriodDto {
  period: string;
  totalEncaissements: number;
  totalDecaissements: number;
  prevuSorties: number;
  executeSorties: number;
  prevuEntrees: number;
  executeEntrees: number;
  extournes: number;
  fluxNet: number;
  soldeDisponible: number;
  soldeReel: number;
  nombreOperations: number;
}

export interface CategoryBreakdownDto {
  categorie: string;
  montant: number;
  count: number;
}

export interface TrendResultDto {
  periods: TrendPeriodDto[];
  categoryBreakdown: CategoryBreakdownDto[];
}
