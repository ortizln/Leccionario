import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../core/api.config';

interface Course { id: number; name: string; }
interface AcademicPeriod { id: number; name: string; }
interface Student { id: number; firstName: string; lastName: string; enrollmentNumber: string; }

interface ReportCardDetail {
  id: number;
  subjectId: number;
  subjectName: string;
  teacherName: string;
  averageScore: number;
  status: string;
  teacherComment: string;
  evaluationCount: number;
}

interface ReportCard {
  id: number;
  studentId: number;
  studentName: string;
  enrollmentNumber: string;
  courseId: number;
  courseName: string;
  academicPeriodId: number;
  academicPeriodName: string;
  status: string;
  overallAverage: number;
  finalStatus: string;
  teacherComments: string;
  conductNotes: string;
  observations: string;
  generatedBy: string;
  generatedAt: string;
  signedAt: string;
  deliveredAt: string;
  details: ReportCardDetail[];
}

@Component({
  selector: 'app-report-cards',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h4 class="mb-0 fw-bold">Libretas</h4>
    </div>

    <ul class="nav nav-tabs nav-tabs-sm mb-3">
      <li><a class="nav-link" [class.active]="tab==='list'" (click)="tab='list'; loadReportCards()">Lista</a></li>
      <li><a class="nav-link" [class.active]="tab==='generate'" (click)="tab='generate'">Generar Libreta</a></li>
    </ul>

    <!-- Lista de Libretas -->
    <div *ngIf="tab==='list'">
      <div class="row g-2 mb-3">
        <div class="col-md-3">
          <label class="form-label form-label-sm">Periodo</label>
          <select class="form-select form-select-sm" [(ngModel)]="filterPeriodId" (change)="loadReportCards()">
            <option [ngValue]="null">Todos</option>
            <option *ngFor="let p of periods" [ngValue]="p.id">{{p.name}}</option>
          </select>
        </div>
        <div class="col-md-3">
          <label class="form-label form-label-sm">Curso</label>
          <select class="form-select form-select-sm" [(ngModel)]="filterCourseId" (change)="loadReportCards()">
            <option [ngValue]="null">Todos</option>
            <option *ngFor="let c of courses" [ngValue]="c.id">{{c.name}}</option>
          </select>
        </div>
      </div>

      <div class="table-responsive">
        <table class="table table-xs table-hover">
          <thead>
            <tr>
              <th>Estudiante</th>
              <th>Curso</th>
              <th>Periodo</th>
              <th>Promedio</th>
              <th>Estado</th>
              <th>Estado Libreta</th>
              <th>Generada</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let rc of reportCards" (click)="viewReportCard(rc)" style="cursor:pointer">
              <td>{{rc.studentName}}</td>
              <td>{{rc.courseName}}</td>
              <td>{{rc.academicPeriodName}}</td>
              <td><strong>{{rc.overallAverage ?? '-'}}</strong></td>
              <td>
                <span class="badge" [class.text-bg-success]="rc.finalStatus==='APPROVED'" [class.text-bg-danger]="rc.finalStatus==='FAILED'" [class.text-bg-warning]="rc.finalStatus==='PENDING'">
                  {{rc.finalStatus === 'APPROVED' ? 'Aprobado' : rc.finalStatus === 'FAILED' ? 'Reprobado' : 'Pendiente'}}
                </span>
              </td>
              <td>
                <span class="badge" [class.text-bg-secondary]="rc.status==='DRAFT'" [class.text-bg-primary]="rc.status==='FINALIZED'" [class.text-bg-success]="rc.status==='SIGNED'||rc.status==='DELIVERED'">
                  {{statusLabel(rc.status)}}
                </span>
              </td>
              <td class="small text-muted">{{rc.generatedAt | date:'dd/MM/yyyy HH:mm'}}</td>
              <td>
                <button class="btn btn-sm btn-outline-primary" (click)="viewReportCard(rc); $event.stopPropagation()">Ver</button>
              </td>
            </tr>
            <tr *ngIf="reportCards.length===0"><td colspan="8" class="text-muted text-center">No hay libretas generadas</td></tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Generar Libreta -->
    <div *ngIf="tab==='generate'">
      <div class="row g-2 mb-3">
        <div class="col-md-3">
          <label class="form-label form-label-sm">Curso</label>
          <select class="form-select form-select-sm" [(ngModel)]="genCourseId" (change)="loadStudents()">
            <option [ngValue]="null">Seleccionar curso...</option>
            <option *ngFor="let c of courses" [ngValue]="c.id">{{c.name}}</option>
          </select>
        </div>
        <div class="col-md-3">
          <label class="form-label form-label-sm">Periodo</label>
          <select class="form-select form-select-sm" [(ngModel)]="genPeriodId">
            <option [ngValue]="null">Seleccionar periodo...</option>
            <option *ngFor="let p of periods" [ngValue]="p.id">{{p.name}}</option>
          </select>
        </div>
        <div class="col-md-3">
          <label class="form-label form-label-sm">Estudiante</label>
          <select class="form-select form-select-sm" [(ngModel)]="genStudentId">
            <option [ngValue]="null">Seleccionar estudiante...</option>
            <option *ngFor="let s of students" [ngValue]="s.id">{{s.firstName}} {{s.lastName}} ({{s.enrollmentNumber}})</option>
          </select>
        </div>
        <div class="col-md-3 d-flex align-items-end">
          <button class="btn btn-sm btn-primary" (click)="generateReportCard()" [disabled]="!genCourseId || !genPeriodId || !genStudentId">Generar</button>
        </div>
      </div>

      <div class="row g-2 mb-3">
        <div class="col-md-6">
          <label class="form-label form-label-sm">Comentarios del Docente</label>
          <textarea class="form-control form-control-sm" rows="3" [(ngModel)]="genComments" placeholder="Observaciones generales del periodo..."></textarea>
        </div>
        <div class="col-md-3">
          <label class="form-label form-label-sm">Conducta</label>
          <textarea class="form-control form-control-sm" rows="3" [(ngModel)]="genConduct" placeholder="Notas de conducta..."></textarea>
        </div>
        <div class="col-md-3">
          <label class="form-label form-label-sm">Observaciones</label>
          <textarea class="form-control form-control-sm" rows="3" [(ngModel)]="genObservations" placeholder="Observaciones adicionales..."></textarea>
        </div>
      </div>
    </div>

    <!-- Detalle de Libreta -->
    <div *ngIf="selectedReportCard" class="card border-0 shadow-sm mb-3">
      <div class="card-header bg-white d-flex justify-content-between align-items-center py-2">
        <h5 class="mb-0 fw-semibold small">Libreta: {{selectedReportCard.studentName}}</h5>
        <div class="d-flex gap-1">
          <button *ngIf="selectedReportCard.status==='DRAFT'" class="btn btn-sm btn-primary" (click)="updateStatus('FINALIZED')">Finalizar</button>
          <button *ngIf="selectedReportCard.status==='FINALIZED'" class="btn btn-sm btn-success" (click)="updateStatus('SIGNED')">Firmar</button>
          <button *ngIf="selectedReportCard.status==='SIGNED'" class="btn btn-sm btn-info text-white" (click)="updateStatus('DELIVERED')">Entregar</button>
          <button class="btn btn-sm btn-outline-danger" (click)="downloadPdf()"><i class="bi bi-file-pdf me-1"></i>PDF</button>
          <button class="btn btn-sm btn-outline-secondary" (click)="selectedReportCard=null">Cerrar</button>
        </div>
      </div>
      <div class="card-body">
        <div class="row mb-3">
          <div class="col-md-3">
            <div class="small text-muted">Estudiante</div>
            <div class="fw-semibold">{{selectedReportCard.studentName}}</div>
          </div>
          <div class="col-md-2">
            <div class="small text-muted">Matricula</div>
            <div><code>{{selectedReportCard.enrollmentNumber}}</code></div>
          </div>
          <div class="col-md-2">
            <div class="small text-muted">Curso</div>
            <div class="fw-semibold">{{selectedReportCard.courseName}}</div>
          </div>
          <div class="col-md-2">
            <div class="small text-muted">Periodo</div>
            <div>{{selectedReportCard.academicPeriodName}}</div>
          </div>
          <div class="col-md-2">
            <div class="small text-muted">Promedio General</div>
            <div class="fs-5 fw-bold" style="color:#3B4436">{{selectedReportCard.overallAverage ?? '-'}}</div>
          </div>
          <div class="col-md-1">
            <div class="small text-muted">Estado</div>
            <span class="badge" [class.text-bg-success]="selectedReportCard.finalStatus==='APPROVED'" [class.text-bg-danger]="selectedReportCard.finalStatus==='FAILED'" [class.text-bg-warning]="selectedReportCard.finalStatus==='PENDING'">
              {{selectedReportCard.finalStatus === 'APPROVED' ? 'Aprobado' : selectedReportCard.finalStatus === 'FAILED' ? 'Reprobado' : 'Pendiente'}}
            </span>
          </div>
        </div>

        <div class="table-responsive">
          <table class="table table-xs">
            <thead>
              <tr><th>Materia</th><th>Docente</th><th>Promedio</th><th>Estado</th><th>Evals</th><th>Observacion</th></tr>
            </thead>
            <tbody>
              <tr *ngFor="let d of selectedReportCard.details">
                <td>{{d.subjectName}}</td>
                <td>{{d.teacherName || '-'}}</td>
                <td><strong>{{d.averageScore ?? '-'}}</strong></td>
                <td>
                  <span class="badge" [class.text-bg-success]="d.status==='APPROVED'" [class.text-bg-danger]="d.status==='FAILED'" [class.text-bg-warning]="d.status==='PENDING'">
                    {{d.status === 'APPROVED' ? 'A' : d.status === 'FAILED' ? 'R' : 'P'}}
                  </span>
                </td>
                <td class="text-muted">{{d.evaluationCount}}</td>
                <td class="small">{{d.teacherComment || '-'}}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="row mt-3" *ngIf="selectedReportCard.teacherComments || selectedReportCard.conductNotes || selectedReportCard.observations">
          <div class="col-md-4" *ngIf="selectedReportCard.teacherComments">
            <div class="small text-muted fw-semibold">Comentarios del Docente</div>
            <div class="small">{{selectedReportCard.teacherComments}}</div>
          </div>
          <div class="col-md-4" *ngIf="selectedReportCard.conductNotes">
            <div class="small text-muted fw-semibold">Conducta</div>
            <div class="small">{{selectedReportCard.conductNotes}}</div>
          </div>
          <div class="col-md-4" *ngIf="selectedReportCard.observations">
            <div class="small text-muted fw-semibold">Observaciones</div>
            <div class="small">{{selectedReportCard.observations}}</div>
          </div>
        </div>
      </div>
    </div>

    <div *ngIf="message" class="position-fixed bottom-0 end-0 p-3" style="z-index:1050">
      <div class="toast show" [class.bg-success]="!messageIsError" [class.bg-danger]="messageIsError">
        <div class="toast-body text-white">{{message}}</div>
      </div>
    </div>
  `
})
export class ReportCardsComponent implements OnInit {
  tab = 'list';
  courses: Course[] = [];
  periods: AcademicPeriod[] = [];
  students: Student[] = [];
  reportCards: ReportCard[] = [];
  selectedReportCard: ReportCard | null = null;

  filterPeriodId: number | null = null;
  filterCourseId: number | null = null;
  genCourseId: number | null = null;
  genPeriodId: number | null = null;
  genStudentId: number | null = null;
  genComments = '';
  genConduct = '';
  genObservations = '';

  message = '';
  messageIsError = false;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.http.get<Course[]>(`${API_URL}/academic/courses`).subscribe({ next: d => this.courses = d });
    this.http.get<AcademicPeriod[]>(`${API_URL}/academic/catalogs/academic-years`).subscribe({ next: d => this.periods = d as any });
  }

  private showMsg(msg: string, err = false) {
    this.message = msg;
    this.messageIsError = err;
    setTimeout(() => this.message = '', 4000);
  }

  loadReportCards() {
    let url = `${API_URL}/report-cards`;
    if (this.filterPeriodId) {
      url += `/period/${this.filterPeriodId}`;
    }
    this.http.get<ReportCard[]>(url).subscribe({
      next: d => this.reportCards = d,
      error: () => this.showMsg('Error al cargar libretas', true)
    });
  }

  loadStudents() {
    if (!this.genCourseId) { this.students = []; return; }
    this.http.get<Student[]>(`${API_URL}/academic/students`, { params: { courseId: this.genCourseId } })
      .subscribe({ next: d => this.students = d, error: () => {} });
  }

  generateReportCard() {
    if (!this.genCourseId || !this.genPeriodId || !this.genStudentId) return;
    this.http.post<ReportCard>(`${API_URL}/report-cards/generate`, {
      studentId: this.genStudentId,
      courseId: this.genCourseId,
      academicPeriodId: this.genPeriodId,
      teacherComments: this.genComments,
      conductNotes: this.genConduct,
      observations: this.genObservations
    }).subscribe({
      next: rc => {
        this.selectedReportCard = rc;
        this.showMsg('Libreta generada exitosamente');
        this.tab = 'list';
        this.loadReportCards();
      },
      error: () => this.showMsg('Error al generar libreta', true)
    });
  }

  viewReportCard(rc: ReportCard) {
    this.http.get<ReportCard>(`${API_URL}/report-cards`, { params: {
      studentId: rc.studentId, courseId: rc.courseId, periodId: rc.academicPeriodId
    }}).subscribe({
      next: d => this.selectedReportCard = d,
      error: () => this.showMsg('Error al cargar libreta', true)
    });
  }

  updateStatus(newStatus: string) {
    if (!this.selectedReportCard) return;
    this.http.put<ReportCard>(`${API_URL}/report-cards/${this.selectedReportCard.id}/status`, null, { params: { status: newStatus } })
      .subscribe({
        next: d => { this.selectedReportCard = d; this.showMsg('Estado actualizado'); this.loadReportCards(); },
        error: () => this.showMsg('Error al actualizar estado', true)
      });
  }

  downloadPdf() {
    if (!this.selectedReportCard) return;
    window.open(`${API_URL}/report-cards/${this.selectedReportCard.id}/pdf`, '_blank');
  }

  statusLabel(status: string): string {
    const labels: Record<string, string> = { DRAFT: 'Borrador', FINALIZED: 'Finalizada', SIGNED: 'Firmada', DELIVERED: 'Entregada' };
    return labels[status] || status;
  }
}
