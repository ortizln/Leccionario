import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../core/api.config';

@Component({
  templateUrl: './asset-assignments.component.html',
  styleUrl: './asset-assignments.component.css',
    selector: 'app-asset-assignments',
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class AssetAssignmentsComponent implements OnInit {
  list: any[] = [];
  stats: any = {};
  search = '';
  showFormModal = false;
  form: any = {};

  constructor(private http: HttpClient) {}
  ngOnInit() { this.load(); }

  load() {
    this.http.get<any[]>(`${API_URL}/inventory/assignments`).subscribe({ next: r => this.list = r, error: () => {} });
    this.http.get<any>(`${API_URL}/inventory/assignments/stats`).subscribe({ next: r => this.stats = r, error: () => {} });
  }

  filteredList() {
    if (!this.search) return this.list;
    const s = this.search.toLowerCase();
    return this.list.filter(a => (a.assignedTo || '').toLowerCase().includes(s) || String(a.assetId).includes(s) || (a.notes || '').toLowerCase().includes(s));
  }

  resetForm() { this.form = { assetId: null, assignedTo: '', userId: null, notes: '' }; }

  createAssignment() {
    this.http.post<any>(`${API_URL}/inventory/assets/${this.form.assetId}/assign`, {
      assignedTo: this.form.assignedTo, userId: this.form.userId, notes: this.form.notes
    }).subscribe({ next: () => { this.showFormModal = false; this.load(); }, error: e => alert(e.error?.message || 'Error') });
  }

  returnAsset(id: number) {
    if (!confirm('Confirmar devolucion?')) return;
    this.http.post<any>(`${API_URL}/inventory/assignments/${id}/return`, {}).subscribe({ next: () => this.load() });
  }
}
