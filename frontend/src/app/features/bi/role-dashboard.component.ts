import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../core/api.config';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-role-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h5 class="mb-0"><i class="bi bi-speedometer2 me-2"></i>Panel {{ roleLabel }}</h5>
      <span class="badge bg-primary">{{ roleLabel }}</span>
    </div>

    @if (role === 'RECTOR') {
      <div class="row g-3 mb-4">
        <div class="col-md-3">
          <div class="card border-0 shadow-sm bg-primary text-white text-center">
            <div class="card-body py-3"><div class="fs-3 fw-bold">{{ data.kpis?.totalStudents || 0 }}</div><div class="small">Estudiantes</div></div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card border-0 shadow-sm bg-success text-white text-center">
            <div class="card-body py-3"><div class="fs-3 fw-bold">{{ data.kpis?.totalTeachers || 0 }}</div><div class="small">Docentes</div></div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card border-0 shadow-sm bg-info text-white text-center">
            <div class="card-body py-3"><div class="fs-3 fw-bold">{{ data.totalCourses || 0 }}</div><div class="small">Cursos</div></div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card border-0 shadow-sm bg-warning text-dark text-center">
            <div class="card-body py-3"><div class="fs-3 fw-bold">{{ data.kpis?.pendingReceivable || 0 }}</div><div class="small">Pendiente Cobro</div></div>
          </div>
        </div>
      </div>
      <div class="card border-0 shadow-sm">
        <div class="card-body">
          <h6>Resumen Financiero</h6>
          <div class="row g-2">
            <div class="col-md-4"><div class="text-center p-2 bg-light rounded"><div class="fw-bold">{{ data.financialSummary?.length || 0 }}</div><div class="small text-muted">Periodos con datos</div></div></div>
            <div class="col-md-4"><div class="text-center p-2 bg-light rounded"><div class="fw-bold">{{ data.hrSummary?.totalEmployees || 0 }}</div><div class="small text-muted">Empleados</div></div></div>
            <div class="col-md-4"><div class="text-center p-2 bg-light rounded"><div class="fw-bold">{{ data.kpis?.activeLoans || 0 }}</div><div class="small text-muted">Prestamos Activos</div></div></div>
          </div>
        </div>
      </div>
    }

    @if (role === 'INSPECTOR') {
      <div class="row g-3 mb-4">
        <div class="col-md-6">
          <div class="card border-0 shadow-sm">
            <div class="card-body"><h6>Tendencia de Asistencia</h6>
              <div *ngIf="data.attendanceSummary?.length; else noAttendance">
                <div *ngFor="let a of data.attendanceSummary" class="d-flex justify-content-between border-bottom py-1">
                  <span>{{ a.date || a.period }}</span>
                  <span class="badge bg-success">{{ a.attendanceRate || '-' }}%</span>
                </div>
              </div>
              <ng-template #noAttendance><p class="text-muted">Sin datos de asistencia</p></ng-template>
            </div>
          </div>
        </div>
        <div class="col-md-6">
          <div class="card border-0 shadow-sm">
            <div class="card-body"><h6>Resumen de Conducta</h6>
              <div class="row g-2">
                <div class="col-6"><div class="text-center p-3 bg-success-subtle rounded"><div class="fs-4 fw-bold text-success">{{ data.conductaSummary?.totalMerits || 0 }}</div><div class="small">Meritos</div></div></div>
                <div class="col-6"><div class="text-center p-3 bg-danger-subtle rounded"><div class="fs-4 fw-bold text-danger">{{ data.conductaSummary?.totalDemerits || 0 }}</div><div class="small">Demeritos</div></div></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    }

    @if (role === 'COORDINADOR') {
      <div class="row g-3 mb-4">
        <div class="col-md-6">
          <div class="card border-0 shadow-sm">
            <div class="card-body"><h6>Distribucion de Notas</h6>
              <div *ngIf="data.gradeDistribution">
                <div *ngFor="let g of gradeEntries" class="d-flex justify-content-between align-items-center mb-1">
                  <span>{{ g.label }}</span>
                  <div class="progress flex-grow-1 mx-2" style="height:20px"><div class="progress-bar" [style.width.%]="g.percent">{{ g.count }}</div></div>
                  <span class="small">{{ g.percent | number:'1.0-0' }}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-6">
          <div class="card border-0 shadow-sm">
            <div class="card-body"><h6>Ranking Docentes</h6>
              <div *ngIf="data.teacherRanking?.length; else noRanking">
                <div *ngFor="let t of data.teacherRanking; let i = index" class="d-flex justify-content-between border-bottom py-1">
                  <span>{{ i + 1 }}. {{ t.teacher_name || t.name }}</span>
                  <span class="badge bg-primary">{{ t.avg_score || t.average_score || '-' }}</span>
                </div>
              </div>
              <ng-template #noRanking><p class="text-muted">Sin datos de ranking</p></ng-template>
            </div>
          </div>
        </div>
      </div>
    }

    @if (role === 'FINANCIERO') {
      <div class="row g-3 mb-4">
        <div class="col-md-4">
          <div class="card border-0 shadow-sm bg-success text-white text-center">
            <div class="card-body py-3"><div class="fs-4 fw-bold">\${{ totalCollected | number:'1.2-2' }}</div><div class="small">Total Cobrado</div></div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card border-0 shadow-sm bg-danger text-white text-center">
            <div class="card-body py-3"><div class="fs-4 fw-bold">\${{ totalPending | number:'1.2-2' }}</div><div class="small">Pendiente</div></div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card border-0 shadow-sm bg-warning text-dark text-center">
            <div class="card-body py-3"><div class="fs-4 fw-bold">{{ data.kpis?.pendingReceivable || 0 }}</div><div class="small">Ctas por Cobrar</div></div>
          </div>
        </div>
      </div>
      <div class="card border-0 shadow-sm">
        <div class="card-body"><h6>Resumen por Periodo</h6>
          <div class="table-responsive">
            <table class="table table-sm mb-0">
              <thead class="table-light"><tr><th>Periodo</th><th>Facturado</th><th>Cobrado</th><th>Pendiente</th></tr></thead>
              <tbody>
                <tr *ngFor="let f of data.financialSummary">
                  <td>{{ f.period || f.period_name || '-' }}</td>
                  <td>\${{ f.total_billed | number:'1.2-2' }}</td>
                  <td>\${{ f.total_collected | number:'1.2-2' }}</td>
                  <td>\${{ f.total_pending | number:'1.2-2' }}</td>
                </tr>
                <tr *ngIf="!data.financialSummary?.length"><td colspan="4" class="text-center text-muted">Sin datos financieros</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    }

    @if (role === 'DOCENTE') {
      <div class="card border-0 shadow-sm">
        <div class="card-body">
          <h6>Mi Panel Docente</h6>
          <p class="text-muted">Accede a leccionarios, calificaciones y asistencia desde el menu lateral.</p>
          <div class="row g-2">
            <div class="col-md-4"><a routerLink="/app/lesson-plans" class="btn btn-outline-primary w-100"><i class="bi bi-journal-text me-1"></i>Mis Leccionarios</a></div>
            <div class="col-md-4"><a routerLink="/app/my-teaching" class="btn btn-outline-success w-100"><i class="bi bi-pencil-square me-1"></i>Mis Calificaciones</a></div>
            <div class="col-md-4"><a routerLink="/app/reports" class="btn btn-outline-info w-100"><i class="bi bi-bar-chart me-1"></i>Reportes</a></div>
          </div>
        </div>
      </div>
    }
  `
})
export class RoleDashboardComponent implements OnInit {
  role = '';
  data: any = {};

  constructor(private http: HttpClient, private auth: AuthService) {}
  ngOnInit() {
    this.role = this.auth.primaryRole() || 'RECTOR';
    this.load();
  }
  private get instId(): number { return this.auth.institutionId() || 1; }

  get roleLabel(): string {
    const labels: Record<string, string> = { ROLE_RECTOR: 'Rector', ROLE_INSPECTOR: 'Inspector', ROLE_COORDINADOR: 'Coordinador', ROLE_FINANCIERO: 'Financiero', ROLE_DOCENTE: 'Docente', ROLE_ADMINISTRADOR: 'Administrador' };
    return labels[this.role] || this.role;
  }

  get gradeEntries(): any[] {
    if (!this.data.gradeDistribution?.distribution) return [];
    return this.data.gradeDistribution.distribution.map((d: any) => ({
      label: d.grade || d.range || '-',
      count: d.count || 0,
      percent: this.data.gradeDistribution.total ? (d.count / this.data.gradeDistribution.total * 100) : 0
    }));
  }

  get totalCollected(): number {
    return (this.data.financialSummary || []).reduce((s: number, f: any) => s + (f.total_collected || 0), 0);
  }

  get totalPending(): number {
    return (this.data.financialSummary || []).reduce((s: number, f: any) => s + (f.total_pending || 0), 0);
  }

  load() {
    this.http.get<any>(`${API_URL}/bi/role-dashboard?institutionId=${this.instId}&role=${this.role}`).subscribe({
      next: r => this.data = r,
      error: () => {}
    });
  }
}
