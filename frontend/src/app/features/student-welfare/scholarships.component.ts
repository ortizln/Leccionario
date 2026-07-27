import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../core/api.config';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-scholarships',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h4 class="mb-0 fw-bold">Becas</h4>
    </div>

    <ul class="nav nav-tabs nav-tabs-sm mb-3">
      <li><a class="nav-link" [class.active]="tab==='types'" (click)="tab='types'; loadTypes()">Tipos de Beca</a></li>
      <li><a class="nav-link" [class.active]="tab==='pending'" (click)="tab='pending'; loadPending()">Solicitudes</a></li>
      <li><a class="nav-link" [class.active]="tab==='new-type'" (click)="tab='new-type'; resetTypeForm()">Nuevo Tipo</a></li>
      <li><a class="nav-link" [class.active]="tab==='new-app'" (click)="tab='new-app'; resetAppForm()">Nueva Solicitud</a></li>
    </ul>

    <div *ngIf="tab==='types'">
      <div class="table-responsive">
        <table class="table table-xs table-hover">
          <thead><tr><th>Nombre</th><th>Cobertura %</th><th>Monto</th><th>Criterios</th><th></th></tr></thead>
          <tbody>
            <tr *ngFor="let t of types">
              <td class="fw-semibold">{{t.name}}</td><td>{{t.coveragePercent || '-'}}%</td><td>{{t.coverageAmount | number:'1.2-2'}}</td>
              <td class="cell-truncate small">{{t.criteria || '-'}}</td>
              <td><button class="btn btn-sm btn-outline-danger" (click)="deleteType(t.id)">X</button></td>
            </tr>
            <tr *ngIf="types.length===0"><td colspan="5" class="text-muted text-center">No hay tipos de beca</td></tr>
          </tbody>
        </table>
      </div>
    </div>

    <div *ngIf="tab==='new-type'">
      <div class="card"><div class="card-body">
        <div class="row g-2">
          <div class="col-md-3"><label class="form-label form-label-sm">Nombre</label><input class="form-control form-control-sm" [(ngModel)]="tf.name"></div>
          <div class="col-md-2"><label class="form-label form-label-sm">Cobertura %</label><input type="number" class="form-control form-control-sm" [(ngModel)]="tf.coveragePercent"></div>
          <div class="col-md-2"><label class="form-label form-label-sm">Monto</label><input type="number" class="form-control form-control-sm" [(ngModel)]="tf.coverageAmount"></div>
          <div class="col-md-5"><label class="form-label form-label-sm">Criterios</label><input class="form-control form-control-sm" [(ngModel)]="tf.criteria"></div>
        </div>
        <div class="row g-2 mt-1">
          <div class="col-md-6"><label class="form-label form-label-sm">Descripcion</label><input class="form-control form-control-sm" [(ngModel)]="tf.description"></div>
          <div class="col-md-2 d-flex align-items-end"><button class="btn btn-sm btn-primary" (click)="createType()">Crear</button></div>
        </div>
      </div></div>
    </div>

    <div *ngIf="tab==='pending'">
      <div class="table-responsive">
        <table class="table table-xs table-hover">
          <thead><tr><th>Estudiante</th><th>Tipo</th><th>Fecha</th><th>Promedio</th><th>Ingreso Fam.</th><th>Estado</th><th></th></tr></thead>
          <tbody>
            <tr *ngFor="let a of applications">
              <td>Est#{{a.studentId}}</td><td>Tipo#{{a.typeId}}</td><td>{{a.applicationDate}}</td>
              <td>{{a.gpa || '-'}}</td><td>{{a.familyIncome | number:'1.2-2'}}</td>
              <td><span class="badge" [class.text-bg-warning]="a.status==='PENDIENTE'" [class.text-bg-success]="a.status==='APROBADA'" [class.text-bg-danger]="a.status==='RECHAZADA'">{{a.status}}</span></td>
              <td>
                <button *ngIf="a.status==='PENDIENTE'" class="btn btn-sm btn-outline-success" (click)="approve(a.id)">Aprobar</button>
                <button *ngIf="a.status==='PENDIENTE'" class="btn btn-sm btn-outline-danger" (click)="reject(a.id)">Rechazar</button>
              </td>
            </tr>
            <tr *ngIf="applications.length===0"><td colspan="7" class="text-muted text-center">No hay solicitudes pendientes</td></tr>
          </tbody>
        </table>
      </div>
    </div>

    <div *ngIf="tab==='new-app'">
      <div class="card"><div class="card-body">
        <div class="row g-2">
          <div class="col-md-2"><label class="form-label form-label-sm">Estudiante ID</label><input type="number" class="form-control form-control-sm" [(ngModel)]="af.studentId"></div>
          <div class="col-md-2"><label class="form-label form-label-sm">Tipo Beca</label><input type="number" class="form-control form-control-sm" [(ngModel)]="af.typeId"></div>
          <div class="col-md-2"><label class="form-label form-label-sm">Promedio</label><input type="number" class="form-control form-control-sm" [(ngModel)]="af.gpa"></div>
          <div class="col-md-2"><label class="form-label form-label-sm">Ingreso Familiar</label><input type="number" class="form-control form-control-sm" [(ngModel)]="af.familyIncome"></div>
          <div class="col-md-2"><label class="form-label form-label-sm">Hermanos</label><input type="number" class="form-control form-control-sm" [(ngModel)]="af.siblingsInSchool"></div>
        </div>
        <div class="row g-2 mt-1">
          <div class="col-md-6"><label class="form-label form-label-sm">Justificacion</label><textarea class="form-control form-control-sm" rows="2" [(ngModel)]="af.justification"></textarea></div>
          <div class="col-md-2 d-flex align-items-end"><button class="btn btn-sm btn-primary" (click)="createApp()">Enviar</button></div>
        </div>
      </div></div>
    </div>

    <div *ngIf="message" class="position-fixed bottom-0 end-0 p-3" style="z-index:1050">
      <div class="toast show" [class.bg-success]="!isError" [class.bg-danger]="isError"><div class="toast-body text-white">{{message}}</div></div>
    </div>
  `
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
