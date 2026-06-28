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
  templateUrl: './audit.component.html'
})
export class AuditComponent {
  private http = inject(HttpClient);

  usernameFilter = '';
  moduleFilter = '';
  logs: AuditItem[] = [];

  sort: SortState | null = null;
  filters: FilterState = {};
  displayedLogs: AuditItem[] = [];

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
  }

  applyFilters(): void {
    this.loadLogs();
  }

  private loadLogs() {
    const params = new URLSearchParams();
    if (this.usernameFilter.trim()) {
      params.set('username', this.usernameFilter.trim());
    }
    if (this.moduleFilter.trim()) {
      params.set('module', this.moduleFilter.trim());
    }
    const query = params.toString();
    const url = query ? `${API_URL}/audit?${query}` : `${API_URL}/audit`;
    this.http.get<Array<AuditItem>>(url).pipe(
      catchError(() => of([]))
    ).subscribe(data => {
      this.logs = data;
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
