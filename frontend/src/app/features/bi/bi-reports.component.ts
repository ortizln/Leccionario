import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../core/api.config';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-bi-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h5 class="mb-0"><i class="bi bi-file-earmark-bar-graph me-2"></i>Reportes BI</h5>
      <button class="btn btn-sm btn-outline-primary" (click)="refresh()"><i class="bi bi-arrow-clockwise me-1"></i>Actualizar Vistas</button>
    </div>

    <ul class="nav nav-tabs mb-3">
      <li class="nav-item"><a class="nav-link" [class.active]="tab==='academic'" (click)="tab='academic'" role="button">Academico</a></li>
      <li class="nav-item"><a class="nav-link" [class.active]="tab==='financial'" (click)="tab='financial'" role="button">Financiero</a></li>
      <li class="nav-item"><a class="nav-link" [class.active]="tab==='attendance'" (click)="tab='attendance'" role="button">Asistencia</a></li>
      <li class="nav-item"><a class="nav-link" [class.active]="tab==='enrollment'" (click)="tab='enrollment'" role="button">Matriculas</a></li>
      <li class="nav-item"><a class="nav-link" [class.active]="tab==='hr'" (click)="tab='hr'; loadHR()" role="button">RRHH</a></li>
      <li class="nav-item"><a class="nav-link" [class.active]="tab==='library'" (click)="tab='library'; loadLibrary()" role="button">Biblioteca</a></li>
      <li class="nav-item"><a class="nav-link" [class.active]="tab==='conducta'" (click)="tab='conducta'; loadConducta()" role="button">Conducta</a></li>
    </ul>

    @if (tab === 'academic') {
      <div class="card border-0 shadow-sm">
        <div class="card-header bg-white d-flex justify-content-between">
          <h6 class="mb-0">Rendimiento Academico por Curso</h6>
          <div>
            <button class="btn btn-sm btn-outline-danger me-1" (click)="exportPDF('academic')"><i class="bi bi-file-pdf me-1"></i>PDF</button>
            <button class="btn btn-sm btn-outline-success" (click)="exportCSV('courses')"><i class="bi bi-download me-1"></i>CSV</button>
          </div>
        </div>
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table table-sm mb-0">
              <thead class="table-light">
                <tr><th>Curso</th><th>Periodo</th><th>Estudiantes</th><th>Promedio</th><th>Aprobados</th><th>Reprobados</th><th>% Aprobacion</th></tr>
              </thead>
              <tbody>
                <tr *ngFor="let r of academicData">
                  <td>{{ r.course_name }}</td>
                  <td>{{ r.period_name }}</td>
                  <td>{{ r.enrolled_students }}</td>
                  <td [class.text-success]="r.average_score>=7" [class.text-danger]="r.average_score<7">{{ r.average_score | number:'1.1-1' }}</td>
                  <td class="text-success">{{ r.passing_count }}</td>
                  <td class="text-danger">{{ r.failing_count }}</td>
                  <td>{{ getPassRate(r) | number:'1.1-1' }}%</td>
                </tr>
                <tr *ngIf="academicData.length===0"><td colspan="7" class="text-center text-muted py-3">Sin datos</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div class="row g-3 mt-3">
        <div class="col-md-4">
          <div class="card border-0 shadow-sm bg-success text-white text-center">
            <div class="card-body py-3">
              <div class="fs-3 fw-bold">{{ getOverallPassRate() | number:'1.1-1' }}%</div>
              <div class="small">Tasa Aprobacion General</div>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card border-0 shadow-sm bg-primary text-white text-center">
            <div class="card-body py-3">
              <div class="fs-3 fw-bold">{{ getOverallAvg() | number:'1.1-1' }}</div>
              <div class="small">Promedio General</div>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card border-0 shadow-sm bg-warning text-dark text-center">
            <div class="card-body py-3">
              <div class="fs-3 fw-bold">{{ getTotalFailing() }}</div>
              <div class="small">Total Reprobados</div>
            </div>
          </div>
        </div>
      </div>
    }

    @if (tab === 'financial') {
      <div class="card border-0 shadow-sm">
        <div class="card-header bg-white d-flex justify-content-between">
          <h6 class="mb-0">Ingresos y Cobros</h6>
          <div>
            <button class="btn btn-sm btn-outline-danger me-1" (click)="exportPDF('financial')"><i class="bi bi-file-pdf me-1"></i>PDF</button>
            <button class="btn btn-sm btn-outline-success" (click)="exportCSV('finance')"><i class="bi bi-download me-1"></i>CSV</button>
          </div>
        </div>
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table table-sm mb-0">
              <thead class="table-light">
                <tr><th>Mes</th><th>Facturas</th><th>Facturado</th><th>Cobrado</th><th>Pendiente</th><th>% Cobertura</th></tr>
              </thead>
              <tbody>
                <tr *ngFor="let f of financialData">
                  <td>{{ f.month | date:'MMM yyyy' }}</td>
                  <td>{{ f.total_invoices }}</td>
                  <td>\${{ f.total_billed | number:'1.2-2' }}</td>
                  <td class="text-success">\${{ f.total_collected | number:'1.2-2' }}</td>
                  <td class="text-danger">\${{ f.total_pending | number:'1.2-2' }}</td>
                  <td>{{ getCollectionRate(f) | number:'1.1-1' }}%</td>
                </tr>
                <tr *ngIf="financialData.length===0"><td colspan="6" class="text-center text-muted py-3">Sin datos</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div class="row g-3 mt-3">
        <div class="col-md-3">
          <div class="card border-0 shadow-sm bg-primary text-white text-center">
            <div class="card-body py-3"><div class="fs-4 fw-bold">\${{ getTotalBilled() | number:'1.2-2' }}</div><div class="small">Total Facturado</div></div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card border-0 shadow-sm bg-success text-white text-center">
            <div class="card-body py-3"><div class="fs-4 fw-bold">\${{ getTotalCollected() | number:'1.2-2' }}</div><div class="small">Total Cobrado</div></div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card border-0 shadow-sm bg-danger text-white text-center">
            <div class="card-body py-3"><div class="fs-4 fw-bold">\${{ getTotalPending() | number:'1.2-2' }}</div><div class="small">Total Pendiente</div></div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card border-0 shadow-sm bg-info text-white text-center">
            <div class="card-body py-3"><div class="fs-4 fw-bold">{{ getOverallCollectionRate() | number:'1.1-1' }}%</div><div class="small">Tasa Cobertura</div></div>
          </div>
        </div>
      </div>
    }

    @if (tab === 'attendance') {
      <div class="card border-0 shadow-sm">
        <div class="card-header bg-white"><h6 class="mb-0">Reporte de Asistencia</h6></div>
        <div class="card-body">
          <p class="text-muted">Reporte consolidado de asistencia por curso. Incluye inasistencias, tardanzas y justificaciones.</p>
          <div class="row g-3">
            <div class="col-md-4">
              <div class="card border-0 shadow-sm bg-danger text-white text-center">
                <div class="card-body py-3"><div class="fs-3 fw-bold">{{ attendanceStats.absences }}</div><div class="small">Inasistencias</div></div>
              </div>
            </div>
            <div class="col-md-4">
              <div class="card border-0 shadow-sm bg-warning text-dark text-center">
                <div class="card-body py-3"><div class="fs-3 fw-bold">{{ attendanceStats.tardies }}</div><div class="small">Tardanzas</div></div>
              </div>
            </div>
            <div class="col-md-4">
              <div class="card border-0 shadow-sm bg-success text-white text-center">
                <div class="card-body py-3"><div class="fs-3 fw-bold">{{ attendanceStats.justified }}</div><div class="small">Justificados</div></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    }

    @if (tab === 'enrollment') {
      <div class="card border-0 shadow-sm">
        <div class="card-header bg-white d-flex justify-content-between">
          <h6 class="mb-0">Matriculas por Periodo</h6>
          <div>
            <button class="btn btn-sm btn-outline-danger me-1" (click)="exportPDF('enrollment')"><i class="bi bi-file-pdf me-1"></i>PDF</button>
            <button class="btn btn-sm btn-outline-success" (click)="exportCSV('enrollments')"><i class="bi bi-download me-1"></i>CSV</button>
          </div>
        </div>
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table table-sm mb-0">
              <thead class="table-light">
                <tr><th>Periodo</th><th>Total</th><th>Activas</th><th>Retiradas</th><th>% Retencion</th></tr>
              </thead>
              <tbody>
                <tr *ngFor="let e of enrollmentData">
                  <td>{{ e.period_name }}</td>
                  <td>{{ e.total_enrollments }}</td>
                  <td class="text-success">{{ e.active_enrollments }}</td>
                  <td class="text-danger">{{ e.withdrawn }}</td>
                  <td>{{ getRetentionRate(e) | number:'1.1-1' }}%</td>
                </tr>
                <tr *ngIf="enrollmentData.length===0"><td colspan="5" class="text-center text-muted py-3">Sin datos</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    }

    @if (tab === 'hr') {
      <div class="d-flex justify-content-end mb-3">
        <button class="btn btn-sm btn-outline-danger" (click)="exportPDF('hr')"><i class="bi bi-file-pdf me-1"></i>Exportar PDF</button>
      </div>
      <div class="row g-3">
        <div class="col-md-3">
          <div class="card border-0 shadow-sm bg-primary text-white text-center">
            <div class="card-body py-3"><div class="fs-3 fw-bold">{{ hrData.totalEmployees || 0 }}</div><div class="small">Empleados</div></div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card border-0 shadow-sm bg-success text-white text-center">
            <div class="card-body py-3"><div class="fs-3 fw-bold">{{ hrData.activeContracts || 0 }}</div><div class="small">Contratos Activos</div></div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card border-0 shadow-sm bg-warning text-dark text-center">
            <div class="card-body py-3"><div class="fs-3 fw-bold">{{ hrData.pendingVacations || 0 }}</div><div class="small">Vacaciones Pend.</div></div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card border-0 shadow-sm bg-info text-white text-center">
            <div class="card-body py-3"><div class="fs-3 fw-bold">{{ hrData.activeTrainings || 0 }}</div><div class="small">Capacitaciones</div></div>
          </div>
        </div>
      </div>
    }

    @if (tab === 'library') {
      <div class="d-flex justify-content-end mb-3">
        <button class="btn btn-sm btn-outline-danger" (click)="exportPDF('library')"><i class="bi bi-file-pdf me-1"></i>Exportar PDF</button>
      </div>
      <div class="row g-3">
        <div class="col-md-3">
          <div class="card border-0 shadow-sm bg-primary text-white text-center">
            <div class="card-body py-3"><div class="fs-3 fw-bold">{{ libData.totalBooks || 0 }}</div><div class="small">Libros</div></div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card border-0 shadow-sm bg-info text-white text-center">
            <div class="card-body py-3"><div class="fs-3 fw-bold">{{ libData.totalCopies || 0 }}</div><div class="small">Ejemplares</div></div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card border-0 shadow-sm bg-success text-white text-center">
            <div class="card-body py-3"><div class="fs-3 fw-bold">{{ libData.activeLoans || 0 }}</div><div class="small">Prestamos</div></div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card border-0 shadow-sm bg-danger text-white text-center">
            <div class="card-body py-3"><div class="fs-3 fw-bold">{{ libData.overdueLoans || 0 }}</div><div class="small">Vencidos</div></div>
          </div>
        </div>
        <div class="col-md-6">
          <div class="card border-0 shadow-sm">
            <div class="card-header bg-white"><h6 class="mb-0">Disponibilidad</h6></div>
            <div class="card-body">
              <div class="d-flex justify-content-between mb-2"><span class="small">Ejemplares disponibles</span><span class="fw-semibold">{{ libData.availableCopies || 0 }}</span></div>
              <div class="progress mb-3" style="height:8px">
                <div class="progress-bar bg-success" [style.width.%]="getAvailabilityRate()"></div>
              </div>
              <div class="d-flex justify-content-between mb-2"><span class="small">Tasa de prestamo</span><span class="fw-semibold">{{ getLoanRate() | number:'1.1-1' }}%</span></div>
              <div class="progress" style="height:8px">
                <div class="progress-bar bg-info" [style.width.%]="getLoanRate()"></div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-6">
          <div class="card border-0 shadow-sm">
            <div class="card-header bg-white"><h6 class="mb-0">Reservas</h6></div>
            <div class="card-body text-center">
              <div class="fs-1 fw-bold text-warning">{{ libData.pendingReservations || 0 }}</div>
              <div class="text-muted">Reservas pendientes</div>
            </div>
          </div>
        </div>
      </div>
    }

    @if (tab === 'conducta') {
      <div class="row g-3">
        <div class="col-md-3">
          <div class="card border-0 shadow-sm bg-success text-white text-center">
            <div class="card-body py-3"><div class="fs-3 fw-bold">{{ conducta.merits || 0 }}</div><div class="small">Meritos</div></div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card border-0 shadow-sm bg-danger text-white text-center">
            <div class="card-body py-3"><div class="fs-3 fw-bold">{{ conducta.demerits || 0 }}</div><div class="small">Demeritos</div></div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card border-0 shadow-sm bg-info text-white text-center">
            <div class="card-body py-3"><div class="fs-3 fw-bold">{{ conducta.totalStudents || 0 }}</div><div class="small">Estudiantes</div></div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card border-0 shadow-sm bg-warning text-dark text-center">
            <div class="card-body py-3"><div class="fs-3 fw-bold">{{ conducta.totalSanctions || 0 }}</div><div class="small">Sanciones</div></div>
          </div>
        </div>
      </div>
    }

    <div class="modal d-block" *ngIf="showExportModal" tabindex="-1" style="background:rgba(0,0,0,0.5)">
      <div class="modal-dialog modal-sm">
        <div class="modal-content">
          <div class="modal-header"><h6 class="modal-title">Exportar Datos</h6></div>
          <div class="modal-body">
            <p class="small text-muted">Descargando reporte...</p>
            <div class="progress"><div class="progress-bar progress-bar-striped progress-bar-animated" style="width:100%"></div></div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class BiReportsComponent implements OnInit {
  tab = 'academic';
  academicData: any[] = [];
  financialData: any[] = [];
  enrollmentData: any[] = [];
  attendanceStats = { absences: 0, tardies: 0, justified: 0 };
  hrData: any = {};
  libData: any = {};
  conducta: any = {};
  showExportModal = false;

  constructor(private http: HttpClient, private auth: AuthService) {}
  ngOnInit() { this.load(); }

  private get instId(): number { return this.auth.institutionId() || 1; }

  load() {
    this.http.get<any[]>(`${API_URL}/bi/courses?institutionId=${this.instId}`).subscribe({ next: r => this.academicData = r, error: () => {} });
    this.http.get<any[]>(`${API_URL}/bi/finance?institutionId=${this.instId}`).subscribe({ next: r => this.financialData = r, error: () => {} });
    this.http.get<any[]>(`${API_URL}/bi/enrollments?institutionId=${this.instId}`).subscribe({ next: r => this.enrollmentData = r, error: () => {} });
  }

  loadHR() {
    this.http.get<any[]>(`${API_URL}/hr/employees/institution/${this.instId}`).subscribe({ next: r => this.hrData.totalEmployees = r.length, error: () => {} });
    this.http.get<any[]>(`${API_URL}/hr/contracts/active`).subscribe({ next: r => this.hrData.activeContracts = r.length, error: () => {} });
    this.http.get<any[]>(`${API_URL}/hr/vacations/requests/pending`).subscribe({ next: r => this.hrData.pendingVacations = r.length, error: () => {} });
    this.http.get<any[]>(`${API_URL}/hr/training/courses/institution/${this.instId}`).subscribe({ next: r => this.hrData.activeTrainings = r.length, error: () => {} });
  }

  loadLibrary() {
    this.http.get<any>(`${API_URL}/library/stats?institutionId=${this.instId}`).subscribe({ next: r => this.libData = r, error: () => {} });
  }

  loadConducta() {
    this.http.get<any>(`${API_URL}/academic/merits?institutionId=${this.instId}`).subscribe({ next: r => this.conducta.merits = Array.isArray(r) ? r.length : 0, error: () => { this.conducta.merits = 0; } });
    this.http.get<any[]>(`${API_URL}/academic/demerits?institutionId=${this.instId}`).subscribe({ next: r => this.conducta.demerits = r.length, error: () => {} });
    this.http.get<any>(`${API_URL}/academic/students?institutionId=${this.instId}`).subscribe({ next: r => this.conducta.totalStudents = Array.isArray(r) ? r.length : 0, error: () => { this.conducta.totalStudents = 0; } });
  }

  refresh() { this.http.post(`${API_URL}/bi/refresh`, {}).subscribe({ next: () => this.load() }); }

  getPassRate(r: any) { return r.enrolled_students ? (r.passing_count / r.enrolled_students * 100) : 0; }
  getOverallAvg() { return this.academicData.length ? this.academicData.reduce((s, r) => s + (r.average_score || 0), 0) / this.academicData.length : 0; }
  getOverallPassRate() { const total = this.academicData.reduce((s, r) => s + r.enrolled_students, 0); const pass = this.academicData.reduce((s, r) => s + r.passing_count, 0); return total ? (pass / total * 100) : 0; }
  getTotalFailing() { return this.academicData.reduce((s, r) => s + (r.failing_count || 0), 0); }
  getCollectionRate(f: any) { return f.total_billed ? (f.total_collected / f.total_billed * 100) : 0; }
  getTotalBilled() { return this.financialData.reduce((s, f) => s + (f.total_billed || 0), 0); }
  getTotalCollected() { return this.financialData.reduce((s, f) => s + (f.total_collected || 0), 0); }
  getTotalPending() { return this.financialData.reduce((s, f) => s + (f.total_pending || 0), 0); }
  getOverallCollectionRate() { const billed = this.getTotalBilled(); const collected = this.getTotalCollected(); return billed ? (collected / billed * 100) : 0; }
  getRetentionRate(e: any) { return e.total_enrollments ? (e.active_enrollments / e.total_enrollments * 100) : 0; }
  getAvailabilityRate() { return this.libData.totalCopies ? ((this.libData.availableCopies || 0) / this.libData.totalCopies * 100) : 0; }
  getLoanRate() { return this.libData.totalCopies ? ((this.libData.activeLoans || 0) / this.libData.totalCopies * 100) : 0; }

  exportCSV(type: string) {
    this.showExportModal = true;
    window.open(`${API_URL}/bi/export/${type}?institutionId=${this.instId}`, '_blank');
    setTimeout(() => this.showExportModal = false, 1000);
  }

  exportPDF(type: string) {
    this.showExportModal = true;
    window.open(`${API_URL}/bi/pdf/${type}?institutionId=${this.instId}`, '_blank');
    setTimeout(() => this.showExportModal = false, 1000);
  }
}
