import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CentreDeGestionService } from '../../services/centre-de-gestion.service';
import { DashboardStatsDto } from '../../models/centre-de-gestion.model';

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

  get statCards(): { label: string; value: number; icon: string; color: string }[] {
    if (!this.stats) return [];
    return [
      { label: 'Centres de Gestion', value: this.stats.totalCentres, icon: '🏢', color: 'blue' },
      { label: 'Employeurs', value: this.stats.totalEmployeurs, icon: '👔', color: 'green' },
      { label: 'Employés', value: this.stats.totalEmployes, icon: '👤', color: 'purple' },
      { label: 'Cotisations Compte', value: this.stats.totalCotisationsCompte, icon: '💼', color: 'orange' },
      { label: 'Encaissements', value: this.stats.totalEncaissements, icon: '💰', color: 'teal' },
      { label: 'Majorations', value: this.stats.totalMajorations, icon: '📈', color: 'red' },
      { label: 'Taxations', value: this.stats.totalTaxations, icon: '🧾', color: 'indigo' },
    ];
  }
}
