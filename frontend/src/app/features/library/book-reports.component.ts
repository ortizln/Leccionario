import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../core/api.config';
import { AuthService } from '../../core/auth.service';

@Component({
  templateUrl: './book-reports.component.html',
  styleUrl: './book-reports.component.css',
    selector: 'app-book-reports',
  standalone: true,
  imports: [CommonModule],
})
export class BookReportsComponent implements OnInit {
  reports: any = {};

  constructor(private http: HttpClient, private auth: AuthService) {}
  ngOnInit() { this.load(); }

  private get instId(): number { return this.auth.institutionId() || 1; }

  load() {
    this.http.get<any>(`${API_URL}/library/reports?institutionId=${this.instId}`).subscribe({ next: r => this.reports = r, error: () => {} });
  }

  getAvailabilityPct() {
    return this.reports.totalCopies ? ((this.reports.availableCopies || 0) / this.reports.totalCopies * 100) : 0;
  }

  exportCSV() {
    window.open(`${API_URL}/library/books/export?institutionId=${this.instId}`, '_blank');
  }
}
