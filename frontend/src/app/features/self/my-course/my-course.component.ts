import { HttpClient } from '@angular/common/http';
import { Component, OnInit, inject } from '@angular/core';
import { API_URL } from '../../../core/api.config';
import { AcademicCourse, AcademicStudent, ScheduleOverview } from '../../academic/academic.models';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'app-my-course',
  standalone: true,
  template: `
    <div class="d-grid gap-4">
      <div class="card border-0 shadow-sm">
        <div class="card-body p-4">
          <div class="d-flex align-items-center justify-content-between mb-3">
            <div>
              <h2 class="h4 mb-1">Mi curso</h2>
              <p class="text-muted mb-0">Informacion del curso al que perteneces.</p>
            </div>
          </div>
          @if (course) {
            <div class="row g-3">
              <div class="col-md-3">
                <div class="p-3 rounded-3" style="background: var(--app-bg);">
                  <div class="small text-muted">Curso</div>
                  <div class="fw-semibold">{{ course.name }}</div>
                </div>
              </div>
              <div class="col-md-3">
                <div class="p-3 rounded-3" style="background: var(--app-bg);">
                  <div class="small text-muted">Paralelo</div>
                  <div class="fw-semibold">{{ course.parallel }}</div>
                </div>
              </div>
              <div class="col-md-3">
                <div class="p-3 rounded-3" style="background: var(--app-bg);">
                  <div class="small text-muted">Seccion</div>
                  <div class="fw-semibold">{{ course.section || '-' }}</div>
                </div>
              </div>
              <div class="col-md-3">
                <div class="p-3 rounded-3" style="background: var(--app-bg);">
                  <div class="small text-muted">Subnivel</div>
                  <div class="fw-semibold">{{ course.subLevel || '-' }}</div>
                </div>
              </div>
            </div>
          }
        </div>
      </div>

      <div class="card border-0 shadow-sm">
        <div class="card-body p-4">
          <h3 class="h5 mb-3">Mis companeros</h3>
          <div class="table-responsive">
            <table class="table table-striped align-middle mb-0">
              <thead>
                <tr>
                  <th>Matricula</th>
                  <th>Nombres</th>
                </tr>
              </thead>
              <tbody>
                @for (s of classmates; track s.id) {
                  <tr>
                    <td>{{ s.enrollmentNumber }}</td>
                    <td>{{ s.fullName }}</td>
                  </tr>
                } @empty {
                  <tr><td colspan="2" class="text-center text-muted py-4">Sin companeros registrados.</td></tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div class="card border-0 shadow-sm">
        <div class="card-body p-4">
          <h3 class="h5 mb-3">Mi horario</h3>
          <div class="table-responsive">
            <table class="table table-striped align-middle mb-0">
              <thead>
                <tr>
                  <th>Dia</th>
                  <th>Bloque</th>
                  <th>Materia</th>
                  <th>Docente</th>
                  <th>Aula</th>
                </tr>
              </thead>
              <tbody>
                @for (s of schedules; track s.id) {
                  <tr>
                    <td>{{ weekdayLabel(s.weekday) }}</td>
                    <td>{{ s.scheduleLabel }}</td>
                    <td>{{ s.subjectName }}</td>
                    <td>{{ s.teacherName }}</td>
                    <td>{{ s.classroom || '-' }}</td>
                  </tr>
                } @empty {
                  <tr><td colspan="5" class="text-center text-muted py-4">Sin horario registrado.</td></tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `
})
export class MyCourseComponent implements OnInit {
  private http = inject(HttpClient);

  course: AcademicCourse | null = null;
  classmates: AcademicStudent[] = [];
  schedules: Array<{ id: number; courseId: number; courseName: string; periodId: number; periodName: string; scheduleLabel: string; subjectId: number; subjectName: string; teacherId: number; teacherName: string; weekday: number; classroom: string | null }> = [];

  ngOnInit(): void {
    this.http.get<AcademicCourse>(`${API_URL}/self/course`).pipe(
      catchError(() => of(null))
    ).subscribe(data => this.course = data);

    this.http.get<AcademicStudent[]>(`${API_URL}/self/classmates`).pipe(
      catchError(() => of([]))
    ).subscribe(data => this.classmates = data);

    this.http.get<any[]>(`${API_URL}/self/schedule`).pipe(
      catchError(() => of([]))
    ).subscribe(data => this.schedules = data);
  }

  weekdayLabel(w: number): string {
    return ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado', 'Domingo'][w - 1] || '';
  }
}
