import { HttpClient } from '@angular/common/http';
import { Component, OnInit, OnDestroy, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { API_URL } from '../../../core/api.config';
import { AuthService } from '../../../core/auth.service';
import { WebSocketService } from '../../../core/websocket.service';
import { AcademicStudent, Announcement } from '../../academic/academic.models';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'app-my-teaching',
  standalone: true,
  imports: [CommonModule, FormsModule],
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
    .row-announced-low {
      background: #ecfdf5 !important;
    }
    .row-announced-low:hover {
      background: #d1fae5 !important;
    }
    .row-announced-normal {
      background: #eff6ff !important;
    }
    .row-announced-normal:hover {
      background: #dbeafe !important;
    }
    .row-announced-high {
      background: #fef3c7 !important;
    }
    .row-announced-high:hover {
      background: #fde68a !important;
    }
    .row-announced-urgent {
      background: #fef2f2 !important;
    }
    .row-announced-urgent:hover {
      background: #fee2e2 !important;
    }
    .announced-badge {
      font-size: 0.6rem;
      animation: pulse 2s infinite;
      cursor: pointer;
    }
    .announced-badge-low {
      background: #10b981 !important;
      color: #fff !important;
    }
    .announced-badge-normal {
      background: #3b82f6 !important;
      color: #fff !important;
    }
    .announced-badge-high {
      background: #f59e0b !important;
      color: #fff !important;
    }
    .announced-badge-urgent {
      background: #ef4444 !important;
      color: #fff !important;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.7; }
    }
    .ann-popover {
      position: fixed; z-index: 1070;
      width: 320px; max-width: 90vw;
      background: #fff; border: 1px solid #e5e7eb;
      border-radius: 0.5rem; box-shadow: 0 8px 24px rgba(0,0,0,0.15);
      padding: 0.75rem;
      animation: fadeIn 0.15s ease;
    }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
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
              <p class="text-muted small mb-0">Horario del dia por curso.</p>
            </div>
            @if (announcedCount > 0) {
              <span class="badge text-bg-warning">
                <i class="bi bi-megaphone me-1"></i>{{ announcedCount }} hora(s) afectada(s)
              </span>
            }
          </div>

          <div class="mb-4">
            <label class="form-label fw-semibold small">Filtrar por curso</label>
            <div class="position-relative">
              <input class="form-control form-control-sm" type="text"
                     placeholder="Buscar curso... (dejar vacio para ver todos)"
                     [value]="courseSearch"
                     (input)="courseSearch = $any($event.target).value"
                     (focus)="courseDropdownOpen = true"
                     (blur)="closeCourseDropdown()">
              @if (courseDropdownOpen && filteredCourses().length > 0) {
                <div class="course-dropdown position-absolute w-100 mt-1">
                  <button class="course-dropdown-item" type="button"
                          [class.active]="selectedCourseId === null"
                          (mousedown)="clearCourseFilter(); courseSearch = ''; courseDropdownOpen = false">
                    <div class="fw-semibold">Todos los cursos</div>
                    <div class="small text-muted">Ver horario completo del dia</div>
                  </button>
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

          <div class="d-flex align-items-center justify-content-between mb-3">
            <h3 class="h5 mb-0">
              {{ selectedCourse() ? 'Horario de ' + selectedCourse()!.courseName + ' ' + selectedCourse()!.parallel : 'Horario completo del dia' }}
            </h3>
            @if (getAnnouncedBlockCount() > 0) {
              <span class="badge text-bg-warning announced-badge">
                <i class="bi bi-exclamation-triangle me-1"></i>{{ getAnnouncedBlockCount() }} con anuncio
              </span>
            }
          </div>

          <ul class="nav nav-tabs nav-tabs-sm mb-3">
            @for (day of scheduleWeekdays; track day.value) {
              @if (entriesByDay(day.value).length > 0) {
                <li class="nav-item">
                  <button class="nav-link" [class.active]="selectedScheduleDay === day.value"
                          type="button" (click)="selectedScheduleDay = day.value">
                    {{ day.short }}
                    @if (hasAnnouncedEntry(day.value)) {
                      <span class="badge rounded-pill text-bg-warning ms-1" style="font-size:0.5rem">!</span>
                    }
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
                  @if (!selectedCourseId) {
                    <th>Curso</th>
                  }
                  <th>Materia</th>
                  <th>Docente</th>
                  <th>Aula</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                @for (entry of entriesByDay(selectedScheduleDay); track entry.id) {
                  <tr [class]="getRowClass(entry)">
                    <td class="align-top">
                      <div class="fw-semibold">{{ entry.scheduleLabel }}</div>
                      <div class="small text-muted">{{ entry.startTime }} - {{ entry.endTime }}</div>
                    </td>
                    @if (!selectedCourseId) {
                      <td class="align-top">
                        <span class="badge text-bg-light">{{ entry.courseName }}</span>
                      </td>
                    }
                    <td class="align-top">{{ entry.subjectName }}</td>
                    <td class="align-top">{{ entry.teacherName }}</td>
                    <td class="align-top">{{ entry.classroom || '-' }}</td>
                    <td class="align-top">
                      @if (isAnnounced(entry)) {
                        <span class="badge announced-badge ann-trigger" [ngClass]="getBadgeClass(entry)" (click)="togglePopover(getAnnouncedForEntry(entry), $event)">
                          <i class="bi bi-megaphone"></i>
                        </span>
                      }
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td [attr.colspan]="selectedCourseId ? 5 : 6" class="text-center text-muted py-4">
                      Sin horas clase este dia.
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          @if (getAnnouncedEntries().length > 0 && selectedScheduleDay) {
            <div class="mt-3">
              <h6 class="small fw-semibold text-warning mb-2">
                <i class="bi bi-megaphone me-1"></i>Anuncios para este dia
              </h6>
              @for (ann of getAnnouncedForDay(selectedScheduleDay); track ann.id) {
                <div class="alert alert-warning py-2 px-3 mb-2 small">
                  <strong>{{ ann.title }}</strong>
                  <span class="text-muted ms-1">· {{ ann.description }}</span>
                </div>
              }
            </div>
          }

          @if (selectedCourseId) {
            <hr class="my-4">
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
          }
        </div>
      </div>
    </div>

    @if (popoverAnnouncement) {
      <div class="ann-popover" (click)="$event.stopPropagation()">
        <div class="d-flex align-items-center gap-2 mb-2">
          <span class="badge" [ngClass]="{
            'text-bg-success': popoverAnnouncement.type === 'EVENT',
            'text-bg-primary': popoverAnnouncement.type === 'TASK',
            'text-bg-danger': popoverAnnouncement.type === 'ALERT'
          }">
            @if (popoverAnnouncement.type === 'EVENT') { Evento }
            @if (popoverAnnouncement.type === 'TASK') { Tarea }
            @if (popoverAnnouncement.type === 'ALERT') { Alerta }
          </span>
          @if (popoverAnnouncement.priority === 'HIGH' || popoverAnnouncement.priority === 'URGENT') {
            <span class="badge" [ngClass]="{'text-bg-warning': popoverAnnouncement.priority === 'HIGH', 'text-bg-danger': popoverAnnouncement.priority === 'URGENT'}">
              {{ popoverAnnouncement.priority === 'URGENT' ? 'Urgente' : 'Alta' }}
            </span>
          }
          @if (popoverAnnouncement.courseName) {
            <span class="badge text-bg-secondary">{{ popoverAnnouncement.courseName }}</span>
          }
        </div>
        <h6 class="mb-1 small">{{ popoverAnnouncement.title }}</h6>
        <p class="text-muted mb-2" style="font-size:0.78rem">{{ popoverAnnouncement.description }}</p>
        @if (popoverAnnouncement.schedules && popoverAnnouncement.schedules.length > 0) {
          <div class="d-flex flex-wrap gap-1 mb-2">
            @for (s of popoverAnnouncement.schedules; track $index) {
              <span class="badge text-bg-light border" style="font-size:0.65rem">
                {{ s.weekdayLabel }} {{ s.scheduleDate }}: {{ s.blockLabel }}
              </span>
            }
          </div>
        }
        <div class="d-flex align-items-center justify-content-between text-muted" style="font-size:0.7rem">
          <span><i class="bi bi-person me-1"></i>{{ popoverAnnouncement.createdByName }}</span>
          <span><i class="bi bi-clock me-1"></i>{{ popoverAnnouncement.createdAt | date:'dd/MM HH:mm' }}</span>
        </div>
      </div>
    }
  `
})
export class MyTeachingComponent implements OnInit, OnDestroy {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private ws = inject(WebSocketService);
  private wsSubs: Subscription[] = [];

  errorMessage = '';
  courses: TeacherCourse[] = [];
  selectedCourseId: number | null = null;
  courseSearch = '';
  courseDropdownOpen = false;
  allSchedule: CourseScheduleEntry[] = [];
  selectedScheduleDay = this.todayWeekday();
  courseStudents: AcademicStudent[] = [];
  popoverAnnouncement: Announcement | null = null;

  myAnnouncements: Announcement[] = [];
  announcedCount = 0;

  private announcedScheduleKeys = new Set<string>();
  private announcedDateBlockKeys = new Set<string>();

  ngOnInit(): void {
    this.loadCourses();
    this.loadAnnouncements();

    this.wsSubs.push(
      this.ws.onAnnouncement().subscribe(() => {
        this.loadAnnouncements();
      }),
      this.ws.onScheduleChange().subscribe(() => {
        this.loadAnnouncements();
        this.loadAllSchedules();
      })
    );
  }

  ngOnDestroy(): void {
    this.wsSubs.forEach(s => s.unsubscribe());
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(e: MouseEvent): void {
    const target = e.target as HTMLElement;
    if (!target.closest('.ann-popover') && !target.closest('.ann-trigger')) {
      this.popoverAnnouncement = null;
    }
  }

  togglePopover(ann: Announcement, event: MouseEvent): void {
    event.stopPropagation();
    this.popoverAnnouncement = this.popoverAnnouncement?.id === ann.id ? null : ann;
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

  selectCourse(courseId: number): void {
    this.selectedCourseId = courseId;
    this.selectedScheduleDay = this.todayWeekday();
    this.loadCourseSchedule(courseId);
    this.loadCourseStudents(courseId);
  }

  clearCourseFilter(): void {
    this.selectedCourseId = null;
    this.courseStudents = [];
    this.selectedScheduleDay = this.todayWeekday();
  }

  readonly scheduleWeekdays = [
    { value: 1, short: 'Lun' },
    { value: 2, short: 'Mar' },
    { value: 3, short: 'Mie' },
    { value: 4, short: 'Jue' },
    { value: 5, short: 'Vie' },
    { value: 6, short: 'Sab' }
  ];

  get currentSchedule(): CourseScheduleEntry[] {
    return this.selectedCourseId
      ? this.allSchedule.filter(e => e.courseId === this.selectedCourseId)
      : this.allSchedule;
  }

  entriesByDay(weekday: number): CourseScheduleEntry[] {
    return this.currentSchedule.filter(e => e.weekday === weekday);
  }

  isAnnounced(entry: CourseScheduleEntry): boolean {
    return this.announcedScheduleKeys.has(`${entry.weekday}_${entry.scheduleBlockId}`);
  }

  hasAnnouncedEntry(weekday: number): boolean {
    return this.currentSchedule.some(e =>
      e.weekday === weekday && this.announcedScheduleKeys.has(`${e.weekday}_${e.scheduleBlockId}`)
    );
  }

  getAnnouncedBlockCount(): number {
    return this.currentSchedule.filter(e =>
      this.announcedScheduleKeys.has(`${e.weekday}_${e.scheduleBlockId}`)
    ).length;
  }

  getAnnouncedForEntry(entry: CourseScheduleEntry): Announcement | null {
    for (const ann of this.myAnnouncements) {
      for (const s of ann.schedules) {
        if (s.weekday === entry.weekday && s.scheduleBlockId === entry.scheduleBlockId) {
          return ann;
        }
      }
    }
    return null;
  }

  getRowClass(entry: CourseScheduleEntry): string {
    const ann = this.getAnnouncedForEntry(entry);
    if (!ann) return '';
    return `row-announced-${ann.priority.toLowerCase()}`;
  }

  getBadgeClass(entry: CourseScheduleEntry): string {
    const ann = this.getAnnouncedForEntry(entry);
    if (!ann) return 'announced-badge';
    return `announced-badge announced-badge-${ann.priority.toLowerCase()}`;
  }

  getAnnouncedEntries(): CourseScheduleEntry[] {
    return this.currentSchedule.filter(e =>
      this.announcedScheduleKeys.has(`${e.weekday}_${e.scheduleBlockId}`)
    );
  }

  getAnnouncedForDay(weekday: number): Announcement[] {
    return this.myAnnouncements.filter(ann =>
      ann.schedules.some(s => s.weekday === weekday)
    );
  }

  private loadCourses(): void {
    this.http.get<TeacherCourse[]>(`${API_URL}/self/my-courses`).pipe(
      catchError(() => of([]))
    ).subscribe(data => {
      this.courses = data;
      this.loadAllSchedules();
    });
  }

  private loadAllSchedules(): void {
    if (this.courses.length === 0) return;
    const allEntries: CourseScheduleEntry[] = [];
    let loaded = 0;
    for (const course of this.courses) {
      this.http.get<CourseScheduleEntry[]>(`${API_URL}/schedules/by-course/${course.courseId}`).pipe(
        catchError(() => of([]))
      ).subscribe(data => {
        allEntries.push(...data);
        loaded++;
        if (loaded === this.courses.length) {
          this.allSchedule = allEntries.sort((a, b) => a.weekday - b.weekday || (a.blockOrder ?? 0) - (b.blockOrder ?? 0));
        }
      });
    }
  }

  private loadCourseSchedule(courseId: number): void {
    this.http.get<CourseScheduleEntry[]>(`${API_URL}/schedules/by-course/${courseId}`).pipe(
      catchError(() => of([]))
    ).subscribe(data => {
      this.allSchedule = data;
    });
  }

  private loadCourseStudents(courseId: number): void {
    this.http.get<AcademicStudent[]>(`${API_URL}/self/my-courses/${courseId}/students`).pipe(
      catchError(() => of([]))
    ).subscribe(data => this.courseStudents = data);
  }

  private loadAnnouncements(): void {
    this.http.get<Announcement[]>(`${API_URL}/announcements/my`).pipe(
      catchError(() => of([]))
    ).subscribe(data => {
      this.myAnnouncements = data;
      this.buildAnnouncedKeys();
    });
  }

  private buildAnnouncedKeys(): void {
    this.announcedScheduleKeys.clear();
    this.announcedDateBlockKeys.clear();
    this.announcedCount = 0;
    for (const ann of this.myAnnouncements) {
      for (const s of ann.schedules) {
        this.announcedScheduleKeys.add(`${s.weekday}_${s.scheduleBlockId}`);
        this.announcedDateBlockKeys.add(`${s.scheduleDate}_${s.scheduleBlockId}`);
        this.announcedCount++;
      }
    }
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
  blockOrder?: number;
};
