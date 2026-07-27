import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../core/api.config';
import { AuthService } from '../../core/auth.service';

interface GradeScale {
  id?: number;
  name: string;
  scaleType: string;
  minValue: number;
  maxValue: number;
  passValue: number;
  isDefault: boolean;
  active: boolean;
}

interface EvaluationType {
  id?: number;
  name: string;
  code: string;
  description: string;
  weightPct: number;
  active: boolean;
}

interface Course { id: number; name: string; }
interface Subject { id: number; name: string; }
interface AcademicPeriod { id: number; name: string; }

@Component({
  selector: 'app-grading-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h4 class="mb-0 fw-bold">Calificaciones</h4>
    </div>

    <ul class="nav nav-tabs nav-tabs-sm mb-3">
      <li><a class="nav-link" [class.active]="tab==='dashboard'" (click)="tab='dashboard'; loadDashboard()">Dashboard</a></li>
      <li><a class="nav-link" [class.active]="tab==='scales'" (click)="tab='scales'">Escalas</a></li>
      <li><a class="nav-link" [class.active]="tab==='types'" (click)="tab='types'">Tipos de Evaluacion</a></li>
      <li><a class="nav-link" [class.active]="tab==='grid'" (click)="tab='grid'; loadGrid()">Grilla de Calificaciones</a></li>
    </ul>

    <!-- Dashboard -->
    <div *ngIf="tab==='dashboard'">
      <div class="row g-2 mb-3">
        <div class="col-md-3">
          <label class="form-label form-label-sm">Periodo</label>
          <select class="form-select form-select-sm" [(ngModel)]="dashboardPeriodId" (change)="loadDashboard()">
            <option [ngValue]="null">Seleccionar periodo...</option>
            <option *ngFor="let p of periods" [ngValue]="p.id">{{p.name}}</option>
          </select>
        </div>
      </div>

      <div *ngIf="dashboard">
        <!-- KPI Cards -->
        <div class="row g-2 mb-3">
          <div class="col-md-3">
            <div class="card border-0 shadow-sm">
              <div class="card-body text-center">
                <div class="text-muted small">Estudiantes</div>
                <div class="fs-4 fw-bold" style="color:#3B4436">{{dashboard.totalStudents}}</div>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="card border-0 shadow-sm">
              <div class="card-body text-center">
                <div class="text-muted small">Promedio General</div>
                <div class="fs-4 fw-bold" style="color:#3B4436">{{dashboard.overallAverage ?? '-'}}</div>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="card border-0 shadow-sm">
              <div class="card-body text-center">
                <div class="text-muted small">Aprobados</div>
                <div class="fs-4 fw-bold text-success">{{dashboard.approvedCount}}</div>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="card border-0 shadow-sm">
              <div class="card-body text-center">
                <div class="text-muted small">Reprobados</div>
                <div class="fs-4 fw-bold text-danger">{{dashboard.failedCount}}</div>
              </div>
            </div>
          </div>
        </div>

        <div class="row g-2 mb-3">
          <div class="col-md-3">
            <div class="card border-0 shadow-sm">
              <div class="card-body text-center">
                <div class="text-muted small">Tasa de Aprobacion</div>
                <div class="fs-4 fw-bold" style="color:#606C56">{{dashboard.approvalRate}}%</div>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="card border-0 shadow-sm">
              <div class="card-body text-center">
                <div class="text-muted small">Evaluaciones</div>
                <div class="fs-4 fw-bold" style="color:#3B4436">{{dashboard.totalEvaluations}}</div>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="card border-0 shadow-sm">
              <div class="card-body text-center">
                <div class="text-muted small">Calificaciones</div>
                <div class="fs-4 fw-bold" style="color:#3B4436">{{dashboard.totalGrades}}</div>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="card border-0 shadow-sm">
              <div class="card-body text-center">
                <div class="text-muted small">Pendientes</div>
                <div class="fs-4 fw-bold text-warning">{{dashboard.pendingCount}}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Charts row -->
        <div class="row g-2 mb-3">
          <!-- Distribution Chart -->
          <div class="col-md-7">
            <div class="card border-0 shadow-sm">
              <div class="card-header bg-white py-2 fw-semibold small">Distribucion de Notas</div>
              <div class="card-body">
                <div *ngFor="let bucket of dashboard.distribution" class="d-flex align-items-center mb-2">
                  <span class="small me-2" style="width:60px;text-align:right">{{bucket.range}}</span>
                  <div class="flex-grow-1 bg-light rounded" style="height:20px">
                    <div class="rounded" style="height:100%;transition:width 0.3s"
                         [style.width]="getBarWidth(bucket.count) + '%'"
                         [style.backgroundColor]="getBarColor(bucket.range)"></div>
                  </div>
                  <span class="small ms-2 fw-bold" style="width:30px">{{bucket.count}}</span>
                </div>
                <div *ngIf="dashboard.distribution.length===0" class="text-muted small text-center">Sin datos</div>
              </div>
            </div>
          </div>

          <!-- Top Students -->
          <div class="col-md-5">
            <div class="card border-0 shadow-sm">
              <div class="card-header bg-white py-2 fw-semibold small">Mejores Estudiantes</div>
              <div class="card-body p-0">
                <table class="table table-xs mb-0">
                  <tbody>
                    <tr *ngFor="let s of dashboard.topStudents; let i = index">
                      <td class="ps-2">
                        <span class="badge rounded-pill" [class.text-bg-warning]="i===0" [class.text-bg-secondary]="i>0">{{i+1}}</span>
                      </td>
                      <td>{{s.studentName}}</td>
                      <td class="text-muted small">{{s.courseName}}</td>
                      <td class="fw-bold">{{s.average}}</td>
                    </tr>
                    <tr *ngIf="dashboard.topStudents.length===0"><td colspan="4" class="text-muted small text-center">Sin datos</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <!-- Bottom Students -->
        <div class="row g-2 mb-3" *ngIf="dashboard.bottomStudents.length > 0 && dashboard.bottomStudents[0].studentId !== dashboard.topStudents[dashboard.topStudents.length-1]?.studentId">
          <div class="col-md-5 offset-md-7">
            <div class="card border-0 shadow-sm">
              <div class="card-header bg-white py-2 fw-semibold small">Estudiantes con Mayor Dificultad</div>
              <div class="card-body p-0">
                <table class="table table-xs mb-0">
                  <tbody>
                    <tr *ngFor="let s of dashboard.bottomStudents">
                      <td class="ps-2">{{s.studentName}}</td>
                      <td class="text-muted small">{{s.courseName}}</td>
                      <td class="fw-bold text-danger">{{s.average}}</td>
                      <td class="small">{{s.approvedSubjects}}/{{s.totalSubjects}} materias</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <!-- Per-course stats -->
        <div *ngIf="dashboard.courseStats.length > 0" class="card border-0 shadow-sm">
          <div class="card-header bg-white py-2 fw-semibold small">Rendimiento por Curso</div>
          <div class="card-body p-0">
            <table class="table table-xs mb-0">
              <thead>
                <tr><th>Curso</th><th>Estudiantes</th><th>Promedio</th><th>Aprobados</th><th>Reprobados</th><th>Tasa Aprob.</th></tr>
              </thead>
              <tbody>
                <tr *ngFor="let cs of dashboard.courseStats">
                  <td>{{cs.courseName}}</td>
                  <td>{{cs.studentCount}}</td>
                  <td><strong>{{cs.average ?? '-'}}</strong></td>
                  <td class="text-success">{{cs.approved}}</td>
                  <td class="text-danger">{{cs.failed}}</td>
                  <td>{{cs.studentCount > 0 ? ((cs.approved / (cs.approved + cs.failed)) * 100 | number:'1.0-0') : 0}}%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div *ngIf="!dashboard && !loadingDashboard" class="text-center text-muted py-5">Seleccione un periodo para ver el dashboard</div>
      <div *ngIf="loadingDashboard" class="text-center py-5">
        <div class="spinner-border spinner-border-sm text-secondary"></div>
      </div>
    </div>

    <!-- Escalas -->
    <div *ngIf="tab==='scales'">
      <div class="d-flex justify-content-end mb-2">
        <button class="btn btn-sm btn-primary" (click)="showScaleForm=true; resetScaleForm()">+ Nueva Escala</button>
      </div>

      <div *ngIf="showScaleForm" class="card mb-3">
        <div class="card-body">
          <div class="row g-2">
            <div class="col-md-3">
              <label class="form-label form-label-sm">Nombre</label>
              <input class="form-control form-control-sm" [(ngModel)]="scaleForm.name" placeholder="Ej: Escala Ecuatoriana">
            </div>
            <div class="col-md-2">
              <label class="form-label form-label-sm">Tipo</label>
              <select class="form-select form-select-sm" [(ngModel)]="scaleForm.scaleType">
                <option value="NUMERIC_10">Numerica 0-10</option>
                <option value="NUMERIC_100">Numerica 0-100</option>
                <option value="LETTER">Letras (A-F)</option>
                <option value="COMPETENCY">Por Competencias</option>
              </select>
            </div>
            <div class="col-md-1">
              <label class="form-label form-label-sm">Min</label>
              <input type="number" class="form-control form-control-sm" [(ngModel)]="scaleForm.minValue">
            </div>
            <div class="col-md-1">
              <label class="form-label form-label-sm">Max</label>
              <input type="number" class="form-control form-control-sm" [(ngModel)]="scaleForm.maxValue">
            </div>
            <div class="col-md-1">
              <label class="form-label form-label-sm">Aprobacion</label>
              <input type="number" class="form-control form-control-sm" [(ngModel)]="scaleForm.passValue">
            </div>
            <div class="col-md-2 d-flex align-items-end gap-2">
              <div class="form-check form-switch">
                <input class="form-check-input" type="checkbox" [(ngModel)]="scaleForm.isDefault" id="scaleDefault">
                <label class="form-check-label form-label-sm" for="scaleDefault">Predeterminada</label>
              </div>
            </div>
            <div class="col-md-2 d-flex align-items-end gap-1">
              <button class="btn btn-sm btn-primary" (click)="saveScale()">Guardar</button>
              <button class="btn btn-sm btn-outline-secondary" (click)="showScaleForm=false">Cancelar</button>
            </div>
          </div>
        </div>
      </div>

      <div class="table-responsive">
        <table class="table table-xs table-hover">
          <thead><tr><th>Nombre</th><th>Tipo</th><th>Min</th><th>Max</th><th>Aprobacion</th><th>Predet.</th><th></th></tr></thead>
          <tbody>
            <tr *ngFor="let s of scales">
              <td>{{s.name}}</td>
              <td><span class="badge text-bg-secondary">{{s.scaleType}}</span></td>
              <td>{{s.minValue}}</td>
              <td>{{s.maxValue}}</td>
              <td>{{s.passValue}}</td>
              <td><i class="bi" [class.bi-check-circle-fill]="s.isDefault" [class.bi-circle]="!s.isDefault"></i></td>
              <td>
                <button class="btn btn-sm btn-outline-danger" (click)="deleteScale(s.id!)">Eliminar</button>
              </td>
            </tr>
            <tr *ngIf="scales.length===0"><td colspan="7" class="text-muted text-center">No hay escalas configuradas</td></tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Tipos de Evaluacion -->
    <div *ngIf="tab==='types'">
      <div class="d-flex justify-content-end mb-2">
        <button class="btn btn-sm btn-primary" (click)="showTypeForm=true; resetTypeForm()">+ Nuevo Tipo</button>
      </div>

      <div *ngIf="showTypeForm" class="card mb-3">
        <div class="card-body">
          <div class="row g-2">
            <div class="col-md-3">
              <label class="form-label form-label-sm">Nombre</label>
              <input class="form-control form-control-sm" [(ngModel)]="typeForm.name" placeholder="Ej: Examen Parcial">
            </div>
            <div class="col-md-2">
              <label class="form-label form-label-sm">Codigo</label>
              <input class="form-control form-control-sm" [(ngModel)]="typeForm.code" placeholder="Ej: EX_PARCIAL">
            </div>
            <div class="col-md-3">
              <label class="form-label form-label-sm">Descripcion</label>
              <input class="form-control form-control-sm" [(ngModel)]="typeForm.description">
            </div>
            <div class="col-md-2">
              <label class="form-label form-label-sm">Peso (%)</label>
              <input type="number" class="form-control form-control-sm" [(ngModel)]="typeForm.weightPct">
            </div>
            <div class="col-md-2 d-flex align-items-end gap-1">
              <button class="btn btn-sm btn-primary" (click)="saveType()">Guardar</button>
              <button class="btn btn-sm btn-outline-secondary" (click)="showTypeForm=false">Cancelar</button>
            </div>
          </div>
        </div>
      </div>

      <div class="table-responsive">
        <table class="table table-xs table-hover">
          <thead><tr><th>Nombre</th><th>Codigo</th><th>Descripcion</th><th>Peso</th><th></th></tr></thead>
          <tbody>
            <tr *ngFor="let t of evalTypes">
              <td>{{t.name}}</td>
              <td><code>{{t.code}}</code></td>
              <td>{{t.description}}</td>
              <td>{{t.weightPct}}%</td>
              <td>
                <button class="btn btn-sm btn-outline-danger" (click)="deleteType(t.id!)">Eliminar</button>
              </td>
            </tr>
            <tr *ngIf="evalTypes.length===0"><td colspan="5" class="text-muted text-center">No hay tipos de evaluacion</td></tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Grilla de Calificaciones -->
    <div *ngIf="tab==='grid'">
      <div class="row g-2 mb-3">
        <div class="col-md-3">
          <label class="form-label form-label-sm">Curso</label>
          <select class="form-select form-select-sm" [(ngModel)]="gridCourseId" (change)="loadSubjectsForCourse()">
            <option [ngValue]="null">Seleccionar curso...</option>
            <option *ngFor="let c of courses" [ngValue]="c.id">{{c.name}}</option>
          </select>
        </div>
        <div class="col-md-3">
          <label class="form-label form-label-sm">Materia</label>
          <select class="form-select form-select-sm" [(ngModel)]="gridSubjectId">
            <option [ngValue]="null">Seleccionar materia...</option>
            <option *ngFor="let s of subjects" [ngValue]="s.id">{{s.name}}</option>
          </select>
        </div>
        <div class="col-md-3">
          <label class="form-label form-label-sm">Periodo</label>
          <select class="form-select form-select-sm" [(ngModel)]="gridPeriodId">
            <option [ngValue]="null">Seleccionar periodo...</option>
            <option *ngFor="let p of periods" [ngValue]="p.id">{{p.name}}</option>
          </select>
        </div>
        <div class="col-md-3 d-flex align-items-end">
          <button class="btn btn-sm btn-primary" (click)="loadGrid()" [disabled]="!gridCourseId || !gridSubjectId || !gridPeriodId">Cargar Grilla</button>
        </div>
      </div>

      <div *ngIf="gridData" class="table-responsive">
        <table class="table table-xs table-hover">
          <thead>
            <tr>
              <th>Estudiante</th>
              <th>Matricula</th>
              <th *ngFor="let ev of gridData.evaluations">{{ev.name}} <small class="text-muted">({{ev.weight}}%)</small></th>
              <th>Promedio</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let row of gridData.students">
              <td>{{row.studentName}}</td>
              <td><code>{{row.enrollmentNumber}}</code></td>
              <td *ngFor="let score of row.scores; let i = index">
                <input type="number" class="form-control form-control-sm" style="width:70px"
                  [ngModel]="score" [ngModelOptions]="{standalone: true}"
                  (ngModelChange)="onCellChange(row.studentId, gridData.evaluations[i].id, $event)"
                  min="0" [max]="gridData.evaluations[i].maxScore" step="0.5">
              </td>
              <td><strong>{{row.average || '-'}}</strong></td>
              <td>
                <span class="badge" [class.text-bg-success]="row.status==='APPROVED'" [class.text-bg-danger]="row.status==='FAILED'" [class.text-bg-warning]="row.status==='PENDING'">
                  {{row.status === 'APPROVED' ? 'Aprobado' : row.status === 'FAILED' ? 'Reprobado' : 'Pendiente'}}
                </span>
              </td>
            </tr>
            <tr *ngIf="gridData.students.length===0"><td [attr.colspan]="gridData.evaluations.length + 5" class="text-muted text-center">No hay estudiantes en este curso</td></tr>
          </tbody>
        </table>
      </div>

      <div *ngIf="gridData && gridData.evaluations.length===0 && gridData.students.length > 0" class="alert alert-info">
        No hay evaluaciones registradas para este curso/materia/periodo. Cree evaluaciones desde el modulo de Leccionario.
      </div>
    </div>

    <div *ngIf="message" class="position-fixed bottom-0 end-0 p-3" style="z-index:1050">
      <div class="toast show" [class.bg-success]="!messageIsError" [class.bg-danger]="messageIsError">
        <div class="toast-body text-white">{{message}}</div>
      </div>
    </div>
  `
})
export class GradingManagementComponent implements OnInit, AfterViewInit {
  tab = 'dashboard';
  scales: GradeScale[] = [];
  evalTypes: EvaluationType[] = [];
  courses: Course[] = [];
  subjects: Subject[] = [];
  periods: AcademicPeriod[] = [];
  gridData: any = null;
  gridCourseId: number | null = null;
  gridSubjectId: number | null = null;
  gridPeriodId: number | null = null;

  showScaleForm = false;
  showTypeForm = false;
  scaleForm: GradeScale = { name: '', scaleType: 'NUMERIC_10', minValue: 0, maxValue: 10, passValue: 7, isDefault: false, active: true };
  typeForm: EvaluationType = { name: '', code: '', description: '', weightPct: 100, active: true };

  dashboard: any = null;
  dashboardPeriodId: number | null = null;
  loadingDashboard = false;

  message = '';
  messageIsError = false;

  constructor(private http: HttpClient, private auth: AuthService) {}

  ngOnInit() {
    this.loadScales();
    this.loadTypes();
    this.loadCourses();
    this.loadPeriods();
  }

  ngAfterViewInit() {
    // Auto-select first period for dashboard if available
    setTimeout(() => {
      if (this.periods.length > 0 && !this.dashboardPeriodId) {
        this.dashboardPeriodId = this.periods[this.periods.length - 1].id;
        this.loadDashboard();
      }
    }, 500);
  }

  private showMsg(msg: string, err = false) {
    this.message = msg;
    this.messageIsError = err;
    setTimeout(() => this.message = '', 4000);
  }

  loadScales() {
    const instId = this.auth.institutionId() || 1;
    this.http.get<GradeScale[]>(`${API_URL}/grading/scales`, { params: { institutionId: instId } })
      .subscribe({ next: d => this.scales = d, error: () => this.showMsg('Error al cargar escalas', true) });
  }

  loadTypes() {
    const instId = this.auth.institutionId() || 1;
    this.http.get<EvaluationType[]>(`${API_URL}/grading/types`, { params: { institutionId: instId } })
      .subscribe({ next: d => this.evalTypes = d, error: () => this.showMsg('Error al cargar tipos', true) });
  }

  loadCourses() {
    this.http.get<Course[]>(`${API_URL}/academic/courses`)
      .subscribe({ next: d => this.courses = d, error: () => {} });
  }

  loadPeriods() {
    this.http.get<AcademicPeriod[]>(`${API_URL}/academic/catalogs/academic-years`)
      .subscribe({ next: d => this.periods = d as any, error: () => {} });
  }

  loadSubjectsForCourse() {
    if (!this.gridCourseId) { this.subjects = []; return; }
    this.http.get<Subject[]>(`${API_URL}/academic/subjects`)
      .subscribe({ next: d => this.subjects = d, error: () => {} });
  }

  loadGrid() {
    if (!this.gridCourseId || !this.gridSubjectId || !this.gridPeriodId) return;
    this.http.get(`${API_URL}/grading/grid`, { params: {
      courseId: this.gridCourseId, subjectId: this.gridSubjectId, periodId: this.gridPeriodId
    }}).subscribe({ next: d => this.gridData = d, error: () => this.showMsg('Error al cargar grilla', true) });
  }

  resetScaleForm() {
    this.scaleForm = { name: '', scaleType: 'NUMERIC_10', minValue: 0, maxValue: 10, passValue: 7, isDefault: false, active: true };
  }

  resetTypeForm() {
    this.typeForm = { name: '', code: '', description: '', weightPct: 100, active: true };
  }

  saveScale() {
    const instId = this.auth.institutionId() || 1;
    this.http.post(`${API_URL}/grading/scales`, this.scaleForm, { params: { institutionId: instId } })
      .subscribe({ next: () => { this.showScaleForm = false; this.loadScales(); this.showMsg('Escala guardada'); },
                   error: () => this.showMsg('Error al guardar escala', true) });
  }

  saveType() {
    const instId = this.auth.institutionId() || 1;
    this.http.post(`${API_URL}/grading/types`, this.typeForm, { params: { institutionId: instId } })
      .subscribe({ next: () => { this.showTypeForm = false; this.loadTypes(); this.showMsg('Tipo guardado'); },
                   error: () => this.showMsg('Error al guardar tipo', true) });
  }

  deleteScale(id: number) {
    if (!confirm('Eliminar esta escala?')) return;
    const instId = this.auth.institutionId() || 1;
    this.http.delete(`${API_URL}/grading/scales/${id}`, { params: { institutionId: instId } })
      .subscribe({ next: () => { this.loadScales(); this.showMsg('Escala eliminada'); },
                   error: () => this.showMsg('Error al eliminar', true) });
  }

  deleteType(id: number) {
    if (!confirm('Eliminar este tipo?')) return;
    const instId = this.auth.institutionId() || 1;
    this.http.delete(`${API_URL}/grading/types/${id}`, { params: { institutionId: instId } })
      .subscribe({ next: () => { this.loadTypes(); this.showMsg('Tipo eliminado'); },
                   error: () => this.showMsg('Error al eliminar', true) });
  }

  onCellChange(studentId: number, evaluationId: number, score: number) {
    this.http.post(`${API_URL}/grading/grades`, { evaluationId, studentId, score })
      .subscribe({ next: () => this.showMsg('Calificacion guardada'),
                   error: () => this.showMsg('Error al guardar calificacion', true) });
  }

  loadDashboard() {
    if (!this.dashboardPeriodId) return;
    this.loadingDashboard = true;
    this.http.get(`${API_URL}/grading/dashboard`, { params: { periodId: this.dashboardPeriodId } })
      .subscribe({
        next: d => { this.dashboard = d; this.loadingDashboard = false; },
        error: () => { this.showMsg('Error al cargar dashboard', true); this.loadingDashboard = false; }
      });
  }

  getBarWidth(count: number): number {
    if (!this.dashboard || !this.dashboard.distribution) return 0;
    const max = Math.max(...this.dashboard.distribution.map((b: any) => b.count), 1);
    return (count / max) * 100;
  }

  getBarColor(range: string): string {
    const colors: Record<string, string> = {
      '0-3.99': '#e74c3c',
      '4-5.99': '#e67e22',
      '6-6.99': '#f1c40f',
      '7-7.99': '#2ecc71',
      '8-8.99': '#27ae60',
      '9-10': '#1a7a3a'
    };
    return colors[range] || '#999';
  }
}
