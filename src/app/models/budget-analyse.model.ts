export interface BudgetExecutionDto {
  codeCentreGestion: string | null;
  centreGestion: string | null;
  typeBudget: string | null;
  codeGestion: string | null;
  gestion: string | null;
  poste: string | null;
  libellePoste: string | null;
  assignation: number;
  realisation: number;
  depense: number;
}

export interface BudgetExecutionFilterDto {
  exercice?: number;
  codeCentreGestion?: string;
  typeBudget?: string;
  codeGestion?: string;
  niveau?: number;
}

export interface BudgetExecutionResultDto {
  niveau: number;
  totalAssignation: number;
  totalRealisation: number;
  totalDepense: number;
  tauxRealisation: number;
  tauxDepense: number;
  totalLignes: number;
  rows: BudgetExecutionDto[];
}

// ── Dashboard Stats ─────────────────────
export interface BudgetDashboardStatsDto {
  exercice: number;
  totalCentres: number;
  totalPostes: number;
  totalTypeBudgets: number;
  totalGestions: number;
  totalAssignation: number;
  totalRealisation: number;
  totalDepense: number;
  tauxRealisation: number;
  tauxDepense: number;
  parTypeBudget: BudgetByTypeBudgetDto[];
  parCentre: BudgetByCentreDto[];
}

export interface BudgetByTypeBudgetDto {
  typeBudget: string;
  assignation: number;
  realisation: number;
  depense: number;
  tauxRealisation: number;
  tauxDepense: number;
}

export interface BudgetByCentreDto {
  codeCentreGestion: string;
  centreGestion: string;
  assignation: number;
  realisation: number;
  depense: number;
  tauxRealisation: number;
  tauxDepense: number;
}

// ── Synthèse ────────────────────────────
export interface BudgetSyntheseDto {
  codeTypeBud: string | null;
  typeBudget: string | null;
  centreGestion: string | null;
  centreGestionId: number | null;
  solliciter: number;
  accorder: number;
  realisation: number;
  projection: number;
}

export interface BudgetSyntheseFilterDto {
  exercice?: number;
  codeCentreGestion?: string;
  typeBudget?: string;
}

// ── Lookups ─────────────────────────────
export interface BudgetLookupsDto {
  exercices: BudgetExerciceDto[];
  typesBudget: BudgetTypeBudgetDto[];
  gestions: BudgetGestionDto[];
  centres: BudgetCentreGestionDto[];
}

export interface BudgetExerciceDto {
  exerciceId: number;
  exercice: string | null;
}

export interface BudgetTypeBudgetDto {
  typBudgetId: number;
  codeTypeBud: string | null;
  typeBudget: string | null;
}

export interface BudgetGestionDto {
  gestionId: number;
  codeGestion: string | null;
  gestion: string | null;
}

export interface BudgetCentreGestionDto {
  centreGestionId: number;
  codeCentreGestion: string | null;
  centreGestion: string | null;
}
