import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../core/api.config';
import { AuthService } from '../../core/auth.service';

@Component({
  templateUrl: './scholarships.component.html',
  styleUrl: './scholarships.component.css',
    selector: 'app-scholarships',
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class ScholarshipsComponent implements OnInit {
  tab = 'types';
  types: any[] = [];
  applications: any[] = [];
  tf: any = {};
  af: any = {};
  message = ''; isError = false;
  instId = 1;

  constructor(private http: HttpClient, private auth: AuthService) {}
  ngOnInit() { this.instId = this.auth.institutionId() || 1; this.loadTypes(); }

  private showMsg(m: string, e = false) { this.message = m; this.isError = e; setTimeout(() => this.message = '', 4000); }

  loadTypes() { this.http.get<any[]>(`${API_URL}/scholarships/types/institution/${this.instId}`).subscribe({ next: d => this.types = d }); }
  loadPending() { this.http.get<any[]>(`${API_URL}/scholarships/applications/pending`).subscribe({ next: d => this.applications = d }); }

  createType() {
    this.http.post(`${API_URL}/scholarships/types`, { ...this.tf, institutionId: this.instId }).subscribe({
      next: () => { this.showMsg('Tipo creado'); this.tab = 'types'; this.loadTypes(); this.resetTypeForm(); }, error: () => this.showMsg('Error', true)
    });
  }

  deleteType(id: number) { if (!confirm('Eliminar?')) return; this.http.delete(`${API_URL}/scholarships/types/${id}`).subscribe({ next: () => this.loadTypes() }); }

  createApp() {
    this.http.post(`${API_URL}/scholarships/applications`, this.af).subscribe({
      next: () => { this.showMsg('Solicitud enviada'); this.tab = 'pending'; this.loadPending(); this.resetAppForm(); }, error: () => this.showMsg('Error', true)
    });
  }

  approve(id: number) { this.http.put(`${API_URL}/scholarships/applications/${id}/approve`, null, { params: { amount: '0' } }).subscribe({ next: () => { this.loadPending(); this.showMsg('Aprobada'); } }); }
  reject(id: number) { this.http.put(`${API_URL}/scholarships/applications/${id}/reject`, null, { params: { observations: 'Rechazada' } }).subscribe({ next: () => { this.loadPending(); this.showMsg('Rechazada'); } }); }

  resetTypeForm() { this.tf = {}; }
  resetAppForm() { this.af = {}; }
}
