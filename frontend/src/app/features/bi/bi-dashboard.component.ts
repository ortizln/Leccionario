import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../core/api.config';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-bi-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h5 class="mb-0"><i class="bi bi-graph-up me-2"></i>Business Intelligence</h5>
      <button class="btn btn-sm btn-outline-primary" (click)="refresh()"><i class="bi bi-arrow-clockwise me-1"></i>Actualizar</button>
    </div>

    <div class="row g-3 mb-4">
      <div class="col-md-2">
        <div class="card border-0 shadow-sm bg-primary text-white text-center">
          <div class="card-body py-3"><div class="fs-3 fw-bold">{{ summary.totalStudents }}</div><div class="small">Estudiantes</div></div>
        </div>
      </div>
      <div class="col-md-2">
        <div class="card border-0 shadow-sm bg-success text-white text-center">
          <div class="card-body py-3"><div class="fs-3 fw-bold">{{ summary.totalCourses }}</div><div class="small">Cursos</div></div>
        </div>
      </div>
      <div class="col-md-2">
        <div class="card border-0 shadow-sm bg-info text-white text-center">
          <div class="card-body py-3"><div class="fs-3 fw-bold">{{ summary.avgScore | number:'1.1-1' }}</div><div class="small">Promedio General</div></div>
        </div>
      </div>
      <div class="col-md-2">
        <div class="card border-0 shadow-sm bg-warning text-dark text-center">
          <div class="card-body py-3"><div class="fs-3 fw-bold">{{ summary.failingStudents }}</div><div class="small">Reprobados</div></div>
        </div>
      </div>
      <div class="col-md-2">
        <div class="card border-0 shadow-sm bg-danger text-white text-center">
          <div class="card-body py-3"><div class="fs-3 fw-bold">{{ summary.pendingReceivable }}</div><div class="small">Ctas Cobrar</div></div>
        </div>
      </div>
      <div class="col-md-2">
        <div class="card border-0 shadow-sm bg-secondary text-white text-center">
          <div class="card-body py-3"><div class="fs-3 fw-bold">{{ summary.activeLoans }}</div><div class="small">Prestamos</div></div>
        </div>
      </div>
    </div>

    <div class="row g-3">
      <div class="col-md-6">
        <div class="card border-0 shadow-sm">
          <div class="card-header bg-white"><h6 class="mb-0">Desempeno por Curso</h6></div>
          <div class="card-body p-0">
            <div class="table-responsive">
              <table class="table table-sm mb-0">
                <thead class="table-light"><tr><th>Curso</th><th>Estudiantes</th><th>Promedio</th><th>Aprobados</th><th>Reprobados</th></tr></thead>
                <tbody>
                  <tr *ngFor="let c of courseData">
                    <td>{{ c.course_name }}</td>
                    <td>{{ c.enrolled_students }}</td>
                    <td><span class="fw-semibold" [class.text-success]="c.average_score>=7" [class.text-danger]="c.average_score<7">{{ c.average_score | number:'1.1-1' }}</span></td>
                    <td class="text-success">{{ c.passing_count }}</td>
                    <td class="text-danger">{{ c.failing_count }}</td>
                  </tr>
                  <tr *ngIf="courseData.length===0"><td colspan="5" class="text-center text-muted py-3">Sin datos</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div class="col-md-6">
        <div class="card border-0 shadow-sm">
          <div class="card-header bg-white"><h6 class="mb-0">Ingresos Mensuales</h6></div>
          <div class="card-body p-0">
            <div class="table-responsive">
              <table class="table table-sm mb-0">
                <thead class="table-light"><tr><th>Mes</th><th>Facturado</th><th>Cobrado</th><th>Pendiente</th></tr></thead>
                <tbody>
                  <tr *ngFor="let f of financeData">
                    <td>{{ f.month | date:'MMM yyyy' }}</td>
                    <td>\${{ f.total_billed | number:'1.2-2' }}</td>
                    <td class="text-success">\${{ f.total_collected | number:'1.2-2' }}</td>
                    <td class="text-danger">\${{ f.total_pending | number:'1.2-2' }}</td>
                  </tr>
                  <tr *ngIf="financeData.length===0"><td colspan="4" class="text-center text-muted py-3">Sin datos</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div class="col-md-6">
        <div class="card border-0 shadow-sm">
          <div class="card-header bg-white"><h6 class="mb-0">Inventario por Categoria</h6></div>
          <div class="card-body p-0">
            <div class="table-responsive">
              <table class="table table-sm mb-0">
                <thead class="table-light"><tr><th>Categoria</th><th>Total</th><th>Disponible</th><th>Asignado</th><th>Mant.</th><th>Valor</th></tr></thead>
                <tbody>
                  <tr *ngFor="let a of assetData">
                    <td>{{ a.category_name }}</td>
                    <td>{{ a.total_assets }}</td>
                    <td class="text-success">{{ a.available }}</td>
                    <td class="text-info">{{ a.assigned }}</td>
                    <td class="text-warning">{{ a.in_maintenance }}</td>
                    <td>\${{ a.total_value | number:'1.2-2' }}</td>
                  </tr>
                  <tr *ngIf="assetData.length===0"><td colspan="6" class="text-center text-muted py-3">Sin datos</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div class="col-md-6">
        <div class="card border-0 shadow-sm">
          <div class="card-header bg-white"><h6 class="mb-0">Matriculas por Periodo</h6></div>
          <div class="card-body p-0">
            <div class="table-responsive">
              <table class="table table-sm mb-0">
                <thead class="table-light"><tr><th>Periodo</th><th>Total</th><th>Activas</th><th>Retiradas</th></tr></thead>
                <tbody>
                  <tr *ngFor="let e of enrollmentData">
                    <td>{{ e.period_name }}</td>
                    <td>{{ e.total_enrollments }}</td>
                    <td class="text-success">{{ e.active_enrollments }}</td>
                    <td class="text-danger">{{ e.withdrawn }}</td>
                  </tr>
                  <tr *ngIf="enrollmentData.length===0"><td colspan="4" class="text-center text-muted py-3">Sin datos</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div class="col-md-6">
        <div class="card border-0 shadow-sm">
          <div class="card-header bg-white"><h6 class="mb-0"><i class="bi bi-trophy me-2"></i>Ranking Docentes</h6></div>
          <div class="card-body p-0">
            <div class="table-responsive">
              <table class="table table-sm mb-0">
                <thead class="table-light"><tr><th>#</th><th>Docente</th><th>Cursos</th><th>Promedio</th></tr></thead>
                <tbody>
                  <tr *ngFor="let t of teacherRanking; let i = index">
                    <td><span class="badge" [class.bg-warning text-dark]="i===0" [class.bg-secondary]="i===1" [class.bg-info]="i===2">{{ i+1 }}</span></td>
                    <td>{{ t.full_name }}</td>
                    <td>{{ t.courses }}</td>
                    <td><span class="fw-semibold" [class.text-success]="t.avg_score>=7" [class.text-danger]="t.avg_score<7">{{ t.avg_score | number:'1.1-1' }}</span></td>
                  </tr>
                  <tr *ngIf="teacherRanking.length===0"><td colspan="4" class="text-center text-muted py-3">Sin datos</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div class="col-md-6">
        <div class="card border-0 shadow-sm">
          <div class="card-header bg-white"><h6 class="mb-0"><i class="bi bi-book me-2"></i>Biblioteca</h6></div>
          <div class="card-body">
            <div class="row text-center">
              <div class="col-4"><div class="fs-4 fw-bold text-primary">{{ libraryData.total_books || 0 }}</div><div class="small text-muted">Libros</div></div>
              <div class="col-4"><div class="fs-4 fw-bold text-success">{{ libraryData.active_loans || 0 }}</div><div class="small text-muted">Prestamos</div></div>
              <div class="col-4"><div class="fs-4 fw-bold text-warning">{{ libraryData.overdue_loans || 0 }}</div><div class="small text-muted">Vencidos</div></div>
            </div>
          </div>
        </div>
      </div>

      <div class="col-md-6">
        <div class="card border-0 shadow-sm">
          <div class="card-header bg-white"><h6 class="mb-0"><i class="bi bi-bar-chart me-2"></i>Distribucion de Calificaciones</h6></div>
          <div class="card-body p-0">
            <div class="table-responsive">
              <table class="table table-sm mb-0">
                <thead class="table-light"><tr><th>Rango</th><th>Cantidad</th></tr></thead>
                <tbody>
                  <tr *ngFor="let g of gradeDistribution">
                    <td><span class="badge bg-secondary">{{ g.range }}</span></td>
                    <td class="fw-semibold">{{ g.count }}</td>
                  </tr>
                  <tr *ngIf="gradeDistribution.length===0"><td colspan="2" class="text-center text-muted py-3">Sin datos</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div class="col-md-6">
        <div class="card border-0 shadow-sm">
          <div class="card-header bg-white"><h6 class="mb-0"><i class="bi bi-chat-dots me-2"></i>Comunicacion</h6></div>
          <div class="card-body">
            <div class="row text-center">
              <div class="col-3"><div class="fs-4 fw-bold text-info">{{ communicationStats.totalNotifications || 0 }}</div><div class="small text-muted">Notifs</div></div>
              <div class="col-3"><div class="fs-4 fw-bold text-primary">{{ communicationStats.totalMessages || 0 }}</div><div class="small text-muted">Mensajes</div></div>
              <div class="col-3"><div class="fs-4 fw-bold text-success">{{ communicationStats.totalParentComms || 0 }}</div><div class="small text-muted"> Padres</div></div>
              <div class="col-3"><div class="fs-4 fw-bold text-warning">{{ communicationStats.activeGroups || 0 }}</div><div class="small text-muted">Grupos</div></div>
            </div>
          </div>
        </div>
      </div>

      <div class="col-md-6">
        <div class="card border-0 shadow-sm">
          <div class="card-header bg-white"><h6 class="mb-0"><i class="bi bi-people me-2"></i>RRHH y Nomina</h6></div>
          <div class="card-body">
            <div class="row text-center">
              <div class="col-3"><div class="fs-4 fw-bold text-primary">{{ hrSummary.totalEmployees || 0 }}</div><div class="small text-muted">Empleados</div></div>
              <div class="col-3"><div class="fs-4 fw-bold text-success">{{ hrSummary.activeContracts || 0 }}</div><div class="small text-muted">Contratos</div></div>
              <div class="col-3"><div class="fs-4 fw-bold text-warning">{{ hrSummary.pendingVacations || 0 }}</div><div class="small text-muted">Vacaciones</div></div>
              <div class="col-3"><div class="fs-4 fw-bold text-info">{{ payrollSummary.totalPayrolls || 0 }}</div><div class="small text-muted">Nominas</div></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class BiDashboardComponent implements OnInit {
  courseData: any[] = [];
  financeData: any[] = [];
  assetData: any[] = [];
  enrollmentData: any[] = [];
  teacherRanking: any[] = [];
  libraryData: any = {};
  gradeDistribution: any[] = [];
  communicationStats: any = {};
  hrSummary: any = {};
  payrollSummary: any = {};
  kpis: any = {};
  summary = { totalStudents: 0, totalCourses: 0, avgScore: 0, failingStudents: 0, pendingReceivable: 0, activeLoans: 0 };

  constructor(private http: HttpClient, private auth: AuthService) {}

  ngOnInit() { this.load(); }

  private get instId(): number { return this.auth.institutionId() || 1; }

  load() {
    this.http.get<any>(`${API_URL}/bi/kpis?institutionId=${this.instId}`).subscribe({
      next: r => {
        this.kpis = r;
        this.summary.totalStudents = r.totalStudents || 0;
        this.summary.pendingReceivable = r.pendingReceivable || 0;
        this.summary.activeLoans = r.activeLoans || 0;
      },
      error: () => {}
    });
    this.http.get<any[]>(`${API_URL}/bi/courses?institutionId=${this.instId}`).subscribe({
      next: r => {
        this.courseData = r;
        this.summary.totalCourses = r.length;
        this.summary.avgScore = r.length ? r.reduce((s, c) => s + (c.average_score || 0), 0) / r.length : 0;
        this.summary.failingStudents = r.reduce((s, c) => s + (c.failing_count || 0), 0);
        if (!this.summary.totalStudents) this.summary.totalStudents = r.reduce((s, c) => s + (c.enrolled_students || 0), 0);
      },
      error: () => {}
    });
    this.http.get<any[]>(`${API_URL}/bi/finance?institutionId=${this.instId}`).subscribe({ next: r => this.financeData = r, error: () => {} });
    this.http.get<any[]>(`${API_URL}/bi/assets?institutionId=${this.instId}`).subscribe({ next: r => this.assetData = r, error: () => {} });
    this.http.get<any[]>(`${API_URL}/bi/enrollments?institutionId=${this.instId}`).subscribe({ next: r => this.enrollmentData = r, error: () => {} });
    this.http.get<any>(`${API_URL}/bi/library`).subscribe({ next: r => this.libraryData = r, error: () => {} });
    this.http.get<any[]>(`${API_URL}/bi/teacher-ranking?institutionId=${this.instId}`).subscribe({ next: r => this.teacherRanking = r, error: () => {} });
    this.http.get<any>(`${API_URL}/bi/grade-distribution?institutionId=${this.instId}`).subscribe({ next: r => { this.gradeDistribution = r.distribution || []; }, error: () => {} });
    this.http.get<any>(`${API_URL}/bi/communication-stats?institutionId=${this.instId}`).subscribe({ next: r => this.communicationStats = r, error: () => {} });
    this.http.get<any>(`${API_URL}/bi/hr-summary?institutionId=${this.instId}`).subscribe({ next: r => this.hrSummary = r, error: () => {} });
    this.http.get<any>(`${API_URL}/bi/payroll-summary?institutionId=${this.instId}`).subscribe({ next: r => this.payrollSummary = r, error: () => {} });
  }

  refresh() {
    this.http.post(`${API_URL}/bi/refresh`, {}).subscribe({ next: () => this.load() });
  }
}
