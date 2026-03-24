// ---------------------------------------------------------------------------
// Modèles TypeScript pour les données de référence (lookups).
// Correspondent aux DTOs C# : LookupsDto, CentreLookupDto,
// TypeDossierLookupDto, EtatDossierLookupDto (DashboardCore)
// ---------------------------------------------------------------------------

export interface CentreLookupDto {
  id:       number;
  code:     string | null;
  libelle:  string | null;
}

export interface TypeDossierLookupDto {
  id:       number;
  code:     string | null;
  libelle:  string | null;
  /** Périmètre : Cotisation/Recouvrement, Prestation, Risque professionnel */
  nature:   string;
}

export interface EtatDossierLookupDto {
  id:             number;
  code:           string | null;
  libelle:        string | null;
  typeDossierId:  number | null;
}

export interface TypePrestationLookupDto {
  id:       number;
  code:     string | null;
  libelle:  string | null;
  brancheId: number | null;
}

export interface LookupsDto {
  centres:            CentreLookupDto[];
  typesDossier:       TypeDossierLookupDto[];
  etatsDossier:       EtatDossierLookupDto[];
  typesPrestations:   TypePrestationLookupDto[];
}
