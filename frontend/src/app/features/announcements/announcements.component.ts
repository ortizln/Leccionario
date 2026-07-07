import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { catchError, of, Subscription } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../core/api.config';
import { AuthService } from '../../core/auth.service';
import { WebSocketService } from '../../core/websocket.service';
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
            <button class="btn btn-sm btn-primary" type="button" (click)="goToEditor()">
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
                            @for (group of groupSchedulesByDate(ann.schedules); track group.dateStr) {
                              <span class="badge text-bg-light border small">
                                {{ group.weekdayLabel }} {{ group.dateDisplay }}:
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
                        <button class="btn btn-sm btn-outline-primary" type="button" (click)="goToEditor(ann)" title="Editar">
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
export class AnnouncementsComponent implements OnInit, OnDestroy {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private router = inject(Router);
  private ws = inject(WebSocketService);
  private wsSubs: Subscription[] = [];

  canManage = this.auth.hasPermission('ANNOUNCEMENT_MANAGE');

  announcements: Announcement[] = [];
  courses: AcademicCourse[] = [];
  scheduleBlocks: ScheduleBlockItem[] = [];
  loading = true;
  search = '';
  filterType = 'all';

  confirmDelete: Announcement | null = null;
  deleting = false;
  deleteError = '';

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

    this.wsSubs.push(
      this.ws.onAnnouncement().subscribe(() => {
        this.loadData();
      }),
      this.ws.onPersonalAnnouncement().subscribe(() => {
        this.loadData();
      })
    );
  }

  ngOnDestroy(): void {
    this.wsSubs.forEach(s => s.unsubscribe());
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

  goToEditor(ann?: Announcement): void {
    if (ann) {
      this.router.navigate(['/app/announcements/edit', ann.id]);
    } else {
      this.router.navigate(['/app/announcements/new']);
    }
  }

  groupSchedulesByDate(schedules: AnnouncementScheduleItem[]): Array<{ dateStr: string; weekdayLabel: string; dateDisplay: string; blocks: AnnouncementScheduleItem[] }> {
    if (!schedules || schedules.length === 0) return [];
    const map = new Map<string, AnnouncementScheduleItem[]>();
    for (const s of schedules) {
      if (!map.has(s.scheduleDate)) map.set(s.scheduleDate, []);
      map.get(s.scheduleDate)!.push(s);
    }
    return Array.from(map.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([dateStr, blocks]) => {
        const d = this.parseDate(dateStr);
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

  parseDate(s: string): Date {
    const [y, m, d] = s.split('-').map(Number);
    return new Date(y, m - 1, d);
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
