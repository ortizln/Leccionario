import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../core/api.config';
import { AuthService } from '../../core/auth.service';

@Component({
  templateUrl: './cashier.component.html',
  styleUrl: './cashier.component.css',
    selector: 'app-cashier',
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class CashierComponent implements OnInit {
  openRegister: any = null;
  transactions: any[] = [];
  showOpenModal = false;
  openingBalance = 0;
  filterType = 'ALL';
  filterMethod = 'ALL';
  newTx: any = { transactionType: 'INGRESO', category: 'MATRICULA', description: '', amount: 0, paymentMethod: 'EFECTIVO' };

  constructor(private http: HttpClient, private auth: AuthService) {}

  ngOnInit() { this.loadOpen(); }
  private get instId(): number { return this.auth.institutionId() || 1; }

  loadOpen() {
    this.http.get<any>(`${API_URL}/finance/cash-registers/open?institutionId=${this.instId}`).subscribe({
      next: r => { this.openRegister = r; if (r) this.loadTx(r.id); },
      error: () => {}
    });
  }

  loadTx(registerId: number) {
    this.http.get<any[]>(`${API_URL}/finance/cash-registers/${registerId}/transactions`).subscribe({
      next: r => this.transactions = r,
      error: () => {}
    });
  }

  filteredTransactions() {
    let items = this.transactions;
    if (this.filterType !== 'ALL') items = items.filter(t => t.transactionType === this.filterType);
    if (this.filterMethod !== 'ALL') items = items.filter(t => t.paymentMethod === this.filterMethod);
    return items;
  }

  getTotalIncome() { return this.transactions.filter(t => t.transactionType === 'INGRESO').reduce((s, t) => s + (t.amount || 0), 0); }
  getTotalExpenses() { return this.transactions.filter(t => t.transactionType === 'EGRESO').reduce((s, t) => s + (t.amount || 0), 0); }
  getCurrentBalance() {
    if (!this.openRegister) return 0;
    return this.openRegister.openingBalance + this.openRegister.totalIncome - this.openRegister.totalExpenses;
  }

  confirmOpen() {
    this.http.post<any>(`${API_URL}/finance/cash-registers`, { institutionId: this.instId, openingBalance: this.openingBalance }).subscribe({
      next: r => { this.openRegister = r; this.showOpenModal = false; this.transactions = []; },
      error: e => alert(e.error?.message || 'Error')
    });
  }

  closeCashRegister() {
    const closing = this.getCurrentBalance();
    this.http.post<any>(`${API_URL}/finance/cash-registers/${this.openRegister.id}/close`, { closedBy: 'admin', closingBalance: closing }).subscribe({
      next: () => { this.openRegister = null; this.transactions = []; },
      error: e => alert(e.error?.message || 'Error')
    });
  }

  downloadDailyClose() {
    window.open(`${API_URL}/finance/cash-registers/${this.openRegister.id}/daily-close`, '_blank');
  }

  addTransaction() {
    if (!this.newTx.description || !this.newTx.amount) return;
    this.http.post<any>(`${API_URL}/finance/cash-registers/transactions`, { ...this.newTx, registerId: this.openRegister.id }).subscribe({
      next: () => { this.loadTx(this.openRegister.id); this.newTx = { transactionType: 'INGRESO', category: 'MATRICULA', description: '', amount: 0, paymentMethod: 'EFECTIVO' }; },
      error: e => alert(e.error?.message || 'Error')
    });
  }
}
