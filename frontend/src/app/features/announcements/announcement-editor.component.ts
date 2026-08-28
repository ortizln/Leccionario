import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { catchError, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../core/api.config';
import { AcademicCourse, ScheduleBlockItem } from '../academic/academic.models';

@Component({
  templateUrl: './announcement-editor.component.html',
  styleUrl: './announcement-editor.component.css',
    selector: 'app-announcement-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
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
