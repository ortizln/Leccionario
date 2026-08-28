import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../core/api.config';
import { AuthService } from '../../core/auth.service';

@Component({
  templateUrl: './transport.component.html',
  styleUrl: './transport.component.css',
    selector: 'app-transport',
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class TransportComponent implements OnInit {
  tab = 'routes';
  routes: any[] = [];
  editId: number | null = null;
  f: any = {};
  message = ''; isError = false;
  instId = 1;

  constructor(private http: HttpClient, private auth: AuthService) {}
  ngOnInit() { this.instId = this.auth.institutionId() || 1; this.loadRoutes(); }

  private showMsg(m: string, e = false) { this.message = m; this.isError = e; setTimeout(() => this.message = '', 4000); }
  loadRoutes() { this.http.get<any[]>(`${API_URL}/transport/routes/institution/${this.instId}`).subscribe({ next: d => this.routes = d }); }

  save() {
    const body = { ...this.f, institutionId: this.instId };
    const obs = this.editId ? this.http.put(`${API_URL}/transport/routes/${this.editId}`, body) : this.http.post(`${API_URL}/transport/routes`, body);
    obs.subscribe({ next: () => { this.showMsg('Guardado'); this.tab = 'routes'; this.loadRoutes(); this.resetForm(); }, error: () => this.showMsg('Error', true) });
  }

  edit(r: any) { this.editId = r.id; this.f = { ...r }; this.tab = 'new'; }
  deleteRoute(id: number) { if (!confirm('Eliminar?')) return; this.http.delete(`${API_URL}/transport/routes/${id}`).subscribe({ next: () => this.loadRoutes() }); }
  resetForm() { this.editId = null; this.f = {}; }
}
