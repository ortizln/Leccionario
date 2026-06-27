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
  emergencyContact?: string; emergencyPhone?: string; address?: string;
};

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

        @if (repSearchOpen) {
          <div class="modal-shell" (click)="repSearchOpen = false">
            <div class="modal-card" (click)="$event.stopPropagation()">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <h3 class="h6 mb-0">Buscar representante</h3>
                <button class="btn btn-sm btn-outline-secondary" type="button" (click)="repSearchOpen = false"><i class="bi bi-x-lg"></i></button>
              </div>
              <input class="form-control form-control-sm mb-3" type="search" placeholder="Buscar por nombre, estudiante, telefono..."
                     [value]="repSearchTerm" (input)="repSearchTerm = $any($event.target).value">

              @if (!creatingRep) {
                <div class="d-grid gap-1" style="max-height:280px;overflow-y:auto">
                  @for (rep of filteredReps(); track rep.id) {
                    <button class="btn btn-sm btn-outline-primary text-start d-flex justify-content-between align-items-center gap-2" type="button" (click)="selectRep(rep)">
                      <span class="fw-semibold small">{{ rep.fullName }}</span>
                      <span class="text-muted small">{{ rep.phone }}</span>
                    </button>
                  } @empty {
                    <p class="text-muted small text-center py-3 mb-0">No se encontraron representantes.</p>
                  }
                </div>
                <button class="btn btn-sm btn-primary mt-3 w-100" type="button" (click)="createNewRep()">
                  <i class="bi bi-person-plus me-2"></i>Crear nuevo representante
                </button>
              }

              @if (creatingRep) {
                <div class="d-grid gap-3">
                  <div>
                    <label class="form-label fw-semibold small mb-1">Nombre completo</label>
                    <input class="form-control form-control-sm" type="text" [value]="repForm.value.fullName" (input)="repForm.patchValue({fullName: $any($event.target).value})" placeholder="Nombres y apellidos">
                  </div>
                  <div class="row g-2">
                    <div class="col-6">
                      <label class="form-label fw-semibold small mb-1">Parentesco</label>
                      <select class="form-select form-select-sm" [value]="repForm.value.relationship" (change)="repForm.patchValue({relationship: $any($event.target).value})">
                        <option value="PADRE">Padre</option>
                        <option value="MADRE">Madre</option>
                        <option value="TUTOR">Tutor legal</option>
                        <option value="ABUELO">Abuelo(a)</option>
                        <option value="HERMANO">Hermano(a)</option>
                        <option value="OTRO">Otro familiar</option>
                      </select>
                    </div>
                    <div class="col-6">
                      <label class="form-label fw-semibold small mb-1">Telefono</label>
                      <input class="form-control form-control-sm" type="tel" [value]="repForm.value.phone" (input)="repForm.patchValue({phone: $any($event.target).value})" placeholder="0999999999">
                    </div>
                  </div>
                  <div class="row g-2">
                    <div class="col-6">
                      <label class="form-label fw-semibold small mb-1">Correo</label>
                      <input class="form-control form-control-sm" type="email" [value]="repForm.value.email" (input)="repForm.patchValue({email: $any($event.target).value})" placeholder="correo@ejemplo.com">
                    </div>
                    <div class="col-6">
                      <label class="form-label fw-semibold small mb-1">Direccion</label>
                      <input class="form-control form-control-sm" type="text" [value]="repForm.value.address" (input)="repForm.patchValue({address: $any($event.target).value})" placeholder="Direccion completa">
                    </div>
                  </div>
                  <div class="d-flex gap-2 justify-content-end">
                    <button class="btn btn-sm btn-outline-secondary" type="button" (click)="cancelNewRep()">Volver</button>
                    <button class="btn btn-sm btn-primary" type="button" (click)="saveNewRep()">Guardar y seleccionar</button>
                  </div>
                </div>
              }
            </div>
          </div>
        }

        @if (editorOpen) {
          <div class="modal-shell" (click)="cancelEdit()">
            <div class="modal-card" style="max-width:720px" (click)="$event.stopPropagation()">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <h3 class="h6 mb-0"><i class="bi bi-person-plus me-2"></i>{{ editingId ? 'Editar estudiante' : 'Nuevo estudiante' }}</h3>
                <button class="btn btn-sm btn-outline-secondary" type="button" (click)="cancelEdit()"><i class="bi bi-x-lg"></i></button>
              </div>
              <form [formGroup]="form" class="row g-3">
                <div class="col-12 col-md-4">
                  <label class="form-label fw-semibold small">Usuario</label>
                  <input class="form-control form-control-sm" type="text" formControlName="username">
                </div>
                <div class="col-12 col-md-4">
                  <label class="form-label fw-semibold small">Correo</label>
                  <input class="form-control form-control-sm" type="email" formControlName="email">
                </div>
                <div class="col-12 col-md-4">
                  <label class="form-label fw-semibold small">Identificacion</label>
                  <input class="form-control form-control-sm" type="text" formControlName="identification">
                </div>
                <div class="col-12 col-md-4">
                  <label class="form-label fw-semibold small">Nombres</label>
                  <input class="form-control form-control-sm" type="text" formControlName="firstName">
                </div>
                <div class="col-12 col-md-4">
                  <label class="form-label fw-semibold small">Apellidos</label>
                  <input class="form-control form-control-sm" type="text" formControlName="lastName">
                </div>
                <div class="col-12 col-md-4">
                  <label class="form-label fw-semibold small">Matricula</label>
                  <input class="form-control form-control-sm" type="text" formControlName="enrollmentNumber" placeholder="Opcional">
                </div>
                <div class="col-12 col-md-4">
                  <label class="form-label fw-semibold small">Fecha nacimiento</label>
                  <input class="form-control form-control-sm" type="date" formControlName="birthDate">
                </div>
                <div class="col-12 col-md-4">
                  <label class="form-label fw-semibold small">Genero</label>
                  <select class="form-select form-select-sm" formControlName="gender">
                    <option value="">Seleccionar...</option>
                    <option value="M">Masculino</option>
                    <option value="F">Femenino</option>
                    <option value="OTRO">Otro</option>
                  </select>
                </div>
                <div class="col-12 col-md-4">
                  <label class="form-label fw-semibold small">Curso</label>
                  <select class="form-select form-select-sm" formControlName="courseId">
                    @for (course of courses; track course.id) {
                      <option [value]="course.id">{{ course.name }} {{ course.parallel }}</option>
                    }
                  </select>
                </div>
                <div class="col-12 col-md-6 d-flex align-items-end">
                  <div class="form-check form-switch border rounded px-3 py-2 w-100">
                    <input class="form-check-input" id="student-enabled" type="checkbox" formControlName="enabled">
                    <label class="form-check-label ms-2 fw-semibold small" for="student-enabled">Habilitado</label>
                  </div>
                </div>
                <div class="col-12">
                  <label class="form-label fw-semibold small">Representante</label>
                  <div class="d-flex gap-2 align-items-center">
                    @if (selectedRep) {
                      <span class="badge rounded-pill text-bg-light d-flex align-items-center gap-2 py-2 px-3">
                        <i class="bi bi-person-check text-primary"></i>
                        <span>{{ selectedRep.fullName }} · {{ selectedRep.phone }}</span>
                        <button class="btn btn-sm btn-link text-danger p-0 ms-1" type="button" (click)="clearRep()" title="Quitar"><i class="bi bi-x-lg"></i></button>
                      </span>
                    } @else {
                      <span class="text-muted small me-2">Sin representante</span>
                    }
                    <button class="btn btn-sm btn-outline-primary" type="button" (click)="openRepSearch()">
                      <i class="bi bi-search me-1"></i>{{ selectedRep ? 'Cambiar' : 'Buscar' }}
                    </button>
                  </div>
                </div>
                <div class="col-12 d-flex justify-content-end gap-2 mt-2">
                  <button class="btn btn-sm btn-outline-secondary" type="button" (click)="cancelEdit()">Cancelar</button>
                  <button class="btn btn-sm btn-primary" type="button" (click)="save()"><i class="bi bi-check-lg me-1"></i>Guardar</button>
                </div>
              </form>
            </div>
          </div>
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
                                  <dt class="col-5 text-muted">Fecha de nac.</dt>
                                  <dd class="col-7 mb-1">{{ student.birthDate || '—' }}</dd>
                                  <dt class="col-5 text-muted">Genero</dt>
                                  <dd class="col-7 mb-1">{{ {M:'Masculino', F:'Femenino', OTRO:'Otro'}[student.gender ?? ''] || '—' }}</dd>
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
  selectedCourseFilter = 'all';
  search = '';
  editorOpen = false;
  editingId: number | null = null;
  selectedStudentId: number | null = null;

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
