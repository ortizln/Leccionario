import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../core/api.config';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-enrollment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h4 class="mb-0 fw-bold">Matriculas</h4>
    </div>

    <ul class="nav nav-tabs nav-tabs-sm mb-3">
      <li><a class="nav-link" [class.active]="tab==='list'" (click)="tab='list'; load()">Matriculas</a></li>
      <li><a class="nav-link" [class.active]="tab==='new'" (click)="tab='new'; resetForm()">Nueva Matricula</a></li>
    </ul>

    <div *ngIf="tab==='list'">
      <div class="row g-2 mb-3">
        <div class="col-md-3">
          <label class="form-label form-label-sm">Periodo</label>
          <select class="form-select form-select-sm" [(ngModel)]="filterPeriodId" (change)="load()">
            <option [ngValue]="null">Todos</option>
            <option *ngFor="let p of periods" [ngValue]="p.id">{{p.name}}</option>
          </select>
        </div>
        <div class="col-md-3">
          <label class="form-label form-label-sm">Curso</label>
          <select class="form-select form-select-sm" [(ngModel)]="filterCourseId" (change)="load()">
            <option [ngValue]="null">Todos</option>
            <option *ngFor="let c of courses" [ngValue]="c.id">{{c.name}}</option>
          </select>
        </div>
      </div>

      <div class="row g-2 mb-3" *ngIf="stats">
        <div class="col-md-3">
          <div class="card border-0 shadow-sm"><div class="card-body text-center py-2">
            <div class="small text-muted">Total Matriculas</div><div class="fs-5 fw-bold" style="color:#3B4436">{{stats.total}}</div>
          </div></div>
        </div>
        <div class="col-md-3">
          <div class="card border-0 shadow-sm"><div class="card-body text-center py-2">
            <div class="small text-muted">Activas</div><div class="fs-5 fw-bold text-success">{{stats.active}}</div>
          </div></div>
        </div>
        <div class="col-md-3">
          <div class="card border-0 shadow-sm"><div class="card-body text-center py-2">
            <div class="small text-muted">Trasladados</div><div class="fs-5 fw-bold text-warning">{{stats.byStatus?.TRANSFERRED || 0}}</div>
          </div></div>
        </div>
        <div class="col-md-3">
          <div class="card border-0 shadow-sm"><div class="card-body text-center py-2">
            <div class="small text-muted">Retirados</div><div class="fs-5 fw-bold text-danger">{{stats.byStatus?.WITHDRAWN || 0}}</div>
          </div></div>
        </div>
      </div>

      <div class="table-responsive">
        <table class="table table-xs table-hover">
          <thead><tr><th># Matricula</th><th>Estudiante</th><th>Curso</th><th>Periodo</th><th>Paralelo</th><th>Estado</th><th>Fecha</th><th></th></tr></thead>
          <tbody>
            <tr *ngFor="let e of enrollments">
              <td class="fw-semibold">{{e.enrollmentNumber}}</td>
              <td>{{e.studentName || 'ID: '+e.studentId}}</td>
              <td>{{e.courseName || 'ID: '+e.courseId}}</td>
              <td>{{e.periodName || 'ID: '+e.periodId}}</td>
              <td>{{e.parallelCode || '-'}}</td>
              <td>
                <span class="badge" [class.text-bg-success]="e.status==='ACTIVE'" [class.text-bg-warning]="e.status==='TRANSFERRED'" [class.text-bg-secondary]="e.status==='PROMOTED'" [class.text-bg-danger]="e.status==='WITHDRAWN'">
                  {{statusLabel(e.status)}}
                </span>
              </td>
              <td>{{e.enrollmentDate}}</td>
              <td>
                <button class="btn btn-sm btn-outline-danger" (click)="deleteEnrollment(e.id)">Retirar</button>
              </td>
            </tr>
            <tr *ngIf="enrollments.length===0"><td colspan="8" class="text-muted text-center">No hay matriculas</td></tr>
          </tbody>
        </table>
      </div>
    </div>

    <div *ngIf="tab==='new'">
      <div class="card">
        <div class="card-body">
          <div class="row g-2">
            <div class="col-md-3">
              <label class="form-label form-label-sm">Estudiante ID</label>
              <input type="number" class="form-control form-control-sm" [(ngModel)]="formStudentId">
            </div>
            <div class="col-md-3">
              <label class="form-label form-label-sm">Curso ID</label>
              <input type="number" class="form-control form-control-sm" [(ngModel)]="formCourseId">
            </div>
            <div class="col-md-3">
              <label class="form-label form-label-sm">Periodo</label>
              <select class="form-select form-select-sm" [(ngModel)]="formPeriodId">
                <option *ngFor="let p of periods" [ngValue]="p.id">{{p.name}}</option>
              </select>
            </div>
            <div class="col-md-3">
              <label class="form-label form-label-sm">Paralelo</label>
              <input class="form-control form-control-sm" [(ngModel)]="formParallelCode" placeholder="A">
            </div>
          </div>
          <div class="row g-2 mt-1">
            <div class="col-md-4">
              <label class="form-label form-label-sm"># Matricula</label>
              <input class="form-control form-control-sm" [(ngModel)]="formEnrollmentNumber" placeholder="AUTO">
            </div>
            <div class="col-md-8">
              <label class="form-label form-label-sm">Observaciones</label>
              <input class="form-control form-control-sm" [(ngModel)]="formObservations">
            </div>
          </div>
          <div class="mt-3">
            <button class="btn btn-sm btn-primary" (click)="create()" [disabled]="!formStudentId || !formCourseId || !formPeriodId">Registrar Matricula</button>
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
export class EnrollmentComponent implements OnInit {
  tab = 'list';
  periods: any[] = [];
  courses: any[] = [];
  enrollments: any[] = [];
  stats: any = null;
  filterPeriodId: number | null = null;
  filterCourseId: number | null = null;

