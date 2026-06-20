import { HttpClient } from '@angular/common/http';
import { Component, OnInit, inject } from '@angular/core';
import { API_URL } from '../../../core/api.config';
import { AcademicStudent } from '../../academic/academic.models';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'app-my-teaching',
  standalone: true,
  template: `
    <div class="d-grid gap-4">
      <div class="card border-0 shadow-sm">
        <div class="card-body p-4">
          <h2 class="h4 mb-1">Mi carga academica</h2>
          <p class="text-muted mb-0">Horarios y estudiantes asignados.</p>
        </div>
      </div>

      <div class="card border-0 shadow-sm">
        <div class="card-body p-4">
          <h3 class="h5 mb-3">Mi horario de clases</h3>
          <div class="table-responsive">
            <table class="table table-striped align-middle mb-0">
              <thead>
                <tr>
                  <th>Dia</th>
                  <th>Bloque</th>
                  <th>Curso</th>
                  <th>Materia</th>
                  <th>Aula</th>
                </tr>
              </thead>
              <tbody>
                @for (s of schedules; track s.id) {
                  <tr>
                    <td>{{ weekdayLabel(s.weekday) }}</td>
                    <td>{{ s.scheduleLabel }}</td>
                    <td>{{ s.courseName }}</td>
                    <td>{{ s.subjectName }}</td>
                    <td>{{ s.classroom || '-' }}</td>
                  </tr>
                } @empty {
                  <tr><td colspan="5" class="text-center text-muted py-4">Sin horario asignado.</td></tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div class="card border-0 shadow-sm">
        <div class="card-body p-4">
          <h3 class="h5 mb-3">Mis estudiantes</h3>
          <div class="table-responsive">
            <table class="table table-striped align-middle mb-0">
              <thead>
                <tr>
                  <th>Matricula</th>
                  <th>Nombres</th>
                  <th>Curso</th>
                </tr>
              </thead>
              <tbody>
                @for (s of students; track s.id) {
                  <tr>
                    <td>{{ s.enrollmentNumber }}</td>
                    <td>{{ s.fullName }}</td>
                    <td>{{ s.courseName }}</td>
                  </tr>
                } @empty {
                  <tr><td colspan="3" class="text-center text-muted py-4">Sin estudiantes asignados.</td></tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `
})
export class MyTeachingComponent implements OnInit {
  private http = inject(HttpClient);

  students: AcademicStudent[] = [];
  schedules: Array<{ id: number; courseId: number; courseName: string; periodId: number; periodName: string; scheduleLabel: string; subjectId: number; subjectName: string; teacherId: number; teacherName: string; weekday: number; classroom: string | null }> = [];

  ngOnInit(): void {
    this.http.get<AcademicStudent[]>(`${API_URL}/self/my-students`).pipe(
      catchError(() => of([]))
    ).subscribe(data => this.students = data);

    this.http.get<any[]>(`${API_URL}/self/my-teaching-schedule`).pipe(
      catchError(() => of([]))
    ).subscribe(data => this.schedules = data);
  }

  weekdayLabel(w: number): string {
    return ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado', 'Domingo'][w - 1] || '';
  }
}
