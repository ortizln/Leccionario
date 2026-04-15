import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { catchError, forkJoin, of } from 'rxjs';
import { API_URL } from '../../core/api.config';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-academic-management',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, FormsModule],
  templateUrl: './academic-management.component.html',
  styleUrl: './academic-management.component.css'
})
export class AcademicManagementComponent {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private fb = inject(FormBuilder);

  canManageAcademic = this.auth.hasPermission('ACADEMIC_MANAGE');
  errorMessage = '';
  activeTab: 'courses' | 'students' | 'teachers' = 'courses';
  selectedCourseFilter = 'all';
  studentSearch = '';
  teacherSearch = '';
  courseEditorOpen = false;
  studentEditorOpen = false;
  teacherEditorOpen = false;
  editingCourseId: number | null = null;
  editingStudentId: number | null = null;
  editingAssignmentId: number | null = null;
  assignmentCourseFilter = '';
  assignmentTeacherFilter = '';
  assignmentWeekdayFilter = '';

  readonly weekdays = [
    { value: 1, label: 'Lunes' },
    { value: 2, label: 'Martes' },
    { value: 3, label: 'Miercoles' },
    { value: 4, label: 'Jueves' },
    { value: 5, label: 'Viernes' },
    { value: 6, label: 'Sabado' },
    { value: 7, label: 'Domingo' }
  ];

  overview: AcademicOverview = {
    courses: [],
    subjects: [],
    periods: [],
    students: [],
    teachers: []
  };

  scheduleOverview: ScheduleOverview = {
    blocks: [],
    schedules: [],
    courses: [],
    periods: [],
    subjects: [],
    teachers: []
  };

  courseForm = this.fb.nonNullable.group({
    name: ['', Validators.required],
    parallel: ['', Validators.required],
    level: ['', Validators.required],
    weekStudentId: [null as number | null]
  });

  studentForm = this.fb.nonNullable.group({
    username: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    identification: ['', Validators.required],
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    enrollmentNumber: ['', Validators.required],
    courseId: [0, Validators.required],
    enabled: [true]
  });

  teacherForm = this.fb.nonNullable.group({
    username: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    identification: ['', Validators.required],
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    specialization: ['', Validators.required],
    enabled: [true]
  });

  assignmentForm = this.fb.nonNullable.group({
    courseId: [0, Validators.required],
    periodId: [0, Validators.required],
    scheduleBlockId: [0, Validators.required],
    subjectId: [0, Validators.required],
    teacherId: [0, Validators.required],
    weekday: [1, Validators.required],
    classroom: ['']
  });

  constructor() {
    this.loadOverview();
  }

  filteredStudents(): AcademicStudent[] {
    const selectedCourse = this.selectedCourseFilter;
    const search = this.studentSearch.trim().toLowerCase();

    return this.overview.students.filter((student) => {
      const courseMatches = selectedCourse === 'all' || String(student.courseId) === selectedCourse;
      const searchMatches = !search
        || student.fullName.toLowerCase().includes(search)
        || student.username.toLowerCase().includes(search)
        || student.enrollmentNumber.toLowerCase().includes(search);
      return courseMatches && searchMatches;
    });
  }

  filteredTeachers(): AcademicTeacher[] {
    const search = this.teacherSearch.trim().toLowerCase();
    if (!search) {
      return this.overview.teachers;
    }
    return this.overview.teachers.filter((teacher) => {
      return teacher.fullName.toLowerCase().includes(search)
        || teacher.username.toLowerCase().includes(search)
        || teacher.specialization.toLowerCase().includes(search);
    });
  }

  courseStudentOptions(): AcademicStudent[] {
    if (!this.editingCourseId) {
      return [];
    }
    return this.overview.students
      .filter(student => student.courseId === this.editingCourseId)
      .sort((left, right) => left.enrollmentNumber.localeCompare(right.enrollmentNumber));
  }

  classBlocks(): ScheduleBlockItem[] {
    return this.scheduleOverview.blocks.filter(block => block.blockType === 'CLASS');
  }

  filteredAssignments(): CourseScheduleItem[] {
    return this.scheduleOverview.schedules.filter((assignment) => {
      const matchesCourse = !this.assignmentCourseFilter || String(assignment.courseId) === this.assignmentCourseFilter;
      const matchesTeacher = !this.assignmentTeacherFilter || String(assignment.teacherId) === this.assignmentTeacherFilter;
      const matchesWeekday = !this.assignmentWeekdayFilter || String(assignment.weekday) === this.assignmentWeekdayFilter;
      return matchesCourse && matchesTeacher && matchesWeekday;
    });
  }

