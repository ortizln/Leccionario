import { Component, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { catchError, of } from 'rxjs';
import { API_URL } from '../../core/api.config';
import { AuthService } from '../../core/auth.service';
import { SortableHeaderComponent } from '../../shared/sortable-header.component';
import { FilterDropdownComponent } from '../../shared/filter-dropdown.component';
import { SortState, FilterState, applySort, applyFilters, getFilterOptions, toggleFilter, clearFilter, SortDir } from '../../shared/table-utils';

@Component({
  selector: 'app-schedule-management',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, SortableHeaderComponent, FilterDropdownComponent],
  templateUrl: './schedule-management.component.html'
})
export class ScheduleManagementComponent {
  private http = inject(HttpClient);
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);

  canManageSchedules = this.auth.hasPermission('ACADEMIC_MANAGE');
  editingBlockId: number | null = null;
  editingScheduleId: number | null = null;
  scheduleCourseFilter = '';
  errorMessage = '';
  blockModalOpen = false;
  scheduleModalOpen = false;
  activeTab = 'blocks';

  sort: SortState | null = null;
  filters: FilterState = {};
  displayedSchedules: CourseScheduleItem[] = [];

  sortColumn(col: string): SortDir { return this.sort?.column === col ? this.sort.dir : null; }
  onSort(col: string): void {
    const dir: SortDir = this.sort?.column === col
      ? (this.sort.dir === 'asc' ? 'desc' : this.sort.dir === 'desc' ? null : 'asc')
      : 'asc';
    this.sort = dir ? { column: col, dir } : null;
    this.refreshDisplayed();
  }
  filterOpts(col: string): string[] { return getFilterOptions(this.overview.schedules, col); }
  getFilter(col: string): Set<string> { return this.filters[col] ?? new Set(); }
  onFilter(col: string, val: string): void { this.filters = toggleFilter(this.filters, col, val); this.refreshDisplayed(); }
  onClearFilter(col: string): void { this.filters = clearFilter(this.filters, col); this.refreshDisplayed(); }
  refreshDisplayed(): void {
    this.displayedSchedules = this.applyWeekdayFilter(applyFilters(applySort(this.filteredSchedules, this.sort), this.filters));
  }

  weekdayLabelFilter(): string[] {
    return this.overview.schedules.map(s => this.weekdayLabel(s.weekday));
  }
  getWeekdayFilter(): Set<string> { return this.filters['weekday'] ?? new Set(); }
  getWeekdayFilterCount(): number { return this.filters['weekday']?.size ?? 0; }
  onWeekdayFilter(val: string): void {
    const dayNum = this.weekdays.find(d => d.label === val)?.value;
    if (dayNum == null) return;
    const strVal = String(dayNum);
    this.filters = toggleFilter(this.filters, 'weekday', strVal);
    this.refreshDisplayed();
  }
  onClearWeekdayFilter(): void {
    this.filters = clearFilter(this.filters, 'weekday');
    this.refreshDisplayed();
  }
  applyWeekdayFilter(items: CourseScheduleItem[]): CourseScheduleItem[] {
    const vals = this.filters['weekday'];
    if (!vals || vals.size === 0) return items;
    return items.filter(s => vals.has(String(s.weekday)));
  }

  overview: ScheduleOverview = {
    blocks: [],
    schedules: [],
    courses: [],
    periods: [],
    subjects: [],
    teachers: []
  };

  readonly weekdays = [
    { value: 1, label: 'Lunes' },
    { value: 2, label: 'Martes' },
    { value: 3, label: 'Miercoles' },
    { value: 4, label: 'Jueves' },
    { value: 5, label: 'Viernes' },
    { value: 6, label: 'Sabado' },
    { value: 7, label: 'Domingo' }
  ];

  blockForm = this.fb.nonNullable.group({
    label: ['', Validators.required],
    startTime: ['', Validators.required],
    endTime: ['', Validators.required],
    blockOrder: [1, Validators.required],
    blockType: ['CLASS', Validators.required],
    active: [true]
  });

  scheduleForm = this.fb.nonNullable.group({
    courseId: [0, Validators.required],
    periodId: [0, Validators.required],
    scheduleBlockId: [0, Validators.required],
    subjectId: [0, Validators.required],
    teacherId: [0, Validators.required],
    weekday: [1, Validators.required],
    classroom: ['']
  });

  scheduleError = '';

  constructor() {
    this.loadOverview();
  }

  get blocks(): ScheduleBlockItem[] {
    return this.overview.blocks;
  }

  get classBlocks(): ScheduleBlockItem[] {
    return this.blocks.filter(block => block.blockType === 'CLASS');
  }

  get filteredSchedules(): CourseScheduleItem[] {
    if (!this.scheduleCourseFilter) {
      return this.overview.schedules;
    }
    return this.overview.schedules.filter(schedule => String(schedule.courseId) === this.scheduleCourseFilter);
  }

  get filteredSubjects() {
    const subjects = this.overview?.subjects ?? [];
    const teacherId = this.scheduleForm.controls.teacherId.value;
    if (!teacherId) return subjects;
    const teachers = this.overview?.teachers ?? [];
    const teacher = teachers.find(t => t.id === teacherId);
    if (!teacher || !teacher.subjectIds || teacher.subjectIds.length === 0) return subjects;
    return subjects.filter(s => teacher.subjectIds.includes(s.id));
  }

  get filteredTeachers() {
    const teachers = this.overview?.teachers ?? [];
    const courseId = Number(this.scheduleForm.controls.courseId.value);
    if (!courseId) return teachers;
    const course = this.overview.courses.find(c => c.id === courseId);
    if (!course) return teachers;
    const courseLabel = course.name + ' ' + course.parallel;
    return teachers.filter(t => t.courseNames.some(cn => cn.toLowerCase().trim() === courseLabel.toLowerCase().trim()));
  }

  get teacherConflictMessage(): string {
    const teacherId = Number(this.scheduleForm.controls.teacherId.value);
    const blockId = Number(this.scheduleForm.controls.scheduleBlockId.value);
    const weekday = Number(this.scheduleForm.controls.weekday.value);
    const periodId = Number(this.scheduleForm.controls.periodId.value);
    const editingId = this.editingScheduleId;
    if (!teacherId || !blockId || !weekday || !periodId) return '';
    const conflict = this.overview.schedules.find(s =>
      s.teacherId === teacherId
      && s.scheduleBlockId === blockId
      && s.weekday === weekday
      && s.periodId === periodId
      && s.id !== editingId
    );
    if (!conflict) return '';
    return `El docente ya tiene hora clase asignada el ${this.weekdayLabel(weekday)} en ${conflict.scheduleLabel} para el curso ${conflict.courseName}.`;
  }

  onCourseChange(): void {
    const teachers = this.filteredTeachers;
    const currentTeacher = Number(this.scheduleForm.controls.teacherId.value);
    if (teachers.length > 0 && !teachers.some(t => t.id === currentTeacher)) {
      this.scheduleForm.controls.teacherId.setValue(teachers[0].id);
      this.onTeacherChange();
    } else if (teachers.length === 0) {
      this.scheduleForm.controls.teacherId.setValue(0);
      this.scheduleForm.controls.subjectId.setValue(0);
    }
  }

  onTeacherChange(): void {
    const subjects = this.filteredSubjects;
    const current = this.scheduleForm.controls.subjectId.value;
    if (subjects.length === 1) {
      this.scheduleForm.controls.subjectId.setValue(subjects[0].id);
    } else if (subjects.length > 0 && !subjects.some(s => s.id === current)) {
      this.scheduleForm.controls.subjectId.setValue(subjects[0].id);
    }
  }

  weekdayLabel(weekday: number): string {
    return this.weekdays.find(day => day.value === weekday)?.label ?? `Dia ${weekday}`;
  }

  openBlockModal(): void {
    this.resetBlockForm();
    this.blockModalOpen = true;
  }

  editBlock(block: ScheduleBlockItem): void {
    this.editingBlockId = block.id;
    this.blockForm.setValue({
      label: block.label,
      startTime: block.startTime,
      endTime: block.endTime,
      blockOrder: block.blockOrder,
      blockType: block.blockType,
      active: block.active
    });
    this.blockModalOpen = true;
  }

  openScheduleModal(): void {
    this.resetScheduleForm();
    this.scheduleModalOpen = true;
  }

  editSchedule(schedule: CourseScheduleItem): void {
    this.editingScheduleId = schedule.id;
    this.scheduleError = '';
    this.scheduleForm.setValue({
      courseId: schedule.courseId,
      periodId: schedule.periodId,
      scheduleBlockId: schedule.scheduleBlockId,
      subjectId: schedule.subjectId,
      teacherId: schedule.teacherId,
      weekday: schedule.weekday,
      classroom: schedule.classroom ?? ''
    });
    this.scheduleModalOpen = true;
  }

  resetBlockForm(): void {
    this.editingBlockId = null;
    this.blockForm.reset({
      label: '',
      startTime: '',
      endTime: '',
      blockOrder: 1,
      blockType: 'CLASS',
      active: true
    });
  }

  resetScheduleForm(): void {
    this.editingScheduleId = null;
    this.scheduleError = '';
    this.scheduleForm.reset({
      courseId: this.overview.courses[0]?.id ?? 0,
      periodId: this.overview.periods[0]?.id ?? 0,
      scheduleBlockId: this.classBlocks[0]?.id ?? 0,
      subjectId: this.overview.subjects[0]?.id ?? 0,
      teacherId: this.overview.teachers[0]?.id ?? 0,
      weekday: 1,
      classroom: ''
    });
  }

  saveBlock(): void {
    if (!this.canManageSchedules || this.blockForm.invalid) {
      return;
    }

    const payload = this.blockForm.getRawValue();
    const request$ = this.editingBlockId
      ? this.http.put(`${API_URL}/schedules/blocks/${this.editingBlockId}`, payload)
      : this.http.post(`${API_URL}/schedules/blocks`, payload);

    request$.subscribe({
      next: () => this.loadOverview(() => this.resetBlockForm()),
      error: (error) => {
        this.errorMessage = error?.error?.message ?? 'No se pudo guardar la hora clase.';
      }
    });
  }

  saveSchedule(): void {
    if (!this.canManageSchedules || this.scheduleForm.invalid || this.teacherConflictMessage) {
      return;
    }
    this.scheduleError = '';

    const raw = this.scheduleForm.getRawValue();
    const payload = {
      courseId: Number(raw.courseId),
      periodId: Number(raw.periodId),
      scheduleBlockId: Number(raw.scheduleBlockId),
      subjectId: Number(raw.subjectId),
      teacherId: Number(raw.teacherId),
      weekday: Number(raw.weekday),
      classroom: raw.classroom || null
    };
    const request$ = this.editingScheduleId
      ? this.http.put(`${API_URL}/schedules/course-assignments/${this.editingScheduleId}`, payload)
      : this.http.post(`${API_URL}/schedules/course-assignments`, payload);

    request$.pipe(
      catchError((error) => {
        this.scheduleError = error?.error?.message ?? 'No se pudo guardar la asignacion del horario.';
        return of(null);
      })
    ).subscribe({
      next: (result) => {
        if (result !== null) {
          this.loadOverview(() => this.resetScheduleForm());
        }
      }
    });
  }

  downloadBlockTemplate(): void {
    this.http.get(`${API_URL}/schedules/import-template/blocks`, { responseType: 'blob' }).subscribe({
      next: (file) => this.downloadBlob(file, 'horas-clase-plantilla.xlsx'),
      error: () => this.errorMessage = 'No se pudo descargar la plantilla de horas clase.'
    });
  }

  downloadAssignmentTemplate(): void {
    this.http.get(`${API_URL}/schedules/import-template/assignments`, { responseType: 'blob' }).subscribe({
      next: (file) => this.downloadBlob(file, 'horarios-plantilla.xlsx'),
      error: () => this.errorMessage = 'No se pudo descargar la plantilla de horarios.'
    });
  }

  triggerBlockImport(): void {
    document.getElementById('blocks-import-input')?.click();
  }

  triggerAssignmentImport(): void {
    document.getElementById('assignments-import-input')?.click();
  }

  handleBlockImport(event: Event): void {
    this.handleImport(event, `${API_URL}/schedules/import/blocks`, 'horas clase');
  }

  handleAssignmentImport(event: Event): void {
    this.handleImport(event, `${API_URL}/schedules/import/assignments`, 'asignaciones');
  }

  private loadOverview(afterLoad?: () => void): void {
    this.http.get<ScheduleOverview>(`${API_URL}/schedules/overview`).pipe(
      catchError(() => {
        this.errorMessage = 'No se pudo cargar la configuracion de horarios.';
        return of({
          blocks: [],
          schedules: [],
          courses: [],
          periods: [],
          subjects: [],
          teachers: []
        });
      })
    ).subscribe((overview) => {
      this.overview = overview;
      if (!this.editingBlockId) {
        this.resetBlockForm();
      }
      if (!this.editingScheduleId) {
        this.resetScheduleForm();
      }
      this.refreshDisplayed();
      afterLoad?.();
    });
  }

  private handleImport(event: Event, endpoint: string, entity: string): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    this.http.post<ImportSummaryResult>(endpoint, formData).subscribe({
      next: (response) => {
        this.errorMessage = this.formatImportSummary(response, entity);
        this.loadOverview();
        input.value = '';
      },
      error: (error) => {
        this.errorMessage = error?.error?.message ?? `No se pudo importar el archivo de ${entity}.`;
        input.value = '';
      }
    });
  }

  private downloadBlob(blob: Blob, fileName: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  }

  private formatImportSummary(summary: ImportSummaryResult, entity: string): string {
    const lines = [
      `${summary.message} Procesadas: ${summary.total}. Importadas: ${summary.imported}. Fallidas: ${summary.failed}.`
    ];
    if (summary.errors.length > 0) {
      lines.push(`Detalle ${entity}: ${summary.errors.slice(0, 5).join(' | ')}`);
      if (summary.errors.length > 5) {
        lines.push(`Se omitieron ${summary.errors.length - 5} errores adicionales.`);
      }
    }
    return lines.join(' ');
  }
}

type ScheduleOverview = {
  blocks: ScheduleBlockItem[];
  schedules: CourseScheduleItem[];
  courses: Array<{ id: number; name: string; parallel: string; level: string; section: string | null; subLevel: string | null; grade: number | null }>;
  periods: Array<{ id: number; name: string; startDate: string; endDate: string; active: boolean }>;
  subjects: Array<{ id: number; name: string; code: string; curriculumArea: string }>;
  teachers: Array<{ id: number; name: string; specialization: string; subjectIds: number[]; courseNames: string[] }>;
};

type ScheduleBlockItem = {
  id: number;
  label: string;
  startTime: string;
  endTime: string;
  blockOrder: number;
  blockType: 'CLASS' | 'RECESS';
  active: boolean;
};

type CourseScheduleItem = {
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

type ImportSummaryResult = {
  module: string;
  total: number;
  imported: number;
  failed: number;
  message: string;
  errors: string[];
};
