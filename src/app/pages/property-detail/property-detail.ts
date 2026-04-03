import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PropertyManagementService } from '../../services/property-management.service';
import {
  PropertyFilterDto, BillingFilterDto, PropertyLookupsDto,
  ImmeubleDto, UniteLocativeDto, LocataireDto,
  FacturationDto, PaiementDto, ImpayeDto
} from '../../models/property-management.model';

type Tab = 'immeubles' | 'unites' | 'locataires' | 'facturations' | 'paiements' | 'impayes';

@Component({
  selector: 'app-property-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './property-detail.html',
  styleUrl: './property-detail.css',
})
export class PropertyDetailComponent implements OnInit {
  private readonly service = inject(PropertyManagementService);

  // ── State ──────────────────────────────────────────────────────────────
  activeTab: Tab = 'immeubles';
  lookups: PropertyLookupsDto | null = null;
  filter: PropertyFilterDto = {};
  billingFilter: BillingFilterDto = {};

  immeubles: ImmeubleDto[] = [];
  unites: UniteLocativeDto[] = [];
  locataires: LocataireDto[] = [];
  facturations: FacturationDto[] = [];
  paiements: PaiementDto[] = [];
  impayes: ImpayeDto[] = [];

  loading = false;
  error: string | null = null;

  readonly tabs: { key: Tab; label: string }[] = [
    { key: 'immeubles', label: 'Immeubles' },
    { key: 'unites', label: 'Unités Locatives' },
    { key: 'locataires', label: 'Locataires' },
    { key: 'facturations', label: 'Facturations' },
    { key: 'paiements', label: 'Paiements' },
    { key: 'impayes', label: 'Impayés' },
  ];

  // ── Lifecycle ──────────────────────────────────────────────────────────

  ngOnInit(): void {
    this.service.getLookups().subscribe({
      next: lk => { this.lookups = lk; this.loadTab(); },
      error: () => this.loadTab()
    });
  }

  // ── Actions ────────────────────────────────────────────────────────────

  switchTab(tab: Tab): void {
    this.activeTab = tab;
    this.loadTab();
  }

  onSearch(): void {
    this.billingFilter = { ...this.filter, annee: this.billingFilter.annee, fkNor: this.billingFilter.fkNor };
    this.loadTab();
  }

  loadTab(): void {
    this.loading = true;
    this.error = null;

    switch (this.activeTab) {
      case 'immeubles':
        this.service.getImmeubles(this.filter).subscribe({
          next: d => { this.immeubles = d; this.loading = false; },
          error: () => { this.error = 'Erreur chargement immeubles.'; this.loading = false; }
        });
        break;
      case 'unites':
        this.service.getUnites(this.filter).subscribe({
          next: d => { this.unites = d; this.loading = false; },
          error: () => { this.error = 'Erreur chargement unités.'; this.loading = false; }
        });
        break;
      case 'locataires':
        this.service.getLocataires(this.filter).subscribe({
          next: d => { this.locataires = d; this.loading = false; },
          error: () => { this.error = 'Erreur chargement locataires.'; this.loading = false; }
        });
        break;
      case 'facturations':
        this.service.getFacturations(this.billingFilter).subscribe({
          next: d => { this.facturations = d; this.loading = false; },
          error: () => { this.error = 'Erreur chargement facturations.'; this.loading = false; }
        });
        break;
      case 'paiements':
        this.service.getPaiements(this.billingFilter).subscribe({
          next: d => { this.paiements = d; this.loading = false; },
          error: () => { this.error = 'Erreur chargement paiements.'; this.loading = false; }
        });
        break;
      case 'impayes':
        this.service.getImpayes(this.billingFilter).subscribe({
          next: d => { this.impayes = d; this.loading = false; },
          error: () => { this.error = 'Erreur chargement impayés.'; this.loading = false; }
        });
        break;
    }
  }
}
