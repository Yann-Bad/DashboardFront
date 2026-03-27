import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { CentreDeGestionService } from '../../services/centre-de-gestion.service';
import {
  CentreDeGestionDto,
  CentreEmployeurStatsDto,
  CentreEmployeStatsDto,
  BreakdownItemDto,
  GrappeFamilleStatsDto,
  EnfantDistributionDto,
} from '../../models/centre-de-gestion.model';

@Component({
  selector: 'app-centre-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './centre-detail.html',
  styleUrl: './centre-detail.css',
})
export class CentreDetailComponent implements OnInit {
  private readonly service = inject(CentreDeGestionService);
  private readonly route = inject(ActivatedRoute);

  centre: CentreDeGestionDto | null = null;
  /** Statistiques détaillées des employeurs rattachés au centre */
  employeurStats: CentreEmployeurStatsDto | null = null;
  /** Statistiques détaillées des employés rattachés au centre */
  employeStats: CentreEmployeStatsDto | null = null;
  /** Statistiques de la grappe familiale des employés du centre */
  grappeStats: GrappeFamilleStatsDto | null = null;
  loading = true;
  statsLoading = false;
  error: string | null = null;

  /** Date de référence pour les stats employeurs (format yyyy-MM-dd, vide = aujourd'hui) */
  dateRef = '';
  /** Date de référence pour les stats employés (format yyyy-MM-dd, vide = aujourd'hui) */
  dateRefEmploye = '';

  private centreId = 0;

  ngOnInit(): void {
    this.centreId = Number(this.route.snapshot.paramMap.get('id'));

    // Chargement en parallèle : détail du centre + statistiques employeurs + statistiques employés + grappe familiale
    forkJoin({
      centre: this.service.getById(this.centreId),
      stats: this.service.getEmployeurStats(this.centreId),
      employes: this.service.getEmployeStats(this.centreId),
      grappe: this.service.getGrappeFamilleStats(this.centreId),
    }).subscribe({
      next: ({ centre, stats, employes, grappe }) => {
        this.centre = centre;
        this.employeurStats = stats;
        this.employeStats = employes;
        this.grappeStats = grappe;
        this.loading = false;
      },
      error: () => {
        this.error = `Centre de gestion introuvable (id: ${this.centreId}).`;
        this.loading = false;
      },
    });
  }

  /** Recharge uniquement les statistiques employeurs avec la date de référence saisie */
  refreshEmployeurStats(): void {
    this.statsLoading = true;
    this.service.getEmployeurStats(this.centreId, this.dateRef || undefined).subscribe({
      next: stats => {
        this.employeurStats = stats;
        this.statsLoading = false;
      },
      error: () => { this.statsLoading = false; },
    });
  }

  /** Recharge uniquement les statistiques employés avec la date de référence saisie */
  refreshEmployeStats(): void {
    this.statsLoading = true;
    this.service.getEmployeStats(this.centreId, this.dateRefEmploye || undefined).subscribe({
      next: employes => {
        this.employeStats = employes;
        this.statsLoading = false;
      },
      error: () => { this.statsLoading = false; },
    });
  }

  /** Compteurs globaux du centre (cotisations, encaissements, etc.) */
  get counters(): { label: string; value: number; icon: string; color: string }[] {
    if (!this.centre) return [];
    return [
      { label: 'Employeurs',         value: this.centre.nombreEmployeurs,       icon: '👔', color: 'green'  },
      { label: 'Employés',            value: this.centre.nombreEmployes,         icon: '👤', color: 'purple' },
      { label: 'Cotisations Compte', value: this.centre.nombreCotisationsCompte, icon: '💼', color: 'orange' },
      { label: 'Encaissements',      value: this.centre.nombreEncaissements,    icon: '💰', color: 'teal'   },
      { label: 'Majorations',        value: this.centre.nombreMajorations,      icon: '📈', color: 'red'    },
      { label: 'Taxations',          value: this.centre.nombreTaxations,        icon: '🧾', color: 'indigo' },
    ];
  }

