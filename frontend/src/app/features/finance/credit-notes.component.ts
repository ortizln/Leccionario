import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../core/api.config';
import { AuthService } from '../../core/auth.service';

@Component({
  templateUrl: './credit-notes.component.html',
  styleUrl: './credit-notes.component.css',
    selector: 'app-credit-notes',
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class CreditNotesComponent implements OnInit {
  notes: any[] = [];
  showForm = false;
  form = { invoiceId: null as number | null, amount: 0, reason: '' };

  constructor(private http: HttpClient, private auth: AuthService) {}
  ngOnInit() { this.load(); }
  private get instId(): number { return this.auth.institutionId() || 1; }

  load() {
    this.http.get<any[]>(`${API_URL}/finance/credit-notes?institutionId=${this.instId}`).subscribe({
      next: r => this.notes = r,
      error: () => {}
    });
  }

  openForm() { this.form = { invoiceId: null, amount: 0, reason: '' }; this.showForm = true; }

  save() {
    if (!this.form.invoiceId || this.form.amount <= 0 || !this.form.reason) { alert('Complete todos los campos'); return; }
    this.http.post(`${API_URL}/finance/credit-notes?institutionId=${this.instId}`, {
      invoiceId: this.form.invoiceId, amount: this.form.amount, reason: this.form.reason
    }).subscribe({ next: () => { this.showForm = false; this.load(); }, error: e => alert(e.error?.message || 'Error') });
  }

  apply(n: any) {
    if (!confirm(`Aplicar nota de credito #${n.creditNumber} por $${n.amount}?`)) return;
    this.http.put(`${API_URL}/finance/credit-notes/${n.id}/apply`, {}).subscribe({ next: () => this.load(), error: e => alert(e.error?.message || 'Error') });
  }

  cancel(n: any) {
    if (!confirm(`Cancelar nota de credito #${n.creditNumber}?`)) return;
    this.http.put(`${API_URL}/finance/credit-notes/${n.id}/cancel`, {}).subscribe({ next: () => this.load(), error: e => alert(e.error?.message || 'Error') });
  }
}
