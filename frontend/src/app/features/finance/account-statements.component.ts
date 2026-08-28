import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../core/api.config';
import { AuthService } from '../../core/auth.service';

@Component({
  templateUrl: './account-statements.component.html',
  styleUrl: './account-statements.component.css',
    selector: 'app-account-statements',
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class AccountStatementsComponent implements OnInit {
  studentId: number | null = null;
  statement: any = null;
  private get instId(): number { return this.auth.institutionId() || 1; }

  constructor(private http: HttpClient, private auth: AuthService) {}

  ngOnInit() {}

  loadStatement() {
    if (!this.studentId) return;
    this.http.get<any[]>(`${API_URL}/finance/accounts-receivable/student/${this.studentId}`).subscribe({
      next: (items: any[]) => {
        const totalDebt = items.reduce((s: number, i: any) => s + (i.originalAmount - (i.paidAmount || 0)), 0);
        const totalPaid = items.reduce((s: number, i: any) => s + (i.paidAmount || 0), 0);
        const balance = totalDebt;
        const overdueCount = items.filter((i: any) => i.status === 'VENCIDO').length;
        this.statement = { totalDebt, totalPaid, balance, overdueCount, items };
      },
      error: () => { this.statement = null; }
    });
  }
}
