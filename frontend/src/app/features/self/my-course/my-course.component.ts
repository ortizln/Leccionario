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
  templateUrl: './my-course.component.html',
  styleUrl: './my-course.component.css',
    selector: 'app-my-course',
  standalone: true,
  imports: [CommonModule],
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
