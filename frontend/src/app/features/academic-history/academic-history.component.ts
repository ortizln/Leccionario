import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../core/api.config';

interface SubjectGrade {
  subjectId: number;
  subjectName: string;
  teacherName: string;
  averageScore: number;
  status: string;
}

interface PeriodSummary {
  periodId: number;
  periodName: string;
  periodStart: string;
  periodEnd: string;
  subjects: SubjectGrade[];
  periodAverage: number;
  periodStatus: string;
}

interface AcademicHistory {
  studentId: number;
  studentName: string;
  enrollmentNumber: string;
  periods: PeriodSummary[];
}

interface Student { id: number; firstName: string; lastName: string; enrollmentNumber: string; }

@Component({
  selector: 'app-academic-history',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h4 class="mb-0 fw-bold">Historial Academico</h4>
    </div>

    <div class="row g-2 mb-3">
      <div class="col-md-3">
        <label class="form-label form-label-sm">Buscar Estudiante</label>
        <input class="form-control form-control-sm" [(ngModel)]="searchTerm" placeholder="Nombre o matricula..."
               (keyup.enter)="searchStudent()">
      </div>
      <div class="col-md-2 d-flex align-items-end">
        <button class="btn btn-sm btn-primary" (click)="searchStudent()" [disabled]="!searchTerm">Buscar</button>
      </div>
    </div>

    <div *ngIf="searchResults.length > 0 && !history" class="mb-3">
      <div class="card border-0 shadow-sm">
        <div class="card-body p-0">
          <table class="table table-xs mb-0">
            <thead><tr><th>Nombre</th><th>Matricula</th><th></th></tr></thead>
            <tbody>
              <tr *ngFor="let s of searchResults" (click)="loadHistory(s.id)" style="cursor:pointer">
                <td>{{s.firstName}} {{s.lastName}}</td>
                <td><code>{{s.enrollmentNumber}}</code></td>
                <td><button class="btn btn-sm btn-outline-primary">Ver historial</button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div *ngIf="history">
      <!-- Header -->
      <div class="card border-0 shadow-sm mb-3">
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-start">
            <div>
              <h5 class="fw-bold mb-1">{{history.studentName}}</h5>
              <div class="small text-muted">Matricula: <code>{{history.enrollmentNumber}}</code></div>
            </div>
            <button class="btn btn-sm btn-outline-secondary" (click)="history=null; searchResults=[]">Volver</button>
          </div>
          <div class="row mt-3">
            <div class="col-md-3">
              <div class="small text-muted">Periodos cursados</div>
              <div class="fs-5 fw-bold" style="color:#3B4436">{{history.periods.length}}</div>
            </div>
            <div class="col-md-3">
              <div class="small text-muted">Materias totales</div>
              <div class="fs-5 fw-bold" style="color:#3B4436">{{totalSubjects}}</div>
            </div>
            <div class="col-md-3">
              <div class="small text-muted">Promedio general</div>
              <div class="fs-5 fw-bold" style="color:#3B4436">{{overallAverage ?? '-'}}</div>
            </div>
            <div class="col-md-3">
              <div class="small text-muted">Materias aprobadas</div>
              <div class="fs-5 fw-bold text-success">{{totalApproved}} / {{totalSubjects}}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Timeline -->
      <div class="timeline">
        <div *ngFor="let period of history.periods; let i = index" class="timeline-item mb-3">
          <div class="card border-0 shadow-sm">
            <div class="card-header bg-white d-flex justify-content-between align-items-center py-2">
              <div>
                <span class="fw-semibold">{{period.periodName}}</span>
                <span class="small text-muted ms-2">{{period.periodStart | date:'dd/MM/yyyy'}} - {{period.periodEnd | date:'dd/MM/yyyy'}}</span>
              </div>
              <div class="d-flex align-items-center gap-2">
                <span class="badge" [class.text-bg-success]="period.periodStatus==='APPROVED'" [class.text-bg-danger]="period.periodStatus==='FAILED'" [class.text-bg-warning]="period.periodStatus==='PENDING'">
                  {{period.periodStatus === 'APPROVED' ? 'Aprobado' : period.periodStatus === 'FAILED' ? 'Reprobado' : 'Pendiente'}}
                </span>
                <span class="fw-bold" style="color:#3B4436">Prom: {{period.periodAverage ?? '-'}}</span>
              </div>
            </div>
            <div class="card-body p-0">
              <table class="table table-xs mb-0">
                <thead>
                  <tr><th>Materia</th><th>Docente</th><th>Promedio</th><th>Estado</th></tr>
                </thead>
                <tbody>
                  <tr *ngFor="let subj of period.subjects">
                    <td>{{subj.subjectName}}</td>
                    <td class="small text-muted">{{subj.teacherName || '-'}}</td>
                    <td><strong>{{subj.averageScore ?? '-'}}</strong></td>
                    <td>
                      <span class="badge" [class.text-bg-success]="subj.status==='APPROVED'" [class.text-bg-danger]="subj.status==='FAILED'" [class.text-bg-warning]="subj.status==='PENDING'">
                        {{subj.status === 'APPROVED' ? 'Aprobado' : subj.status === 'FAILED' ? 'Reprobado' : 'Pendiente'}}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div *ngIf="history.periods.length===0" class="text-center text-muted py-5">No hay registros academicos para este estudiante</div>
    </div>

    <div *ngIf="!history && searchResults.length===0" class="text-center text-muted py-5">
      Busque un estudiante para ver su historial academico
    </div>

    <div *ngIf="message" class="position-fixed bottom-0 end-0 p-3" style="z-index:1050">
      <div class="toast show" [class.bg-success]="!messageIsError" [class.bg-danger]="messageIsError">
        <div class="toast-body text-white">{{message}}</div>
      </div>
    </div>
  `,
  styles: [`
    .timeline { position: relative; padding-left: 20px; }
    .timeline::before { content: ''; position: absolute; left: 8px; top: 0; bottom: 0; width: 2px; background: #dee2e6; }
    .timeline-item { position: relative; }
    .timeline-item::before { content: ''; position: absolute; left: -16px; top: 12px; width: 10px; height: 10px; border-radius: 50%; background: #606C56; border: 2px solid #fff; box-shadow: 0 0 0 2px #dee2e6; }
  `]
})
export class AcademicHistoryComponent implements OnInit {
  searchTerm = '';
  searchResults: Student[] = [];
  history: AcademicHistory | null = null;
  totalSubjects = 0;
  totalApproved = 0;
  overallAverage: number | null = null;

  message = '';
  messageIsError = false;

  constructor(private http: HttpClient) {}

  ngOnInit() {}

  private showMsg(msg: string, err = false) {
    this.message = msg;
    this.messageIsError = err;
    setTimeout(() => this.message = '', 4000);
  }

  searchStudent() {
    if (!this.searchTerm) return;
    this.http.get<Student[]>(`${API_URL}/academic/students`, { params: { search: this.searchTerm } })
      .subscribe({
        next: d => { this.searchResults = d; this.history = null; },
        error: () => this.showMsg('Error al buscar estudiantes', true)
      });
  }

  loadHistory(studentId: number) {
    this.http.get<AcademicHistory>(`${API_URL}/report-cards/history/${studentId}`)
      .subscribe({
        next: d => {
          this.history = d;
          this.searchResults = [];
          this.computeStats();
        },
        error: () => this.showMsg('Error al cargar historial', true)
      });
  }

  private computeStats() {
    if (!this.history) return;
    this.totalSubjects = 0;
    this.totalApproved = 0;
    const allScores: number[] = [];
    for (const period of this.history.periods) {
      for (const subj of period.subjects) {
        this.totalSubjects++;
        if (subj.status === 'APPROVED') this.totalApproved++;
        if (subj.averageScore != null) allScores.push(subj.averageScore);
      }
    }
    if (allScores.length > 0) {
      this.overallAverage = Math.round((allScores.reduce((a, b) => a + b, 0) / allScores.length) * 100) / 100;
    } else {
      this.overallAverage = null;
    }
  }
}
