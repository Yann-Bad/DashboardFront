import { Component, OnInit, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CentreDeGestionService } from '../../services/centre-de-gestion.service';
import {
  GlobalEmployeurStatsDto,
  GlobalEmployeurStatsLineDto,
} from '../../models/centre-de-gestion.model';

@Component({
  selector: 'app-employeurs-stats',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './employeurs-stats.component.html',
  styleUrl:    './employeurs-stats.component.css',
})
export class EmployeursStatsComponent implements OnInit {
  private readonly service = inject(CentreDeGestionService);

  stats   = signal<GlobalEmployeurStatsDto | null>(null);
  loading = signal(true);
  error   = signal<string | null>(null);

  /** Date saisie par l'utilisateur (format yyyy-MM-dd, vide = aujourd'hui) */
  dateRef = '';

  /** Filtre texte sur le libellé du centre */
  filterCentre = '';

  /** Colonne de tri et direction */
  sortCol: 'centreLibelle' | 'etatEmployeur' | 'nombreEmployeurs' | 'nombreTravailleurs' =
    'nombreEmployeurs';
  sortDir: 'asc' | 'desc' = 'desc';

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.service.getGlobalEmployeurStats(this.dateRef || undefined).subscribe({
      next: data => {
        this.stats.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Impossible de charger les statistiques globales.');
        this.loading.set(false);
      },
    });
  }

  sort(col: typeof this.sortCol): void {
    if (this.sortCol === col) {
      this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortCol = col;
      this.sortDir = col === 'centreLibelle' || col === 'etatEmployeur' ? 'asc' : 'desc';
    }
  }

  sortIcon(col: typeof this.sortCol): string {
    if (this.sortCol !== col) return '⇅';
    return this.sortDir === 'asc' ? '↑' : '↓';
  }

  /** Filtered + sorted rows */
  readonly filteredLignes = computed(() => {
    const data = this.stats();
    if (!data) return [];
    let rows = data.lignes;

    if (this.filterCentre.trim()) {
      const q = this.filterCentre.trim().toLowerCase();
      rows = rows.filter(r => r.centreLibelle.toLowerCase().includes(q));
    }

    const col  = this.sortCol;
    const dir  = this.sortDir === 'asc' ? 1 : -1;
    return [...rows].sort((a, b) => {
      const av = a[col];
      const bv = b[col];
      if (typeof av === 'string' && typeof bv === 'string')
        return av.localeCompare(bv) * dir;
      return ((av as number) - (bv as number)) * dir;
    });
  });

  /** Rows grouped by centre for the summary table */
  readonly bycentre = computed(() => {
    const rows = this.filteredLignes();
    const map = new Map<string, { centreId: number; total: number; travailleurs: number }>();
    for (const r of rows) {
      const cur = map.get(r.centreLibelle) ?? { centreId: r.centreId, total: 0, travailleurs: 0 };
      map.set(r.centreLibelle, {
        centreId: r.centreId,
        total: cur.total + r.nombreEmployeurs,
        travailleurs: cur.travailleurs + r.nombreTravailleurs,
      });
    }
    return [...map.entries()]
      .map(([libelle, v]) => ({ libelle, ...v }))
      .sort((a, b) => b.total - a.total);
  });

  /** Distinct état labels from all rows */
  readonly etats = computed(() => {
    const data = this.stats();
    if (!data) return [];
    return [...new Set(data.lignes.map(r => r.etatEmployeur))].sort();
  });

  /** Color mapping for état labels */
  etatColor(etat: string): string {
    const u = etat.toUpperCase();
    if (u.includes('ACTIVIT'))  return 'green';
    if (u.includes('CESSATION')) return 'orange';
    if (u.includes('INACTIF'))  return 'red';
    return 'slate';
  }

  /** Total for the filtered set */
  get filteredTotal(): number {
    return this.filteredLignes().reduce((s, r) => s + r.nombreEmployeurs, 0);
  }
  get filteredTravailleurs(): number {
    return this.filteredLignes().reduce((s, r) => s + r.nombreTravailleurs, 0);
  }

  etatTotal(etat: string): number {
    return this.filteredLignes()
      .filter(r => r.etatEmployeur === etat)
      .reduce((s, r) => s + r.nombreEmployeurs, 0);
  }

  etatTravailleurs(etat: string): number {
    return this.filteredLignes()
      .filter(r => r.etatEmployeur === etat)
      .reduce((s, r) => s + r.nombreTravailleurs, 0);
  }
}
