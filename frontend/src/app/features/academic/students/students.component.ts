import { HttpClient } from '@angular/common/http';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { catchError, forkJoin, of } from 'rxjs';
import { API_URL } from '../../../core/api.config';
import { AuthService } from '../../../core/auth.service';
import { AcademicCourse, AcademicStudent, AcademicOverview, CourseScheduleItem, ImportSummaryResult, ScheduleBlockItem, ScheduleOverview } from '../academic.models';

type StudentRepresentative = {
  id: number; studentId: number; studentName: string; enrollmentNumber: string;
  fullName: string; relationship: string; phone: string; email: string;
};

type GradeEntry = { id: number; subjectName: string; grade: number | null; periodName: string };

@Component({
  selector: 'app-academic-students',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule],
  template: `
    <div class="card border-0 shadow-sm h-100">
      <div class="card-body p-4 d-grid gap-4">
        <div class="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3">
          <div>
            <h2 class="h4 mb-1">Estudiantes por curso</h2>
            <p class="text-muted mb-0">Estos registros alimentan la lista de inasistencias del leccionario diario.</p>
          </div>
          <details class="action-menu">
            <summary class="btn btn-sm btn-primary">
              <i class="bi bi-list-ul me-2"></i>Acciones
            </summary>
            <div class="action-menu-panel">
              <button class="btn btn-sm btn-link text-start w-100" type="button" [disabled]="!canManageAcademic" (click)="startCreate()">
                <i class="bi bi-person-plus me-2"></i>Nuevo estudiante
              </button>
              <button class="btn btn-sm btn-link text-start w-100" type="button" (click)="exportExcel()">
                <i class="bi bi-file-earmark-excel me-2"></i>Exportar Excel
              </button>
              <button class="btn btn-sm btn-link text-start w-100" type="button" (click)="downloadTemplate()">
                <i class="bi bi-file-earmark-arrow-down me-2"></i>Descargar plantilla Excel
              </button>
              <button class="btn btn-sm btn-link text-start w-100" type="button" [disabled]="!canManageAcademic" (click)="triggerImport()">
                <i class="bi bi-file-earmark-arrow-up me-2"></i>Importar Excel
              </button>
            </div>
          </details>
        </div>

        <div class="row g-3">
          <div class="col-12 col-md-6">
            <label class="form-label fw-semibold">Filtrar por curso</label>
            <select class="form-select form-select-sm" [value]="selectedCourseFilter" (change)="selectedCourseFilter = $any($event.target).value">
              <option value="all">Todos los cursos</option>
              @for (course of courses; track course.id) {
                <option [value]="course.id">{{ course.name }} {{ course.parallel }}</option>
              }
            </select>
          </div>
          <div class="col-12 col-md-6">
            <label class="form-label fw-semibold">Buscar</label>
            <input class="form-control form-control-sm" type="text" [value]="search" (input)="search = $any($event.target).value" placeholder="Nombre, usuario o matricula">
          </div>
        </div>

        @if (editorOpen) {
          <form [formGroup]="form" class="row g-3 p-3 rounded-4 editor-panel">
            <div class="col-12">
              <h3 class="h6 mb-0">{{ editingId ? 'Editar estudiante' : 'Nuevo estudiante' }}</h3>
            </div>
            <div class="col-12 col-md-4">
              <label class="form-label fw-semibold">Usuario</label>
              <input class="form-control form-control-sm" type="text" formControlName="username">
            </div>
            <div class="col-12 col-md-4">
              <label class="form-label fw-semibold">Correo</label>
              <input class="form-control form-control-sm" type="email" formControlName="email">
            </div>
            <div class="col-12 col-md-4">
              <label class="form-label fw-semibold">Identificacion</label>
              <input class="form-control form-control-sm" type="text" formControlName="identification">
            </div>
            <div class="col-12 col-md-4">
              <label class="form-label fw-semibold">Nombres</label>
              <input class="form-control form-control-sm" type="text" formControlName="firstName">
            </div>
            <div class="col-12 col-md-4">
              <label class="form-label fw-semibold">Apellidos</label>
              <input class="form-control form-control-sm" type="text" formControlName="lastName">
            </div>
            <div class="col-12 col-md-4">
              <label class="form-label fw-semibold">Matricula</label>
              <input class="form-control form-control-sm" type="text" formControlName="enrollmentNumber">
            </div>
            <div class="col-12 col-md-6">
              <label class="form-label fw-semibold">Curso</label>
              <select class="form-select form-select-sm" formControlName="courseId">
                @for (course of courses; track course.id) {
                  <option [value]="course.id">{{ course.name }} {{ course.parallel }}</option>
                }
              </select>
            </div>
            <div class="col-12 col-md-6 d-flex align-items-end">
              <div class="form-check form-switch border rounded px-3 py-2 w-100">
                <input class="form-check-input" id="student-enabled" type="checkbox" formControlName="enabled">
                <label class="form-check-label ms-2 fw-semibold" for="student-enabled">Estudiante habilitado</label>
              </div>
            </div>
            <div class="col-12 d-flex justify-content-end gap-2">
              <button class="btn btn-sm btn-outline-primary" type="button" (click)="cancelEdit()">Cancelar</button>
              <button class="btn btn-sm btn-primary" type="button" (click)="save()">Guardar estudiante</button>
            </div>
          </form>
        }

        <div class="table-responsive">
          <table class="table table-striped align-middle mb-0">
            <thead>
              <tr>
                <th>Matricula</th>
                <th>Estudiante</th>
                <th>Curso</th>
                <th>Usuario</th>
                <th>Estado</th>
                <th class="text-end"></th>
              </tr>
            </thead>
            <tbody>
              @for (student of filtered(); track student.id) {
                <tr>
                  <td>{{ student.enrollmentNumber }}</td>
                  <td>
                    <div class="fw-semibold">{{ student.fullName }}</div>
                    <div class="small text-muted">{{ student.identification }}</div>
                  </td>
                  <td>{{ student.courseName }}</td>
                  <td>{{ student.username }}</td>
                  <td>
                    <span class="badge" [class.text-bg-success]="student.enabled" [class.text-bg-secondary]="!student.enabled">
                      {{ student.enabled ? 'Activo' : 'Inactivo' }}
                    </span>
                  </td>
                  <td class="text-end">
                    <button class="btn btn-sm btn-outline-primary" type="button" (click)="toggleInfo(student.id)">
                      <i class="bi" [class.bi-eye]="selectedStudentId !== student.id" [class.bi-eye-slash]="selectedStudentId === student.id"></i>
                      {{ selectedStudentId === student.id ? 'Ocultar' : 'Ver' }}
                    </button>
                  </td>
                </tr>
                @if (selectedStudentId === student.id) {
                  <tr>
                    <td colspan="6" class="p-0 border-0">
                      <div class="p-4 d-grid gap-4 bg-white rounded-3">
                        <div class="row g-3">
                          <div class="col-12 col-md-4">
                            <div class="card border-0 shadow-sm h-100">
                              <div class="card-body">
                                <div class="d-flex justify-content-between align-items-center mb-2">
                                  <h3 class="h6 mb-0"><i class="bi bi-person-vcard me-2"></i>Datos basicos</h3>
                                  @if (canManageAcademic) {
                                    <button class="btn btn-sm btn-outline-primary" type="button" (click)="edit(student)">
                                      <i class="bi bi-pencil"></i>
                                    </button>
                                  }
                                </div>
                                <dl class="row mb-0 small">
                                  <dt class="col-5 text-muted">Nombres</dt>
                                  <dd class="col-7 mb-1">{{ student.firstName }} {{ student.lastName }}</dd>
                                  <dt class="col-5 text-muted">Usuario</dt>
                                  <dd class="col-7 mb-1">{{ student.username }}</dd>
                                  <dt class="col-5 text-muted">Correo</dt>
                                  <dd class="col-7 mb-1">{{ student.email }}</dd>
                                  <dt class="col-5 text-muted">Identificacion</dt>
                                  <dd class="col-7 mb-1">{{ student.identification }}</dd>
                                  <dt class="col-5 text-muted">Matricula</dt>
                                  <dd class="col-7 mb-1">{{ student.enrollmentNumber }}</dd>
                                  <dt class="col-5 text-muted">Curso</dt>
                                  <dd class="col-7 mb-1">{{ student.courseName }}</dd>
                                  <dt class="col-5 text-muted">Estado</dt>
                                  <dd class="col-7 mb-1">
                                    <span class="badge" [class.text-bg-success]="student.enabled" [class.text-bg-secondary]="!student.enabled">
                                      {{ student.enabled ? 'Activo' : 'Inactivo' }}
                                    </span>
                                  </dd>
                                </dl>
                              </div>
                            </div>
                          </div>
                          <div class="col-12 col-md-4">
                            <div class="card border-0 shadow-sm h-100">
                              <div class="card-body">
                                <h3 class="h6 mb-2"><i class="bi bi-people me-2"></i>Representante</h3>
                                @let rep = studentRep(student.id);
                                @if (rep) {
                                  <dl class="row mb-0 small">
                                    <dt class="col-5 text-muted">Nombre</dt>
                                    <dd class="col-7 mb-1">{{ rep.fullName }}</dd>
                                    <dt class="col-5 text-muted">Parentesco</dt>
                                    <dd class="col-7 mb-1">{{ rep.relationship }}</dd>
                                    <dt class="col-5 text-muted">Telefono</dt>
                                    <dd class="col-7 mb-1">{{ rep.phone }}</dd>
                                    <dt class="col-5 text-muted">Correo</dt>
                                    <dd class="col-7 mb-1">{{ rep.email || 'Sin registro' }}</dd>
                                  </dl>
                                } @else {
                                  <p class="text-muted small mb-0">Sin representante asignado.</p>
                                }
                              </div>
                            </div>
                          </div>
                          <div class="col-12 col-md-4">
                            <div class="card border-0 shadow-sm h-100">
                              <div class="card-body">
                                <div class="d-flex justify-content-between align-items-center mb-2">
                                  <h3 class="h6 mb-0"><i class="bi bi-bar-chart me-2"></i>Calificaciones</h3>
                                  @if (canManageAcademic && !editingGrades && grades.length > 0) {
                                    <button class="btn btn-sm btn-outline-primary" type="button" (click)="startEditGrades()">
                                      <i class="bi bi-pencil"></i>
                                    </button>
                                  }
                                </div>
                                @if (editingGrades) {
                                  <div class="table-responsive" style="max-height:220px">
                                    <table class="table table-sm mb-0">
                                      <thead>
                                        <tr>
                                          <th class="small">Materia</th>
                                          <th class="small text-end">Nota</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        @for (g of grades; track g.id) {
                                          <tr>
                                            <td class="small">{{ g.subjectName }}</td>
                                            <td class="small text-end">
                                              <input class="form-control form-control-sm text-end" type="number" step="0.1" min="0" max="10"
                                                     style="width:80px;display:inline-block"
                                                     [value]="pendingGrades.get(g.id) ?? ''"
                                                     (input)="setGrade(g.id, $any($event.target).value)">
                                            </td>
                                          </tr>
                                        }
                                      </tbody>
                                    </table>
                                  </div>
                                  <div class="d-flex gap-2 mt-2">
                                    <button class="btn btn-sm btn-primary" type="button" (click)="saveGrades(student.id)">Guardar notas</button>
                                    <button class="btn btn-sm btn-outline-secondary" type="button" (click)="cancelEditGrades()">Cancelar</button>
                                  </div>
                                } @else {
                                  @if (grades.length > 0) {
                                    <div class="table-responsive" style="max-height:200px">
                                      <table class="table table-sm mb-0">
                                        <thead>
                                          <tr>
                                            <th class="small">Materia</th>
                                            <th class="small text-end">Nota</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          @for (g of grades; track g.id) {
                                            <tr>
                                              <td class="small">{{ g.subjectName }}</td>
                                              <td class="small text-end fw-semibold">{{ g.grade ?? '--' }}</td>
                                            </tr>
                                          }
                                        </tbody>
                                      </table>
                                    </div>
                                  } @else {
                                    <div class="d-flex flex-column align-items-center gap-2 py-3">
                                      <i class="bi bi-journal-text text-muted" style="font-size:1.5rem"></i>
                                      <p class="text-muted small mb-0">Sin calificaciones registradas.</p>
                                    </div>
                                  }
                                }
                              </div>
                            </div>
                          </div>
                        </div>

                        <div class="card border-0 shadow-sm">
                          <div class="card-body">
                            <h3 class="h6 mb-3"><i class="bi bi-calendar-week me-2"></i>Horario del curso</h3>
                            @if (courseSchedule(student.courseId).length === 0) {
                              <p class="text-muted small mb-0">Sin horario asignado al curso.</p>
                            } @else {
                              @for (day of weekdays; track day.value) {
                                @let entries = courseScheduleByDay(student.courseId, day.value);
                                @if (entries.length > 0) {
                                  <div class="mb-3">
                                    <div class="fw-semibold small text-uppercase text-primary mb-2">{{ day.label }}</div>
                                    <div class="table-responsive">
                                      <table class="table table-sm align-middle mb-0">
                                        <thead>
                                          <tr>
                                            <th>Bloque</th>
                                            <th>Materia</th>
                                            <th>Docente</th>
                                            <th>Aula</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          @for (entry of entries; track entry.id) {
                                            <tr>
                                              <td class="small">{{ entry.scheduleLabel }}</td>
                                              <td class="fw-semibold small">{{ entry.subjectName }}</td>
                                              <td class="small">{{ entry.teacherName }}</td>
                                              <td class="small">{{ entry.classroom || 'Sin aula' }}</td>
                                            </tr>
                                          }
                                        </tbody>
                                      </table>
                                    </div>
                                  </div>
                                }
                              }
                            }
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                }
              } @empty {
                <tr><td colspan="6" class="text-center text-muted py-4">No hay estudiantes para ese filtro.</td></tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <input id="students-import-input" class="d-none" type="file" accept=".xlsx" (change)="handleImport($event)">
  `
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
  grades: GradeEntry[] = [];

  selectedCourseFilter = 'all';
  search = '';
  editorOpen = false;
  editingId: number | null = null;
  selectedStudentId: number | null = null;
  editingGrades = false;
  pendingGrades: Map<number, number | null> = new Map();

  readonly weekdays = [
    { value: 1, label: 'Lunes' },
    { value: 2, label: 'Martes' },
    { value: 3, label: 'Miercoles' },
    { value: 4, label: 'Jueves' },
    { value: 5, label: 'Viernes' },
    { value: 6, label: 'Sabado' },
    { value: 7, label: 'Domingo' }
  ];

  form = this.fb.nonNullable.group({
    username: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    identification: ['', Validators.required],
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    enrollmentNumber: ['', Validators.required],
    courseId: [0, Validators.required],
    enabled: [true]
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

  toggleInfo(studentId: number): void {
    this.selectedStudentId = this.selectedStudentId === studentId ? null : studentId;
    if (this.selectedStudentId === studentId) {
      this.loadStudentGrades(studentId);
    }
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

  loadStudentGrades(studentId: number): void {
    this.http.get<GradeEntry[]>(`${API_URL}/academic/grades?studentId=${studentId}`).pipe(
      catchError(() => of([]))
    ).subscribe(data => {
      this.grades = data;
    });
  }

  startEditGrades(): void {
    this.editingGrades = true;
    this.pendingGrades = new Map(this.grades.map(g => [g.id, g.grade]));
  }

  cancelEditGrades(): void {
    this.editingGrades = false;
    this.pendingGrades = new Map();
  }

  setGrade(gradeId: number, value: string): void {
    const num = parseFloat(value);
    this.pendingGrades.set(gradeId, isNaN(num) ? null : num);
  }

  saveGrades(studentId: number): void {
    if (!this.canManageAcademic) return;
    const updates: Array<{ id: number; grade: number | null }> = [];
    for (const [id, grade] of this.pendingGrades) {
      const original = this.grades.find(g => g.id === id);
      if (original && original.grade !== grade) {
        updates.push({ id, grade });
      }
    }
    if (updates.length === 0) { this.cancelEditGrades(); return; }
    this.http.put(`${API_URL}/academic/grades/batch`, { studentId, grades: updates }).pipe(
      catchError(() => of(null))
    ).subscribe({
      next: () => {
        this.cancelEditGrades();
        this.loadStudentGrades(studentId);
      }
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
    this.editingId = student.id;
    this.editorOpen = true;
    this.form.setValue({
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

  cancelEdit(): void {
    this.editorOpen = false;
    this.editingId = null;
    this.form.reset({
      username: '', email: '', identification: '',
      firstName: '', lastName: '', enrollmentNumber: '',
      courseId: this.courses[0]?.id ?? 0, enabled: true
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
      next: () => { this.cancelEdit(); this.loadData(); },
      error: () => {}
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
}
