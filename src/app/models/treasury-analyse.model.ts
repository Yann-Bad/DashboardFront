// ─── Filters ─────────────────────────────────────────────────────────────────

export interface TreasuryForecastFilter {
  metric: string;
  anneeDebut?: number;
  anneeFin?: number;
  horizon: number;
  monnaie?: string;
  typeBank?: string;
}

export interface TreasuryAnomalyFilter {
  metric: string;
  anneeDebut?: number;
  anneeFin?: number;
  confidence: number;
  monnaie?: string;
  typeBank?: string;
}

// ─── Responses ───────────────────────────────────────────────────────────────

export interface TreasuryTimeSeriesPoint {
  date: string;
  value: number;
}

export interface TreasuryForecastPoint {
  date: string;
  predictedValue: number;
  lowerBound: number;
  upperBound: number;
}

export interface TreasuryForecastResult {
  metric: string;
  monnaie?: string;
  typeBank?: string;
  historicalPointCount: number;
  historicalData: TreasuryTimeSeriesPoint[];
  forecasts: TreasuryForecastPoint[];
}

export interface TreasuryAnomalyPoint {
  date: string;
  value: number;
  isAnomaly: boolean;
  score: number;
  pValue: number;
}

export interface TreasuryAnomalyResult {
  metric: string;
  monnaie?: string;
  typeBank?: string;
  totalPoints: number;
  anomalyCount: number;
  points: TreasuryAnomalyPoint[];
}

// ─── Shared ──────────────────────────────────────────────────────────────────

export const TREASURY_METRICS = [
  { value: 'NetCashFlow',       label: 'Flux Net (Encaissements − Décaissements)' },
  { value: 'Encaissements',     label: 'Encaissements (AE hors DAT + BEE)' },
  { value: 'Decaissements',     label: 'Décaissements (CS + BSE)' },
  { value: 'InteretsDAT',       label: 'Intérêts DAT (A02 + A05)' },
  { value: 'SoldeDisponible',   label: 'Solde Disponible (cumulé)' },
  { value: 'SoldeReel',         label: 'Solde Réel (cumulé)' },
  { value: 'SoldePrevisionnel', label: 'Solde Prévisionnel (cumulé)' },
  { value: 'Volume',            label: 'Volume d\'Opérations (nombre)' },
  { value: 'FraisBancaires',    label: 'Frais Bancaires (C01–C07)' },
];

export const TREASURY_CURRENCIES = [
  { value: '',     label: 'Toutes (conv. CDF)' },
  { value: 'CDF',  label: 'CDF (Franc Congolais)' },
  { value: 'USD',  label: 'USD (Dollar)' },
  { value: 'EURO', label: 'EUR (Euro)' },
];
