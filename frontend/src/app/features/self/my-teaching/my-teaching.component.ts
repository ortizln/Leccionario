import { HttpClient } from '@angular/common/http';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { API_URL } from '../../../core/api.config';
import { AuthService } from '../../../core/auth.service';
import { AcademicStudent } from '../../academic/academic.models';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'app-my-teaching',
  standalone: true,
  imports: [FormsModule],
  styles: [`
    .course-dropdown {
      max-height: 280px; overflow-y: auto; z-index: 1060;
      background: var(--app-surface); border: 1px solid var(--app-border);
      border-radius: var(--radius-lg); box-shadow: 0 8px 24px rgba(0,0,0,0.12);
    }
    .course-dropdown-item {
      display: block; width: 100%; padding: 0.6rem 0.75rem; text-align: left;
      background: none; border: none; border-bottom: 1px solid var(--app-border);
      cursor: pointer; transition: background 0.1s;
    }
    .course-dropdown-item:last-child { border-bottom: none; }
    .course-dropdown-item:hover, .course-dropdown-item.active {
      background: rgba(85, 107, 47, 0.06);
    }
  `],
  template: `
    <div class="d-grid gap-4">
      @if (errorMessage) {
        <div class="alert alert-warning mb-0">{{ errorMessage }}</div>
      }

      <div class="card border-0 shadow-sm">
        <div class="card-body p-4">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <div>
              <h2 class="h5 mb-0">Mi carga academica</h2>
              <p class="text-muted small mb-0">
                Periodo {{ journal?.periodName || '...' }} · Horarios y leccionario por dia.
              </p>
            </div>
          </div>

          <ul class="nav nav-tabs mb-4">
            <li class="nav-item">
              <button class="nav-link" [class.active]="activeTab === 'cursos'" (click)="activeTab = 'cursos'">
                <i class="bi bi-book me-1"></i>Cursos
              </button>
            </li>
            <li class="nav-item">
              <button class="nav-link" [class.active]="activeTab === 'leccionario'" (click)="activeTab = 'leccionario'">
                <i class="bi bi-journal-text me-1"></i>Leccionario
              </button>
            </li>
          </ul>

          @if (activeTab === 'cursos') {
            <div class="mb-4">
              <label class="form-label fw-semibold small">Selecciona un curso</label>
              <div class="position-relative">
                <input class="form-control form-control-sm" type="text"
                       placeholder="Buscar curso..."
                       [value]="courseSearch"
                       (input)="courseSearch = $any($event.target).value"
                       (focus)="courseDropdownOpen = true"
                       (blur)="closeCourseDropdown()">
                @if (courseDropdownOpen && filteredCourses().length > 0) {
                  <div class="course-dropdown position-absolute w-100 mt-1">
                    @for (course of filteredCourses(); track course.courseId) {
                      <button class="course-dropdown-item" type="button"
                              [class.active]="selectedCourseId === course.courseId"
                              (mousedown)="selectCourse(course.courseId); courseSearch = ''; courseDropdownOpen = false">
                        <div class="fw-semibold">{{ course.courseName }} {{ course.parallel }}</div>
                        <div class="small text-muted">{{ course.level }} · {{ course.subjectNames.join(', ') }}</div>
                      </button>
                    }
                  </div>
                }
              </div>
              @if (selectedCourse()) {
                <div class="mt-2 d-flex flex-wrap gap-1">
                  @for (subj of selectedCourse()!.subjectNames; track subj) {
                    <span class="badge rounded-pill text-bg-light">{{ subj }}</span>
                  }
                  <span class="badge rounded-pill text-bg-secondary">{{ selectedCourse()!.scheduleCount }} horas clase</span>
                </div>
              }
            </div>

            @if (selectedCourseId) {
              <div class="row g-4">
                <div class="col-12 col-lg-6">
                  <h3 class="h5 mb-3">Horario del curso</h3>
                  <ul class="nav nav-tabs nav-tabs-sm mb-3">
                    @for (day of scheduleWeekdays; track day.value) {
                      @if (scheduleEntriesByDay(day.value).length > 0) {
                        <li class="nav-item">
                          <button class="nav-link" [class.active]="selectedScheduleDay === day.value"
                                  type="button" (click)="selectedScheduleDay = day.value">
                            {{ day.short }}
                          </button>
                        </li>
                      }
                    }
                  </ul>
                  <div class="table-responsive">
                    <table class="table table-xs table-hover align-middle mb-0">
                      <thead>
                        <tr>
                          <th>Hora Clase</th>
                          <th>Materia</th>
                          <th>Aula</th>
                        </tr>
                      </thead>
                      <tbody>
                        @for (entry of scheduleEntriesByDay(selectedScheduleDay); track entry.id) {
                          <tr>
                            <td class="align-top">
                              <div class="fw-semibold">{{ entry.scheduleLabel }}</div>
                              <div class="small text-muted">{{ entry.startTime }} - {{ entry.endTime }}</div>
                            </td>
                            <td class="align-top">{{ entry.subjectName }}</td>
                            <td class="align-top">{{ entry.classroom || '-' }}</td>
                          </tr>
                        } @empty {
                          <tr>
                            <td colspan="3" class="text-center text-muted py-4">
                              Sin horas clase este dia.
                            </td>
                          </tr>
                        }
                      </tbody>
                    </table>
                  </div>
                </div>
                <div class="col-12 col-lg-6">
                  <h3 class="h5 mb-3">Estudiantes del curso ({{ courseStudents.length }})</h3>
                  <div class="table-responsive">
                    <table class="table table-xs table-hover align-middle mb-0">
                      <thead>
                        <tr>
                          <th>Matricula</th>
                          <th>Nombres</th>
                          <th>Identificacion</th>
                        </tr>
                      </thead>
                      <tbody>
                        @for (s of courseStudents; track s.id) {
                          <tr>
                            <td>{{ s.enrollmentNumber }}</td>
                            <td>{{ s.fullName }}</td>
                            <td>{{ s.identification }}</td>
                          </tr>
                        } @empty {
                          <tr><td colspan="3" class="text-center text-muted py-4">Sin estudiantes en este curso.</td></tr>
                        }
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            }
          }

          @if (activeTab === 'leccionario') {
            <div class="d-flex align-items-center justify-content-between mb-3">
              <div></div>
              <div class="d-flex align-items-center gap-2">
                <button class="btn btn-sm btn-outline-secondary" type="button" (click)="goToday()">Hoy</button>
                <button class="btn btn-sm btn-outline-primary" type="button" (click)="prevWeek()">
                  <i class="bi bi-chevron-left"></i>
                </button>
                <button class="btn btn-sm btn-outline-primary" type="button" (click)="nextWeek()">
                  <i class="bi bi-chevron-right"></i>
                </button>
              </div>
            </div>

            <ul class="nav nav-tabs mb-4">
              @for (day of weekDays; track day.date) {
                <li class="nav-item">
                  <button class="nav-link text-center" [class.active]="selectedWeekday === day.weekday"
                          (click)="selectDay(day.weekday)">
                    <div class="small">{{ day.dayLabel }}</div>
                    <div class="small fw-semibold">{{ day.numDay }}</div>
                  </button>
                </li>
              }
            </ul>

            @if (selectedDay(); as day) {
              <div class="mb-3 text-muted small">
                {{ day.logDate }} · {{ day.entries.length }} horas clase
              </div>

              <div class="table-responsive">
                <table class="table table-hover align-middle mb-0">
                  <thead>
                    <tr>
                      <th>Hora Clase</th>
                      <th>Curso</th>
                      <th>Materia</th>
                      <th>Unidad didactica</th>
                      <th>Tema</th>
                      <th>Estado</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (entry of day.entries; track entry.entryId) {
                      <tr>
                        <td class="align-top">
                          <div class="fw-semibold">{{ entry.scheduleLabel }}</div>
                          <div class="small text-muted">{{ entry.startTime }} - {{ entry.endTime }}</div>
                        </td>
                        <td class="align-top">{{ entry.courseName }}</td>
                        <td class="align-top">{{ entry.subjectName }}</td>
                        <td class="align-top">
                          @if (editingEntryId === entry.entryId) {
                            <textarea class="form-control form-control-sm" rows="2"
                                      [(ngModel)]="entry.didacticUnit"
                                      placeholder="Unidad didactica"></textarea>
                          } @else {
                            <span>{{ entry.didacticUnit || '-' }}</span>
                          }
                        </td>
                        <td class="align-top">
                          @if (editingEntryId === entry.entryId) {
                            <textarea class="form-control form-control-sm" rows="2"
                                      [(ngModel)]="entry.topic"
                                      placeholder="Tema"></textarea>
                          } @else {
                            <span>{{ entry.topic || '-' }}</span>
                          }
                        </td>
                        <td class="align-top">
                          <span class="badge rounded-pill" [class.text-bg-success]="entry.teacherSignatureStatus === 'SIGNED'"
                                [class.text-bg-secondary]="entry.teacherSignatureStatus !== 'SIGNED'">
                            {{ entry.teacherSignatureStatus === 'SIGNED' ? 'Firmado' : 'Pendiente' }}
                          </span>
                        </td>
                        <td class="text-end align-top">
                          @if (editingEntryId === entry.entryId) {
                            <div class="d-grid gap-1">
                              <button class="btn btn-sm btn-primary" (click)="saveEntry(entry)">Guardar</button>
                              <button class="btn btn-sm btn-outline-secondary" (click)="editingEntryId = null">Cancelar</button>
                            </div>
                          } @else {
                            <button class="btn btn-sm btn-outline-primary"
                                    [disabled]="entry.teacherSignatureStatus === 'SIGNED'"
                                    (click)="editingEntryId = entry.entryId">
                              Editar
                            </button>
                          }
                        </td>
                      </tr>
                    } @empty {
                      <tr>
                        <td colspan="7" class="text-center text-muted py-4">
                          Sin clases programadas para este dia.
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            } @else {
              <div class="text-center text-muted py-4">
                Selecciona un dia para ver el leccionario.
              </div>
            }
          }
        </div>
      </div>
    </div>
  `
})
export class MyTeachingComponent implements OnInit {
  private http = inject(HttpClient);
  private auth = inject(AuthService);

