import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../core/api.config';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-institution-reports',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h5 class="mb-0"><i class="bi bi-building me-2"></i>Reportes Institucionales</h5>
    </div>

    <div class="row g-3 mb-4">
      <div class="col-md-3">
        <div class="card border-0 shadow-sm bg-primary text-white text-center">
          <div class="card-body py-3"><div class="fs-3 fw-bold">{{ kpis.totalStudents }}</div><div class="small">Estudiantes</div></div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card border-0 shadow-sm bg-success text-white text-center">
          <div class="card-body py-3"><div class="fs-3 fw-bold">{{ kpis.activeEnrollments }}</div><div class="small">Matriculas Activas</div></div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card border-0 shadow-sm bg-info text-white text-center">
          <div class="card-body py-3"><div class="fs-3 fw-bold">{{ kpis.totalTeachers }}</div><div class="small">Docentes</div></div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card border-0 shadow-sm bg-warning text-dark text-center">
          <div class="card-body py-3"><div class="fs-3 fw-bold">{{ kpis.attendanceRate }}%</div><div class="small">Asistencia</div></div>
        </div>
      </div>
    </div>

    <div class="row g-3 mb-4">
      <div class="col-md-3">
        <div class="card border-0 shadow-sm text-center">
          <div class="card-body py-3">
            <div class="fs-4 fw-bold text-success">\${{ kpis.totalRevenue | number:'1.0-0' }}</div>
            <div class="small text-muted">Ingresos Totales</div>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card border-0 shadow-sm text-center">
          <div class="card-body py-3">
            <div class="fs-4 fw-bold text-danger">\${{ kpis.pendingReceivable | number:'1.0-0' }}</div>
            <div class="small text-muted">Por Cobrar</div>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card border-0 shadow-sm text-center">
          <div class="card-body py-3">
            <div class="fs-4 fw-bold text-primary">{{ kpis.totalAssets }}</div>
            <div class="small text-muted">Bienes</div>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card border-0 shadow-sm text-center">
          <div class="card-body py-3">
            <div class="fs-4 fw-bold text-info">{{ kpis.activeLoans }}</div>
            <div class="small text-muted">Prestamos Libro</div>
          </div>
        </div>
      </div>
    </div>

    <div class="row g-3">
      <div class="col-md-6">
        <div class="card border-0 shadow-sm h-100">
          <div class="card-header bg-white"><h6 class="mb-0"><i class="bi bi-people me-2"></i>Distribucion por Grado</h6></div>
          <div class="card-body p-0">
            <table class="table table-sm mb-0">
              <thead class="table-light"><tr><th>Grado</th><th>Estudiantes</th><th></th></tr></thead>
              <tbody>
                <tr *ngFor="let d of distribution">
                  <td>{{ d.grade_name }}</td>
                  <td>{{ d.enrolled }}</td>
                  <td>
                    <div class="progress" style="height:6px">
                      <div class="progress-bar bg-primary" [style.width.%]="d.enrolled / maxEnrolled * 100"></div>
                    </div>
                  </td>
                </tr>
                <tr *ngIf="distribution.length===0"><td colspan="3" class="text-center text-muted py-3">Sin datos</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div class="col-md-6">
        <div class="card border-0 shadow-sm h-100">
          <div class="card-header bg-white"><h6 class="mb-0"><i class="bi bi-currency-dollar me-2"></i>Ingresos Mensuales</h6></div>
          <div class="card-body p-0">
            <table class="table table-sm mb-0">
              <thead class="table-light"><tr><th>Mes</th><th>Facturado</th><th>Cobrado</th></tr></thead>
              <tbody>
                <tr *ngFor="let t of trend">
                  <td>{{ t.month | date:'MMM yyyy' }}</td>
                  <td>\${{ t.billed | number:'1.0-0' }}</td>
                  <td class="text-success">\${{ t.collected | number:'1.0-0' }}</td>
                </tr>
                <tr *ngIf="trend.length===0"><td colspan="3" class="text-center text-muted py-3">Sin datos</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `
})
export class InstitutionReportsComponent implements OnInit {
  kpis: any = { totalStudents: 0, activeEnrollments: 0, totalTeachers: 0, attendanceRate: 0, totalRevenue: 0, pendingReceivable: 0, totalAssets: 0, activeLoans: 0 };
  distribution: any[] = [];
  trend: any[] = [];
  maxEnrolled = 1;

  constructor(private http: HttpClient, private auth: AuthService) {}
  ngOnInit() { this.load(); }
  private get instId(): number { return this.auth.institutionId() || 1; }

  load() {
    this.http.get<any>(`${API_URL}/bi/kpis?institutionId=${this.instId}`).subscribe({
      next: r => this.kpis = r,
      error: () => {}
    });
    this.http.get<any[]>(`${API_URL}/bi/student-distribution?institutionId=${this.instId}`).subscribe({
      next: r => { this.distribution = r; this.maxEnrolled = Math.max(...r.map((d: any) => d.enrolled || 1), 1); },
      error: () => {}
    });
    this.http.get<any[]>(`${API_URL}/bi/trend?institutionId=${this.instId}`).subscribe({
      next: r => this.trend = r,
      error: () => {}
    });
  }
}
