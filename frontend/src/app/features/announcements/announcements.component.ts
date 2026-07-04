import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { catchError, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../core/api.config';
import { AuthService } from '../../core/auth.service';
import { Announcement, AcademicCourse, ScheduleBlockItem, AnnouncementScheduleItem } from '../academic/academic.models';

@Component({
  selector: 'app-announcements',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="card border-0 shadow-sm h-100">
      <div class="card-body p-4 d-grid gap-4">
        <div class="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3">
          <div>
            <h2 class="h4 mb-1"><i class="bi bi-megaphone me-2"></i>Anuncios</h2>
            <p class="text-muted mb-0">Gestiona eventos, tareas y alertas para la comunidad educativa.</p>
          </div>
          @if (canManage) {
            <button class="btn btn-sm btn-primary" type="button" (click)="openEditor()">
              <i class="bi bi-plus-lg me-2"></i>Nuevo anuncio
            </button>
          }
        </div>

        <div class="row g-3">
          <div class="col-12 col-md-4">
            <label class="form-label fw-semibold small">Filtrar por tipo</label>
            <select class="form-select form-select-sm" [(ngModel)]="filterType">
              <option value="all">Todos</option>
              <option value="EVENT">Eventos</option>
              <option value="TASK">Tareas</option>
              <option value="ALERT">Alertas</option>
            </select>
          </div>
          <div class="col-12 col-md-4">
            <label class="form-label fw-semibold small">Buscar</label>
            <input class="form-control form-control-sm" type="text" [(ngModel)]="search" placeholder="Titulo o descripcion">
          </div>
        </div>

        @if (loading) {
          <div class="text-center py-5">
            <div class="spinner-border text-primary"></div>
          </div>
        } @else if (filteredAnnouncements.length === 0) {
          <div class="text-center py-5 text-muted">
            <i class="bi bi-megaphone" style="font-size:3rem"></i>
            <p class="mt-3 mb-0">No hay anuncios para mostrar.</p>
          </div>
        } @else {
          <div class="d-grid gap-3">
            @for (ann of filteredAnnouncements; track ann.id) {
              <div class="card border" [class.border-danger]="ann.priority === 'URGENT'" [class.border-warning]="ann.priority === 'HIGH'">
                <div class="card-body">
                  <div class="d-flex justify-content-between align-items-start gap-3">
                    <div class="flex-grow-1">
                      <div class="d-flex align-items-center gap-2 mb-2 flex-wrap">
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
                        @if (ann.courseName) {
                          <span class="badge text-bg-secondary"><i class="bi bi-book me-1"></i>{{ ann.courseName }}</span>
                        } @else {
                          <span class="badge text-bg-info"><i class="bi bi-globe me-1"></i>General</span>
                        }
                        @if (!ann.read) {
                          <span class="badge rounded-pill text-bg-danger">Nuevo</span>
                        }
                      </div>
                      <h6 class="mb-1">{{ ann.title }}</h6>
                      <p class="text-muted small mb-2">{{ ann.description }}</p>
                      <div class="d-flex align-items-center gap-3 text-muted small flex-wrap">
                        @if (ann.schedules && ann.schedules.length > 0) {
                          <span class="d-inline-flex align-items-center gap-1">
                            <i class="bi bi-clock-history me-1"></i>
                            @for (group of groupSchedulesByWeekday(ann.schedules); track group.weekday) {
                              <span class="badge text-bg-light border small">
                                {{ group.weekdayLabel }}:
                                @for (b of group.blocks; track b.scheduleBlockId; let last = $last) {
                                  {{ b.blockLabel }}{{ last ? '' : ', ' }}
                                }
                              </span>
                            }
                          </span>
                        } @else if (ann.eventDate) {
                          <span><i class="bi bi-calendar3 me-1"></i>{{ ann.eventDate | date:'dd/MM/yyyy' }}@if (ann.eventEndDate) { - {{ ann.eventEndDate | date:'dd/MM/yyyy' }} }</span>
                        }
                        <span><i class="bi bi-person me-1"></i>{{ ann.createdByName }}</span>
                        <span><i class="bi bi-clock me-1"></i>{{ ann.createdAt | date:'dd/MM HH:mm' }}</span>
                      </div>
                    </div>
                    <div class="d-flex gap-1">
                      @if (!ann.read) {
                        <button class="btn btn-sm btn-outline-success" type="button" (click)="markRead(ann)" title="Marcar como leido">
                          <i class="bi bi-check-lg"></i>
                        </button>
                      }
                      @if (canManage) {
                        <button class="btn btn-sm btn-outline-primary" type="button" (click)="openEditor(ann)" title="Editar">
                          <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger" type="button" (click)="confirmDelete = ann" title="Eliminar">
                          <i class="bi bi-trash"></i>
                        </button>
                      }
                    </div>
                  </div>
                </div>
              </div>
            }
          </div>
        }
      </div>
    </div>

    @if (editorOpen) {
      <div class="modal-shell" (click)="closeEditor()">
        <div class="modal-card" style="max-width:700px" (click)="$event.stopPropagation()">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h5 class="mb-0">{{ editingId ? 'Editar anuncio' : 'Nuevo anuncio' }}</h5>
            <button class="btn btn-sm btn-outline-secondary" type="button" (click)="closeEditor()"><i class="bi bi-x-lg"></i></button>
          </div>
          <form (ngSubmit)="save()" class="d-grid gap-3">
            <div>
              <label class="form-label fw-semibold small">Titulo *</label>
              <input class="form-control form-control-sm" type="text" [(ngModel)]="form.title" name="title" required maxlength="200">
            </div>
            <div>
              <label class="form-label fw-semibold small">Descripcion *</label>
              <textarea class="form-control form-control-sm" rows="3" [(ngModel)]="form.description" name="description" required></textarea>
            </div>
            <div class="row g-3">
              <div class="col-12 col-md-4">
                <label class="form-label fw-semibold small">Tipo *</label>
                <select class="form-select form-select-sm" [(ngModel)]="form.type" name="type" required>
                  <option value="EVENT">Evento</option>
                  <option value="TASK">Tarea</option>
                  <option value="ALERT">Alerta</option>
                </select>
              </div>
              <div class="col-12 col-md-4">
                <label class="form-label fw-semibold small">Prioridad</label>
                <select class="form-select form-select-sm" [(ngModel)]="form.priority" name="priority">
                  <option value="LOW">Baja</option>
                  <option value="NORMAL">Normal</option>
                  <option value="HIGH">Alta</option>
                  <option value="URGENT">Urgente</option>
                </select>
              </div>
              <div class="col-12 col-md-4">
                <label class="form-label fw-semibold small">Curso (opcional)</label>
                <select class="form-select form-select-sm" [(ngModel)]="form.courseId" name="courseId">
                  <option [ngValue]="null">Todos (General)</option>
                  @for (course of courses; track course.id) {
                    <option [ngValue]="course.id">{{ course.name }} {{ course.parallel }}</option>
                  }
                </select>
              </div>
            </div>

            <div>
              <label class="form-label fw-semibold small">
                <i class="bi bi-clock-history me-1"></i>Horarios afectados
                <span class="text-muted fw-normal">(opcional, selecciona los bloques)</span>
              </label>
              @if (scheduleBlocks.length === 0) {
                <div class="text-muted small">Cargando bloques...</div>
              } @else {
                <div class="table-responsive">
                  <table class="table table-bordered table-xs mb-0">
                    <thead>
                      <tr class="small">
                        <th class="text-muted" style="width:100px"></th>
                        @for (block of scheduleBlocks; track block.id) {
                          <th class="text-center px-1" style="min-width:70px">
                            <div class="small fw-semibold">{{ block.label }}</div>
                            <div class="text-muted" style="font-size:0.65rem">{{ block.startTime }} - {{ block.endTime }}</div>
                          </th>
                        }
                      </tr>
                    </thead>
                    <tbody>
                      @for (day of weekdays; track day.value) {
                        <tr>
                          <td class="small fw-semibold text-muted">{{ day.label }}</td>
                          @for (block of scheduleBlocks; track block.id) {
                            <td class="text-center p-1">
                              <div class="form-check form-check-inline m-0">
                                <input
                                  class="form-check-input"
                                  type="checkbox"
                                  [checked]="isScheduleSelected(day.value, block.id)"
                                  (change)="toggleSchedule(day.value, block.id)"
                                >
                              </div>
                            </td>
                          }
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              }
              @if (form.schedules.length > 0) {
                <div class="mt-2 d-flex flex-wrap gap-1">
                  @for (s of form.schedules; track $index) {
                    <span class="badge text-bg-light border small d-inline-flex align-items-center gap-1">
                      {{ getWeekdayLabel(s.weekday) }}: {{ getBlockLabel(s.scheduleBlockId) }}
                      <button type="button" class="btn btn-link btn-sm p-0 text-decoration-none" (click)="removeSchedule($index)">
                        <i class="bi bi-x"></i>
                      </button>
                    </span>
                  }
                </div>
              }
            </div>

            <div class="row g-3">
              <div class="col-12 col-md-6">
                <label class="form-label fw-semibold small">Fecha inicio (referencia)</label>
                <input class="form-control form-control-sm" type="date" [(ngModel)]="form.eventDate" name="eventDate">
              </div>
              <div class="col-12 col-md-6">
                <label class="form-label fw-semibold small">Fecha fin (referencia)</label>
                <input class="form-control form-control-sm" type="date" [(ngModel)]="form.eventEndDate" name="eventEndDate">
              </div>
            </div>
            @if (saveError) {
              <div class="alert alert-danger py-2 small mb-0">{{ saveError }}</div>
            }
            <div class="d-flex justify-content-end gap-2 pt-2 border-top">
              <button class="btn btn-sm btn-outline-secondary" type="button" (click)="closeEditor()">Cancelar</button>
              <button class="btn btn-sm btn-primary" type="submit" [disabled]="saving">
                @if (saving) { <span class="spinner-border spinner-border-sm me-1"></span> }
                {{ editingId ? 'Actualizar' : 'Publicar' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    }

    @if (confirmDelete) {
      <div class="modal-shell" style="z-index:1060" (click)="confirmDelete = null">
        <div class="modal-card" style="max-width:420px" (click)="$event.stopPropagation()">
          <div class="text-center mb-3">
            <i class="bi bi-megaphone text-danger" style="font-size:2.5rem"></i>
          </div>
          <h5 class="text-center mb-2">Eliminar anuncio</h5>
          <p class="text-muted small text-center mb-3">
            Se eliminara <strong>{{ confirmDelete.title }}</strong>. Esta accion no se puede deshacer.
          </p>
          @if (deleteError) {
            <div class="alert alert-danger py-2 small">{{ deleteError }}</div>
          }
          <div class="d-flex justify-content-center gap-2">
            <button class="btn btn-sm btn-outline-secondary" type="button" (click)="confirmDelete = null">Cancelar</button>
            <button class="btn btn-sm btn-danger" type="button" (click)="deleteAnnouncement()" [disabled]="deleting">
              @if (deleting) { <span class="spinner-border spinner-border-sm me-1"></span> }
              Eliminar
            </button>
          </div>
        </div>
      </div>
    }
  `
})
export class AnnouncementsComponent implements OnInit {
  private http = inject(HttpClient);
  private auth = inject(AuthService);

  canManage = this.auth.hasPermission('ANNOUNCEMENT_MANAGE');

  announcements: Announcement[] = [];
  courses: AcademicCourse[] = [];
  scheduleBlocks: ScheduleBlockItem[] = [];
  loading = true;
  search = '';
  filterType = 'all';

  editorOpen = false;
  editingId: number | null = null;
  saving = false;
  saveError = '';

  confirmDelete: Announcement | null = null;
  deleting = false;
  deleteError = '';

  weekdays = [
    { value: 1, label: 'Lunes' },
    { value: 2, label: 'Martes' },
    { value: 3, label: 'Miercoles' },
    { value: 4, label: 'Jueves' },
    { value: 5, label: 'Viernes' },
    { value: 6, label: 'Sabado' },
  ];

  form = {
    title: '',
    description: '',
    type: 'EVENT',
    priority: 'NORMAL',
    eventDate: null as string | null,
    eventEndDate: null as string | null,
    courseId: null as number | null,
    schedules: [] as Array<{ weekday: number; scheduleBlockId: number }>
  };

  get filteredAnnouncements(): Announcement[] {
    let list = this.announcements;
    if (this.filterType !== 'all') {
      list = list.filter(a => a.type === this.filterType);
    }
    if (this.search.trim()) {
      const q = this.search.toLowerCase();
      list = list.filter(a => a.title.toLowerCase().includes(q) || a.description.toLowerCase().includes(q));
    }
    return list;
  }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    const url = this.canManage ? `${API_URL}/announcements` : `${API_URL}/announcements/my`;
    this.http.get<Announcement[]>(url).pipe(
      catchError(() => of([]))
    ).subscribe(data => {
      this.announcements = data;
      this.loading = false;
    });

    this.http.get<any>(`${API_URL}/academic/overview`).pipe(
      catchError(() => of({ courses: [] }))
    ).subscribe(data => {
      this.courses = data.courses ?? [];
    });

    if (this.canManage) {
      this.http.get<ScheduleBlockItem[]>(`${API_URL}/announcements/schedule-blocks`).pipe(
        catchError(() => of([]))
      ).subscribe(data => {
        this.scheduleBlocks = data;
      });
    }
  }

  openEditor(ann?: Announcement): void {
    if (ann) {
      this.editingId = ann.id;
      this.form = {
        title: ann.title,
        description: ann.description,
        type: ann.type,
        priority: ann.priority,
        eventDate: ann.eventDate,
        eventEndDate: ann.eventEndDate,
        courseId: ann.courseId,
        schedules: (ann.schedules ?? []).map(s => ({ weekday: s.weekday, scheduleBlockId: s.scheduleBlockId }))
      };
    } else {
      this.editingId = null;
      this.form = { title: '', description: '', type: 'EVENT', priority: 'NORMAL', eventDate: null, eventEndDate: null, courseId: null, schedules: [] };
    }
    this.saveError = '';
    this.editorOpen = true;
  }

  closeEditor(): void {
    this.editorOpen = false;
    this.editingId = null;
    this.saveError = '';
  }

  isScheduleSelected(weekday: number, blockId: number): boolean {
    return this.form.schedules.some(s => s.weekday === weekday && s.scheduleBlockId === blockId);
  }

  toggleSchedule(weekday: number, blockId: number): void {
    const idx = this.form.schedules.findIndex(s => s.weekday === weekday && s.scheduleBlockId === blockId);
    if (idx >= 0) {
      this.form.schedules.splice(idx, 1);
    } else {
      this.form.schedules.push({ weekday, scheduleBlockId: blockId });
    }
  }

  removeSchedule(index: number): void {
    this.form.schedules.splice(index, 1);
  }

  getWeekdayLabel(weekday: number): string {
    return this.weekdays.find(w => w.value === weekday)?.label ?? '';
  }

  getBlockLabel(blockId: number): string {
    return this.scheduleBlocks.find(b => b.id === blockId)?.label ?? '';
  }

  groupSchedulesByWeekday(schedules: AnnouncementScheduleItem[]): Array<{ weekday: number; weekdayLabel: string; blocks: AnnouncementScheduleItem[] }> {
    if (!schedules || schedules.length === 0) return [];
    const map = new Map<number, AnnouncementScheduleItem[]>();
    for (const s of schedules) {
      if (!map.has(s.weekday)) map.set(s.weekday, []);
      map.get(s.weekday)!.push(s);
    }
    return Array.from(map.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([weekday, blocks]) => ({
        weekday,
        weekdayLabel: blocks[0]?.weekdayLabel ?? this.getWeekdayLabel(weekday),
        blocks: blocks.sort((a, b) => a.blockLabel.localeCompare(b.blockLabel))
      }));
  }

  save(): void {
    if (!this.form.title.trim() || !this.form.description.trim()) return;
    this.saving = true;
    this.saveError = '';

    const payload: any = {
      title: this.form.title,
      description: this.form.description,
      type: this.form.type,
      priority: this.form.priority,
      eventDate: this.form.eventDate || null,
      eventEndDate: this.form.eventEndDate || null,
      courseId: this.form.courseId,
      schedules: this.form.schedules.length > 0 ? this.form.schedules : null
    };

    const req$ = this.editingId
      ? this.http.put(`${API_URL}/announcements/${this.editingId}`, payload)
      : this.http.post(`${API_URL}/announcements`, payload);

    req$.pipe(
      catchError(err => {
        this.saveError = err?.error?.message ?? 'Error al guardar el anuncio.';
        return of(null);
      })
    ).subscribe(res => {
      this.saving = false;
      if (res) {
        this.closeEditor();
        this.loadData();
      }
    });
  }

  markRead(ann: Announcement): void {
    this.http.put(`${API_URL}/announcements/${ann.id}/read`, {}).pipe(
      catchError(() => of(null))
    ).subscribe(() => {
      ann.read = true;
    });
  }

  deleteAnnouncement(): void {
    if (!this.confirmDelete) return;
    this.deleting = true;
    this.deleteError = '';
    this.http.delete(`${API_URL}/announcements/${this.confirmDelete.id}`).pipe(
      catchError(err => {
        this.deleteError = err?.error?.message ?? 'No se pudo eliminar el anuncio.';
        return of(null);
      })
    ).subscribe(res => {
      this.deleting = false;
      if (res !== null) {
        this.confirmDelete = null;
        this.loadData();
      }
    });
  }
}
