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
  templateUrl: './announcements.component.html',
  styleUrl: './announcements.component.css',
    selector: 'app-announcements',
  standalone: true,
  imports: [CommonModule, FormsModule],
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