  weekdayLabel(weekday: number): string {
    return this.weekdays.find(day => day.value === weekday)?.label ?? `Dia ${weekday}`;
  }

  startCreateCourse(): void {
    this.editingCourseId = null;
    this.courseEditorOpen = true;
    this.courseForm.reset({ name: '', parallel: '', level: '', weekStudentId: null });
  }

  editCourse(course: AcademicCourse): void {
    this.editingCourseId = course.id;
    this.courseEditorOpen = true;
    this.courseForm.setValue({
      name: course.name,
      parallel: course.parallel,
      level: course.level,
      weekStudentId: course.weekStudentId ?? null
    });
  }

  cancelCourseEdit(): void {
    this.courseEditorOpen = false;
    this.editingCourseId = null;
    this.courseForm.reset({ name: '', parallel: '', level: '', weekStudentId: null });
  }

  saveCourse(): void {
    if (!this.canManageAcademic || this.courseForm.invalid) {
      this.errorMessage = 'Completa nombre, paralelo y nivel para guardar el curso.';
      return;
    }

    const request = {
      ...this.courseForm.getRawValue(),
      parallel: this.courseForm.controls.parallel.value.toUpperCase()
    };
    const url = this.editingCourseId
      ? `${API_URL}/academic/courses/${this.editingCourseId}`
      : `${API_URL}/academic/courses`;
    const operation = this.editingCourseId
      ? this.http.put(url, request)
      : this.http.post(url, request);

    operation.subscribe({
      next: () => {
        this.cancelCourseEdit();
        this.loadOverview();
      },
      error: (error) => {
        this.errorMessage = error?.error?.message ?? 'No se pudo guardar el curso.';
      }
    });
  }

  startCreateStudent(): void {
    this.editingStudentId = null;
    this.studentEditorOpen = true;
    this.studentForm.reset({
      username: '',
      email: '',
      identification: '',
      firstName: '',
      lastName: '',
      enrollmentNumber: '',
      courseId: this.overview.courses[0]?.id ?? 0,
      enabled: true
    });
  }

  editStudent(student: AcademicStudent): void {
    this.editingStudentId = student.id;
    this.studentEditorOpen = true;
    this.studentForm.setValue({
      username: student.username,
      email: student.email,
      identification: student.identification,
      firstName: student.firstName,
      lastName: student.lastName,
      enrollmentNumber: student.enrollmentNumber,
      courseId: student.courseId,
      enabled: student.enabled
    });
  }

  cancelStudentEdit(): void {
    this.studentEditorOpen = false;
    this.editingStudentId = null;
    this.studentForm.reset({
      username: '',
      email: '',
      identification: '',
      firstName: '',
      lastName: '',
      enrollmentNumber: '',
      courseId: this.overview.courses[0]?.id ?? 0,
      enabled: true
    });
  }

  saveStudent(): void {
    if (!this.canManageAcademic || this.studentForm.invalid) {
      this.errorMessage = 'Completa todos los datos requeridos del estudiante antes de guardar.';
      return;
    }

    const request = this.studentForm.getRawValue();
    const url = this.editingStudentId
      ? `${API_URL}/academic/students/${this.editingStudentId}`
      : `${API_URL}/academic/students`;
    const operation = this.editingStudentId
      ? this.http.put(url, request)
      : this.http.post(url, request);

    operation.subscribe({
      next: () => {
        this.cancelStudentEdit();
        this.loadOverview();
      },
      error: (error) => {
        this.errorMessage = error?.error?.message ?? 'No se pudo guardar el estudiante.';
      }
    });
  }

  startCreateTeacher(): void {
    this.teacherEditorOpen = true;
    this.teacherForm.reset({
      username: '',
      email: '',
      identification: '',
      firstName: '',
      lastName: '',
      specialization: '',
      enabled: true
    });
  }

  cancelTeacherEdit(): void {
    this.teacherEditorOpen = false;
    this.teacherForm.reset({
      username: '',
      email: '',
      identification: '',
      firstName: '',
      lastName: '',
      specialization: '',
      enabled: true
    });
  }

