import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CentreDeGestionService } from '../../services/centre-de-gestion.service';
import { BalanceAnalyseDto, BalanceFilterDto, BalanceParCentreDto, BalanceEmployeurDto } from '../../models/balance-analyse.model';
import { CentreLookupDto } from '../../models/lookups.model';

@Component({
  selector: 'app-soldes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './soldes.component.html',
  styleUrls: ['./soldes.component.css'],
})
export class SoldesComponent implements OnInit {
  private readonly service = inject(CentreDeGestionService);

  readonly showGuide = signal(false);
  readonly data    = signal<BalanceAnalyseDto | null>(null);
  readonly loading = signal(false);
  readonly error   = signal<string | null>(null);
  readonly centres = signal<CentreLookupDto[]>([]);

  filter: BalanceFilterDto = { topN: 10 };

  // -------------------------------------------------------------------------
  // Computed helpers
  // -------------------------------------------------------------------------
  readonly tauxDette = computed(() => {
    const d = this.data();
    if (!d || d.nombreEmployeurs === 0) return 0;
    return Math.round((d.employeursEnDette / d.nombreEmployeurs) * 100 * 100) / 100;
  });

  readonly topCentres = computed(() => {
    return (this.data()?.parCentre ?? []).slice(0, 10);
  });

  // -------------------------------------------------------------------------
  // Lifecycle
  // -------------------------------------------------------------------------
  ngOnInit(): void {
    this.service.getLookups().subscribe({
      next: lk => this.centres.set(lk.centres),
    });
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.service.getBalanceAnalyse(this.filter).subscribe({
      next: d => { this.data.set(d); this.loading.set(false); },
      error: err => {
        this.error.set(err?.error?.message ?? err?.message ?? 'Erreur réseau');
        this.loading.set(false);
      },
    });
  }

  // -------------------------------------------------------------------------
  // Formatters
  // -------------------------------------------------------------------------
  fmtMontant(v: number | null | undefined): string {
    if (v == null) return '—';
    return v.toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  }

  barWidth(value: number, max: number): string {
    if (max <= 0) return '0%';
    return `${Math.min(100, Math.max(0, (value / max) * 100))}%`;
  }
}
