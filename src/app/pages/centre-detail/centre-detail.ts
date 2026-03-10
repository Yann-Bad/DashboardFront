import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { CentreDeGestionService } from '../../services/centre-de-gestion.service';
import {
  CentreDeGestionDto,
  CentreEmployeurStatsDto,
  CentreEmployeStatsDto,
} from '../../models/centre-de-gestion.model';

@Component({
  selector: 'app-centre-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
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
  loading = true;
  error: string | null = null;

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    // Chargement en parallèle : détail du centre + statistiques employeurs + statistiques employés
    forkJoin({
      centre: this.service.getById(id),
      stats: this.service.getEmployeurStats(id),
      employes: this.service.getEmployeStats(id),
    }).subscribe({
      next: ({ centre, stats, employes }) => {
        this.centre = centre;
        this.employeurStats = stats;
        this.employeStats = employes;
        this.loading = false;
      },
      error: () => {
        this.error = `Centre de gestion introuvable (id: ${id}).`;
        this.loading = false;
      },
    });
  }

  /** Compteurs globaux du centre (cotisations, encaissements, etc.) */
  get counters(): { label: string; value: number; icon: string; color: string }[] {
    if (!this.centre) return [];
    return [
      { label: 'Employeurs',         value: this.centre.nombreEmployeurs,       icon: '👔', color: 'green'  },
      { label: 'Employés',           value: this.centre.nombreEmployes,         icon: '👤', color: 'purple' },
      { label: 'Cotisations Compte', value: this.centre.nombreCotisationsCompte, icon: '💼', color: 'orange' },
      { label: 'Encaissements',      value: this.centre.nombreEncaissements,    icon: '💰', color: 'teal'   },
      { label: 'Majorations',        value: this.centre.nombreMajorations,      icon: '📈', color: 'red'    },
      { label: 'Taxations',          value: this.centre.nombreTaxations,        icon: '🧾', color: 'indigo' },
    ];
  }

  /**
   * Répartition des employeurs en 3 catégories :
   * en activité (etat_id=1), en cessation (etat_id=2) et inactifs (etat_id=3) — avec leur pourcentage sur le total.
   */
  get employeurRepartition(): { label: string; value: number; pct: number; color: string; icon: string }[] {
    const s = this.employeurStats;
    if (!s || s.totalEmployeurs === 0) return [];
    return [
      {
        label: 'En activité',
        value: s.enActivite,
        pct: Math.round(s.pourcentageEnActivite),
        color: 'green',
        icon: '✅',
      },
      {
        label: 'En cessation',
        value: s.enCessation,
        pct: Math.round(s.pourcentageEnCessation),
        color: 'orange',
        icon: '⏸️',
      },
      {
        label: 'Inactifs',
        value: s.inactif,
        pct: Math.round(s.pourcentageInactif),
        color: 'red',
        icon: '🚫',
      },
    ];
  }

  /**
   * Répartition des employés en 2 statuts :
   * actifs (statut_employe_id=1) et inactifs (statut_employe_id=2).
   * Règle : DateDeleted IS NULL, Deleted != true, TagDeces=0, TagRetraite=1, TagValidate=1
   */
  get employeRepartition(): { label: string; value: number; pct: number; color: string; icon: string }[] {
    const s = this.employeStats;
    if (!s || (s.actif + s.inactif) === 0) return [];
    return [
      {
        label: 'Actifs',
        value: s.actif,
        pct: s.pourcentageActif,
        color: 'green',
        icon: '✅',
      },
      {
        label: 'Inactifs',
        value: s.inactif,
        pct: s.pourcentageInactif,
        color: 'red',
        icon: '🚫',
      },
    ];
  }

  /**
   * Breakdown dynamique par statut depuis Referentielstatutemploye.
   * Libellés réels depuis la DB — remplace le hardcodage 1=Actif / 2=Inactif.
   */
  get statutBreakdown(): { label: string; value: number; pct: number }[] {
    return (this.employeStats?.breakdownParStatut ?? []).map(s => ({
      label: s.statutLibelle ?? s.statutCode ?? `Statut ${s.statutId}`,
      value: s.nombre,
      pct:   s.pourcentage,
    }));
  }
}
