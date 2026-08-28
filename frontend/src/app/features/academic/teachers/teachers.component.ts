import { HttpClient } from '@angular/common/http';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { catchError, map, of } from 'rxjs';
import { API_URL } from '../../../core/api.config';
import { AuthService } from '../../../core/auth.service';
import { AcademicOverview, AcademicTeacher, CourseScheduleItem, ImportSummaryResult, ScheduleBlockItem, ScheduleOverview } from '../academic.models';

@Component({
  templateUrl: './teachers.component.html',
  styleUrl: './teachers.component.css',
    selector: 'app-academic-teachers',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule],
})
export class TeachersComponent implements OnInit {
  private http = inject(HttpClient);
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);

  canManageAcademic = this.auth.hasPermission('ACADEMIC_MANAGE');

  teachers: AcademicTeacher[] = [];
  scheduleBlocks: ScheduleBlockItem[] = [];
  allSchedules: CourseScheduleItem[] = [];
  allSubjectNames: string[] = [];
  allCourseNames: string[] = [];
  allAreas: string[] = [];
  overviewCourses: Array<{ id: number; name: string; parallel: string }> = [];
  overviewSubjects: Array<{ id: number; name: string; code: string; curriculumArea: string }> = [];
  periods: Array<{ id: number; name: string; active: boolean }> = [];

  search = '';
  editorOpen = false;
  editingId: number | null = null;
  detailTeacher: AcademicTeacher | null = null;
  detailTab: 'datos' | 'materias' | 'cursos' | 'horario' = 'datos';
  selectedScheduleDay = 1;
  editingSubjectsFor: number | null = null;
  confirmDeleteTeacher: AcademicTeacher | null = null;
  deletingTeacher = false;
  deleteError = '';
  editingCoursesFor: number | null = null;
  pendingSubjectSelection: Set<string> = new Set();
  pendingCourseSelection: Set<string> = new Set();
  editingScheduleEntryId: number | null = null;
  addingScheduleFor: number | null = null;
  scheduleModalTeacher: AcademicTeacher | null = null;

  subjectModalOpen = false;
  courseModalOpen = false;
  subjectSearch = '';
  courseSearch = '';
  subjectTempSelection: Set<string> = new Set();
  courseTempSelection: Set<string> = new Set();

  scheduleForm = this.fb.nonNullable.group({
    courseId: [0, Validators.required],
    subjectId: [0, Validators.required],
    scheduleBlockId: [0, Validators.required],
    weekday: [1, Validators.required],
    classroom: ['']
  });

  scheduleError = '';

  readonly weekdays = [
    { value: 1, label: 'Lunes', shortLabel: 'Lun' },
    { value: 2, label: 'Martes', shortLabel: 'Mar' },
    { value: 3, label: 'Miercoles', shortLabel: 'Mie' },
    { value: 4, label: 'Jueves', shortLabel: 'Jue' },
    { value: 5, label: 'Viernes', shortLabel: 'Vie' },
    { value: 6, label: 'Sabado', shortLabel: 'Sab' },
    { value: 7, label: 'Domingo', shortLabel: 'Dom' }
  ];

  form = this.fb.nonNullable.group({
    username: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    identification: ['', Validators.required],
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    specialization: ['', Validators.required],
    enabled: [true]
  });

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.http.get<AcademicOverview>(`${API_URL}/academic/overview`).pipe(
      catchError(() => of({ courses: [], subjects: [], periods: [], students: [], teachers: [] }))
    ).subscribe(data => {
      this.teachers = data.teachers;
      this.allSubjectNames = data.subjects.map(s => s.name);
      this.allAreas = [...new Set(data.subjects.map(s => s.curriculumArea).filter(Boolean))];
      this.allCourseNames = data.courses.map(c => c.name + ' ' + c.parallel);
      this.overviewCourses = data.courses;
      this.overviewSubjects = data.subjects;
      this.periods = data.periods;
    });
    if (this.auth.hasPermission('ACADEMIC_VIEW')) {
      this.http.get<ScheduleOverview>(`${API_URL}/schedules/overview`).pipe(
        catchError(() => of({ blocks: [], schedules: [], courses: [], periods: [], subjects: [], teachers: [] }))
      ).subscribe(data => {
        this.scheduleBlocks = data.blocks;
        this.allSchedules = data.schedules;
      });
    }
  }

  filtered(): AcademicTeacher[] {
    const term = this.search.trim().toLowerCase();
    if (!term) return this.teachers;
    return this.teachers.filter(t =>
      t.fullName.toLowerCase().includes(term) ||
      t.username.toLowerCase().includes(term) ||
      t.specialization.toLowerCase().includes(term)
    );
  }

  openTeacherDetail(teacher: AcademicTeacher): void {
    this.detailTeacher = teacher;
    this.detailTab = 'datos';
    this.selectedScheduleDay = 1;
  }

  closeTeacherDetail(): void {
    this.detailTeacher = null;
    this.detailTab = 'datos';
  }

  startEditSubjects(teacher: AcademicTeacher): void {
    this.cancelEditSection();
    this.editingSubjectsFor = teacher.id;
    this.pendingSubjectSelection = new Set(teacher.subjects);
  }

  startEditCourses(teacher: AcademicTeacher): void {
    this.cancelEditSection();
    this.editingCoursesFor = teacher.id;
    this.pendingCourseSelection = new Set(teacher.courses);
  }

  cancelEditSection(): void {
    this.editingSubjectsFor = null;
    this.editingCoursesFor = null;
    this.pendingSubjectSelection = new Set();
    this.pendingCourseSelection = new Set();
  }

  togglePendingSubject(subj: string): void {
    if (this.pendingSubjectSelection.has(subj)) {
      this.pendingSubjectSelection.delete(subj);
    } else {
      this.pendingSubjectSelection.add(subj);
    }
  }

  saveSubjects(teacher: AcademicTeacher): void {
    if (!this.canManageAcademic) return;
    this.cancelEditSection();
  }

  saveCourses(teacher: AcademicTeacher): void {
    if (!this.canManageAcademic) return;
    this.cancelEditSection();
  }

  get selectedArea(): string {
    return this.form.get('specialization')?.value || '';
  }

  get filteredSubjectOptions(): string[] {
    let list = this.allSubjectNames;
    const area = this.selectedArea;
    if (area) {
      list = this.overviewSubjects
        .filter(s => s.curriculumArea === area)
        .map(s => s.name);
    }
    const q = this.subjectSearch.toLowerCase().trim();
    if (q) {
      list = list.filter(s => s.toLowerCase().includes(q));
    }
    return list;
  }

  get filteredCourseOptions(): string[] {
    let list = this.allCourseNames;
    const q = this.courseSearch.toLowerCase().trim();
    if (q) {
      list = list.filter(c => c.toLowerCase().includes(q));
    }
    return list;
  }

  filteredAssignedCourses(): string[] {
    let list = Array.from(this.courseTempSelection);
    const q = this.courseSearch.toLowerCase().trim();
    if (q) {
      list = list.filter(c => c.toLowerCase().includes(q));
    }
    return list;
  }

  filteredAvailableCourses(): string[] {
    const q = this.courseSearch.toLowerCase().trim();
    let list = this.allCourseNames.filter(c => !this.courseTempSelection.has(c));
    if (q) {
      list = list.filter(c => c.toLowerCase().includes(q));
    }
    return list;
  }

  onAreaChange(): void {
    this.subjectSearch = '';
    this.pendingSubjectSelection.clear();
  }

  openSubjectModal(): void {
    this.subjectTempSelection = new Set(this.pendingSubjectSelection);
    this.subjectSearch = '';
    this.subjectModalOpen = true;
  }

  openCourseModal(): void {
    this.courseTempSelection = new Set(this.pendingCourseSelection);
    this.courseSearch = '';
    this.courseModalOpen = true;
  }

  toggleSubjectTemp(subj: string): void {
    if (this.subjectTempSelection.has(subj)) {
      this.subjectTempSelection.delete(subj);
    } else {
      this.subjectTempSelection.add(subj);
    }
  }

  toggleCourseTemp(course: string): void {
    if (this.courseTempSelection.has(course)) {
      this.courseTempSelection.delete(course);
    } else {
      this.courseTempSelection.add(course);
    }
  }

  confirmSubjectSelection(): void {
    this.pendingSubjectSelection = this.subjectTempSelection;
    this.subjectModalOpen = false;
  }

  confirmCourseSelection(): void {
    this.pendingCourseSelection = this.courseTempSelection;
    this.courseModalOpen = false;
  }

  classBlocks(): ScheduleBlockItem[] {
    return this.scheduleBlocks.filter(b => b.blockType === 'CLASS');
  }

  teacherScheduleSubjects(): Array<{ id: number; name: string; code: string; curriculumArea: string }> {
    if (!this.scheduleModalTeacher) return [];
    return this.overviewSubjects.filter(s => this.scheduleModalTeacher!.subjects.includes(s.name));
  }

  teacherScheduleCourses(): Array<{ id: number; name: string; parallel: string }> {
    if (!this.scheduleModalTeacher) return [];
    const teacherCourses = this.scheduleModalTeacher!.courses;
    if (!teacherCourses || teacherCourses.length === 0) return this.overviewCourses;
    return this.overviewCourses.filter(c => {
      const fullName = (c.name + ' ' + c.parallel).toLowerCase().trim();
      return teacherCourses.some(tc => tc.toLowerCase().trim() === fullName);
    });
  }

  activePeriodId(): number {
    return this.periods.find(p => p.active)?.id ?? this.periods[0]?.id ?? 0;
  }

  startAddScheduleEntry(teacherId: number): void {
    this.editingScheduleEntryId = null;
    this.addingScheduleFor = teacherId;
    this.scheduleModalTeacher = this.teachers.find(t => t.id === teacherId) || null;
    this.scheduleError = '';
    this.scheduleForm.reset({
      courseId: this.teacherScheduleCourses()[0]?.id ?? 0,
      subjectId: this.teacherScheduleSubjects()[0]?.id ?? 0,
      scheduleBlockId: this.classBlocks()[0]?.id ?? 0,
      weekday: 1,
      classroom: ''
    });
  }

  startEditScheduleEntry(entry: CourseScheduleItem): void {
    this.addingScheduleFor = null;
    this.editingScheduleEntryId = entry.id;
    this.scheduleModalTeacher = this.teachers.find(t => t.id === entry.teacherId) || null;
    this.scheduleError = '';
    this.scheduleForm.setValue({
      courseId: entry.courseId,
      subjectId: entry.subjectId,
      scheduleBlockId: entry.scheduleBlockId,
      weekday: entry.weekday,
      classroom: entry.classroom ?? ''
    });
  }

  cancelScheduleEdit(): void {
    this.editingScheduleEntryId = null;
    this.addingScheduleFor = null;
    this.scheduleModalTeacher = null;
    this.scheduleForm.reset({ courseId: 0, subjectId: 0, scheduleBlockId: 0, weekday: 1, classroom: '' });
  }

  saveScheduleEntry(teacherId: number): void {
    if (!this.canManageAcademic || this.scheduleForm.invalid) return;
    this.scheduleError = '';
    const payload = {
      ...this.scheduleForm.getRawValue(),
      teacherId,
      periodId: this.activePeriodId()
    };
    const url = this.editingScheduleEntryId
      ? `${API_URL}/schedules/course-assignments/${this.editingScheduleEntryId}`
      : `${API_URL}/schedules/course-assignments`;
    const request$ = this.editingScheduleEntryId
      ? this.http.put(url, payload)
      : this.http.post(url, payload);

    request$.pipe(
      catchError((error) => {
        this.scheduleError = error?.error?.message || 'No se pudo guardar la hora clase.';
        return of(null);
      })
    ).subscribe({
      next: (result) => {
        if (result !== null) {
          const savedDay = this.scheduleForm.getRawValue().weekday;
          this.cancelScheduleEdit();
          this.loadData();
          this.selectedScheduleDay = savedDay;
          this.detailTab = 'horario';
        }
      }
    });
  }

  deleteScheduleEntry(entryId: number): void {
    if (!this.canManageAcademic) return;
    this.http.delete(`${API_URL}/schedules/course-assignments/${entryId}`).pipe(
      catchError(() => of(null))
    ).subscribe({
      next: () => { this.loadData(); }
    });
  }

  teacherSchedule(teacherId: number): CourseScheduleItem[] {
    return this.allSchedules.filter(s => s.teacherId === teacherId);
  }

  teacherScheduleByDay(teacherId: number, weekday: number): CourseScheduleItem[] {
    return this.allSchedules
      .filter(s => s.teacherId === teacherId && s.weekday === weekday)
      .sort((a, b) => {
        const aBlock = this.scheduleBlocks.find(bk => bk.label === a.scheduleLabel);
        const bBlock = this.scheduleBlocks.find(bk => bk.label === b.scheduleLabel);
        return (aBlock?.blockOrder ?? 0) - (bBlock?.blockOrder ?? 0);
      });
  }

  startCreate(): void {
    this.editingId = null;
    this.editorOpen = true;
    this.form.reset({
      username: '', email: '', identification: '',
      firstName: '', lastName: '', specialization: '', enabled: true
    });
    this.pendingSubjectSelection = new Set();
    this.pendingCourseSelection = new Set();
  }

  editTeacher(teacher: AcademicTeacher): void {
    this.editingId = teacher.id;
    this.editorOpen = true;
    this.detailTeacher = null;
    this.pendingSubjectSelection = new Set(teacher.subjects);
    this.pendingCourseSelection = new Set(teacher.courses);
    this.http.get<AcademicTeacher>(`${API_URL}/academic/teachers/${teacher.id}`).pipe(
      catchError(() => of(null))
    ).subscribe(detail => {
      if (detail) {
        this.form.setValue({
          username: detail.username,
          email: detail.email,
          identification: detail.identification,
          firstName: detail.firstName,
          lastName: detail.lastName,
          specialization: detail.specialization,
          enabled: detail.enabled
        });
        if (detail.subjects.length > 0 || detail.courses.length > 0) {
          this.pendingSubjectSelection = new Set(detail.subjects);
          this.pendingCourseSelection = new Set(detail.courses);
        }
      } else {
        this.form.setValue({
          username: teacher.username,
          email: '',
          identification: '',
          firstName: '',
          lastName: '',
          specialization: teacher.specialization,
          enabled: teacher.enabled
        });
      }
    });
  }

  deleteTeacher(): void {
    if (!this.confirmDeleteTeacher || !this.canManageAcademic) return;
    this.deletingTeacher = true;
    this.deleteError = '';
    const id = this.confirmDeleteTeacher.id;
    this.http.delete(`${API_URL}/academic/teachers/${id}`).pipe(
      map(() => true),
      catchError(err => {
        this.deleteError = err?.error?.message ?? 'No se pudo eliminar el docente.';
        return of(false);
      })
    ).subscribe(ok => {
      this.deletingTeacher = false;
      if (ok) {
        this.confirmDeleteTeacher = null;
        this.deleteError = '';
        this.closeTeacherDetail();
        this.loadData();
      }
    });
  }

  cancelEdit(): void {
    this.editorOpen = false;
    this.editingId = null;
    this.pendingSubjectSelection = new Set();
    this.pendingCourseSelection = new Set();
    this.form.reset({
      username: '', email: '', identification: '',
      firstName: '', lastName: '', specialization: '', enabled: true
    });
  }

  saveError = '';

  save(): void {
    if (!this.canManageAcademic || this.form.invalid) return;
    this.saveError = '';
    const payload = {
      ...this.form.getRawValue(),
      subjects: Array.from(this.pendingSubjectSelection),
      courses: Array.from(this.pendingCourseSelection)
    };
    const url = this.editingId
      ? `${API_URL}/academic/teachers/${this.editingId}`
      : `${API_URL}/academic/teachers`;
    const request$ = this.editingId
      ? this.http.put(url, payload)
      : this.http.post(url, payload);
    request$.subscribe({
      next: () => { this.cancelEdit(); this.loadData(); },
      error: (err) => { this.saveError = err.error?.message || 'Error al guardar docente'; console.error('Teacher save error:', err); }
    });
  }

  downloadTemplate(): void {
    this.http.get(`${API_URL}/academic/import-template/teachers`, { responseType: 'blob' }).subscribe({
      next: (file) => this.downloadBlob(file, 'docentes-plantilla.xlsx'),
      error: () => {}
    });
  }

  triggerImport(): void {
    document.getElementById('teachers-import-input')?.click();
  }

  handleImport(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    this.http.post<ImportSummaryResult>(`${API_URL}/academic/import/teachers`, formData).subscribe({
      next: () => { this.loadData(); input.value = ''; },
      error: () => { input.value = ''; }
    });
  }

  exportExcel(): void {
    const rows = this.filtered().map(t => `
      <tr><td>${t.fullName}</td><td>${t.specialization || 'Sin especialidad'}</td><td>${t.subjects.join(', ') || 'Sin materias asignadas'}</td><td>${t.courses.join(', ') || 'Sin cursos asignados'}</td><td>${t.weeklyBlocks}</td></tr>
    `).join('');
    this.exportHtmlTable('docentes-leccionario.xls', ['Docente', 'Especialidad', 'Materias', 'Cursos', 'Horas clase/semana'], rows);
  }

  private downloadBlob(blob: Blob, fileName: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  }

  private exportHtmlTable(fileName: string, headers: string[], rows: string): void {
    const html = `<table><thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody>${rows}</tbody></table>`;
    const blob = new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    this.downloadBlob(blob, fileName);
  }
}
