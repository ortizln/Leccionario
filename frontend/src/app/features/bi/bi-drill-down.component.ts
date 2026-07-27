import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../core/api.config';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-bi-drill-down',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h5 class="mb-0"><i class="bi bi-search me-2"></i>Analisis Detallado BI</h5>
    </div>

    <ul class="nav nav-tabs mb-3">
      <li class="nav-item"><a class="nav-link" [class.active]="tab==='grades'" (click)="tab='grades'; loadGrades()">Notas</a></li>
      <li class="nav-item"><a class="nav-link" [class.active]="tab==='attendance'" (click)="tab='attendance'; loadAttendance()">Asistencia</a></li>
      <li class="nav-item"><a class="nav-link" [class.active]="tab==='financial'" (click)="tab='financial'; loadFinancial()">Financiero</a></li>
      <li class="nav-item"><a class="nav-link" [class.active]="tab==='trends'" (click)="tab='trends'; loadTrends()">Tendencias</a></li>
    </ul>

    @if (tab === 'grades') {
      <div class="row g-3">
        <div class="col-md-8">
          <div class="card border-0 shadow-sm">
            <div class="card-body">
              <h6>Distribucion de Notas</h6>
              <div *ngIf="gradesData?.gradeDistribution?.distribution">
                <div *ngFor="let g of gradesData.gradeDistribution.distribution" class="d-flex align-items-center mb-2">
                  <span class="me-2" style="width:60px">{{ g.grade || g.range }}</span>
                  <div class="progress flex-grow-1" style="height:24px">
                    <div class="progress-bar bg-primary" [style.width.%]="g.count / gradesData.gradeDistribution.total * 100">
                      {{ g.count }}
                    </div>
                  </div>
                  <span class="ms-2 small">{{ (g.count / gradesData.gradeDistribution.total * 100) | number:'1.0-0' }}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card border-0 shadow-sm">
            <div class="card-body">
              <h6>Resumen</h6>
              <div class="mb-2"><strong>Total:</strong> {{ gradesData?.gradeDistribution?.total || 0 }}</div>
              <div class="mb-2"><strong>Promedio:</strong> {{ gradesData?.gradeDistribution?.average || '-' }}</div>
            </div>
          </div>
        </div>
      </div>
    }

    @if (tab === 'attendance') {
      <div class="card border-0 shadow-sm">
        <div class="card-body">
          <h6>Tendencia de Asistencia</h6>
          <div class="table-responsive">
            <table class="table table-sm">
              <thead class="table-light"><tr><th>Periodo</th><th>Presentes</th><th>Ausentes</th><th>Tardanzas</th><th>Porcentaje</th></tr></thead>
              <tbody>
                <tr *ngFor="let a of attendanceData">
                  <td>{{ a.period || a.date }}</td>
                  <td>{{ a.present_count || a.presentCount || 0 }}</td>
                  <td>{{ a.absent_count || a.absentCount || 0 }}</td>
                  <td>{{ a.late_count || a.lateCount || 0 }}</td>
                  <td><span class="badge bg-success">{{ a.attendance_rate || a.attendanceRate || '-' }}%</span></td>
                </tr>
                <tr *ngIf="!attendanceData?.length"><td colspan="5" class="text-center text-muted">Sin datos</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    }

    @if (tab === 'financial') {
      <div class="row g-3">
        <div class="col-md-8">
          <div class="card border-0 shadow-sm">
            <div class="card-body">
              <h6>Resumen Financiero</h6>
              <div class="table-responsive">
                <table class="table table-sm">
                  <thead class="table-light"><tr><th>Periodo</th><th>Facturado</th><th>Cobrado</th><th>Pendiente</th></tr></thead>
                  <tbody>
                    <tr *ngFor="let f of financialData?.financialSummary">
                      <td>{{ f.period || f.period_name }}</td>
                      <td>\${{ f.total_billed | number:'1.2-2' }}</td>
                      <td>\${{ f.total_collected | number:'1.2-2' }}</td>
                      <td>\${{ f.total_pending | number:'1.2-2' }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card border-0 shadow-sm">
            <div class="card-body">
              <h6>Nomina</h6>
              <div *ngIf="financialData?.payrollSummary">
                <div class="mb-1"><strong>Total Empleados:</strong> {{ financialData.payrollSummary.totalEmployees }}</div>
                <div class="mb-1"><strong>Masa Salarial:</strong> \${{ financialData.payrollSummary.totalPayroll | number:'1.2-2' }}</div>
                <div class="mb-1"><strong>IESS:</strong> \${{ financialData.payrollSummary.totalIess | number:'1.2-2' }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    }

    @if (tab === 'trends') {
      <div class="card border-0 shadow-sm">
        <div class="card-body">
          <h6>Tendencias Mensuales (6 meses)</h6>
          <div class="table-responsive">
            <table class="table table-sm">
              <thead class="table-light"><tr><th>Mes</th><th>Estudiantes</th><th>Asistencia</th><th>Ingresos</th></tr></thead>
              <tbody>
                <tr *ngFor="let t of trendsData?.monthlyTrend">
                  <td>{{ t.month }}</td>
                  <td>{{ t.studentCount || t.student_count || 0 }}</td>
                  <td>{{ t.attendanceRate || t.attendance_rate || '-' }}%</td>
                  <td>\${{ t.revenue || 0 | number:'1.2-2' }}</td>
                </tr>
                <tr *ngIf="!trendsData?.monthlyTrend?.length"><td colspan="4" class="text-center text-muted">Sin datos de tendencias</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    }
  `
})
export class BiDrillDownComponent implements OnInit {
  tab = 'grades';
  gradesData: any = null;
  attendanceData: any[] = [];
  financialData: any = null;
  trendsData: any = null;

  constructor(private http: HttpClient, private auth: AuthService) {}
  ngOnInit() { this.loadGrades(); }
  private get instId(): number { return this.auth.institutionId() || 1; }

  loadGrades() {
    this.http.get<any>(`${API_URL}/bi/drill-down/grades?institutionId=${this.instId}`).subscribe(r => this.gradesData = r);
  }
  loadAttendance() {
    this.http.get<any>(`${API_URL}/bi/drill-down/attendance?institutionId=${this.instId}`).subscribe(r => this.attendanceData = r.attendanceTrend || []);
  }
  loadFinancial() {
    this.http.get<any>(`${API_URL}/bi/drill-down/financial?institutionId=${this.instId}`).subscribe(r => this.financialData = r);
  }
  loadTrends() {
    this.http.get<any>(`${API_URL}/bi/trends?institutionId=${this.instId}`).subscribe(r => this.trendsData = r);
  }
}
