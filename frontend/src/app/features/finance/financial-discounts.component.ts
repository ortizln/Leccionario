import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../core/api.config';
import { AuthService } from '../../core/auth.service';

@Component({
  templateUrl: './financial-discounts.component.html',
  styleUrl: './financial-discounts.component.css',
    selector: 'app-financial-discounts',
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class FinancialDiscountsComponent implements OnInit {
  discounts: any[] = [];
  showCreateModal = false;
  form: any = { name: '', discountType: 'PORCENTAJE', value: 0, description: '', studentId: null, validFrom: '', validUntil: '' };

  constructor(private http: HttpClient, private auth: AuthService) {}
  ngOnInit() { this.load(); }
  private get instId(): number { return this.auth.institutionId() || 1; }

  load() {
    this.http.get<any[]>(`${API_URL}/finance/discounts?institutionId=${this.instId}`).subscribe({ next: r => this.discounts = r, error: () => {} });
  }
  save() {
    this.http.post<any>(`${API_URL}/finance/discounts`, { ...this.form, institutionId: this.instId }).subscribe({
      next: () => { this.showCreateModal = false; this.load(); this.form = { name: '', discountType: 'PORCENTAJE', value: 0, description: '', studentId: null, validFrom: '', validUntil: '' }; },
      error: e => alert(e.error?.message || 'Error')
    });
  }
  deleteDiscount(id: number) {
    if (!confirm('Eliminar descuento?')) return;
    this.http.delete(`${API_URL}/finance/discounts/${id}`).subscribe({ next: () => this.load() });
  }
}
