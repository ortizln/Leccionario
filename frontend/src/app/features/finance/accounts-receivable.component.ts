import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../core/api.config';
import { AuthService } from '../../core/auth.service';

@Component({
  templateUrl: './accounts-receivable.component.html',
  styleUrl: './accounts-receivable.component.css',
    selector: 'app-accounts-receivable',
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class AccountsReceivableComponent implements OnInit {
  accountsReceivable: any[] = [];
  pendingCount = 0;
  partialCount = 0;
  totalPending = 0;
  showPayModal = false;
  selectedAR: any = null;
  payAmount = 0;

  constructor(private http: HttpClient, private auth: AuthService) {}

  ngOnInit() { this.load(); }
  private get instId(): number { return this.auth.institutionId() || 1; }

  load() {
    this.http.get<any[]>(`${API_URL}/finance/accounts-receivable/pending?institutionId=${this.instId}`).subscribe({
      next: r => {
        this.accountsReceivable = r;
        this.pendingCount = r.filter(a => a.status === 'PENDIENTE').length;
        this.partialCount = r.filter(a => a.status === 'PARCIAL').length;
        this.totalPending = r.reduce((sum, a) => sum + (a.originalAmount - a.paidAmount), 0);
      },
      error: () => {}
    });
  }

  openPayModal(ar: any) {
    this.selectedAR = ar;
    this.payAmount = ar.originalAmount - ar.paidAmount;
    this.showPayModal = true;
  }

  confirmPay() {
    this.http.post<any>(`${API_URL}/finance/accounts-receivable/${this.selectedAR.id}/payments`, { amount: this.payAmount }).subscribe({
      next: () => { this.showPayModal = false; this.load(); },
      error: e => alert(e.error?.message || 'Error')
    });
  }

  downloadStatement(studentId: number) {
    window.open(`${API_URL}/finance/invoices/student/${studentId}/statement?institutionId=${this.instId}`, '_blank');
  }
}
