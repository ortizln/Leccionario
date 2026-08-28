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
  templateUrl: './my-teaching.component.html',
  styleUrl: './my-teaching.component.css',
    selector: 'app-my-teaching',
  standalone: true,
  imports: [CommonModule, FormsModule],
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
