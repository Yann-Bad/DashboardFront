import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Workbook } from 'exceljs';
import { SummaryAccountService } from '../../services/summary-account.service';
import {
  AccountSummaryDto,
  SummaryAccountFilterDto,
  PagedResultDto,
} from '../../models/summary-account.model';

@Component({
  selector: 'app-summary-accounts',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './summary-accounts.html',
  styleUrl: './summary-accounts.css',
})
export class ReconciliationComponent implements OnInit {
  private readonly service = inject(SummaryAccountService);

  data: AccountSummaryDto[] = [];
  loading = false;
  exporting = false;
  error: string | null = null;
  totalCount = 0;
  totalPages = 0;
  pages: number[] = [];
  pageSizeOptions = [10, 25, 50, 100];

  filter: SummaryAccountFilterDto = {
    page: 1,
    pageSize: 10,
    monnaie: '',
    typeBank: 'B',
    typeSearch: 'searchallacounts',
    dateoperation: new Date().toISOString().substring(0, 10),
  };

  typeSearchOptions = [
    { value: 'searchallacounts', label: 'Tous les comptes' },
    { value: 'searchbydevise', label: 'Par devise' },
    { value: 'searchbankanddevise', label: 'Banque + devise' },
    { value: 'searchonlybank', label: 'Par banque' },
  ];

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = null;
    console.log('Loading summary accounts with filter', this.filter);
    this.service.getSummaryAccounts(this.filter).subscribe({
      next: (result) => {
        this.data = result.data;
        this.totalCount = result.totalCount;
        this.totalPages = result.totalPages;
        this.buildPages();
        this.loading = false;
      },
      error: () => {
        this.error = 'Impossible de charger les soldes des comptes.';
        this.loading = false;
      },
    });
  }

  onSearch(): void {
    this.filter.page = 1;
    this.load();
  }

  onReset(): void {
    this.filter = {
      page: 1,
      pageSize: 50,
      monnaie: '',
      typeBank: 'B',
      typeSearch: 'searchallacounts',
      dateoperation: new Date().toISOString().substring(0, 10),
    };
    this.load();
  }

  get totalsByDevise(): { monnaie: string; dispo: number; reel: number; emis: number; enc: number; prev: number; totalEnc: number; totalDec: number; count: number }[] {
    const map = new Map<string, { dispo: number; reel: number; emis: number; enc: number; prev: number; totalEnc: number; totalDec: number; count: number }>();
    for (const a of this.data) {
      const key = a.monnaie ?? 'N/A';
      const cur = map.get(key) ?? { dispo: 0, reel: 0, emis: 0, enc: 0, prev: 0, totalEnc: 0, totalDec: 0, count: 0 };
      cur.dispo += a.soldeDisponible;
      cur.reel += a.soldeReel;
      cur.emis += a.soldeEmis;
      cur.enc += a.soldeEncaisse;
      cur.prev += a.soldePrevisionnel;
      cur.totalEnc += a.totalEncaissements;
      cur.totalDec += a.totalDecaissements;
      cur.count++;
      map.set(key, cur);
    }
    return Array.from(map.entries()).map(([monnaie, v]) => ({ monnaie, ...v }));
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.filter.page) return;
    this.filter.page = page;
    this.load();
  }

  onPageSizeChange(): void {
    this.filter.page = 1;
    this.load();
  }

  private buildPages(): void {
    const total = this.totalPages;
    const current = this.filter.page;
    const delta = 2;
    const pages: number[] = [];
    const left = Math.max(1, current - delta);
    const right = Math.min(total, current + delta);
    for (let i = left; i <= right; i++) {
      pages.push(i);
    }
    if (left > 1) { pages.unshift(1); if (left > 2) pages.splice(1, 0, -1); }
    if (right < total) { if (right < total - 1) pages.push(-1); pages.push(total); }
    this.pages = pages;
  }

  fmtMontant(v: number | null): string {
    if (v == null) return '—';
    return v.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  exportExcel(): void {
    this.exporting = true;
    const exportFilter: SummaryAccountFilterDto = { ...this.filter, page: 1, pageSize: 10000 };
    this.service.getSummaryAccounts(exportFilter).subscribe({
      next: (result) => {
        this.generateExcel(result.data);
        this.exporting = false;
      },
      error: () => {
        this.error = "Erreur lors de l'export Excel.";
        this.exporting = false;
      },
    });
  }

  private async generateExcel(accounts: AccountSummaryDto[]): Promise<void> {
    const wb = new Workbook();
    wb.creator = 'Dashboard';
    wb.created = new Date();

    // Group accounts by currency
    const grouped = new Map<string, AccountSummaryDto[]>();
    for (const a of accounts) {
      const key = a.monnaie ?? 'N/A';
      const arr = grouped.get(key) ?? [];
      arr.push(a);
      grouped.set(key, arr);
    }

    for (const [monnaie, items] of grouped) {
      const ws = wb.addWorksheet(monnaie);

      // Title row
      ws.mergeCells('A1:G1');
      const titleCell = ws.getCell('A1');
      titleCell.value = `Soldes des Comptes — ${monnaie} au ${this.filter.dateoperation}`;
      titleCell.font = { bold: true, size: 14 };
      titleCell.alignment = { horizontal: 'center' };

      // Header row
      const headers = ['Dénomination', 'N° Compte', 'Solde Dispo.', 'Solde Émis', 'Solde Enc.', 'Solde Réel', 'Solde Prév.'];
      const headerRow = ws.addRow(headers);
      headerRow.eachCell((cell) => {
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2563EB' } };
        cell.alignment = { horizontal: 'center' };
        cell.border = { bottom: { style: 'thin' } };
      });

      // Data rows
      for (const a of items) {
        ws.addRow([
          a.libelleBank ?? '—',
          a.numeroBank ?? '—',
          a.soldeDisponible,
          a.soldeEmis,
          a.soldeEncaisse,
          a.soldeReel,
          a.soldePrevisionnel,
        ]);
      }

      // Totals row
      const totals = items.reduce(
        (t, a) => {
          t.dispo += a.soldeDisponible;
          t.emis += a.soldeEmis;
          t.enc += a.soldeEncaisse;
          t.reel += a.soldeReel;
          t.prev += a.soldePrevisionnel;
          return t;
        },
        { dispo: 0, emis: 0, enc: 0, reel: 0, prev: 0 }
      );
      const totalRow = ws.addRow(['TOTAL', '', totals.dispo, totals.emis, totals.enc, totals.reel, totals.prev]);
      totalRow.eachCell((cell) => {
        cell.font = { bold: true };
        cell.border = { top: { style: 'double' } };
      });

      // Format number columns
      for (let col = 3; col <= 7; col++) {
        ws.getColumn(col).numFmt = '#,##0.00';
        ws.getColumn(col).alignment = { horizontal: 'right' };
      }

      // Auto-width
      ws.columns.forEach((col) => {
        col.width = col.width && col.width > 15 ? col.width : 18;
      });
      ws.getColumn(1).width = 30;
      ws.getColumn(2).width = 22;
    }

    // Download
    const buffer = await wb.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `soldes-comptes-${this.filter.dateoperation}.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
  }
}
