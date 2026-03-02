export interface CentreDeGestionDto {
  id: number;
  version: number;
  code: string | null;
  ancienCode: string | null;
  ancienCodePension: string | null;
  libelle: string | null;
  adresse: string | null;
  dateCreated: string;
  lastUpdated: string;
  tenantId: number | null;
  tagProd: number | null;
  etablissementId: number | null;
  etablissementLibelle: string | null;
  organigrammeId: number | null;
  organigrammeLibelle: string | null;
  entiteAdresseId: number | null;
  entiteAdresseLibelle: string | null;
  userCreatedId: number;
  userUpdatedId: number;
  nombreEmployeurs: number;
  nombreEmployes: number;
  nombreCotisationsCompte: number;
  nombreEncaissements: number;
  nombreMajorations: number;
  nombreTaxations: number;
}

export interface CentreDeGestionSummaryDto {
  id: number;
  code: string | null;
  libelle: string | null;
  adresse: string | null;
  tenantId: number | null;
  nombreEmployeurs: number;
  nombreEmployes: number;
}

export interface CentreDeGestionFilterDto {
  code?: string;
  libelle?: string;
  etablissementId?: number;
  tenantId?: number;
  tagProd?: number;
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

export interface DashboardStatsDto {
  totalCentres: number;
  totalEmployeurs: number;
  totalEmployes: number;
  totalCotisationsCompte: number;
  totalEncaissements: number;
  totalMajorations: number;
  totalTaxations: number;
  top5CentresParEmployeurs: CentreDeGestionSummaryDto[];
}
