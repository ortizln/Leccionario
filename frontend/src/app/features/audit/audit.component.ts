import { AsyncPipe, DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { catchError, of } from 'rxjs';
import { API_URL } from '../../core/api.config';

@Component({
  selector: 'app-audit',
  standalone: true,
  imports: [AsyncPipe, DatePipe, FormsModule],
  templateUrl: './audit.component.html'
})
export class AuditComponent {
  private http = inject(HttpClient);

  usernameFilter = '';
  moduleFilter = '';
  logs$ = this.loadLogs();

  applyFilters(): void {
    this.logs$ = this.loadLogs();
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
    return this.http.get<Array<AuditItem>>(url).pipe(
      catchError(() => of([]))
    );
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
