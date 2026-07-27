import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../core/api.config';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-staff-permissions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h5 class="mb-0"><i class="bi bi-person-check me-2"></i>Permisos del Personal</h5>
      <button class="btn btn-sm btn-primary" (click)="showCreateModal=true"><i class="bi bi-plus-circle me-1"></i>Nuevo Permiso</button>
    </div>

    <div class="row g-3 mb-4">
      <div class="col-md-3">
        <div class="card border-0 shadow-sm bg-primary text-white text-center">
          <div class="card-body py-3"><div class="fs-3 fw-bold">{{ total }}</div><div class="small">Total</div></div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card border-0 shadow-sm bg-warning text-dark text-center">
          <div class="card-body py-3"><div class="fs-3 fw-bold">{{ pendingCount }}</div><div class="small">Pendientes</div></div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card border-0 shadow-sm bg-success text-white text-center">
          <div class="card-body py-3"><div class="fs-3 fw-bold">{{ approved }}</div><div class="small">Aprobados</div></div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card border-0 shadow-sm bg-danger text-white text-center">
          <div class="card-body py-3"><div class="fs-3 fw-bold">{{ rejected }}</div><div class="small">Rechazados</div></div>
        </div>
      </div>
    </div>

    <div class="card border-0 shadow-sm">
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-sm mb-0">
            <thead class="table-light">
              <tr><th>Empleado</th><th>Tipo</th><th>Inicio</th><th>Fin</th><th>Dias</th><th>Razon</th><th>Estado</th><th></th></tr>
            </thead>
            <tbody>
              <tr *ngFor="let p of permissions">
                <td>{{ p.employeeId }}</td>
                <td><span class="badge bg-info">{{ p.permissionType }}</span></td>
                <td>{{ p.startDate | date:'dd/MM/yyyy' }}</td>
                <td>{{ p.endDate | date:'dd/MM/yyyy' }}</td>
                <td>{{ p.daysRequested }}</td>
                <td>{{ p.reason }}</td>
                <td><span class="badge" [class.bg-warning]="p.status==='PENDIENTE'" [class.bg-success]="p.status==='APROBADO'" [class.bg-danger]="p.status==='RECHAZADO'">{{ p.status }}</span></td>
                <td>
                  <button class="btn btn-sm btn-outline-success" *ngIf="p.status==='PENDIENTE'" (click)="approve(p.id)"><i class="bi bi-check"></i></button>
                  <button class="btn btn-sm btn-outline-danger" *ngIf="p.status==='PENDIENTE'" (click)="reject(p.id)"><i class="bi bi-x"></i></button>
                </td>
              </tr>
              <tr *ngIf="permissions.length===0"><td colspan="8" class="text-center text-muted py-3">Sin permisos</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div class="modal d-block" *ngIf="showCreateModal" tabindex="-1" style="background:rgba(0,0,0,0.5)">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header"><h6 class="modal-title">Nuevo Permiso</h6></div>
          <div class="modal-body">
            <div class="row g-3">
              <div class="col-md-6"><label class="form-label small">Empleado ID *</label><input type="number" class="form-control form-control-sm" [(ngModel)]="newPerm.employeeId"></div>
              <div class="col-md-6"><label class="form-label small">Tipo *</label>
                <select class="form-select form-select-sm" [(ngModel)]="newPerm.permissionType">
                  <option value="PERSONAL">Personal</option><option value="MEDICO">Medico</option><option value="ACADEMICO">Academico</option><option value="OTRO">Otro</option>
                </select>
              </div>
              <div class="col-md-6"><label class="form-label small">Inicio *</label><input type="date" class="form-control form-control-sm" [(ngModel)]="newPerm.startDate"></div>
              <div class="col-md-6"><label class="form-label small">Fin *</label><input type="date" class="form-control form-control-sm" [(ngModel)]="newPerm.endDate"></div>
              <div class="col-12"><label class="form-label small">Razon</label><textarea class="form-control form-control-sm" [(ngModel)]="newPerm.reason" rows="2"></textarea></div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-sm btn-secondary" (click)="showCreateModal=false">Cancelar</button>
            <button class="btn btn-sm btn-primary" (click)="create()">Crear</button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class StaffPermissionsComponent implements OnInit {
  permissions: any[] = [];
  total = 0;
  pendingCount = 0;
  approved = 0;
  rejected = 0;
  showCreateModal = false;
  newPerm: any = { employeeId: null, permissionType: 'PERSONAL', startDate: '', endDate: '', reason: '' };

  constructor(private http: HttpClient, private auth: AuthService) {}

  ngOnInit() { this.load(); }

  load() {
    this.http.get<any[]>(`${API_URL}/hr/permissions/pending`).subscribe({
      next: r => {
        this.permissions = r;
        this.pendingCount = r.length;
      },
      error: () => {}
    });
  }

  approve(id: number) {
    this.http.post<any>(`${API_URL}/hr/permissions/${id}/approve`, {}).subscribe({ next: () => this.load() });
  }

  reject(id: number) {
    this.http.post<any>(`${API_URL}/hr/permissions/${id}/reject`, {}).subscribe({ next: () => this.load() });
  }

  create() {
    this.http.post<any>(`${API_URL}/hr/permissions`, this.newPerm).subscribe({
      next: () => { this.showCreateModal = false; this.load(); },
      error: e => alert(e.error?.message || 'Error')
    });
  }
}