  canManage = this.auth.hasPermission('LESSONPLAN_MANAGE');
  errorMessage = '';
  activeTab: 'cursos' | 'leccionario' = 'cursos';
  students: AcademicStudent[] = [];
  courses: TeacherCourse[] = [];
  selectedCourseId: number | null = null;
  courseSearch = '';
  courseDropdownOpen = false;
  courseSchedule: CourseScheduleEntry[] = [];
  selectedScheduleDay = this.todayWeekday();
  courseStudents: AcademicStudent[] = [];
  journal: WeeklyJournalResponse | null = null;
  selectedWeekday = this.todayWeekday();
  editingEntryId: number | null = null;
  currentDate = this.today();
  weekOffset = 0;

  ngOnInit(): void {
    this.loadCourses();
    this.loadJournal();
  }

  get weekDays(): Array<{ date: string; dayLabel: string; numDay: string; weekday: number }> {
    const current = new Date(this.currentDate + 'T12:00:00');
    const monday = new Date(current);
    monday.setDate(current.getDate() - ((current.getDay() + 6) % 7));
    const labels = ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return {
        date: d.toISOString().slice(0, 10),
        dayLabel: labels[i],
        numDay: d.getDate().toString(),
        weekday: i + 1
      };
    });
  }

  selectedDay(): WeeklyJournalDayResponse | undefined {
    return this.journal?.days.find(d => d.weekday === this.selectedWeekday);
  }

  selectDay(weekday: number): void {
    this.selectedWeekday = weekday;
  }

  selectCourse(courseId: number): void {
    this.selectedCourseId = courseId;
    this.selectedScheduleDay = this.todayWeekday();
    this.loadCourseSchedule(courseId);
    this.loadCourseStudents(courseId);
  }

  filteredCourses(): TeacherCourse[] {
    const term = this.courseSearch.toLowerCase().trim();
    if (!term) return this.courses;
    return this.courses.filter(c =>
      c.courseName.toLowerCase().includes(term) ||
      c.parallel.toLowerCase().includes(term) ||
      c.level.toLowerCase().includes(term) ||
      c.subjectNames.some(s => s.toLowerCase().includes(term))
    );
  }

  selectedCourse(): TeacherCourse | undefined {
    return this.courses.find(c => c.courseId === this.selectedCourseId);
  }

  closeCourseDropdown(): void {
    setTimeout(() => { this.courseDropdownOpen = false; }, 150);
  }

  prevWeek(): void {
    this.weekOffset--;
    this.updateCurrentDateFromOffset();
    this.loadJournal();
  }

  nextWeek(): void {
    this.weekOffset++;
    this.updateCurrentDateFromOffset();
    this.loadJournal();
  }

  goToday(): void {
    this.weekOffset = 0;
    this.currentDate = this.today();
    this.selectedWeekday = this.todayWeekday();
    this.loadJournal();
  }

  weekdayLabel(weekday: number): string {
    const labels = ['', 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado'];
    return labels[weekday] || '';
  }

  readonly scheduleWeekdays = [
    { value: 1, short: 'Lun' },
    { value: 2, short: 'Mar' },
    { value: 3, short: 'Mie' },
    { value: 4, short: 'Jue' },
    { value: 5, short: 'Vie' },
    { value: 6, short: 'Sab' }
  ];

  scheduleEntriesByDay(weekday: number): CourseScheduleEntry[] {
    return this.courseSchedule.filter(e => e.weekday === weekday);
  }

  saveEntry(entry: JournalEntry): void {
    this.http.put(`${API_URL}/daily-logs/${entry.dailyLogId}/entries/${entry.entryId}`, {
      didacticUnit: entry.didacticUnit,
      topic: entry.topic,
      specificNotes: entry.specificNotes,
      generalNotes: entry.generalNotes,
      signed: entry.teacherSignatureStatus === 'SIGNED'
    }).subscribe({
      next: () => {
        this.editingEntryId = null;
      },
      error: (error) => {
        this.errorMessage = error?.error?.message ?? 'No se pudo guardar la entrada.';
      }
    });
  }

  private loadCourses(): void {
    this.http.get<TeacherCourse[]>(`${API_URL}/self/my-courses`).pipe(
      catchError(() => of([]))
    ).subscribe(data => {
      this.courses = data;
      if (data.length > 0) {
        this.selectCourse(data[0].courseId);
      }
    });
  }

  private loadCourseSchedule(courseId: number): void {
    this.http.get<CourseScheduleEntry[]>(`${API_URL}/schedules/by-course/${courseId}`).pipe(
      catchError(() => of([]))
    ).subscribe(data => this.courseSchedule = data);
  }

  private loadCourseStudents(courseId: number): void {
    this.http.get<AcademicStudent[]>(`${API_URL}/self/my-courses/${courseId}/students`).pipe(
      catchError(() => of([]))
    ).subscribe(data => this.courseStudents = data);
  }

  private loadJournal(): void {
    this.http.get<WeeklyJournalResponse>(`${API_URL}/self/my-weekly-journal?weekOffset=${this.weekOffset}`).pipe(
      catchError(() => {
        this.errorMessage = 'No se pudo cargar el leccionario semanal.';
        return of(null);
      })
    ).subscribe(data => {
      this.journal = data;
      if (data?.days) {
        const todayWeekday = this.todayWeekday();
        const todayEntry = data.days.find(d => d.weekday === todayWeekday && d.entries.length > 0);
        if (todayEntry) {
          this.selectedWeekday = todayWeekday;
        } else {
          const firstWithEntries = data.days.find(d => d.entries.length > 0);
          if (firstWithEntries) {
            this.selectedWeekday = firstWithEntries.weekday;
          }
        }
      }
    });
  }

  private updateCurrentDateFromOffset(): void {
    const today = new Date();
    const monday = new Date(today);
    monday.setDate(today.getDate() - ((today.getDay() + 6) % 7) + this.weekOffset * 7);
    this.currentDate = monday.toISOString().slice(0, 10);
  }

  private today(): string {
    return new Date().toISOString().slice(0, 10);
  }

  private todayWeekday(): number {
    const day = new Date().getDay();
    return day === 0 ? 1 : day;
  }
}