  /**
   * Répartition des employeurs en 3 catégories avec le nombre de travailleurs par état.
   */
  get employeurRepartition(): {
    label: string; value: number; pct: number;
    travailleurs: number; color: string; icon: string;
  }[] {
    const s = this.employeurStats;
    if (!s || s.totalEmployeurs === 0) return [];
    return [
      {
        label: 'En activité',
        value: s.enActivite,
        pct: Math.round(s.pourcentageEnActivite),
        travailleurs: s.travailleurs_EnActivite,
        color: 'green',
        icon: '✅',
      },
      {
        label: 'En cessation',
        value: s.enCessation,
        pct: Math.round(s.pourcentageEnCessation),
        travailleurs: s.travailleurs_EnCessation,
        color: 'orange',
        icon: '⏸️',
      },
      {
        label: 'Inactifs',
        value: s.inactif,
        pct: Math.round(s.pourcentageInactif),
        travailleurs: s.travailleurs_Inactif,
        color: 'red',
        icon: '🚫',
      },
    ];
  }
  /**
   * Répartition des employés en 3 états via historique :
   * EN ACTIVITE | EN CESSATION | INACTIF
   */
  get employeRepartition(): { label: string; value: number; pct: number; color: string; icon: string }[] {
    const s = this.employeStats;
    if (!s || s.totalEmployes === 0) return [];
    return [
      { label: 'En activité',  value: s.enActivite,  pct: Math.round(s.pourcentageEnActivite),  color: 'green',  icon: '✅' },
      { label: 'En cessation', value: s.enCessation, pct: Math.round(s.pourcentageEnCessation), color: 'orange', icon: '⏸️' },
      { label: 'Inactifs',     value: s.inactif,     pct: Math.round(s.pourcentageInactif),     color: 'red',    icon: '🚫' },
    ];
  }

  /** Top 5 formes juridiques des employeurs de ce centre */
  get topFormesJuridiques(): BreakdownItemDto[] {
    return (this.employeurStats?.breakdownParFormeJuridique ?? []).slice(0, 5);
  }

  /** Top 5 régimes des employeurs de ce centre */
  get topRegimes(): BreakdownItemDto[] {
    return (this.employeurStats?.breakdownParRegime ?? []).slice(0, 5);
  }

  /** Top 5 secteurs des employeurs de ce centre */
  get topSecteurs(): BreakdownItemDto[] {
    return (this.employeurStats?.breakdownParSecteur ?? []).slice(0, 5);
  }

  clampPct(v: number): number {
    return Math.min(100, Math.max(0, v ?? 0));
  }

  /** Répartition des branches de validation de la grappe familiale */
  get grappeValidationBranches(): { label: string; valide: number; pct: number; color: string }[] {
    const g = this.grappeStats;
    if (!g || g.totalEmployesValides === 0) return [];
    const total = g.totalEmployesValides;
    return [
      { label: 'Pension',               valide: g.avecGrappeValidePension, pct: Math.round((g.avecGrappeValidePension / total) * 100), color: 'blue'   },
      { label: 'Prestations Familiales', valide: g.avecGrappeValidePf,     pct: Math.round((g.avecGrappeValidePf     / total) * 100), color: 'teal'   },
      { label: 'Risques Professionnels', valide: g.avecGrappeValideRp,     pct: Math.round((g.avecGrappeValideRp    / total) * 100), color: 'orange' },
    ];
  }

  /** Totaux des membres de la famille par type */
  get familleMembres(): { label: string; total: number; employesConcernes: number; pct: number; icon: string; color: string }[] {
    const g = this.grappeStats;
    if (!g || g.totalEmployesValides === 0) return [];
    const total = g.totalEmployesValides;
    return [
      { label: 'Conjoints',   total: g.totalConjoints,   employesConcernes: g.employesAvecConjoint,   pct: Math.round(g.pctAvecConjoint),   icon: '💑', color: 'pink'   },
      { label: 'Enfants',     total: g.totalEnfants,     employesConcernes: g.employesAvecEnfants,     pct: Math.round(g.pctAvecEnfants),     icon: '👶', color: 'purple' },
      { label: 'Ascendants',  total: g.totalAscendants,  employesConcernes: g.employesAvecAscendants,  pct: Math.round(g.pctAvecAscendants),  icon: '👴', color: 'indigo' },
    ];
  }

  /** Distribution du nombre d’enfants par employé */
  get distributionEnfants(): EnfantDistributionDto[] {
    return this.grappeStats?.distributionEnfants ?? [];
  }
}
