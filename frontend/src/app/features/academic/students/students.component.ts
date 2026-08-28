import { HttpClient } from '@angular/common/http';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { catchError, forkJoin, of } from 'rxjs';
import { API_URL } from '../../../core/api.config';
import { AuthService } from '../../../core/auth.service';
import { SortableHeaderComponent } from '../../../shared/sortable-header.component';
import { FilterDropdownComponent } from '../../../shared/filter-dropdown.component';
import { SortState, FilterState, applySort, applyFilters, getFilterOptions, toggleFilter, clearFilter, SortDir } from '../../../shared/table-utils';
import { AcademicCourse, AcademicStudent, AcademicOverview, CourseScheduleItem, ImportSummaryResult, ScheduleBlockItem, ScheduleOverview } from '../academic.models';

type StudentRepresentative = {
  id: number; studentId: number; studentName: string; enrollmentNumber: string;
  fullName: string; relationship: string; phone: string; email: string;
  emergencyContact?: string; emergencyPhone?: string; address?: string;
};

@Component({
  templateUrl: './students.component.html',
  styleUrl: './students.component.css',
    selector: 'app-academic-students',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, SortableHeaderComponent, FilterDropdownComponent],
})
export class StudentsComponent implements OnInit {
  private http = inject(HttpClient);
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);

  courses: AcademicCourse[] = [];
  students: AcademicStudent[] = [];
  canManageAcademic = this.auth.hasPermission('ACADEMIC_MANAGE');
  scheduleBlocks: ScheduleBlockItem[] = [];
  allSchedules: CourseScheduleItem[] = [];
  allReps: StudentRepresentative[] = [];
  selectedCourseFilter = 'all';
  search = '';
  editorOpen = false;
  editingId: number | null = null;
  detailStudent: AcademicStudent | null = null;
  detailTab = 'datos';
  selectedScheduleDay = 1;

  sort: SortState | null = null;
  filters: FilterState = {};
  displayedStudents: AcademicStudent[] = [];

  repSearchOpen = false;
  repSearchTerm = '';
  creatingRep = false;
  selectedRepId: number | null = null;

  repForm = this.fb.nonNullable.group({
    fullName: ['', Validators.required],
    relationship: ['PADRE', Validators.required],
    phone: ['', Validators.required],
    email: [''],
    address: ['']
  });

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
    enrollmentNumber: [''],
    courseId: [0, Validators.required],
    enabled: [true],
    birthDate: [''],
    gender: ['']
  });

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    forkJoin({
      overview: this.http.get<AcademicOverview>(`${API_URL}/academic/overview`).pipe(
        catchError(() => of({ courses: [], subjects: [], periods: [], students: [], teachers: [] }))
      ),
      reps: this.http.get<StudentRepresentative[]>(`${API_URL}/academic/representatives`).pipe(
        catchError(() => of([]))
      ),
      schedule: this.http.get<ScheduleOverview>(`${API_URL}/schedules/overview`).pipe(
        catchError(() => of({ blocks: [], schedules: [], courses: [], periods: [], subjects: [], teachers: [] }))
      )
    }).subscribe(({ overview, reps, schedule }) => {
      this.courses = overview.courses;
      this.students = overview.students;
      this.allReps = reps;
      this.scheduleBlocks = schedule.blocks;
      this.allSchedules = schedule.schedules;
      this.refreshDisplayed();
    });
  }

  filtered(): AcademicStudent[] {
    const selected = this.selectedCourseFilter;
    const term = this.search.trim().toLowerCase();
    return this.students.filter(s => {
      const courseMatch = selected === 'all' || String(s.courseId) === selected;
      const searchMatch = !term
        || s.fullName.toLowerCase().includes(term)
        || s.username.toLowerCase().includes(term)
        || s.enrollmentNumber.toLowerCase().includes(term);
      return courseMatch && searchMatch;
    });
  }

  sortColumn(col: string): SortDir { return this.sort?.column === col ? this.sort.dir : null; }
  onSort(col: string): void {
    const dir: SortDir = this.sort?.column === col
      ? (this.sort.dir === 'asc' ? 'desc' : this.sort.dir === 'desc' ? null : 'asc')
      : 'asc';
    this.sort = dir ? { column: col, dir } : null;
    this.refreshDisplayed();
  }
  filterOpts(col: string): string[] { return getFilterOptions(this.filtered(), col); }
  getFilter(col: string): Set<string> { return this.filters[col] ?? new Set(); }
  onFilter(col: string, val: string): void { this.filters = toggleFilter(this.filters, col, val); this.refreshDisplayed(); }
  onClearFilter(col: string): void { this.filters = clearFilter(this.filters, col); this.refreshDisplayed(); }
  refreshDisplayed(): void {
    this.displayedStudents = applyFilters(applySort(this.filtered(), this.sort), this.filters);
  }

  openStudentDetail(student: AcademicStudent): void {
    this.detailStudent = student;
    this.detailTab = 'datos';
    this.selectedScheduleDay = 1;
  }

  closeStudentDetail(): void {
    this.detailStudent = null;
  }

  studentRep(studentId: number): StudentRepresentative | undefined {
    return this.allReps.find(r => r.studentId === studentId);
  }

  courseSchedule(courseId: number): CourseScheduleItem[] {
    return this.allSchedules.filter(s => s.courseId === courseId);
  }

  courseScheduleByDay(courseId: number, weekday: number): CourseScheduleItem[] {
    return this.allSchedules
      .filter(s => s.courseId === courseId && s.weekday === weekday)
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
      firstName: '', lastName: '', enrollmentNumber: '',
      courseId: this.courses[0]?.id ?? 0, enabled: true
    });
  }

  edit(student: AcademicStudent): void {
    this.detailStudent = null;
    this.editingId = student.id;
    this.editorOpen = true;
    const rep = this.allReps.find(r => r.studentId === student.id);
    this.selectedRepId = rep?.id ?? null;
    this.form.setValue({
      username: student.username,
      email: student.email,
      identification: student.identification,
      firstName: student.firstName,
      lastName: student.lastName,
      enrollmentNumber: student.enrollmentNumber,
      courseId: student.courseId,
      enabled: student.enabled,
      birthDate: student.birthDate ?? '',
      gender: student.gender ?? ''
    });
  }

  cancelEdit(): void {
    this.editorOpen = false;
    this.editingId = null;
    this.selectedRepId = null;
    this.form.reset({
      username: '', email: '', identification: '',
      firstName: '', lastName: '', enrollmentNumber: '',
      courseId: this.courses[0]?.id ?? 0, enabled: true,
      birthDate: '', gender: ''
    });
  }

  save(): void {
    if (!this.canManageAcademic || this.form.invalid) return;
    const request = this.form.getRawValue();
    const url = this.editingId
      ? `${API_URL}/academic/students/${this.editingId}`
      : `${API_URL}/academic/students`;
    const operation = this.editingId
      ? this.http.put(url, request)
      : this.http.post(url, request);

    operation.subscribe({
      next: (saved: any) => {
        const studentId = saved?.id ?? this.editingId ?? 0;
        if (this.selectedRepId) {
          const rep = this.allReps.find(r => r.id === this.selectedRepId);
          if (rep) {
            rep.studentId = studentId;
            rep.studentName = `${request.firstName} ${request.lastName}`.trim();
            rep.enrollmentNumber = request.enrollmentNumber;
            this.http.put(`${API_URL}/academic/representatives/${this.selectedRepId}`, {
              studentId,
              fullName: rep.fullName,
              relationship: rep.relationship,
              phone: rep.phone,
              email: rep.email || ''
            }).pipe(catchError(() => of(null))).subscribe();
          }
        }
        this.cancelEdit(); this.loadData();
      },
      error: () => { this.cancelEdit(); this.loadData(); },
    });
  }

  downloadTemplate(): void {
    this.http.get(`${API_URL}/academic/import-template/students`, { responseType: 'blob' }).subscribe({
      next: (file) => this.downloadBlob(file, 'estudiantes-plantilla.xlsx'),
      error: () => {}
    });
  }

  triggerImport(): void {
    document.getElementById('students-import-input')?.click();
  }

  handleImport(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    this.http.post<ImportSummaryResult>(`${API_URL}/academic/import/students`, formData).subscribe({
      next: () => { this.loadData(); input.value = ''; },
      error: () => { input.value = ''; }
    });
  }

  exportExcel(): void {
    const rows = this.filtered().map(s => `
      <tr><td>${s.enrollmentNumber}</td><td>${s.fullName}</td><td>${s.courseName}</td><td>${s.username}</td><td>${s.enabled ? 'Activo' : 'Inactivo'}</td></tr>
    `).join('');
    this.exportHtmlTable('estudiantes-leccionario.xls', ['Matricula', 'Estudiante', 'Curso', 'Usuario', 'Estado'], rows);
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

  /* ---- Representative search & create ---- */

  openRepSearch(): void {
    this.repSearchOpen = true;
    this.repSearchTerm = '';
    this.creatingRep = false;
    this.repForm.reset({ fullName: '', relationship: 'PADRE', phone: '', email: '', address: '' });
  }

  selectRep(rep: StudentRepresentative): void {
    this.selectedRepId = rep.id;
    this.repSearchOpen = false;
  }

  clearRep(): void {
    this.selectedRepId = null;
  }

  createNewRep(): void {
    this.creatingRep = true;
  }

  cancelNewRep(): void {
    this.creatingRep = false;
    this.repForm.reset({ fullName: '', relationship: 'PADRE', phone: '', email: '', address: '' });
  }

  saveNewRep(): void {
    if (!this.canManageAcademic || this.repForm.invalid) return;
    const payload = this.repForm.getRawValue();
    const formValues = this.form.getRawValue();

    const studentId = this.editingId ?? 0;
    const tempId = Date.now();

    this.http.post<{ id: number }>(`${API_URL}/academic/representatives`, payload).pipe(
      catchError(() => of(null))
    ).subscribe((saved) => {
      const repId = saved?.id ?? Date.now();
      const newRep: StudentRepresentative = {
        id: repId,
        studentId,
        studentName: `${formValues.firstName} ${formValues.lastName}`.trim(),
        enrollmentNumber: formValues.enrollmentNumber,
        fullName: payload.fullName,
        relationship: payload.relationship,
        phone: payload.phone,
        email: payload.email,
        emergencyContact: '',
        emergencyPhone: '',
        address: payload.address,
      };
      this.allReps = [...this.allReps, newRep];
      this.selectedRepId = repId;
      this.repSearchOpen = false;
      this.creatingRep = false;
    });
  }

  get selectedRep(): StudentRepresentative | undefined {
    return this.selectedRepId ? this.allReps.find(r => r.id === this.selectedRepId) : undefined;
  }

  filteredReps(): StudentRepresentative[] {
    const term = this.repSearchTerm.trim().toLowerCase();
    if (!term) return this.allReps;
    return this.allReps.filter(r =>
      r.fullName.toLowerCase().includes(term) ||
      r.studentName.toLowerCase().includes(term) ||
      r.enrollmentNumber.toLowerCase().includes(term) ||
      r.phone.includes(term)
    );
  }
}
