import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SummaryAccountService } from '../../services/summary-account.service';
import {
  TreasurySummaryDto,
  SoldeParDeviseDto,
  ExerciceComptableSummaryDto,
} from '../../models/summary-account.model';

@Component({
  selector: 'app-treasury-summary',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './treasury-summary.html',
  styleUrl: './treasury-summary.css',
})
export class TreasurySummaryComponent implements OnInit {
  private readonly service = inject(SummaryAccountService);

  summary: TreasurySummaryDto | null = null;
  exercices: ExerciceComptableSummaryDto[] = [];
  loading = true;
  error: string | null = null;

  ngOnInit(): void {
    this.loadAll();
  }

  loadAll(): void {
    this.loading = true;
    this.error = null;

    this.service.getTreasurySummary().subscribe({
      next: (data) => {
        this.summary = data;
        this.loadExercices();
        this.loading = false;
      },
      error: () => {
        this.error = 'Impossible de charger le résumé de trésorerie.';
        this.loading = false;
      },
    });
  }

  private loadExercices(): void {
    this.service.getExercices().subscribe({
      next: (data) => (this.exercices = data),
    });
  }

  get soldesBanque() {
    return this.aggregateByMonnaie(this.summary?.soldesParDevise.filter(s => s.typeBank?.startsWith('B')) ?? []);
  }

  get soldesCaisse() {
    return this.aggregateByMonnaie(this.summary?.soldesParDevise.filter(s => s.typeBank?.startsWith('C')) ?? []);
  }

  private aggregateByMonnaie(items: SoldeParDeviseDto[]) {
    const map = new Map<string, SoldeParDeviseDto>();
    for (const s of items) {
      const cur = map.get(s.monnaie);
      if (cur) {
        cur.soldeDisponible += s.soldeDisponible;
        cur.soldeEmis += s.soldeEmis;
        cur.soldeEncaisse += s.soldeEncaisse;
        cur.soldeReel += s.soldeReel;
        cur.soldePrevisionnel += s.soldePrevisionnel;
        cur.totalEncaissements += s.totalEncaissements;
        cur.totalDecaissements += s.totalDecaissements;
        cur.nombreOperations += s.nombreOperations;
      } else {
        map.set(s.monnaie, { ...s });
      }
    }
    return Array.from(map.values());
  }

  fmtMontant(v: number | null | undefined): string {
    if (v === null || v === undefined) return '—';
    return v.toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  }
}
