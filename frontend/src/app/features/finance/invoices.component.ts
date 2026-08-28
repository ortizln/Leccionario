import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../core/api.config';
import { AuthService } from '../../core/auth.service';

@Component({
  templateUrl: './invoices.component.html',
  styleUrl: './invoices.component.css',
    selector: 'app-invoices',
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class InvoicesComponent implements OnInit {
  invoices: any[] = [];
  filteredInvoices: any[] = [];
  filterStatus = '';
  totalInvoices = 0;
  pendingCount = 0;
  paidCount = 0;
  totalPending = 0;
  showPaymentModal = false;
  showCreateModal = false;
  selectedInvoice: any = null;
  paymentAmount = 0;
  paymentMethod = 'EFECTIVO';
  newInvoice: any = { studentId: null, periodId: null, concept: '', dueDate: '', items: [{ description: '', quantity: 1, unitPrice: 0 }] };

  constructor(private http: HttpClient, private auth: AuthService) {}

  ngOnInit() { this.load(); }
  private get instId(): number { return this.auth.institutionId() || 1; }

  load() {
    this.http.get<any[]>(`${API_URL}/finance/invoices?institutionId=${this.instId}`).subscribe({
      next: (r: any) => { this.invoices = r.content || r; this.applyFilter(); },
      error: () => {}
    });
  }

  applyFilter() {
    if (!Array.isArray(this.invoices)) { this.invoices = []; }
    this.filteredInvoices = this.filterStatus ? this.invoices.filter(i => i.status === this.filterStatus) : [...this.invoices];
    this.totalInvoices = this.invoices.length;
    this.pendingCount = this.invoices.filter(i => i.status === 'PENDIENTE').length;
    this.paidCount = this.invoices.filter(i => i.status === 'PAGADA').length;
    this.totalPending = this.invoices.filter(i => i.status !== 'PAGADA').reduce((sum, i) => sum + (i.total - i.paidAmount), 0);
  }

  openPaymentModal(inv: any) {
    this.selectedInvoice = inv;
    this.paymentAmount = inv.total - inv.paidAmount;
    this.showPaymentModal = true;
  }

  confirmPayment() {
    this.http.post<any>(`${API_URL}/finance/invoices/${this.selectedInvoice.id}/payments`, { amount: this.paymentAmount, paymentMethod: this.paymentMethod }).subscribe({
      next: () => { this.showPaymentModal = false; this.load(); },
      error: e => alert(e.error?.message || 'Error')
    });
  }

  createInvoice() {
    this.http.post<any>(`${API_URL}/finance/invoices`, { ...this.newInvoice, institutionId: this.instId }).subscribe({
      next: () => { this.showCreateModal = false; this.load(); },
      error: e => alert(e.error?.message || 'Error')
    });
  }

  downloadPdf(id: number) {
    window.open(`${API_URL}/finance/invoices/${id}/pdf`, '_blank');
  }
}
