import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CentreDeGestionService } from '../../services/centre-de-gestion.service';
import { CentreDeGestionDto } from '../../models/centre-de-gestion.model';

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
  loading = true;
  error: string | null = null;

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.service.getById(id).subscribe({
      next: (data) => {
        this.centre = data;
        this.loading = false;
      },
      error: () => {
        this.error = `Centre de gestion introuvable (id: ${id}).`;
        this.loading = false;
      },
    });
  }

  get counters(): { label: string; value: number; icon: string; color: string }[] {
    if (!this.centre) return [];
    return [
      { label: 'Employeurs', value: this.centre.nombreEmployeurs, icon: '👔', color: 'green' },
      { label: 'Employés', value: this.centre.nombreEmployes, icon: '👤', color: 'purple' },
      { label: 'Cotisations Compte', value: this.centre.nombreCotisationsCompte, icon: '💼', color: 'orange' },
      { label: 'Encaissements', value: this.centre.nombreEncaissements, icon: '💰', color: 'teal' },
      { label: 'Majorations', value: this.centre.nombreMajorations, icon: '📈', color: 'red' },
      { label: 'Taxations', value: this.centre.nombreTaxations, icon: '🧾', color: 'indigo' },
    ];
  }
}
