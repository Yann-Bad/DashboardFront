import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CentreDeGestionService } from '../../services/centre-de-gestion.service';
import {
  CentreDeGestionSummaryDto,
  CentreDeGestionFilterDto,
  PagedResultDto,
} from '../../models/centre-de-gestion.model';

@Component({
  selector: 'app-centres-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './centres-list.html',
  styleUrl: './centres-list.css',
})
export class CentresListComponent implements OnInit {
  private readonly service = inject(CentreDeGestionService);

  result: PagedResultDto<CentreDeGestionSummaryDto> | null = null;
  loading = false;
  error: string | null = null;

  filter: CentreDeGestionFilterDto = {
    page: 1,
    pageSize: 20,
    code: '',
    libelle: '',
    tenantId: undefined,
  };

  pageSizeOptions = [10, 20, 50];

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = null;
    this.service.getAll(this.filter).subscribe({
      next: (data) => {
        this.result = data;
        this.loading = false;
      },
      error: () => {
        this.error = 'Impossible de charger les centres de gestion.';
        this.loading = false;
      },
    });
  }

  onSearch(): void {
    this.filter.page = 1;
    this.load();
  }

  onReset(): void {
    this.filter = { page: 1, pageSize: this.filter.pageSize };
    this.load();
  }

  goToPage(page: number): void {
    if (!this.result || page < 1 || page > this.result.totalPages) return;
    this.filter.page = page;
    this.load();
  }

  get pages(): number[] {
    if (!this.result) return [];
    const total = this.result.totalPages;
    const current = this.result.page;
    const delta = 2;
    const range: number[] = [];
    for (
      let i = Math.max(1, current - delta);
      i <= Math.min(total, current + delta);
      i++
    ) {
      range.push(i);
    }
    return range;
  }
}