type TeacherCourse = {
  courseId: number;
  courseName: string;
  parallel: string;
  level: string;
  section: string | null;
  subLevel: string | null;
  grade: number | null;
  subjectNames: string[];
  scheduleCount: number;
};

type CourseScheduleEntry = {
  id: number;
  courseId: number;
  courseName: string;
  periodId: number;
  periodName: string;
  scheduleBlockId: number;
  scheduleLabel: string;
  subjectId: number;
  subjectName: string;
  teacherId: number;
  teacherName: string;
  weekday: number;
  startTime: string;
  endTime: string;
  classroom: string | null;
};

type WeeklyJournalResponse = {
  teacherName: string;
  periodName: string;
  weekStart: string;
  days: WeeklyJournalDayResponse[];
};

type WeeklyJournalDayResponse = {
  weekday: number;
  weekdayLabel: string;
  logDate: string;
  entries: JournalEntry[];
};

type JournalEntry = {
  dailyLogId: number;
  entryId: number;
  courseName: string;
  scheduleLabel: string;
  startTime: string;
  endTime: string;
  subjectName: string;
  teacherName: string;
  blockType: string;
  didacticUnit: string | null;
  topic: string | null;
  specificNotes: string | null;
  generalNotes: string | null;
  teacherSignatureStatus: string;
  closeToken: string;
};
