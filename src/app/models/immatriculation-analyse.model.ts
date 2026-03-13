export interface ImmatriculationParCentreDto {
  centreId: number;
  centreCode: string | null;
  centreLibelle: string | null;
  nouveauxEmployeurs: number;
  nouveauxEmployes: number;
  effectifTotal: number;
}

export interface ImmatriculationAnalyseDto {
  annee: number;
  mois: string;
  periode: string;

  nouveauxEmployeurs: number;
  employeursValides: number;
  employeursEnAttente: number;

  nouveauxEmployes: number;
  employesValides: number;
  employesEnAttente: number;
  sorties: number;

  effectifTotal: number;
  effectifEmploye: number;
  effectifAssimile: number;

  variationEmployeurs: number | null;
  variationEmployes: number | null;
  tendance: string | null;

  parCentre: ImmatriculationParCentreDto[];
}

export interface ImmatriculationFilterDto {
  anneeDebut?: number;
  anneeFin?: number;
  moisDebut?: string;
  moisFin?: string;
  centreDeGestionId?: number | null;
  tenantId?: number;
  avecDetailParCentre?: boolean;
}
