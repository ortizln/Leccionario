import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../core/api.config';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-staff-vacations',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h4 class="mb-0 fw-bold">Vacaciones y Permisos del Personal</h4>
    </div>

    <ul class="nav nav-tabs nav-tabs-sm mb-3">
      <li><a class="nav-link" [class.active]="tab==='requests'" (click)="tab='requests'; loadPending()">Solicitudes</a></li>
      <li><a class="nav-link" [class.active]="tab==='new-vac'" (click)="tab='new-vac'; resetVacForm()">Nueva Solicitud</a></li>
      <li><a class="nav-link" [class.active]="tab==='permissions'" (click)="tab='permissions'; loadPendingPerms()">Permisos</a></li>
      <li><a class="nav-link" [class.active]="tab==='new-perm'" (click)="tab='new-perm'; resetPermForm()">Nuevo Permiso</a></li>
    </ul>

    <!-- Solicitudes pendientes -->
    <div *ngIf="tab==='requests'">
      <div class="table-responsive">
        <table class="table table-xs table-hover">
          <thead><tr><th>Empleado</th><th>Desde</th><th>Hasta</th><th>Dias</th><th>Razon</th><th>Estado</th><th></th></tr></thead>
          <tbody>
            <tr *ngFor="let r of vacRequests">
              <td>Emp#{{r.employeeId}}</td><td>{{r.startDate}}</td><td>{{r.endDate}}</td><td>{{r.daysRequested}}</td>
              <td class="cell-truncate">{{r.reason || '-'}}</td>
              <td><span class="badge" [class.text-bg-warning]="r.status==='PENDIENTE'" [class.text-bg-success]="r.status==='APROBADA'" [class.text-bg-danger]="r.status==='RECHAZADA'">{{r.status}}</span></td>
              <td>
                <button *ngIf="r.status==='PENDIENTE'" class="btn btn-sm btn-outline-success" (click)="approveVac(r.id)">Aprobar</button>
                <button *ngIf="r.status==='PENDIENTE'" class="btn btn-sm btn-outline-danger" (click)="rejectVac(r.id)">Rechazar</button>
              </td>
            </tr>
            <tr *ngIf="vacRequests.length===0"><td colspan="7" class="text-muted text-center">No hay solicitudes pendientes</td></tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Nueva solicitud vacaciones -->
    <div *ngIf="tab==='new-vac'">
      <div class="card">
        <div class="card-body">
          <div class="row g-2">
            <div class="col-md-2"><label class="form-label form-label-sm">Empleado ID</label><input type="number" class="form-control form-control-sm" [(ngModel)]="vf.employeeId"></div>
            <div class="col-md-2"><label class="form-label form-label-sm">Desde</label><input type="date" class="form-control form-control-sm" [(ngModel)]="vf.startDate"></div>
            <div class="col-md-2"><label class="form-label form-label-sm">Hasta</label><input type="date" class="form-control form-control-sm" [(ngModel)]="vf.endDate"></div>
            <div class="col-md-1"><label class="form-label form-label-sm"># Dias</label><input type="number" class="form-control form-control-sm" [(ngModel)]="vf.daysRequested"></div>
            <div class="col-md-5"><label class="form-label form-label-sm">Razon</label><input class="form-control form-control-sm" [(ngModel)]="vf.reason"></div>
          </div>
          <div class="mt-2"><button class="btn btn-sm btn-primary" (click)="createVac()">Enviar Solicitud</button></div>
        </div>
      </div>
    </div>

    <!-- Permisos pendientes -->
    <div *ngIf="tab==='permissions'">
      <div class="table-responsive">
        <table class="table table-xs table-hover">
          <thead><tr><th>Empleado</th><th>Tipo</th><th>Desde</th><th>Hasta</th><th>Razon</th><th>Estado</th><th></th></tr></thead>
          <tbody>
            <tr *ngFor="let p of permRequests">
              <td>Emp#{{p.employeeId}}</td>
              <td><span class="badge text-bg-secondary">{{p.permissionType}}</span></td>
              <td>{{p.startDate}}</td><td>{{p.endDate}}</td>
              <td class="cell-truncate">{{p.reason}}</td>
              <td><span class="badge" [class.text-bg-warning]="p.status==='PENDIENTE'" [class.text-bg-success]="p.status==='APROBADO'" [class.text-bg-danger]="p.status==='RECHAZADO'">{{p.status}}</span></td>
              <td>
                <button *ngIf="p.status==='PENDIENTE'" class="btn btn-sm btn-outline-success" (click)="approvePerm(p.id)">Aprobar</button>
                <button *ngIf="p.status==='PENDIENTE'" class="btn btn-sm btn-outline-danger" (click)="rejectPerm(p.id)">Rechazar</button>
              </td>
            </tr>
            <tr *ngIf="permRequests.length===0"><td colspan="7" class="text-muted text-center">No hay permisos pendientes</td></tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Nuevo permiso -->
    <div *ngIf="tab==='new-perm'">
      <div class="card">
        <div class="card-body">
          <div class="row g-2">
            <div class="col-md-2"><label class="form-label form-label-sm">Empleado ID</label><input type="number" class="form-control form-control-sm" [(ngModel)]="pf.employeeId"></div>
            <div class="col-md-2"><label class="form-label form-label-sm">Tipo</label>
              <select class="form-select form-select-sm" [(ngModel)]="pf.permissionType"><option value="PERSONAL">Personal</option><option value="MEDICO">Medico</option><option value="FAMILIAR">Familiar</option><option value="EDUCATIVO">Educativo</option><option value="MATERNIDAD">Maternidad</option><option value="PATERNIDAD">Paternidad</option><option value="CALAMIDAD">Calamidad</option><option value="OTRO">Otro</option></select>
            </div>
            <div class="col-md-2"><label class="form-label form-label-sm">Desde</label><input type="date" class="form-control form-control-sm" [(ngModel)]="pf.startDate"></div>
            <div class="col-md-2"><label class="form-label form-label-sm">Hasta</label><input type="date" class="form-control form-control-sm" [(ngModel)]="pf.endDate"></div>
            <div class="col-md-4"><label class="form-label form-label-sm">Razon</label><input class="form-control form-control-sm" [(ngModel)]="pf.reason"></div>
          </div>
          <div class="mt-2"><button class="btn btn-sm btn-primary" (click)="createPerm()">Enviar Permiso</button></div>
        </div>
      </div>
    </div>

    <div *ngIf="message" class="position-fixed bottom-0 end-0 p-3" style="z-index:1050">
      <div class="toast show" [class.bg-success]="!isError" [class.bg-danger]="isError"><div class="toast-body text-white">{{message}}</div></div>
    </div>
  `
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
