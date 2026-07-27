import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../core/api.config';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-employee-attendance',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h5 class="mb-0"><i class="bi bi-clock-history me-2"></i>Asistencia del Personal</h5>
      <button class="btn btn-sm btn-primary" (click)="showCheckInModal=true"><i class="bi bi-check-circle me-1"></i>Registrar Asistencia</button>
    </div>

    <div class="row g-2 mb-3">
      <div class="col-md-3">
        <div class="card border-0 shadow-sm bg-success text-white text-center"><div class="card-body py-3"><div class="fs-3 fw-bold">{{ stats.present || 0 }}</div><div class="small">Presentes Hoy</div></div></div>
      </div>
      <div class="col-md-3">
        <div class="card border-0 shadow-sm bg-danger text-white text-center"><div class="card-body py-3"><div class="fs-3 fw-bold">{{ stats.absent || 0 }}</div><div class="small">Ausentes</div></div></div>
      </div>
      <div class="col-md-3">
        <div class="card border-0 shadow-sm bg-warning text-dark text-center"><div class="card-body py-3"><div class="fs-3 fw-bold">{{ stats.late || 0 }}</div><div class="small">Tardanzas</div></div></div>
      </div>
      <div class="col-md-3">
        <div class="card border-0 shadow-sm bg-info text-white text-center"><div class="card-body py-3"><div class="fs-3 fw-bold">{{ stats.permission || 0 }}</div><div class="small">Permisos</div></div></div>
      </div>
    </div>

    <div class="card border-0 shadow-sm">
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-sm mb-0">
            <thead class="table-light"><tr><th>Empleado</th><th>Fecha</th><th>Entrada</th><th>Salida</th><th>Estado</th><th></th></tr></thead>
            <tbody>
              <tr *ngFor="let a of attendances">
                <td class="fw-semibold">{{ a.employee?.user?.firstName }} {{ a.employee?.user?.lastName }}</td>
                <td>{{ a.attendanceDate }}</td>
                <td>{{ a.checkInTime || '-' }}</td>
                <td>{{ a.checkOutTime || '-' }}</td>
                <td><span class="badge" [class.bg-success]="a.status==='PRESENTE'" [class.bg-danger]="a.status==='AUSENTE'" [class.bg-warning]="a.status==='TARDANZA'" [class.bg-info]="a.status==='PERMISO'">{{ a.status }}</span></td>
                <td><button *ngIf="!a.checkOutTime" class="btn btn-sm btn-outline-secondary" (click)="checkOut(a.id)"><i class="bi bi-box-arrow-right"></i></button></td>
              </tr>
              <tr *ngIf="attendances.length===0"><td colspan="6" class="text-center text-muted py-3">Sin registros hoy</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div class="modal d-block" *ngIf="showCheckInModal" tabindex="-1" style="background:rgba(0,0,0,0.5)">
      <div class="modal-dialog"><div class="modal-content">
        <div class="modal-header py-2"><h6 class="modal-title">Registrar Asistencia</h6></div>
        <div class="modal-body">
          <label class="form-label small">ID Empleado *</label>
          <input type="number" class="form-control form-control-sm" [(ngModel)]="employeeId">
        </div>
        <div class="modal-footer py-2">
          <button class="btn btn-sm btn-secondary" (click)="showCheckInModal=false">Cancelar</button>
          <button class="btn btn-sm btn-primary" (click)="checkIn()" [disabled]="!employeeId">Registrar</button>
        </div>
      </div></div>
    </div>
  `
})
export class EmployeeAttendanceComponent implements OnInit {
  attendances: any[] = [];
  stats: any = {};
  showCheckInModal = false;
  employeeId: number | null = null;

  constructor(private http: HttpClient, private auth: AuthService) {}
  ngOnInit() { this.load(); this.loadStats(); }
  private get instId(): number { return this.auth.institutionId() || 1; }

  load() {
    this.http.get<any[]>(`${API_URL}/hr/attendances?institutionId=${this.instId}`).subscribe({ next: r => this.attendances = r, error: () => {} });
  }
  loadStats() {
    this.http.get<any>(`${API_URL}/hr/attendances/stats?institutionId=${this.instId}`).subscribe({ next: r => this.stats = r, error: () => {} });
  }
  checkIn() {
    this.http.post<any>(`${API_URL}/hr/attendances/check-in/${this.employeeId}?institutionId=${this.instId}`, {}).subscribe({
      next: () => { this.showCheckInModal = false; this.employeeId = null; this.load(); this.loadStats(); },
      error: e => alert(e.error?.message || 'Error')
    });
  }
  checkOut(id: number) {
    this.http.post<any>(`${API_URL}/hr/attendances/${id}/check-out`, {}).subscribe({ next: () => { this.load(); this.loadStats(); } });
  }
}