  saveTeacher(): void {
    if (!this.canManageAcademic || this.teacherForm.invalid) {
      this.errorMessage = 'Completa todos los datos requeridos del docente antes de guardar.';
      return;
    }

    this.http.post(`${API_URL}/academic/teachers`, this.teacherForm.getRawValue()).subscribe({
      next: () => {
        this.cancelTeacherEdit();
        this.loadOverview();
      },
      error: (error) => {
        this.errorMessage = error?.error?.message ?? 'No se pudo guardar el docente.';
      }
    });
  }

  downloadCourseTemplate(): void {
    this.http.get(`${API_URL}/academic/import-template/courses`, { responseType: 'blob' }).subscribe({
      next: (file) => this.downloadBlob(file, 'cursos-plantilla.xlsx'),
      error: () => this.errorMessage = 'No se pudo descargar la plantilla de cursos.'
    });
  }

  downloadStudentTemplate(): void {
    this.http.get(`${API_URL}/academic/import-template/students`, { responseType: 'blob' }).subscribe({
      next: (file) => this.downloadBlob(file, 'estudiantes-plantilla.xlsx'),
      error: () => this.errorMessage = 'No se pudo descargar la plantilla de estudiantes.'
    });
  }

  downloadTeacherTemplate(): void {
    this.http.get(`${API_URL}/academic/import-template/teachers`, { responseType: 'blob' }).subscribe({
      next: (file) => this.downloadBlob(file, 'docentes-plantilla.xlsx'),
      error: () => this.errorMessage = 'No se pudo descargar la plantilla de docentes.'
    });
  }

  triggerCourseImport(): void {
    document.getElementById('courses-import-input')?.click();
  }

  triggerStudentImport(): void {
    document.getElementById('students-import-input')?.click();
  }

  triggerTeacherImport(): void {
    document.getElementById('teachers-import-input')?.click();
  }

  handleCourseImport(event: Event): void {
    this.handleImport(event, `${API_URL}/academic/import/courses`, 'cursos');
  }

  handleStudentImport(event: Event): void {
    this.handleImport(event, `${API_URL}/academic/import/students`, 'estudiantes');
  }

  handleTeacherImport(event: Event): void {
    this.handleImport(event, `${API_URL}/academic/import/teachers`, 'docentes');
  }

  exportCoursesExcel(): void {
    const rows = this.overview.courses.map(course => `
      <tr>
        <td>${this.escapeHtml(course.name)}</td>
        <td>${this.escapeHtml(course.parallel)}</td>
        <td>${this.escapeHtml(course.level)}</td>
        <td>${this.escapeHtml(course.weekStudentName || 'Sin semanero')}</td>
      </tr>
    `).join('');
    this.exportHtmlTable('cursos-leccionario.xls', ['Curso', 'Paralelo', 'Nivel', 'Semanero'], rows);
  }

  exportStudentsExcel(): void {
    const rows = this.filteredStudents().map(student => `
      <tr>
        <td>${this.escapeHtml(student.enrollmentNumber)}</td>
        <td>${this.escapeHtml(student.fullName)}</td>
        <td>${this.escapeHtml(student.courseName)}</td>
        <td>${this.escapeHtml(student.username)}</td>
        <td>${student.enabled ? 'Activo' : 'Inactivo'}</td>
      </tr>
    `).join('');
    this.exportHtmlTable('estudiantes-leccionario.xls', ['Matricula', 'Estudiante', 'Curso', 'Usuario', 'Estado'], rows);
  }

  exportTeachersExcel(): void {
    const rows = this.filteredTeachers().map(teacher => `
      <tr>
        <td>${this.escapeHtml(teacher.fullName)}</td>
        <td>${this.escapeHtml(teacher.specialization || 'Sin especialidad')}</td>
        <td>${this.escapeHtml(teacher.subjects.join(', ') || 'Sin materias asignadas')}</td>
        <td>${this.escapeHtml(teacher.courses.join(', ') || 'Sin cursos asignados')}</td>
        <td>${teacher.weeklyBlocks}</td>
      </tr>
    `).join('');
    this.exportHtmlTable('docentes-leccionario.xls', ['Docente', 'Especialidad', 'Materias', 'Cursos', 'Bloques/semana'], rows);
  }

