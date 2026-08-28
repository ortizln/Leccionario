import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../core/api.config';
import { AuthService } from '../../core/auth.service';

@Component({
  templateUrl: './asset-warranties.component.html',
  styleUrl: './asset-warranties.component.css',
    selector: 'app-asset-warranties',
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class AssetWarrantiesComponent implements OnInit {
  warranties: any[] = [];
  expiring: any[] = [];
  showForm = false;
  editItem: any = null;
  form: any = { assetId: null, provider: '', warrantyType: 'ESTANDAR', startDate: '', endDate: '', terms: '' };
  private get instId(): number { return this.auth.institutionId() || 1; }

  constructor(private http: HttpClient, private auth: AuthService) {}

  ngOnInit() { this.load(); }

  load() {
    this.http.get<any[]>(`${API_URL}/inventory/warranties?institutionId=${this.instId}`).subscribe(d => this.warranties = d);
    this.http.get<any[]>(`${API_URL}/inventory/warranties/expiring?institutionId=${this.instId}`).subscribe(d => this.expiring = d);
  }

  resetForm() { this.form = { assetId: null, provider: '', warrantyType: 'ESTANDAR', startDate: '', endDate: '', terms: '' }; }

  save() {
    const payload = { ...this.form, institutionId: this.instId, status: 'VIGENTE' };
    const req = this.editItem
      ? this.http.put(`${API_URL}/inventory/warranties/${this.editItem.id}`, payload)
      : this.http.post(`${API_URL}/inventory/warranties`, payload);
    req.subscribe(() => { this.showForm = false; this.load(); });
  }

  edit(w: any) { this.editItem = w; this.form = { ...w }; this.showForm = true; }

  deleteItem(id: number) {
    if (confirm('Eliminar garantia?')) this.http.delete(`${API_URL}/inventory/warranties/${id}`).subscribe(() => this.load());
  }
}
