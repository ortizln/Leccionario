import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../core/api.config';
import { AuthService } from '../../core/auth.service';

@Component({
  templateUrl: './staff-vacations.component.html',
  styleUrl: './staff-vacations.component.css',
    selector: 'app-staff-vacations',
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class StaffVacationsComponent implements OnInit {
  tab = 'requests';
  vacRequests: any[] = [];
  permRequests: any[] = [];
  vf: any = {};
  pf: any = { permissionType: 'PERSONAL' };
  message = ''; isError = false;

  constructor(private http: HttpClient) {}
  ngOnInit() { this.loadPending(); }

  private showMsg(m: string, e = false) { this.message = m; this.isError = e; setTimeout(() => this.message = '', 4000); }

  loadPending() { this.http.get<any[]>(`${API_URL}/hr/vacations/requests/pending`).subscribe({ next: d => this.vacRequests = d }); }
  loadPendingPerms() { this.http.get<any[]>(`${API_URL}/hr/permissions/pending`).subscribe({ next: d => this.permRequests = d }); }

  createVac() {
    this.http.post(`${API_URL}/hr/vacations/requests`, this.vf).subscribe({
      next: () => { this.showMsg('Solicitud enviada'); this.tab = 'requests'; this.loadPending(); this.resetVacForm(); },
      error: () => this.showMsg('Error', true)
    });
  }

  approveVac(id: number) { this.http.put(`${API_URL}/hr/vacations/requests/${id}/approve`, {}).subscribe({ next: () => { this.loadPending(); this.showMsg('Aprobada'); } }); }
  rejectVac(id: number) { this.http.put(`${API_URL}/hr/vacations/requests/${id}/reject`, {}).subscribe({ next: () => { this.loadPending(); this.showMsg('Rechazada'); } }); }

  createPerm() {
    this.http.post(`${API_URL}/hr/permissions`, this.pf).subscribe({
      next: () => { this.showMsg('Permiso enviado'); this.tab = 'permissions'; this.loadPendingPerms(); this.resetPermForm(); },
      error: () => this.showMsg('Error', true)
    });
  }

  approvePerm(id: number) { this.http.put(`${API_URL}/hr/permissions/${id}/approve`, {}).subscribe({ next: () => { this.loadPendingPerms(); this.showMsg('Aprobado'); } }); }
  rejectPerm(id: number) { this.http.put(`${API_URL}/hr/permissions/${id}/reject`, {}).subscribe({ next: () => { this.loadPendingPerms(); this.showMsg('Rechazado'); } }); }

  resetVacForm() { this.vf = {}; }
  resetPermForm() { this.pf = { permissionType: 'PERSONAL' }; }
}
