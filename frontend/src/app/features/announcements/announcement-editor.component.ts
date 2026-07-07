import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { catchError, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../core/api.config';
import { AcademicCourse, ScheduleBlockItem } from '../academic/academic.models';

@Component({
  selector: 'app-announcement-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="card border-0 shadow-sm h-100">
      <div class="card-body p-4">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 class="h4 mb-1">
              <i class="bi bi-arrow-left me-2" style="cursor:pointer" (click)="goBack()"></i>
              {{ editingId ? 'Editar anuncio' : 'Nuevo anuncio' }}
            </h2>
            <p class="text-muted mb-0 small">{{ editingId ? 'Modifica los datos del anuncio.' : 'Crea un anuncio para la comunidad educativa.' }}</p>
          </div>
          <button class="btn btn-sm btn-outline-secondary" type="button" (click)="goBack()">
            <i class="bi bi-x-lg"></i> Cerrar
          </button>
        </div>

        <form (ngSubmit)="save()">
          <div class="row g-4">
            <div class="col-12 col-lg-7">
              <div class="card border h-100">
                <div class="card-body d-grid gap-3">
                  <h6 class="card-title"><i class="bi bi-pencil-square me-2"></i>Datos del anuncio</h6>
                  <div>
                    <label class="form-label fw-semibold small">Titulo *</label>
                    <input class="form-control form-control-sm" type="text" [(ngModel)]="form.title" name="title" required maxlength="200" placeholder="Titulo del anuncio">
                  </div>
                  <div>
                    <label class="form-label fw-semibold small">Descripcion *</label>
                    <textarea class="form-control form-control-sm" rows="4" [(ngModel)]="form.description" name="description" required placeholder="Descripcion detallada..."></textarea>
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
                      <label class="form-label fw-semibold small">Curso</label>
                      <select class="form-select form-select-sm" [(ngModel)]="form.courseId" name="courseId">
                        <option [ngValue]="null">Todos (General)</option>
                        @for (course of courses; track course.id) {
                          <option [ngValue]="course.id">{{ course.name }} {{ course.parallel }}</option>
                        }
                      </select>
                    </div>
                  </div>
                  <div class="row g-3">
                    <div class="col-6">
                      <label class="form-label fw-semibold small">Fecha inicio *</label>
                      <input class="form-control form-control-sm" type="date" [(ngModel)]="form.eventDate" name="eventDate" (ngModelChange)="onDateChange()" required>
                    </div>
                    <div class="col-6">
                      <label class="form-label fw-semibold small">Fecha fin *</label>
                      <input class="form-control form-control-sm" type="date" [(ngModel)]="form.eventEndDate" name="eventEndDate" (ngModelChange)="onDateChange()" required>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="col-12 col-lg-5">
              <div class="card border h-100 d-flex flex-column">
                <div class="card-body d-grid gap-3 flex-grow-1 d-flex flex-column" style="min-height:0">
                  <div>
                    <h6 class="card-title mb-1"><i class="bi bi-clock-history me-2"></i>Horarios afectados</h6>
                    <p class="text-muted small mb-0">
                      Selecciona los bloques de horario que se veran afectados.
                      <strong>{{ gridDays.length }}</strong> dia(s) en el rango.
                    </p>
                  </div>
                  @if (scheduleBlocks.length === 0) {
                    <div class="text-muted small text-center py-3">Cargando bloques...</div>
                  } @else if (gridDays.length === 0) {
                    <div class="text-muted small text-center py-3">Selecciona un rango de fechas valido.</div>
                  } @else {
                    <div class="schedule-grid-wrapper">
                      <table class="table table-bordered table-sm mb-0 schedule-grid">
                        <thead>
                          <tr>
                            <th class="schedule-day-header"></th>
                            @for (block of scheduleBlocks; track block.id) {
                              <th class="text-center schedule-block-header">
                                <div class="schedule-block-label">{{ block.label }}</div>
                              </th>
                            }
                          </tr>
                        </thead>
                        <tbody>
                          @for (day of gridDays; track day.dateStr) {
                            <tr [class.schedule-row-selected]="hasAnySelected(day.dateStr)">
                              <td class="schedule-day-cell">
                                <div class="schedule-day-name">{{ day.dayName }}</div>
                                <div class="schedule-day-date">{{ day.dateDisplay }}</div>
                              </td>
                              @for (block of scheduleBlocks; track block.id) {
                                <td class="text-center schedule-cell">
                                  <label class="schedule-checkbox-label">
                                    <input
                                      class="schedule-checkbox"
                                      type="checkbox"
                                      [checked]="isScheduleSelected(day.dateStr, block.id)"
                                      (change)="toggleSchedule(day.dateStr, block.id)"
                                    >
                                    <span class="schedule-checkbox-box"></span>
                                  </label>
                                </td>
                              }
                            </tr>
                          }
                        </tbody>
                      </table>
                    </div>
                  }
                  @if (form.schedules.length > 0) {
                    <div class="d-flex flex-wrap gap-1 schedule-tags">
                      @for (s of form.schedules; track $index) {
                        <span class="badge text-bg-light border small d-inline-flex align-items-center gap-1">
                          {{ getWeekdayLabel(s.scheduleDate) }} {{ s.scheduleDate }}: {{ getBlockLabel(s.scheduleBlockId) }}
                          <button type="button" class="btn btn-link btn-sm p-0 text-decoration-none" (click)="removeSchedule($index)">
                            <i class="bi bi-x"></i>
                          </button>
                        </span>
                      }
                    </div>
                  }
                </div>
              </div>
            </div>
          </div>

          @if (saveError) {
            <div class="alert alert-danger py-2 small mt-3 mb-0">{{ saveError }}</div>
          }

          <div class="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
            <button class="btn btn-sm btn-outline-secondary" type="button" (click)="goBack()">Cancelar</button>
            <button class="btn btn-sm btn-primary" type="submit" [disabled]="saving">
              @if (saving) { <span class="spinner-border spinner-border-sm me-1"></span> }
              {{ editingId ? 'Actualizar anuncio' : 'Publicar anuncio' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .schedule-grid-wrapper { overflow: auto; flex-grow: 1; min-height: 0; }
    .schedule-grid { min-width: 100%; border-collapse: separate; border-spacing: 0; }
    .schedule-grid th, .schedule-grid td { border: 1px solid #dee2e6 !important; }
    .schedule-grid thead { position: sticky; top: 0; z-index: 2; }
    .schedule-grid thead th { background: #f8f9fa; }

    .schedule-day-header { width: 90px; }
    .schedule-block-header { min-width: 52px; padding: 6px 2px !important; }
    .schedule-block-label { font-size: 0.68rem; font-weight: 700; color: #495057; line-height: 1.1; }

    .schedule-day-cell { padding: 6px 8px !important; background: #f8f9fa; white-space: nowrap; vertical-align: middle; }
    .schedule-day-name { font-size: 0.75rem; font-weight: 600; color: #344054; }
    .schedule-day-date { font-size: 0.65rem; color: #667085; margin-top: 1px; }

    .schedule-cell { padding: 4px !important; vertical-align: middle; }
    .schedule-row-selected { background: #f0fdf4 !important; }
    .schedule-row-selected .schedule-day-cell { background: #dcfce7; }

    .schedule-checkbox-label {
      display: inline-flex; align-items: center; justify-content: center;
      cursor: pointer; margin: 0; width: 28px; height: 28px;
    }
    .schedule-checkbox { position: absolute; opacity: 0; width: 0; height: 0; }
    .schedule-checkbox-box {
      display: inline-block; width: 22px; height: 22px;
      border: 2px solid #cbd5e1; border-radius: 5px;
      background: #fff; transition: all 0.15s ease;
      position: relative;
    }
    .schedule-checkbox:checked + .schedule-checkbox-box {
      background: #0F766E; border-color: #0F766E;
    }
    .schedule-checkbox:checked + .schedule-checkbox-box::after {
      content: ''; position: absolute; left: 6px; top: 2px;
      width: 6px; height: 11px;
      border: solid white; border-width: 0 2px 2px 0;
      transform: rotate(45deg);
    }
    .schedule-checkbox:focus + .schedule-checkbox-box {
      box-shadow: 0 0 0 3px rgba(15,118,110,0.2);
    }
    .schedule-tags { max-height: 100px; overflow-y: auto; }
  `]
})
export class AnnouncementEditorComponent implements OnInit {
  private http = inject(HttpClient);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  editingId: number | null = null;
  courses: AcademicCourse[] = [];
  scheduleBlocks: ScheduleBlockItem[] = [];
  saving = false;
  saveError = '';

  gridDays: Array<{ dateStr: string; dayName: string; dateDisplay: string; weekday: number }> = [];

  form = {
    title: '',
    description: '',
    type: 'EVENT',
    priority: 'NORMAL',
    eventDate: '',
    eventEndDate: '',
    courseId: null as number | null,
    schedules: [] as Array<{ scheduleDate: string; scheduleBlockId: number }>
  };

  ngOnInit(): void {
    this.setDefaultDates();
    this.rebuildGrid();
    this.loadCourses();
    this.loadBlocks();

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.editingId = +idParam;
      this.loadAnnouncement(this.editingId);
    }
  }

  setDefaultDates(): void {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(today);
    monday.setDate(today.getDate() + mondayOffset);
    const saturday = new Date(monday);
    saturday.setDate(monday.getDate() + 5);
    this.form.eventDate = this.toISODate(monday);
    this.form.eventEndDate = this.toISODate(saturday);
  }

  toISODate(d: Date): string {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  parseDate(s: string): Date {
    const [y, m, d] = s.split('-').map(Number);
    return new Date(y, m - 1, d);
  }

  onDateChange(): void {
    this.rebuildGrid();
    this.form.schedules = this.form.schedules.filter(s =>
      s.scheduleDate >= this.form.eventDate && s.scheduleDate <= this.form.eventEndDate
    );
  }

  rebuildGrid(): void {
    this.gridDays = [];
    if (!this.form.eventDate || !this.form.eventEndDate) return;
    const start = this.parseDate(this.form.eventDate);
    const end = this.parseDate(this.form.eventEndDate);
    if (end < start) return;
    const DAY_NAMES = ['', 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado', 'Domingo'];
    const cur = new Date(start);
    while (cur <= end) {
      const dow = cur.getDay();
      if (dow >= 1 && dow <= 6) {
        const dd = String(cur.getDate()).padStart(2, '0');
        const mm = String(cur.getMonth() + 1).padStart(2, '0');
        this.gridDays.push({
          dateStr: this.toISODate(cur),
          dayName: DAY_NAMES[dow],
          dateDisplay: `${dd}/${mm}`,
          weekday: dow
        });
      }
      cur.setDate(cur.getDate() + 1);
    }
  }

  loadCourses(): void {
    this.http.get<any>(`${API_URL}/academic/overview`).pipe(
      catchError(() => of({ courses: [] }))
    ).subscribe(data => {
      this.courses = data.courses ?? [];
    });
  }

  loadBlocks(): void {
    this.http.get<ScheduleBlockItem[]>(`${API_URL}/announcements/schedule-blocks`).pipe(
      catchError(() => of([]))
    ).subscribe(data => {
      this.scheduleBlocks = data;
    });
  }

  loadAnnouncement(id: number): void {
    this.http.get<any[]>(`${API_URL}/announcements`).pipe(
      catchError(() => of([]))
    ).subscribe(list => {
      const ann = list.find(a => a.id === id);
      if (ann) {
        this.form = {
          title: ann.title,
          description: ann.description,
          type: ann.type,
          priority: ann.priority,
          eventDate: ann.eventDate ?? '',
          eventEndDate: ann.eventEndDate ?? '',
          courseId: ann.courseId,
          schedules: (ann.schedules ?? []).map((s: any) => ({
            scheduleDate: s.scheduleDate,
            scheduleBlockId: s.scheduleBlockId
          }))
        };
        this.rebuildGrid();
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/app/announcements']);
  }

  isScheduleSelected(dateStr: string, blockId: number): boolean {
    return this.form.schedules.some(s => s.scheduleDate === dateStr && s.scheduleBlockId === blockId);
  }

  hasAnySelected(dateStr: string): boolean {
    return this.form.schedules.some(s => s.scheduleDate === dateStr);
  }

  toggleSchedule(dateStr: string, blockId: number): void {
    const idx = this.form.schedules.findIndex(s => s.scheduleDate === dateStr && s.scheduleBlockId === blockId);
    if (idx >= 0) {
      this.form.schedules.splice(idx, 1);
    } else {
      this.form.schedules.push({ scheduleDate: dateStr, scheduleBlockId: blockId });
    }
  }

  removeSchedule(index: number): void {
    this.form.schedules.splice(index, 1);
  }

  getWeekdayLabel(dateStr: string): string {
    const d = this.parseDate(dateStr);
    const DAY_NAMES = ['', 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado', 'Domingo'];
    return DAY_NAMES[d.getDay()] ?? '';
  }

  getBlockLabel(blockId: number): string {
    return this.scheduleBlocks.find(b => b.id === blockId)?.label ?? '';
  }

  save(): void {
    if (!this.form.title.trim() || !this.form.description.trim()) return;
    if (!this.form.eventDate || !this.form.eventEndDate) return;
    this.saving = true;
    this.saveError = '';

    const payload: any = {
      title: this.form.title,
      description: this.form.description,
      type: this.form.type,
      priority: this.form.priority,
      eventDate: this.form.eventDate,
      eventEndDate: this.form.eventEndDate,
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
        this.goBack();
      }
    });
  }
}
