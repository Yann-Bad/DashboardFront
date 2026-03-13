import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CentreDeGestionService } from '../../services/centre-de-gestion.service';
import { DashboardStatsDto, BreakdownItemDto } from '../../models/centre-de-gestion.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class DashboardComponent implements OnInit {
  private readonly service = inject(CentreDeGestionService);

  stats: DashboardStatsDto | null = null;
  loading = true;
  error: string | null = null;

  ngOnInit(): void {
    this.service.getDashboardStats().subscribe({
      next: (data) => {
        this.stats = data;
        this.loading = false;
      },
      error: () => {
        this.error = 'Impossible de charger les statistiques du tableau de bord.';
        this.loading = false;
      },
    });
  }

  /** Compteurs globaux affichés dans la grille de tuiles */
  get statCards(): { label: string; value: number; icon: string; color: string }[] {
    if (!this.stats) return [];
    return [
      { label: 'Centres de Gestion',    value: this.stats.totalCentres,              icon: '🏢', color: 'blue'   },
      { label: 'Employeurs',            value: this.stats.totalEmployeurs,           icon: '👔', color: 'green'  },
      { label: 'Employés déclarés',     value: this.stats.totalEmployes,             icon: '👤', color: 'purple' },
      { label: 'Effectifs déclarés',    value: this.stats.effectifDeclareTotal ?? 0, icon: '📋', color: 'teal'   },
    ];
  }

  /**
   * Répartition des employeurs en 3 états métier (EtatId 1, 2, 3)
   * pour l'affichage des barres de progression.
   */
  get repartitionEmployeurs(): { label: string; valeur: number; pourcentage: number; couleur: string; icon: string }[] {
    if (!this.stats) return [];
    return [
      {
        label:       'En activité',
        valeur:      this.stats.employeursEnActivite,
        pourcentage: this.stats.pourcentageEnActivite,
        couleur:     'green',
        icon:        '✅',
      },
      {
        label:       'En cessation',
        valeur:      this.stats.employeursEnCessation,
        pourcentage: this.stats.pourcentageEnCessation,
        couleur:     'orange',
        icon:        '⏸️',
      },
      {
        label:       'Inactifs',
        valeur:      this.stats.employeursInactifs,
        pourcentage: this.stats.pourcentageInactifs,
        couleur:     'red',
        icon:        '🚫',
      },
    ];
  }

  /**
   * Répartition des employés en 2 statuts métier (StatutEmployeId 1=Actif, 2=Inactif)
   * pour l'affichage des barres de progression.
   * Règle : DateDeleted IS NULL, Deleted != true, TagDeces=0, TagRetraite=1, TagValidate=1
   */
  get repartitionEmployes(): { label: string; valeur: number; pourcentage: number; couleur: string; icon: string }[] {
    if (!this.stats) return [];
    return [
      {
        label:       'Actifs',
        valeur:      this.stats.employesActifs,
        pourcentage: this.stats.pourcentageEmployesActifs,
        couleur:     'green',
        icon:        '✅',
      },
      {
        label:       'Inactifs',
        valeur:      this.stats.employesInactifs,
        pourcentage: this.stats.pourcentageEmployesInactifs,
        couleur:     'red',
        icon:        '🚫',
      },
      {
        label:       'Retraités',
        valeur:      this.stats.employesRetraites,
        pourcentage: this.stats.pourcentageEmployesRetraites,
        couleur:     'blue',
        icon:        '👴',
      },
      {
        label:       'Décédés',
        valeur:      this.stats.employesDecedes,
        pourcentage: this.stats.pourcentageEmployesDecedes,
        couleur:     'slate',
        icon:        '✝️',
      },
    ];
  }
  /** Top 5 formes juridiques par nombre d'employeurs */
  get topFormesJuridiques(): BreakdownItemDto[] {
    return (this.stats?.breakdownParFormeJuridique ?? []).slice(0, 5);
  }

  /** Top 5 régimes par nombre d'employeurs */
  get topRegimes(): BreakdownItemDto[] {
    return (this.stats?.breakdownParRegime ?? []).slice(0, 5);
  }

  /** Top 5 secteurs par nombre d'employeurs */
  get topSecteurs(): BreakdownItemDto[] {
    return (this.stats?.breakdownParSecteur ?? []).slice(0, 5);
  }
  /** Formate un montant avec séparateurs (ex : 1 234 567) */
  fmtMontant(v: number | null | undefined): string {
    if (v === null || v === undefined) return '—';
    return v.toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  }

  /** Bloque une valeur entre 0 et 100 pour les barres de progression */
  clampPct(v: number): number {
    return Math.min(100, Math.max(0, v ?? 0));
  }
}