  private loadOverview(afterLoad?: () => void): void {
    forkJoin({
      academic: this.http.get<AcademicOverview>(`${API_URL}/academic/overview`),
      schedules: this.http.get<ScheduleOverview>(`${API_URL}/schedules/overview`)
    }).pipe(
      catchError(() => {
        this.errorMessage = 'No se pudo cargar la estructura academica.';
        return of({
          academic: { courses: [], subjects: [], periods: [], students: [], teachers: [] },
          schedules: { blocks: [], schedules: [], courses: [], periods: [], subjects: [], teachers: [] }
        });
      })
    ).subscribe(({ academic, schedules }) => {
      this.errorMessage = '';
      this.overview = academic;
      this.scheduleOverview = schedules;
      if (!academic.courses.some(course => String(course.id) === this.selectedCourseFilter)) {
        this.selectedCourseFilter = 'all';
      }
      if (this.studentForm.controls.courseId.value === 0 && academic.courses.length > 0) {
        this.studentForm.patchValue({ courseId: academic.courses[0].id });
      }
      if (this.assignmentForm.controls.courseId.value === 0) {
        this.resetAssignmentForm();
      }
      afterLoad?.();
    });
  }

  editAssignment(assignment: CourseScheduleItem): void {
    this.editingAssignmentId = assignment.id;
    this.assignmentForm.setValue({
      courseId: assignment.courseId,
      periodId: assignment.periodId,
      scheduleBlockId: assignment.scheduleBlockId,
      subjectId: assignment.subjectId,
      teacherId: assignment.teacherId,
      weekday: assignment.weekday,
      classroom: assignment.classroom ?? ''
    });
  }

  resetAssignmentForm(): void {
    this.editingAssignmentId = null;
    this.assignmentForm.reset({
      courseId: this.overview.courses[0]?.id ?? 0,
      periodId: this.overview.periods[0]?.id ?? 0,
      scheduleBlockId: this.classBlocks()[0]?.id ?? 0,
      subjectId: this.overview.subjects[0]?.id ?? 0,
      teacherId: this.scheduleOverview.teachers[0]?.id ?? 0,
      weekday: 1,
      classroom: ''
    });
  }

  saveAssignment(): void {
    if (!this.canManageAcademic || this.assignmentForm.invalid) {
      this.errorMessage = 'Completa curso, periodo, dia, bloque, materia y docente para guardar la asignacion.';
      return;
    }

    const payload = this.assignmentForm.getRawValue();
    const request$ = this.editingAssignmentId
      ? this.http.put(`${API_URL}/schedules/course-assignments/${this.editingAssignmentId}`, payload)
      : this.http.post(`${API_URL}/schedules/course-assignments`, payload);

    request$.subscribe({
      next: () => {
        this.errorMessage = '';
        this.loadOverview(() => this.resetAssignmentForm());
      },
      error: (error) => {
        this.errorMessage = error?.error?.message ?? 'No se pudo guardar la asignacion docente.';
      }
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

  private exportHtmlTable(fileName: string, headers: string[], rows: string): void {
    const html = `
      <table>
        <thead>
          <tr>${headers.map(header => `<th>${header}</th>`).join('')}</tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    `;
    const blob = new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    this.downloadBlob(blob, fileName);
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

  private escapeHtml(value: string): string {
    return value
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;');
  }
}

type AcademicOverview = {
  courses: AcademicCourse[];
  subjects: Array<{ id: number; name: string; code: string; curriculumArea: string }>;
  periods: Array<{ id: number; name: string; startDate: string; endDate: string; active: boolean }>;
  students: AcademicStudent[];
  teachers: AcademicTeacher[];
};

type AcademicCourse = {
  id: number;
  name: string;
  parallel: string;
  level: string;
  weekStudentId: number | null;
  weekStudentName: string | null;
};

type AcademicStudent = {
  id: number;
  userId: number;
  username: string;
  identification: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  enabled: boolean;
  courseId: number;
  courseName: string;
  enrollmentNumber: string;
};

type AcademicTeacher = {
  id: number;
  userId: number;
  username: string;
  fullName: string;
  specialization: string;
  enabled: boolean;
  weeklyBlocks: number;
  subjects: string[];
  courses: string[];
};

type ScheduleOverview = {
  blocks: ScheduleBlockItem[];
  schedules: CourseScheduleItem[];
  courses: Array<{ id: number; name: string; parallel: string; level: string }>;
  periods: Array<{ id: number; name: string; startDate: string; endDate: string; active: boolean }>;
  subjects: Array<{ id: number; name: string; code: string; curriculumArea: string }>;
  teachers: Array<{ id: number; name: string; specialization: string }>;
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
