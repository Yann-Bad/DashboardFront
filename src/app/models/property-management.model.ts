// ══════════════════════════════════════════════════════════════════════════════
//  Property Management (Gestion du Patrimoine – DGI) – TypeScript interfaces
//  Mirrors the backend DTOs in DashboardCore/Dtos/PropertyManagementDto.cs
// ══════════════════════════════════════════════════════════════════════════════

// ── Filters ──────────────────────────────────────────────────────────────────

export interface PropertyFilterDto {
  centreGestionId?: number;
  annee?: number;
}

export interface BillingFilterDto {
  centreGestionId?: number;
  annee?: number;
  /** 1=Garantie, 2=Frais Dossier, 3=Arriéré Loyer, 4=Arriéré Mois, >5=Encaissement */
  fkNor?: number;
}

// ── Dashboard Stats ──────────────────────────────────────────────────────────

export interface PropertyDashboardStatsDto {
  centreGestionId: number | null;
  totalImmeubles: number;
  totalImmeublesVilla: number;
  totalImmeublesAppartement: number;
  totalUnites: number;
  totalUnitesOccupees: number;
  totalUnitesVacantes: number;
  totalLocataires: number;
  totalLocatairesAutres: number;
  totalLocatairesInstances: number;
  totalContrats: number;
  totalContratsEnCours: number;
  totalContratsExpires: number;
  tauxOccupation: number;
}

// ── Billing Summary ──────────────────────────────────────────────────────────

export interface BillingSummaryDto {
  annee: number | null;
  totalFacturation: number;
  totalPaiement: number;
  solde: number;
  tauxRecouvrement: number;
  parNature: BillingByNatureDto[];
}

export interface BillingByNatureDto {
  libelle: string | null;
  fkNor: number | null;
  facturation: number;
  paiement: number;
  solde: number;
  tauxRecouvrement: number;
}

// ── Immeuble ─────────────────────────────────────────────────────────────────

export interface ImmeubleDto {
  cdIm: string;
  im: string | null;
  commune: string | null;
  adresseIm: string | null;
  typeImmeuble: string | null;
  categorieIm: string | null;
  etat: string | null;
  dateGestion: string | null;
  centreGestionId: number | null;
}

// ── Unité Locative ───────────────────────────────────────────────────────────

export interface UniteLocativeDto {
  cdu: number;
  immeuble: string | null;
  nomUnite: string | null;
  numeroUnite: string | null;
  superficie: number | null;
  tauxSuperficie: number | null;
  etat: string | null;
  adresse: string | null;
  commune: string | null;
  centreGestionId: number | null;
}

// ── Locataire ────────────────────────────────────────────────────────────────

export interface LocataireDto {
  num: number;
  nomLocataire: string | null;
  immeuble: string | null;
  nomUnite: string | null;
  numeroUnite: string | null;
  usage: string | null;
  typeLocataire: string | null;
  superficie: number | null;
  debutContrat: string | null;
  finContrat: string | null;
  etat: string | null;
  centreGestionId: number | null;
}

// ── Facturation ──────────────────────────────────────────────────────────────

export interface FacturationDto {
  num: number;
  immeuble: string | null;
  nomUnite: string | null;
  numeroUnite: string | null;
  nomLocataire: string | null;
  libelle: string | null;
  annee: number | null;
  montant: number | null;
  dateFacture: string | null;
  centreGestionId: number | null;
}

// ── Paiement ─────────────────────────────────────────────────────────────────

export interface PaiementDto {
  num: number;
  immeuble: string | null;
  nomUnite: string | null;
  numeroUnite: string | null;
  nomLocataire: string | null;
  libelle: string | null;
  annee: number | null;
  montant: number | null;
  datePaiement: string | null;
  etat: string | null;
  centreGestionId: number | null;
}

// ── Impayé ───────────────────────────────────────────────────────────────────

export interface ImpayeDto {
  immeuble: string | null;
  nomUnite: string | null;
  numeroUnite: string | null;
  nomLocataire: string | null;
  totalFacturation: number;
  totalPaiement: number;
  solde: number;
}

// ── Occupancy ────────────────────────────────────────────────────────────────

export interface OccupancyByImmeubleDto {
  immeuble: string | null;
  cdIm: string | null;
  totalUnites: number;
  unitesOccupees: number;
  unitesVacantes: number;
  tauxOccupation: number;
}

// ── Lookups ──────────────────────────────────────────────────────────────────

export interface PropertyLookupsDto {
  centres: PropertyCentreGestionDto[];
  annees: PropertyAnneeDto[];
}

export interface PropertyCentreGestionDto {
  centreGestionId: number;
  codeCentreGestion: string | null;
  centreGestion: string | null;
}

export interface PropertyAnneeDto {
  annee: number;
}
