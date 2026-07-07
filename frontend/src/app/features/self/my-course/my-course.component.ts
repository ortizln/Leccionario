import { HttpClient } from '@angular/common/http';
import { Component, OnInit, OnDestroy, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { API_URL } from '../../../core/api.config';
import { AuthService } from '../../../core/auth.service';
import { WebSocketService } from '../../../core/websocket.service';
import { AcademicCourse, AcademicStudent, Announcement } from '../../academic/academic.models';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'app-my-course',
  standalone: true,
  imports: [CommonModule],
  styles: [`
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
      @if (myAnnouncements.length > 0) {
        <div class="card border-0 shadow-sm border-start border-4 border-warning">
          <div class="card-body p-4">
            <div class="d-flex align-items-center justify-content-between mb-3">
              <h3 class="h5 mb-0">
                <i class="bi bi-megaphone me-2 text-warning"></i>Anuncios
                <span class="badge text-bg-warning ms-2">{{ myAnnouncements.length }}</span>
              </h3>
            </div>
            <div class="d-grid gap-2">
              @for (ann of myAnnouncements; track ann.id) {
                <div class="card border" [class.border-danger]="ann.priority === 'URGENT'" [class.border-warning]="ann.priority === 'HIGH'">
                  <div class="card-body py-2 px-3">
                    <div class="d-flex align-items-start gap-2">
                      <div class="flex-grow-1">
                        <div class="d-flex align-items-center gap-2 mb-1 flex-wrap">
                          <span class="badge" [ngClass]="{
                            'text-bg-success': ann.type === 'EVENT',
                            'text-bg-primary': ann.type === 'TASK',
                            'text-bg-danger': ann.type === 'ALERT'
                          }">
                            @if (ann.type === 'EVENT') { <i class="bi bi-calendar-event me-1"></i>Evento }
                            @if (ann.type === 'TASK') { <i class="bi bi-clipboard-check me-1"></i>Tarea }
                            @if (ann.type === 'ALERT') { <i class="bi bi-exclamation-triangle me-1"></i>Alerta }
                          </span>
                          @if (ann.priority === 'HIGH' || ann.priority === 'URGENT') {
                            <span class="badge" [ngClass]="{'text-bg-warning': ann.priority === 'HIGH', 'text-bg-danger': ann.priority === 'URGENT'}">
                              {{ ann.priority === 'URGENT' ? 'Urgente' : 'Alta' }}
                            </span>
                          }
                          @if (!ann.read) {
                            <span class="badge rounded-pill text-bg-danger">Nuevo</span>
                          }
                        </div>
                        <div class="fw-semibold small">{{ ann.title }}</div>
                        <div class="text-muted" style="font-size:0.8rem">{{ ann.description }}</div>
                        @if (ann.schedules && ann.schedules.length > 0) {
                          <div class="d-flex flex-wrap gap-1 mt-1">
                            @for (group of groupSchedulesByDate(ann.schedules); track group.dateStr) {
                              <span class="badge text-bg-light border" style="font-size:0.65rem">
                                {{ group.weekdayLabel }} {{ group.dateDisplay }}:
                                @for (b of group.blocks; track b.scheduleBlockId; let last = $last) {
                                  {{ b.blockLabel }}{{ last ? '' : ', ' }}
                                }
                              </span>
                            }
                          </div>
                        }
                        <div class="text-muted mt-1" style="font-size:0.7rem">
                          <i class="bi bi-person me-1"></i>{{ ann.createdByName }} · {{ ann.createdAt | date:'dd/MM HH:mm' }}
                        </div>
                      </div>
                      @if (!ann.read) {
                        <button class="btn btn-sm btn-outline-success" type="button" (click)="markRead(ann)" title="Marcar como leido">
                          <i class="bi bi-check-lg"></i>
                        </button>
                      }
                    </div>
                  </div>
                </div>
              }
            </div>
          </div>
        </div>
      }

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

      @if (dailyLog) {
        <div class="card border-0 shadow-sm">
          <div class="card-body p-4">
            <h3 class="h5 mb-1">Leccionario del dia</h3>
            <p class="text-muted mb-3">{{ dailyLog.logDate }} · {{ dailyLog.courseName }} · {{ dailyLog.status }}</p>
            <div class="table-responsive">
              <table class="table table-xs table-hover align-middle mb-0">
                <thead>
                  <tr>
                    <th>Hora Clase</th>
                    <th>Materia</th>
                    <th>Docente</th>
                    <th>Tema</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  @for (entry of dailyLog.entries; track entry.id) {
                    @if (entry.teacherId) {
                      <tr [class]="getRowClassDaily(entry)">
                        <td>
                          <div class="fw-semibold">{{ entry.scheduleLabel }}</div>
                          <div class="small text-muted">{{ entry.startTime }} - {{ entry.endTime }}</div>
                        </td>
                        <td>{{ entry.subjectName || '-' }}</td>
                        <td>{{ entry.teacherName || '-' }}</td>
                        <td>{{ entry.topic || '-' }}</td>
                        <td>
                          @if (isAnnouncedToday(entry)) {
                            <span class="badge announced-badge ann-trigger" [ngClass]="getBadgeClassDaily(entry)" (click)="togglePopover(getAnnouncedForDailyLog(entry), $event)">
                              <i class="bi bi-megaphone"></i>
                            </span>
                          }
                        </td>
                      </tr>
                    }
                  } @empty {
                    <tr><td colspan="5" class="text-center text-muted py-4">Sin leccionario registrado para hoy.</td></tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        </div>
      }

      <div class="card border-0 shadow-sm">
        <div class="card-body p-4">
          <h3 class="h5 mb-3">Mis companeros</h3>
          <div class="table-responsive">
            <table class="table table-xs table-hover align-middle mb-0">
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
          <div class="d-flex align-items-center justify-content-between mb-3">
            <h3 class="h5 mb-0">Mi horario</h3>
            @if (announcedScheduleCount > 0) {
              <span class="badge text-bg-warning announced-badge">
                <i class="bi bi-megaphone me-1"></i>{{ announcedScheduleCount }} hora(s) con anuncio
              </span>
            }
          </div>
          <div class="table-responsive">
            <table class="table table-xs table-hover align-middle mb-0">
              <thead>
                <tr>
                  <th>Dia</th>
                  <th>Hora Clase</th>
                  <th>Materia</th>
                  <th>Docente</th>
                  <th>Aula</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                @for (s of schedules; track s.id) {
                  <tr [class]="getRowClassSchedule(s)">
                    <td>{{ weekdayLabel(s.weekday) }}</td>
                    <td>{{ s.scheduleLabel }}</td>
                    <td>{{ s.subjectName }}</td>
                    <td>{{ s.teacherName }}</td>
                    <td>{{ s.classroom || '-' }}</td>
                    <td>
                      @if (isScheduleAnnounced(s)) {
                        <span class="badge announced-badge ann-trigger" [ngClass]="getBadgeClassSchedule(s)" (click)="togglePopover(getAnnouncedForSchedule(s), $event)">
                          <i class="bi bi-megaphone"></i>
                        </span>
                      }
                    </td>
                  </tr>
                } @empty {
                  <tr><td colspan="6" class="text-center text-muted py-4">Sin horario registrado.</td></tr>
                }
              </tbody>
            </table>
          </div>
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
export class MyCourseComponent implements OnInit, OnDestroy {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private ws = inject(WebSocketService);
  private wsSubs: Subscription[] = [];

  course: AcademicCourse | null = null;
  classmates: AcademicStudent[] = [];
  schedules: ScheduleItem[] = [];
  dailyLog: DailyLogItem | null = null;
  myAnnouncements: Announcement[] = [];
  announcedScheduleCount = 0;
  popoverAnnouncement: Announcement | null = null;

  private announcedDateBlockKeys = new Set<string>();
  private announcedWeekdayBlockKeys = new Set<string>();

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

    const today = new Date().toISOString().slice(0, 10);
    this.http.get<DailyLogItem>(`${API_URL}/self/my-course-daily-log?logDate=${today}`).pipe(
      catchError(() => of(null))
    ).subscribe(data => this.dailyLog = data);

    this.loadAnnouncements();

    this.wsSubs.push(
      this.ws.onAnnouncement().subscribe(() => {
        this.loadAnnouncements();
      }),
      this.ws.onScheduleChange().subscribe(() => {
        this.loadAnnouncements();
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

  weekdayLabel(w: number): string {
    return ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado', 'Domingo'][w - 1] || '';
  }

  isScheduleAnnounced(s: ScheduleItem): boolean {
    return this.announcedWeekdayBlockKeys.has(`${s.weekday}_${s.scheduleBlockId}`);
  }

  isAnnouncedToday(entry: { scheduleBlockId?: number; scheduleLabel?: string }): boolean {
    if (!this.dailyLog) return false;
    const today = new Date().toISOString().slice(0, 10);
    return this.announcedDateBlockKeys.has(`${today}_${entry.scheduleBlockId}`);
  }

  getAnnouncementTitle(entry: { scheduleBlockId?: number }): string {
    return this.getAnnouncedForDailyLog(entry)?.title ?? '';
  }

  getAnnouncedForDailyLog(entry: { scheduleBlockId?: number }): Announcement | null {
    const today = new Date().toISOString().slice(0, 10);
    for (const ann of this.myAnnouncements) {
      for (const s of ann.schedules) {
        if (s.scheduleDate === today && s.scheduleBlockId === entry.scheduleBlockId) {
          return ann;
        }
      }
    }
    return null;
  }

  getScheduleAnnouncementTitle(s: ScheduleItem): string {
    return this.getAnnouncedForSchedule(s)?.title ?? '';
  }

  getAnnouncedForSchedule(s: ScheduleItem): Announcement | null {
    for (const ann of this.myAnnouncements) {
      for (const sched of ann.schedules) {
        if (sched.weekday === s.weekday && sched.scheduleBlockId === s.scheduleBlockId) {
          return ann;
        }
      }
    }
    return null;
  }

  getRowClassDaily(entry: { scheduleBlockId?: number }): string {
    const ann = this.getAnnouncedForDailyLog(entry);
    if (!ann) return '';
    return `row-announced-${ann.priority.toLowerCase()}`;
  }

  getBadgeClassDaily(entry: { scheduleBlockId?: number }): string {
    const ann = this.getAnnouncedForDailyLog(entry);
    if (!ann) return 'announced-badge';
    return `announced-badge announced-badge-${ann.priority.toLowerCase()}`;
  }

  getRowClassSchedule(s: ScheduleItem): string {
    const ann = this.getAnnouncedForSchedule(s);
    if (!ann) return '';
    return `row-announced-${ann.priority.toLowerCase()}`;
  }

  getBadgeClassSchedule(s: ScheduleItem): string {
    const ann = this.getAnnouncedForSchedule(s);
    if (!ann) return 'announced-badge';
    return `announced-badge announced-badge-${ann.priority.toLowerCase()}`;
  }

  groupSchedulesByDate(schedules: Announcement['schedules']): Array<{ dateStr: string; weekdayLabel: string; dateDisplay: string; blocks: Announcement['schedules'] }> {
    if (!schedules || schedules.length === 0) return [];
    const map = new Map<string, Announcement['schedules']>();
    for (const s of schedules) {
      if (!map.has(s.scheduleDate)) map.set(s.scheduleDate, []);
      map.get(s.scheduleDate)!.push(s);
    }
    return Array.from(map.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([dateStr, blocks]) => {
        const d = new Date(dateStr + 'T12:00:00');
        const dd = String(d.getDate()).padStart(2, '0');
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        return {
          dateStr,
          weekdayLabel: blocks[0]?.weekdayLabel ?? '',
          dateDisplay: `${dd}/${mm}`,
          blocks: blocks.sort((a, b) => a.blockLabel.localeCompare(b.blockLabel))
        };
      });
  }

  markRead(ann: Announcement): void {
    this.http.put(`${API_URL}/announcements/${ann.id}/read`, {}).pipe(
      catchError(() => of(null))
    ).subscribe(() => {
      ann.read = true;
    });
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
    this.announcedDateBlockKeys.clear();
    this.announcedWeekdayBlockKeys.clear();
    this.announcedScheduleCount = 0;
    for (const ann of this.myAnnouncements) {
      for (const s of ann.schedules) {
        this.announcedDateBlockKeys.add(`${s.scheduleDate}_${s.scheduleBlockId}`);
        this.announcedWeekdayBlockKeys.add(`${s.weekday}_${s.scheduleBlockId}`);
        this.announcedScheduleCount++;
      }
    }
  }
}

type ScheduleItem = {
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
  classroom: string | null;
};

type DailyLogItem = {
  id: number;
  courseId: number;
  courseName: string;
  periodId: number;
  periodName: string;
  institutionId: number;
  institutionName: string;
  workDayNumber: number | null;
  logDate: string;
  city: string | null;
  generalNotes: string | null;
  closeToken: string;
  status: string;
  closedAt: string | null;
  signatures: Array<{ id: number; signerName: string; signerRole: string; signatureType: string; signedAt: string; notes: string | null }>;
  students: Array<{ id: number; enrollmentNumber: string; fullName: string }>;
  entries: Array<{
    id: number;
    scheduleBlockId: number;
    scheduleLabel: string;
    blockType: string;
    startTime: string;
    endTime: string;
    teacherId: number | null;
    teacherName: string | null;
    subjectId: number | null;
    subjectName: string | null;
    didacticUnit: string | null;
    topic: string | null;
    closeToken: string;
    teacherSignatureStatus: string;
    teacherClosedAt: string | null;
    specificNotes: string | null;
    generalNotes: string | null;
  }>;
};