  formStudentId: number | null = null;
  formCourseId: number | null = null;
  formPeriodId: number | null = null;
  formParallelCode = '';
  formEnrollmentNumber = '';
  formObservations = '';

  message = '';
  messageIsError = false;

  constructor(private http: HttpClient, private auth: AuthService) {}

  ngOnInit() {
    const instId = this.auth.institutionId() || 1;
    this.http.get<any[]>(`${API_URL}/academic/periods`).subscribe({ next: d => this.periods = d });
    this.http.get<any[]>(`${API_URL}/academic/courses`, { params: { institutionId: instId } })
      .subscribe({ next: d => this.courses = d });
    this.load();
  }

  private showMsg(msg: string, err = false) { this.message = msg; this.messageIsError = err; setTimeout(() => this.message = '', 4000); }

  load() {
    if (this.filterPeriodId) {
      this.http.get<any>(`${API_URL}/enrollment/stats/${this.filterPeriodId}`).subscribe({ next: d => this.stats = d });
      if (this.filterCourseId) {
        this.http.get<any[]>(`${API_URL}/enrollment/course/${this.filterCourseId}/period/${this.filterPeriodId}`)
          .subscribe({ next: d => this.enrollments = d });
      } else {
        this.http.get<any[]>(`${API_URL}/enrollment/period/${this.filterPeriodId}`)
          .subscribe({ next: d => this.enrollments = d });
      }
    }
  }

  create() {
    this.http.post(`${API_URL}/enrollment`, {
      studentId: this.formStudentId, courseId: this.formCourseId, periodId: this.formPeriodId,
      enrollmentNumber: this.formEnrollmentNumber || null,
      parallelCode: this.formParallelCode, observations: this.formObservations
    }).subscribe({
      next: () => { this.showMsg('Matricula creada'); this.tab = 'list'; this.load(); this.resetForm(); },
      error: () => this.showMsg('Error al crear', true)
    });
  }

  deleteEnrollment(id: number) {
    if (!confirm('Retirar esta matricula?')) return;
    this.http.delete(`${API_URL}/enrollment/${id}`).subscribe({
      next: () => { this.load(); this.showMsg('Matricula retirada'); },
      error: () => this.showMsg('Error', true)
    });
  }

  resetForm() { this.formStudentId = null; this.formCourseId = null; this.formParallelCode = ''; this.formEnrollmentNumber = ''; this.formObservations = ''; }

  statusLabel(s: string): string {
    const m: Record<string, string> = { ACTIVE: 'Activa', TRANSFERRED: 'Trasladado', WITHDRAWN: 'Retirado', PROMOTED: 'Promovido' };
    return m[s] || s;
  }
}
