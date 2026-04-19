// ─── Filters / Requests ──────────────────────────────────────────────────────

export interface ForecastFilter {
  metric: string;
  anneeDebut?: number;
  anneeFin?: number;
  horizon: number;
  centreDeGestionId?: number;
  tenantId?: number;
}

export interface AnomalyFilter {
  metric: string;
  anneeDebut?: number;
  anneeFin?: number;
  centreDeGestionId?: number;
  tenantId?: number;
  confidence: number;
}

// ─── Responses ───────────────────────────────────────────────────────────────

export interface TimeSeriesPoint {
  date: string;
  value: number;
}

export interface ForecastPoint {
  date: string;
  predictedValue: number;
  lowerBound: number;
  upperBound: number;
}

export interface ForecastResult {
  metric: string;
  historicalPointCount: number;
  historicalData: TimeSeriesPoint[];
  forecasts: ForecastPoint[];
}

export interface AnomalyPoint {
  date: string;
  value: number;
  isAnomaly: boolean;
  score: number;
  pValue: number;
}

export interface AnomalyResult {
  metric: string;
  totalPoints: number;
  anomalyCount: number;
  points: AnomalyPoint[];
}

// ─── Shared ──────────────────────────────────────────────────────────────────

export const SUPPORTED_METRICS = [
  { value: 'Encaissements', label: 'Encaissements', unit: 'CDF' },
  { value: 'Declarations',  label: 'Déclarations',  unit: 'nb' },
  { value: 'Dossiers',      label: 'Dossiers',      unit: 'nb' },
  { value: 'Balance',       label: 'Soldes Employeurs', unit: 'CDF' },
];
