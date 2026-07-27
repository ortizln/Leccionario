import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../core/api.config';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-employees',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h4 class="mb-0 fw-bold">Expediente de Empleados</h4>
    </div>

    <div class="row g-2 mb-3" *ngIf="stats">
      <div class="col-md-3"><div class="card border-0 shadow-sm"><div class="card-body text-center py-2"><div class="small text-muted">Total</div><div class="fs-5 fw-bold" style="color:#3B4436">{{stats.total}}</div></div></div></div>
      <div class="col-md-3"><div class="card border-0 shadow-sm"><div class="card-body text-center py-2"><div class="small text-muted">Activos</div><div class="fs-5 fw-bold text-success">{{stats.active}}</div></div></div></div>
      <div class="col-md-3"><div class="card border-0 shadow-sm"><div class="card-body text-center py-2"><div class="small text-muted">Vacaciones</div><div class="fs-5 fw-bold text-warning">{{stats.byStatus?.VACACIONES || 0}}</div></div></div></div>
      <div class="col-md-3"><div class="card border-0 shadow-sm"><div class="card-body text-center py-2"><div class="small text-muted">Retirados</div><div class="fs-5 fw-bold text-danger">{{stats.byStatus?.RETIRADO || 0}}</div></div></div></div>
    </div>

    <ul class="nav nav-tabs nav-tabs-sm mb-3">
      <li><a class="nav-link" [class.active]="tab==='list'" (click)="tab='list'; load()">Empleados</a></li>
      <li><a class="nav-link" [class.active]="tab==='new'" (click)="tab='new'; resetForm()">Nuevo Empleado</a></li>
    </ul>

    <div *ngIf="tab==='list'">
      <div class="table-responsive">
        <table class="table table-xs table-hover">
          <thead><tr><th>#</th><th>Nombre</th><th>Cedula</th><th>Cargo</th><th>Depto</th><th>Estado</th><th>Ingresa</th><th></th></tr></thead>
          <tbody>
            <tr *ngFor="let e of employees">
              <td>{{e.employeeNumber}}</td>
              <td>{{e.firstName}} {{e.lastName}}</td>
              <td>{{e.identification}}</td>
              <td>{{e.position || '-'}}</td>
              <td>{{e.department || '-'}}</td>
              <td>
                <span class="badge" [class.text-bg-success]="e.status==='ACTIVO'" [class.text-bg-warning]="e.status==='VACACIONES'" [class.text-bg-info]="e.status==='PERMISO'" [class.text-bg-secondary]="e.status==='INACTIVO'" [class.text-bg-danger]="e.status==='RETIRADO'">
                  {{e.status}}
                </span>
              </td>
              <td>{{e.hireDate}}</td>
              <td><button class="btn btn-sm btn-outline-primary" (click)="edit(e)">Editar</button> <button class="btn btn-sm btn-outline-danger" (click)="deleteEmp(e.id)">X</button></td>
            </tr>
            <tr *ngIf="employees.length===0"><td colspan="8" class="text-muted text-center">No hay empleados</td></tr>
          </tbody>
        </table>
      </div>
    </div>

    <div *ngIf="tab==='new'">
      <div class="card">
        <div class="card-body">
          <div class="row g-2">
            <div class="col-md-2"><label class="form-label form-label-sm"># Empleado</label><input class="form-control form-control-sm" [(ngModel)]="f.employeeNumber"></div>
            <div class="col-md-3"><label class="form-label form-label-sm">Nombres</label><input class="form-control form-control-sm" [(ngModel)]="f.firstName"></div>
            <div class="col-md-3"><label class="form-label form-label-sm">Apellidos</label><input class="form-control form-control-sm" [(ngModel)]="f.lastName"></div>
            <div class="col-md-2"><label class="form-label form-label-sm">Cedula</label><input class="form-control form-control-sm" [(ngModel)]="f.identification"></div>
            <div class="col-md-2"><label class="form-label form-label-sm">Tipo ID</label>
              <select class="form-select form-select-sm" [(ngModel)]="f.idType"><option value="CEDULA">Cedula</option><option value="RUC">RUC</option><option value="PASSPORT">Pasaporte</option></select>
            </div>
          </div>
          <div class="row g-2 mt-1">
            <div class="col-md-2"><label class="form-label form-label-sm">Fecha Nac.</label><input type="date" class="form-control form-control-sm" [(ngModel)]="f.birthDate"></div>
            <div class="col-md-2"><label class="form-label form-label-sm">Genero</label>
              <select class="form-select form-select-sm" [(ngModel)]="f.gender"><option value="M">Masculino</option><option value="F">Femenino</option></select>
            </div>
            <div class="col-md-2"><label class="form-label form-label-sm">Estado Civil</label>
              <select class="form-select form-select-sm" [(ngModel)]="f.civilStatus"><option value="SOLTERO">Soltero</option><option value="CASADO">Casado</option><option value="DIVORCIADO">Divorciado</option><option value="VIUDO">Viudo</option></select>
            </div>
            <div class="col-md-2"><label class="form-label form-label-sm">Nacionalidad</label><input class="form-control form-control-sm" [(ngModel)]="f.nationality"></div>
            <div class="col-md-2"><label class="form-label form-label-sm">Provincia</label><input class="form-control form-control-sm" [(ngModel)]="f.province"></div>
            <div class="col-md-2"><label class="form-label form-label-sm">Ciudad</label><input class="form-control form-control-sm" [(ngModel)]="f.city"></div>
          </div>
          <div class="row g-2 mt-1">
            <div class="col-md-3"><label class="form-label form-label-sm">Cargo</label><input class="form-control form-control-sm" [(ngModel)]="f.position"></div>
            <div class="col-md-2"><label class="form-label form-label-sm">Depto</label><input class="form-control form-control-sm" [(ngModel)]="f.department"></div>
            <div class="col-md-2"><label class="form-label form-label-sm">Fecha Ingreso</label><input type="date" class="form-control form-control-sm" [(ngModel)]="f.hireDate"></div>
            <div class="col-md-2"><label class="form-label form-label-sm">Telefono</label><input class="form-control form-control-sm" [(ngModel)]="f.phone"></div>
            <div class="col-md-3"><label class="form-label form-label-sm">Email</label><input class="form-control form-control-sm" [(ngModel)]="f.email"></div>
          </div>
          <div class="row g-2 mt-1">
            <div class="col-md-4"><label class="form-label form-label-sm">Direccion</label><input class="form-control form-control-sm" [(ngModel)]="f.address"></div>
            <div class="col-md-3"><label class="form-label form-label-sm">Contacto Emergencia</label><input class="form-control form-control-sm" [(ngModel)]="f.emergencyContact"></div>
            <div class="col-md-2"><label class="form-label form-label-sm">Tel. Emergencia</label><input class="form-control form-control-sm" [(ngModel)]="f.emergencyPhone"></div>
          </div>
          <div class="mt-3"><button class="btn btn-sm btn-primary" (click)="save()">{{editId?'Actualizar':'Crear'}} Empleado</button></div>
        </div>
      </div>
    </div>

    <div *ngIf="message" class="position-fixed bottom-0 end-0 p-3" style="z-index:1050">
      <div class="toast show" [class.bg-success]="!isError" [class.bg-danger]="isError"><div class="toast-body text-white">{{message}}</div></div>
    </div>
  `
})
export class EmployeesComponent implements OnInit {
  tab = 'list';
  employees: any[] = [];
  stats: any = null;
  editId: number | null = null;
  f: any = {};
  message = ''; isError = false;
  instId = 1;

  constructor(private http: HttpClient, private auth: AuthService) {}
  ngOnInit() { this.instId = this.auth.institutionId() || 1; this.load(); this.loadStats(); }

  private showMsg(m: string, e = false) { this.message = m; this.isError = e; setTimeout(() => this.message = '', 4000); }
  load() { this.http.get<any[]>(`${API_URL}/hr/employees/institution/${this.instId}`).subscribe({ next: d => this.employees = d }); }
  loadStats() { this.http.get<any>(`${API_URL}/hr/employees/stats/${this.instId}`).subscribe({ next: d => this.stats = d }); }

  save() {
    const body = { ...this.f, institutionId: this.instId };
    const obs = this.editId ? this.http.put(`${API_URL}/hr/employees/${this.editId}`, body) : this.http.post(`${API_URL}/hr/employees`, body);
    obs.subscribe({ next: () => { this.showMsg('Guardado'); this.tab = 'list'; this.load(); this.loadStats(); this.resetForm(); }, error: () => this.showMsg('Error', true) });
  }

  edit(e: any) { this.editId = e.id; this.f = { ...e }; this.tab = 'new'; }
  deleteEmp(id: number) { if (!confirm('Eliminar?')) return; this.http.delete(`${API_URL}/hr/employees/${id}`).subscribe({ next: () => { this.load(); this.loadStats(); } }); }
  resetForm() { this.editId = null; this.f = { employeeNumber: '', firstName: '', lastName: '', identification: '', idType: 'CEDULA', birthDate: null, gender: '', civilStatus: '', nationality: '', province: '', city: '', position: '', department: '', hireDate: null, phone: '', mobile: '', email: '', address: '', emergencyContact: '', emergencyPhone: '' }; }
}
