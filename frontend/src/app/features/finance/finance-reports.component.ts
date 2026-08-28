import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../core/api.config';
import { AuthService } from '../../core/auth.service';

@Component({
  templateUrl: './finance-reports.component.html',
  styleUrl: './finance-reports.component.css',
    selector: 'app-finance-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class FinanceReportsComponent implements OnInit {
  tab = 'summary';
  summary = { totalBilled: 0, totalCollected: 0, totalPending: 0, totalOverdue: 0 };
  collectionMethods: any[] = [];
  overdueAccounts: any[] = [];
  tuitionStats: any[] = [];

  constructor(private http: HttpClient, private auth: AuthService) {}
  ngOnInit() { this.load(); }
  private get instId(): number { return this.auth.institutionId() || 1; }

  load() {
    this.http.get<any>(`${API_URL}/finance/invoices?institutionId=${this.instId}`).subscribe({
      next: (invoices: any[]) => {
        let billed = 0, collected = 0, pending = 0, overdue = 0;
        invoices.forEach((i: any) => {
          billed += i.total || 0;
          collected += i.paidAmount || 0;
          if (i.status === 'PENDIENTE' || i.status === 'PARCIAL') pending += (i.total - (i.paidAmount || 0));
          if (i.status === 'VENCIDA') overdue += (i.total - (i.paidAmount || 0));
        });
        this.summary = { totalBilled: billed, totalCollected: collected, totalPending: pending, totalOverdue: overdue };
      },
      error: () => {}
    });
    this.http.get<any[]>(`${API_URL}/finance/accounts-receivable/pending?institutionId=${this.instId}`).subscribe({
      next: r => this.overdueAccounts = r,
      error: () => {}
    });
    this.http.get<any>(`${API_URL}/finance/tuitions/plans?institutionId=${this.instId}`).subscribe({
      next: r => this.tuitionStats = Array.isArray(r) ? r : [],
      error: () => {}
    });
    this.http.get<any[]>(`${API_URL}/finance/cash-registers/collection-methods?institutionId=${this.instId}`).subscribe({
      next: r => this.collectionMethods = r || [],
      error: () => {}
    });
  }

  getPercent(total: number) {
    const grand = this.collectionMethods.reduce((s, m) => s + m.total, 0);
    return grand ? (total / grand * 100) : 0;
  }
}
