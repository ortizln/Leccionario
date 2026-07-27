import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../core/api.config';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-classrooms',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h4 class="mb-0 fw-bold">Aulas y Laboratorios</h4>
    </div>

    <div class="row g-2 mb-3" *ngIf="stats">
      <div class="col-md-3"><div class="card border-0 shadow-sm"><div class="card-body text-center py-2"><div class="small text-muted">Total</div><div class="fs-5 fw-bold" style="color:#3B4436">{{stats.total}}</div></div></div></div>
      <div class="col-md-3"><div class="card border-0 shadow-sm"><div class="card-body text-center py-2"><div class="small text-muted">Aulas</div><div class="fs-5 fw-bold text-primary">{{stats.byType?.AULA || 0}}</div></div></div></div>
      <div class="col-md-3"><div class="card border-0 shadow-sm"><div class="card-body text-center py-2"><div class="small text-muted">Laboratorios</div><div class="fs-5 fw-bold text-info">{{stats.byType?.LABORATORIO || 0}}</div></div></div></div>
      <div class="col-md-3"><div class="card border-0 shadow-sm"><div class="card-body text-center py-2"><div class="small text-muted">Capacidad Total</div><div class="fs-5 fw-bold text-success">{{stats.totalCapacity}}</div></div></div></div>
    </div>

    <div class="d-flex justify-content-end mb-2">
      <button class="btn btn-sm btn-primary" (click)="showForm=!showForm; resetForm()">+ Nueva Aula</button>
    </div>

    <div *ngIf="showForm" class="card mb-3">
      <div class="card-body">
        <div class="row g-2">
          <div class="col-md-2"><label class="form-label form-label-sm">Nombre</label><input class="form-control form-control-sm" [(ngModel)]="formName"></div>
          <div class="col-md-2"><label class="form-label form-label-sm">Codigo</label><input class="form-control form-control-sm" [(ngModel)]="formCode"></div>
          <div class="col-md-2"><label class="form-label form-label-sm">Tipo</label>
            <select class="form-select form-select-sm" [(ngModel)]="formType">
              <option value="AULA">Aula</option><option value="LABORATORIO">Laboratorio</option><option value="TALLER">Taller</option><option value="AUDITORIO">Auditorio</option><option value="BIBLIOTECA">Biblioteca</option><option value="CANCHA">Cancha</option><option value="OTRO">Otro</option>
            </select>
          </div>
          <div class="col-md-1"><label class="form-label form-label-sm">Cap.</label><input type="number" class="form-control form-control-sm" [(ngModel)]="formCapacity"></div>
          <div class="col-md-1"><label class="form-label form-label-sm">Piso</label><input class="form-control form-control-sm" [(ngModel)]="formFloor"></div>
          <div class="col-md-1"><label class="form-label form-label-sm">Ala</label><input class="form-control form-control-sm" [(ngModel)]="formWing"></div>
          <div class="col-md-2 d-flex align-items-end"><button class="btn btn-sm btn-primary" (click)="save()">Guardar</button></div>
        </div>
        <div class="row g-2 mt-1">
          <div class="col-auto"><label class="form-check-label"><input type="checkbox" class="form-check-input" [(ngModel)]="formProjector"> Proyector</label></div>
          <div class="col-auto"><label class="form-check-label"><input type="checkbox" class="form-check-input" [(ngModel)]="formComputers"> Computadoras</label></div>
          <div class="col-auto"><label class="form-check-label"><input type="checkbox" class="form-check-input" [(ngModel)]="formInternet"> Internet</label></div>
          <div class="col-md-2" *ngIf="formComputers"><label class="form-label form-label-sm"># PCs</label><input type="number" class="form-control form-control-sm" [(ngModel)]="formCompCount"></div>
        </div>
      </div>
    </div>

    <div class="table-responsive">
      <table class="table table-xs table-hover">
        <thead><tr><th>Codigo</th><th>Nombre</th><th>Tipo</th><th>Cap.</th><th>Piso</th><th>Ala</th><th>Recursos</th><th></th></tr></thead>
        <tbody>
          <tr *ngFor="let c of classrooms">
            <td>{{c.code}}</td><td>{{c.name}}</td>
            <td><span class="badge text-bg-secondary">{{typeLabel(c.classroomType)}}</span></td>
            <td>{{c.capacity}}</td><td>{{c.floor || '-'}}</td><td>{{c.wing || '-'}}</td>
            <td>
              <span *ngIf="c.hasProjector" class="badge text-bg-info me-1">Proyector</span>
              <span *ngIf="c.hasComputers" class="badge text-bg-primary me-1">PCs:{{c.computerCount}}</span>
              <span *ngIf="c.hasInternet" class="badge text-bg-success">WiFi</span>
            </td>
            <td><button class="btn btn-sm btn-outline-primary" (click)="edit(c)">Editar</button> <button class="btn btn-sm btn-outline-danger" (click)="delete(c.id)">X</button></td>
          </tr>
          <tr *ngIf="classrooms.length===0"><td colspan="8" class="text-muted text-center">No hay aulas</td></tr>
        </tbody>
      </table>
    </div>

    <div *ngIf="message" class="position-fixed bottom-0 end-0 p-3" style="z-index:1050">
      <div class="toast show" [class.bg-success]="!isError" [class.bg-danger]="isError"><div class="toast-body text-white">{{message}}</div></div>
    </div>
  `
})
export class ClassroomsComponent implements OnInit {
  classrooms: any[] = [];
  stats: any = null;
  showForm = false;
  editId: number | null = null;
  formName = ''; formCode = ''; formType = 'AULA'; formCapacity = 40; formFloor = ''; formWing = '';
  formProjector = false; formComputers = false; formCompCount = 0; formInternet = false;
  message = ''; isError = false;
  instId = 1;

  constructor(private http: HttpClient, private auth: AuthService) {}
  ngOnInit() { this.instId = this.auth.institutionId() || 1; this.load(); this.loadStats(); }

  private showMsg(m: string, e = false) { this.message = m; this.isError = e; setTimeout(() => this.message = '', 4000); }

  load() { this.http.get<any[]>(`${API_URL}/institution/classrooms/institution/${this.instId}`).subscribe({ next: d => this.classrooms = d }); }
  loadStats() { this.http.get<any>(`${API_URL}/institution/classrooms/stats/${this.instId}`).subscribe({ next: d => this.stats = d }); }

  save() {
    const body: any = { institutionId: this.instId, name: this.formName, code: this.formCode, classroomType: this.formType,
      capacity: this.formCapacity, floor: this.formFloor, wing: this.formWing,
      hasProjector: this.formProjector, hasComputers: this.formComputers, computerCount: this.formCompCount, hasInternet: this.formInternet };
    const obs = this.editId ? this.http.put(`${API_URL}/institution/classrooms/${this.editId}`, body) : this.http.post(`${API_URL}/institution/classrooms`, body);
    obs.subscribe({ next: () => { this.showMsg('Guardado'); this.showForm = false; this.load(); this.loadStats(); this.resetForm(); }, error: () => this.showMsg('Error', true) });
  }

  edit(c: any) { this.editId = c.id; this.formName = c.name; this.formCode = c.code; this.formType = c.classroomType; this.formCapacity = c.capacity; this.formFloor = c.floor || ''; this.formWing = c.wing || ''; this.formProjector = c.hasProjector; this.formComputers = c.hasComputers; this.formCompCount = c.computerCount || 0; this.formInternet = c.hasInternet; this.showForm = true; }

  delete(id: number) { if (!confirm('Eliminar aula?')) return; this.http.delete(`${API_URL}/institution/classrooms/${id}`).subscribe({ next: () => { this.load(); this.loadStats(); this.showMsg('Eliminada'); }, error: () => this.showMsg('Error', true) }); }

  resetForm() { this.editId = null; this.formName = ''; this.formCode = ''; this.formType = 'AULA'; this.formCapacity = 40; this.formFloor = ''; this.formWing = ''; this.formProjector = false; this.formComputers = false; this.formCompCount = 0; this.formInternet = false; }

  typeLabel(t: string): string { const m: Record<string, string> = { AULA: 'Aula', LABORATORIO: 'Lab', TALLER: 'Taller', AUDITORIO: 'Auditorio', BIBLIOTECA: 'Biblioteca', CANCHA: 'Cancha', OTRO: 'Otro' }; return m[t] || t; }
}
