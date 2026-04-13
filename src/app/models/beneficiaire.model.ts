export interface BeneficiairePrestationDto {
  prestationId: number;
  prestationCode: string | null;
  prestationLibelle: string | null;
  nombreBeneficiaires: number;
}

export interface BeneficiaireDomaineDto {
  domaine: string;            // "RP" | "PF" | "Pension"
  nombreBeneficiaires: number;
  prestations: BeneficiairePrestationDto[];
}

export interface BeneficiaireParBrancheDto {
  brancheId: number;
  brancheCode: string | null;
  brancheLibelle: string | null;
  totalActifs: number;
  domaines: BeneficiaireDomaineDto[];
}

export interface BeneficiaireSummaryDto {
  dateReference: string;      // ISO date
  totalBeneficiairesActifs: number;
  parBranche: BeneficiaireParBrancheDto[];
}

export interface BeneficiaireTrendDto {
  annee: number;
  mois: string;               // "01"-"12" | "T1"-"T4" | "AN"
  periode: string;            // ISO date
  totalActifs: number;
  actifsRp: number;
  actifsPf: number;
  actifsPvid: number;
  variationTotal: number | null;
  variationRp: number | null;
  variationPf: number | null;
  variationPvid: number | null;
  tendance: string | null;    // "hausse" | "baisse" | "stable"
}

export interface BeneficiaireFilterDto {
  dateReference?: string;     // yyyy-MM-dd (for snapshot)
  anneeDebut?: number;
  anneeFin?: number;
  moisDebut?: string;
  moisFin?: string;
  centreDeGestionId?: number;
  granularite?: string;       // "mensuel" | "trimestriel" | "annuel"
}
