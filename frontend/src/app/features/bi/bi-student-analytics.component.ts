import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../core/api.config';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-bi-student-analytics',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h5 class="mb-0"><i class="bi bi-person-lines-fill me-2"></i>Analitica de Estudiantes</h5>
    </div>

    <ul class="nav nav-tabs mb-3">
      <li class="nav-item"><a class="nav-link" [class.active]="tab==='risk'" (click)="tab='risk'" role="button">En Riesgo</a></li>
      <li class="nav-item"><a class="nav-link" [class.active]="tab==='performance'" (click)="tab='performance'" role="button">Rendimiento</a></li>
      <li class="nav-item"><a class="nav-link" [class.active]="tab==='distribution'" (click)="tab='distribution'" role="button">Distribucion</a></li>
      <li class="nav-item"><a class="nav-link" [class.active]="tab==='attendance'" (click)="tab='attendance'" role="button">Asistencia</a></li>
      <li class="nav-item"><a class="nav-link" [class.active]="tab==='financial'" (click)="tab='financial'" role="button">Financiero</a></li>
      <li class="nav-item"><a class="nav-link" [class.active]="tab==='anomalies'" (click)="tab='anomalies'" role="button">Anomalias</a></li>
    </ul>

    @if (tab === 'risk') {
      <div class="card border-0 shadow-sm">
        <div class="card-header bg-white"><h6 class="mb-0"><i class="bi bi-exclamation-triangle text-danger me-2"></i>Estudiantes en Riesgo Academico</h6></div>
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table table-sm mb-0">
              <thead class="table-light">
                <tr><th>ID</th><th>Riesgo Academico</th><th>Riesgo Asistencia</th><th>Conducta</th><th>Estilo</th><th>Acciones</th></tr>
              </thead>
              <tbody>
                <tr *ngFor="let p of highRiskProfiles">
                  <td>{{ p.studentId }}</td>
                  <td>
                    <div class="progress" style="height:6px;width:80px">
                      <div class="progress-bar bg-danger" [style.width.%]="p.academicRisk*100"></div>
                    </div>
                    <small class="text-danger">{{ (p.academicRisk*100)|number:'1.0-0' }}%</small>
                  </td>
                  <td>
                    <div class="progress" style="height:6px;width:80px">
                      <div class="progress-bar bg-warning" [style.width.%]="p.attendanceRisk*100"></div>
                    </div>
                    <small class="text-warning">{{ (p.attendanceRisk*100)|number:'1.0-0' }}%</small>
                  </td>
                  <td><span class="badge" [class.bg-success]="p.behaviorScore>=0.7" [class.bg-warning]="p.behaviorScore>=0.4" [class.bg-danger]="p.behaviorScore<0.4">{{ (p.behaviorScore*100)|number:'1.0-0' }}%</span></td>
                  <td><span class="badge bg-info">{{ p.learningStyle || 'N/A' }}</span></td>
                  <td><button class="btn btn-sm btn-outline-primary" (click)="viewProfile(p)" title="Ver perfil"><i class="bi bi-eye"></i></button></td>
                </tr>
                <tr *ngIf="highRiskProfiles.length===0"><td colspan="6" class="text-center text-muted py-3">No hay estudiantes en riesgo</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    }

    @if (tab === 'performance') {
      <div class="card border-0 shadow-sm">
        <div class="card-header bg-white"><h6 class="mb-0">Rendimiento por Curso</h6></div>
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table table-sm mb-0">
              <thead class="table-light">
                <tr><th>Curso</th><th>Periodo</th><th>Estudiantes</th><th>Promedio</th><th>Aprobados</th><th>Reprobados</th><th>% Aprobacion</th></tr>
              </thead>
              <tbody>
                <tr *ngFor="let c of coursePerformance">
                  <td>{{ c.course_name }}</td>
                  <td>{{ c.period_name }}</td>
                  <td>{{ c.enrolled_students }}</td>
                  <td [class.text-success]="c.average_score>=7" [class.text-danger]="c.average_score<7">{{ c.average_score | number:'1.1-1' }}</td>
                  <td class="text-success">{{ c.passing_count }}</td>
                  <td class="text-danger">{{ c.failing_count }}</td>
                  <td>{{ (c.passing_count / c.enrolled_students * 100)|number:'1.1-1' }}%</td>
                </tr>
                <tr *ngIf="coursePerformance.length===0"><td colspan="7" class="text-center text-muted py-3">Sin datos de rendimiento</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    }

    @if (tab === 'distribution') {
      <div class="row g-3">
        <div class="col-md-6">
          <div class="card border-0 shadow-sm">
            <div class="card-header bg-white"><h6 class="mb-0">Distribucion de Notas</h6></div>
            <div class="card-body">
              <div *ngFor="let d of gradeDistribution" class="mb-2">
                <div class="d-flex justify-content-between small"><span>{{ d.range }}</span><span>{{ d.count }} estudiantes</span></div>
                <div class="progress" style="height:8px">
                  <div class="progress-bar" [class.bg-success]="d.range.includes('9') || d.range.includes('10')" [class.bg-primary]="d.range.includes('7') || d.range.includes('8')" [class.bg-warning]="d.range.includes('5') || d.range.includes('6')" [class.bg-danger]="d.range.includes('0') || d.range.includes('1') || d.range.includes('2') || d.range.includes('3') || d.range.includes('4')" [style.width.%]="d.percent"></div>
                </div>
              </div>
              <p *ngIf="gradeDistribution.length===0" class="text-muted small">Sin datos de distribucion</p>
            </div>
          </div>
        </div>
        <div class="col-md-6">
          <div class="card border-0 shadow-sm">
            <div class="card-header bg-white"><h6 class="mb-0">Estilos de Aprendizaje</h6></div>
            <div class="card-body">
              <div *ngFor="let l of learningStyles" class="d-flex justify-content-between mb-2">
                <span class="small"><i class="bi bi-palette me-2"></i>{{ l.style }}</span>
                <span class="badge bg-info">{{ l.count }}</span>
              </div>
              <p *ngIf="learningStyles.length===0" class="text-muted small">Sin datos de estilos</p>
            </div>
          </div>
        </div>
      </div>
    }

    @if (tab === 'anomalies') {
      <div class="card border-0 shadow-sm">
        <div class="card-header bg-white"><h6 class="mb-0"><i class="bi bi-bug me-2"></i>Anomalias Detectadas</h6></div>
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table table-sm mb-0">
              <thead class="table-light">
                <tr><th>Tipo</th><th>Entidad</th><th>Descripcion</th><th>Severidad</th><th>Detectado</th><th>Estado</th></tr>
              </thead>
              <tbody>
                <tr *ngFor="let a of anomalies">
                  <td><span class="badge bg-secondary">{{ a.anomalyType }}</span></td>
                  <td>{{ a.entityType }} #{{ a.entityId }}</td>
                  <td>{{ a.description }}</td>
                  <td><span class="badge" [class.bg-danger]="a.severity==='CRITICAL'||a.severity==='CRITICA'" [class.bg-warning]="a.severity==='HIGH'||a.severity==='ALTA'" [class.bg-info]="a.severity==='MEDIUM'||a.severity==='MEDIA'">{{ a.severity }}</span></td>
                  <td>{{ a.detectedAt | date:'dd/MM/yyyy HH:mm' }}</td>
                  <td><span class="badge" [class.bg-danger]="a.status==='DETECTED'||a.status==='DETECTADA'" [class.bg-success]="a.status==='RESOLVED'||a.status==='RESUELTA'" [class.bg-secondary]="a.status==='DISMISSED'||a.status==='DESCARTADA'">{{ a.status }}</span></td>
                </tr>
                <tr *ngIf="anomalies.length===0"><td colspan="6" class="text-center text-muted py-3">No hay anomalias detectadas</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    }

    @if (tab === 'attendance') {
      <div class="card border-0 shadow-sm">
        <div class="card-header bg-white"><h6 class="mb-0"><i class="bi bi-calendar-check me-2"></i>Tendencia de Asistencia (Ultimos 30 dias)</h6></div>
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table table-sm mb-0">
              <thead class="table-light">
                <tr><th>Fecha</th><th>Inasistencias</th><th>Tardanzas</th><th>Justificados</th><th>Total Registros</th><th>% Asistencia</th></tr>
              </thead>
              <tbody>
                <tr *ngFor="let a of attendanceTrend">
                  <td>{{ a.date | date:'dd/MM/yyyy' }}</td>
                  <td class="text-danger">{{ a.absences }}</td>
                  <td class="text-warning">{{ a.tardies }}</td>
                  <td class="text-success">{{ a.justified }}</td>
                  <td>{{ a.total }}</td>
                  <td>
                    <div class="d-flex align-items-center gap-2">
                      <div class="progress flex-grow-1" style="height:6px">
                        <div class="progress-bar" [class.bg-success]="getAttendanceRate(a)>=90" [class.bg-warning]="getAttendanceRate(a)>=70" [class.bg-danger]="getAttendanceRate(a)<70" [style.width.%]="getAttendanceRate(a)"></div>
                      </div>
                      <small>{{ getAttendanceRate(a) | number:'1.0-0' }}%</small>
                    </div>
                  </td>
                </tr>
                <tr *ngIf="attendanceTrend.length===0"><td colspan="6" class="text-center text-muted py-3">Sin datos de asistencia</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    }

    @if (tab === 'financial') {
      <div class="row g-3">
        <div class="col-md-4" *ngFor="let s of financialSummary">
          <div class="card border-0 shadow-sm">
            <div class="card-body text-center">
              <div class="text-muted small">Cobrado</div>
              <div class="fs-4 fw-bold text-success">\${{ s.collected | number:'1.0-0' }}</div>
              <hr class="my-2">
              <div class="text-muted small">Pendiente</div>
              <div class="fs-5 fw-bold text-warning">\${{ s.pending | number:'1.0-0' }}</div>
              <hr class="my-2">
              <div class="text-muted small">En Mora</div>
              <div class="fs-5 fw-bold text-danger">\${{ s.overdue | number:'1.0-0' }}</div>
              <hr class="my-2">
              <div class="d-flex justify-content-between small">
                <span>Pagadas: <strong class="text-success">{{ s.paid_count }}</strong></span>
                <span>Impagas: <strong class="text-danger">{{ s.unpaid_count }}</strong></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    }

    @if (selectedProfile) {
      <div class="modal d-block" tabindex="-1" style="background:rgba(0,0,0,0.5)">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header"><h6 class="modal-title">Perfil Estudiante #{{ selectedProfile.studentId }}</h6></div>
            <div class="modal-body">
              <div class="row g-3">
                <div class="col-6">
                  <div class="small text-muted">Riesgo Academico</div>
                  <div class="progress mb-1" style="height:6px"><div class="progress-bar bg-danger" [style.width.%]="selectedProfile.academicRisk*100"></div></div>
                  <small>{{ (selectedProfile.academicRisk*100)|number:'1.0-0' }}%</small>
                </div>
                <div class="col-6">
                  <div class="small text-muted">Riesgo Asistencia</div>
                  <div class="progress mb-1" style="height:6px"><div class="progress-bar bg-warning" [style.width.%]="selectedProfile.attendanceRisk*100"></div></div>
                  <small>{{ (selectedProfile.attendanceRisk*100)|number:'1.0-0' }}%</small>
                </div>
                <div class="col-12">
                  <div class="small text-muted">Fortalezas</div>
                  <p class="small">{{ selectedProfile.strengths || 'No evaluado' }}</p>
                </div>
                <div class="col-12">
                  <div class="small text-muted">Debilidades</div>
                  <p class="small">{{ selectedProfile.weaknesses || 'No evaluado' }}</p>
                </div>
                <div class="col-12">
                  <div class="small text-muted">Recomendaciones</div>
                  <p class="small">{{ selectedProfile.recommendations || 'Sin recomendaciones' }}</p>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn btn-sm btn-secondary" (click)="selectedProfile=null">Cerrar</button>
            </div>
          </div>
        </div>
      </div>
    }
  `
})
export class BiStudentAnalyticsComponent implements OnInit {
  tab = 'risk';
  highRiskProfiles: any[] = [];
  coursePerformance: any[] = [];
  gradeDistribution: any[] = [];
  learningStyles: any[] = [];
  anomalies: any[] = [];
  attendanceTrend: any[] = [];
  financialSummary: any[] = [];
  selectedProfile: any = null;

  constructor(private http: HttpClient, private auth: AuthService) {}
  ngOnInit() { this.load(); }
  private get instId(): number { return this.auth.institutionId() || 1; }

  load() {
    this.http.get<any>(`${API_URL}/ai/stats?institutionId=${this.instId}`).subscribe({
      next: (stats: any) => {
        this.gradeDistribution = (stats.gradeDistribution || []).map((d: any, i: number) => ({ ...d, percent: 0 }));
        this.learningStyles = stats.learningStyles || [];
      },
      error: () => {}
    });
    this.http.get<any[]>(`${API_URL}/ai/profiles/high-risk?institutionId=${this.instId}`).subscribe({
      next: r => this.highRiskProfiles = r,
      error: () => {}
    });
    this.http.get<any[]>(`${API_URL}/bi/courses?institutionId=${this.instId}`).subscribe({
      next: r => this.coursePerformance = r,
      error: () => {}
    });
    this.http.get<any[]>(`${API_URL}/ai/anomalies?institutionId=${this.instId}`).subscribe({
      next: r => this.anomalies = r,
      error: () => {}
    });
    this.http.get<any[]>(`${API_URL}/bi/attendance-trend?institutionId=${this.instId}`).subscribe({
      next: r => this.attendanceTrend = r,
      error: () => {}
    });
    this.http.get<any[]>(`${API_URL}/bi/financial-summary?institutionId=${this.instId}`).subscribe({
      next: r => this.financialSummary = r,
      error: () => {}
    });
  }

  viewProfile(p: any) { this.selectedProfile = p; }

  getAttendanceRate(a: any): number {
    if (!a.total || a.total === 0) return 0;
    return ((a.total - a.absences - a.tardies) / a.total) * 100;
  }
}
