import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../core/api.config';
import { AuthService } from '../../core/auth.service';

@Component({
  templateUrl: './suppliers.component.html',
  styleUrl: './suppliers.component.css',
    selector: 'app-suppliers',
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class SuppliersComponent implements OnInit {
  suppliers: any[] = [];
  showCreateModal = false;
  editMode = false;
  editId: number | null = null;
  form: any = { name: '', ruc: '', contactName: '', phone: '', email: '', address: '' };

  constructor(private http: HttpClient, private auth: AuthService) {}
  ngOnInit() { this.load(); }
  private get instId(): number { return this.auth.institutionId() || 1; }

  load() {
    this.http.get<any[]>(`${API_URL}/inventory/suppliers?institutionId=${this.instId}`).subscribe({ next: r => this.suppliers = r, error: () => {} });
  }
  save() {
    const req = this.editMode
      ? this.http.put(`${API_URL}/inventory/suppliers/${this.editId}`, { ...this.form, institutionId: this.instId })
      : this.http.post(`${API_URL}/inventory/suppliers`, { ...this.form, institutionId: this.instId });
    req.subscribe({ next: () => { this.closeModal(); this.load(); }, error: e => alert(e.error?.message || 'Error') });
  }
  editSupplier(s: any) { this.editMode = true; this.editId = s.id; this.form = { ...s }; this.showCreateModal = true; }
  closeModal() { this.showCreateModal = false; this.editMode = false; this.editId = null; this.form = { name: '', ruc: '', contactName: '', phone: '', email: '', address: '' }; }
  deleteSupplier(id: number) {
    if (!confirm('Eliminar proveedor?')) return;
    this.http.delete(`${API_URL}/inventory/suppliers/${id}`).subscribe({ next: () => this.load() });
  }
}
