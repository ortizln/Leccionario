import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { catchError, of } from 'rxjs';
import { API_URL } from '../../core/api.config';
import { SortableHeaderComponent } from '../../shared/sortable-header.component';
import { FilterDropdownComponent } from '../../shared/filter-dropdown.component';
import { SortState, FilterState, applySort, applyFilters, getFilterOptions, toggleFilter, clearFilter, SortDir } from '../../shared/table-utils';

@Component({
  selector: 'app-audit',
  standalone: true,
  imports: [DatePipe, FormsModule, SortableHeaderComponent, FilterDropdownComponent],
  templateUrl: './audit.component.html',
  styleUrl: './audit.component.css'
})
export class AuditComponent {
  private http = inject(HttpClient);

  usernameFilter = '';
  moduleFilter = '';
  logs: AuditItem[] = [];
  stats: AuditStats = { total: 0, byModule: {}, byAction: {}, byUser: {} };

  sort: SortState | null = null;
  filters: FilterState = {};
  displayedLogs: AuditItem[] = [];

  currentPage = 0;
  pageSize = 25;
  totalPages = 1;

  Object = Object;

  sortColumn(col: string): SortDir { return this.sort?.column === col ? this.sort.dir : null; }
  onSort(col: string): void {
    const dir: SortDir = this.sort?.column === col
      ? (this.sort.dir === 'asc' ? 'desc' : this.sort.dir === 'desc' ? null : 'asc')
      : 'asc';
    this.sort = dir ? { column: col, dir } : null;
    this.refreshDisplayed();
  }
  filterOpts(col: string): string[] { return getFilterOptions(this.logs, col); }
  getFilter(col: string): Set<string> { return this.filters[col] ?? new Set(); }
  onFilter(col: string, val: string): void { this.filters = toggleFilter(this.filters, col, val); this.refreshDisplayed(); }
  onClearFilter(col: string): void { this.filters = clearFilter(this.filters, col); this.refreshDisplayed(); }
  refreshDisplayed(): void {
    this.displayedLogs = applyFilters(applySort(this.logs, this.sort), this.filters);
  }

  constructor() {
    this.loadLogs();
    this.loadStats();
  }

  applyFilters(): void {
    this.currentPage = 0;
    this.loadLogs();
  }

  clearFilters(): void {
    this.usernameFilter = '';
    this.moduleFilter = '';
    this.currentPage = 0;
    this.loadLogs();
  }

  goToPage(page: number): void {
    this.currentPage = page;
    this.loadLogs();
  }

  getTotalPages(): number {
    return Math.max(1, this.totalPages);
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const total = this.getTotalPages();
    const start = Math.max(0, this.currentPage - 2);
    const end = Math.min(total, start + 5);
    for (let i = start; i < end; i++) pages.push(i);
    return pages;
  }

  getTopModule(): string {
    if (!this.stats.byModule) return '-';
    const entries = Object.entries(this.stats.byModule);
    return entries.length ? entries.sort((a, b) => b[1] - a[1])[0][0] : '-';
  }

  getTopUser(): string {
    if (!this.stats.byUser) return '-';
    const entries = Object.entries(this.stats.byUser);
    return entries.length ? entries.sort((a, b) => b[1] - a[1])[0][0] : '-';
  }

  private loadStats() {
    this.http.get<AuditStats>(`${API_URL}/audit/stats`).pipe(
      catchError(() => of({ total: 0, byModule: {}, byAction: {}, byUser: {} }))
    ).subscribe(data => this.stats = data);
  }

  private loadLogs() {
    const params = new URLSearchParams();
    params.set('page', String(this.currentPage));
    params.set('size', String(this.pageSize));
    if (this.usernameFilter.trim()) {
      params.set('username', this.usernameFilter.trim());
    }
    if (this.moduleFilter.trim()) {
      params.set('module', this.moduleFilter.trim());
    }
    const url = `${API_URL}/audit/paginated?${params.toString()}`;
    this.http.get<PaginatedResponse>(url).pipe(
      catchError(() => of({ content: [], totalPages: 1 }))
    ).subscribe(data => {
      this.logs = data.content || [];
      this.totalPages = data.totalPages || 1;
      this.refreshDisplayed();
    });
  }
}

type AuditItem = {
  id: number;
  username: string;
  action: string;
  module: string;
  details: string;
  createdAt: string;
};

type AuditStats = {
  total: number;
  byModule: Record<string, number>;
  byAction: Record<string, number>;
  byUser: Record<string, number>;
};

type PaginatedResponse = {
  content: AuditItem[];
  totalPages: number;
};
