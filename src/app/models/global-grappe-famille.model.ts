// ---------------------------------------------------------------------------
// Modèle TypeScript pour les statistiques globales de la grappe familiale
// Correspond au DTO C# : GlobalGrappeFamilleStatsDto (DashboardCore)
// ---------------------------------------------------------------------------

import {
  GrappeFamilleStatsDto,
  EnfantDistributionDto,
} from './centre-de-gestion.model';

export type { GrappeFamilleStatsDto, EnfantDistributionDto };

/** Vue globale de la grappe familiale pour tous les centres */
export interface GlobalGrappeFamilleStatsDto {
  totalEmployesValides: number;
  avecGrappeValidePension: number;
  avecGrappeValidePf: number;
  avecGrappeValideRp: number;

  totalConjoints: number;
  totalEnfants: number;
  totalAscendants: number;
  totalMembresFamille: number;

  employesAvecConjoint: number;
  employesAvecEnfants: number;
  employesAvecAscendants: number;

  pctAvecConjoint: number;
  pctAvecEnfants: number;
  pctAvecAscendants: number;
  moyenneEnfants: number;

  distributionEnfants: EnfantDistributionDto[];
  parCentre: GrappeFamilleStatsDto[];
}
