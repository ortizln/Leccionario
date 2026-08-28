import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../core/api.config';
import { AuthService } from '../../core/auth.service';

@Component({
  templateUrl: './purchase-orders.component.html',
  styleUrl: './purchase-orders.component.css',
    selector: 'app-purchase-orders',
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class PurchaseOrdersComponent implements OnInit {
  orders: any[] = [];
  showCreateModal = false;
  form: any = { supplierId: null, totalAmount: 0, expectedDate: '', description: '' };
  constructor(private http: HttpClient, private auth: AuthService) {}
  ngOnInit() { this.load(); }
  private get instId(): number { return this.auth.institutionId() || 1; }
  load() { this.http.get<any[]>(`${API_URL}/inventory/purchase-orders?institutionId=${this.instId}`).subscribe({ next: r => this.orders = r, error: () => {} }); }
  save() {
    this.http.post<any>(`${API_URL}/inventory/purchase-orders`, { ...this.form, supplier: this.form.supplierId ? { id: this.form.supplierId } : null, institutionId: this.instId, requestedByUserId: 1 }).subscribe({
      next: () => { this.showCreateModal = false; this.load(); this.form = { supplierId: null, totalAmount: 0, expectedDate: '', description: '' }; },
      error: e => alert(e.error?.message || 'Error')
    });
  }
  updateStatus(id: number, status: string) {
    if (!confirm(`Cambiar estado a ${status}?`)) return;
    this.http.put<any>(`${API_URL}/inventory/purchase-orders/${id}/status?status=${status}`, {}).subscribe({ next: () => this.load() });
  }
}
