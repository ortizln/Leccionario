import { HttpClient } from '@angular/common/http';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { catchError, of } from 'rxjs';
import { API_URL } from '../../../core/api.config';
import { AuthService } from '../../../core/auth.service';
import { AcademicOverview, AcademicTeacher, CourseScheduleItem, ImportSummaryResult, ScheduleBlockItem, ScheduleOverview } from '../academic.models';

@Component({
  selector: 'app-academic-teachers',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule],
  template: `
    <div class="card border-0 shadow-sm h-100">
      <div class="card-body">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h2 class="h5 mb-0">Docentes y carga asignada</h2>
          <details class="action-menu">
            <summary class="btn btn-sm btn-primary">
              <i class="bi bi-list-ul me-2"></i>Acciones
            </summary>
            <div class="action-menu-panel">
              <button class="btn btn-sm btn-link text-start w-100" type="button" [disabled]="!canManageAcademic" (click)="startCreate()">
                <i class="bi bi-person-plus me-2"></i>Nuevo docente
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

        <div class="row g-3 mb-3">
          <div class="col-12 col-lg-6">
            <label class="form-label fw-semibold">Buscar docente</label>
            <input class="form-control form-control-sm" type="text" [value]="search" (input)="search = $any($event.target).value" placeholder="Nombre, usuario o especialidad">
          </div>
        </div>

        @if (editorOpen) {
          <form [formGroup]="form" class="row g-3 p-3 rounded-4 editor-panel mb-4">
            <div class="col-12">
              <h3 class="h6 mb-0">{{ editingId ? 'Editar docente' : 'Nuevo docente' }}</h3>
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
              <label class="form-label fw-semibold">Especialidad</label>
              <input class="form-control form-control-sm" type="text" formControlName="specialization">
            </div>
            <div class="col-12 col-md-6 d-flex align-items-end">
              <div class="form-check form-switch border rounded px-3 py-2 w-100">
                <input class="form-check-input" id="teacher-enabled" type="checkbox" formControlName="enabled">
                <label class="form-check-label ms-2 fw-semibold" for="teacher-enabled">Docente habilitado</label>
              </div>
            </div>
            <div class="col-12 d-flex justify-content-end gap-2">
              <button class="btn btn-sm btn-outline-primary" type="button" (click)="cancelEdit()">Cancelar</button>
              <button class="btn btn-sm btn-primary" type="button" (click)="save()">Guardar docente</button>
            </div>
          </form>
        }

        <div class="table-responsive">
          <table class="table table-striped align-middle mb-0">
            <thead>
              <tr>
                <th>Docente</th>
                <th>Materias</th>
                <th>Cursos</th>
                <th>Bloques/semana</th>
                <th class="text-end"></th>
              </tr>
            </thead>
            <tbody>
              @for (teacher of filtered(); track teacher.id) {
                <tr>
                  <td>
                    <div class="fw-semibold">{{ teacher.fullName }}</div>
                    <div class="small text-muted">{{ teacher.specialization || 'Sin especialidad' }}</div>
                  </td>
                  <td>{{ teacher.subjects.length > 0 ? teacher.subjects.join(', ') : 'Sin materias asignadas' }}</td>
                  <td>{{ teacher.courses.length > 0 ? teacher.courses.join(', ') : 'Sin cursos asignados' }}</td>
                  <td>
                    <span class="badge" [class.text-bg-success]="teacher.weeklyBlocks > 0" [class.text-bg-secondary]="teacher.weeklyBlocks === 0">
                      {{ teacher.weeklyBlocks }}
                    </span>
                  </td>
                  <td class="text-end">
                    <button class="btn btn-sm btn-outline-primary" type="button" (click)="toggleInfo(teacher.id)">
                      <i class="bi" [class.bi-eye]="selectedTeacherId !== teacher.id" [class.bi-eye-slash]="selectedTeacherId === teacher.id"></i>
                      {{ selectedTeacherId === teacher.id ? 'Ocultar' : 'Ver' }}
                    </button>
                  </td>
                </tr>
                @if (selectedTeacherId === teacher.id) {
                  <tr>
                    <td colspan="5" class="p-0 border-0">
                      <div class="p-4 d-grid gap-4 bg-white rounded-3">
                        <div class="row g-3">
                          <div class="col-12 col-md-4">
                            <div class="card border-0 shadow-sm h-100">
                              <div class="card-body">
                                <div class="d-flex justify-content-between align-items-center mb-2">
                                  <h3 class="h6 mb-0"><i class="bi bi-person-vcard me-2"></i>Informacion personal</h3>
                                  <button class="btn btn-sm btn-outline-primary" type="button" (click)="editTeacher(teacher)">
                                    <i class="bi bi-pencil"></i>
                                  </button>
                                </div>
                                <dl class="row mb-0 small">
                                  <dt class="col-5 text-muted">Usuario</dt>
                                  <dd class="col-7 mb-1">{{ teacher.username }}</dd>
                                  <dt class="col-5 text-muted">Correo</dt>
                                  <dd class="col-7 mb-1">{{ teacher.username }}&#64;educacion.gob.ec</dd>
                                  <dt class="col-5 text-muted">Estado</dt>
                                  <dd class="col-7 mb-1">
                                    <span class="badge" [class.text-bg-success]="teacher.enabled" [class.text-bg-secondary]="!teacher.enabled">
                                      {{ teacher.enabled ? 'Activo' : 'Inactivo' }}
                                    </span>
                                  </dd>
                                </dl>
                              </div>
                            </div>
                          </div>
                          <div class="col-12 col-md-4">
                            <div class="card border-0 shadow-sm h-100">
                              <div class="card-body">
                                <div class="d-flex justify-content-between align-items-center mb-2">
                                  <h3 class="h6 mb-0"><i class="bi bi-book me-2"></i>Materias asignadas</h3>
                                  @if (canManageAcademic && editingSubjectsFor !== teacher.id) {
                                    <button class="btn btn-sm btn-outline-primary" type="button" (click)="startEditSubjects(teacher)">
                                      <i class="bi bi-pencil"></i>
                                    </button>
                                  }
                                </div>
                                @if (editingSubjectsFor === teacher.id) {
                                  <div class="d-grid gap-2" style="max-height:200px;overflow-y:auto">
                                    @for (subj of allSubjectNames; track subj) {
                                      <label class="d-flex align-items-center gap-2 small fw-normal">
                                        <input class="form-check-input m-0" type="checkbox"
                                               [checked]="pendingSubjectSelection.has(subj)"
                                               (change)="togglePendingSubject(subj)">
                                        {{ subj }}
                                      </label>
                                    }
                                  </div>
                                  <div class="d-flex gap-2 mt-2">
                                    <button class="btn btn-sm btn-primary" type="button" (click)="saveSubjects(teacher)">Guardar</button>
                                    <button class="btn btn-sm btn-outline-secondary" type="button" (click)="cancelEditSection()">Cancelar</button>
                                  </div>
                                } @else {
                                  @if (teacher.subjects.length > 0) {
                                    <ul class="list-unstyled mb-0 small">
                                      @for (subj of teacher.subjects; track subj) {
                                        <li><i class="bi bi-dot me-1"></i>{{ subj }}</li>
                                      }
                                    </ul>
                                  } @else {
                                    <p class="text-muted small mb-0">Sin materias asignadas.</p>
                                  }
                                }
                              </div>
                            </div>
                          </div>
                          <div class="col-12 col-md-4">
                            <div class="card border-0 shadow-sm h-100">
                              <div class="card-body">
                                <div class="d-flex justify-content-between align-items-center mb-2">
                                  <h3 class="h6 mb-0"><i class="bi bi-mortarboard me-2"></i>Cursos asignados</h3>
                                  @if (canManageAcademic && editingCoursesFor !== teacher.id) {
                                    <button class="btn btn-sm btn-outline-primary" type="button" (click)="startEditCourses(teacher)">
                                      <i class="bi bi-pencil"></i>
                                    </button>
                                  }
                                </div>
                                @if (editingCoursesFor === teacher.id) {
                                  <div class="d-grid gap-2" style="max-height:200px;overflow-y:auto">
                                    @for (course of allCourseNames; track course) {
                                      <label class="d-flex align-items-center gap-2 small fw-normal">
                                        <input class="form-check-input m-0" type="checkbox"
                                               [checked]="pendingCourseSelection.has(course)"
                                               (change)="togglePendingCourse(course)">
                                        {{ course }}
                                      </label>
                                    }
                                  </div>
                                  <div class="d-flex gap-2 mt-2">
                                    <button class="btn btn-sm btn-primary" type="button" (click)="saveCourses(teacher)">Guardar</button>
                                    <button class="btn btn-sm btn-outline-secondary" type="button" (click)="cancelEditSection()">Cancelar</button>
                                  </div>
                                } @else {
                                  @if (teacher.courses.length > 0) {
                                    <ul class="list-unstyled mb-0 small">
                                      @for (course of teacher.courses; track course) {
                                        <li><i class="bi bi-dot me-1"></i>{{ course }}</li>
                                      }
                                    </ul>
                                  } @else {
                                    <p class="text-muted small mb-0">Sin cursos asignados.</p>
                                  }
                                }
                              </div>
                            </div>
                          </div>
                        </div>

                        <div class="card border-0 shadow-sm">
                          <div class="card-body">
                            <div class="d-flex justify-content-between align-items-center mb-3">
                              <h3 class="h6 mb-0"><i class="bi bi-calendar-week me-2"></i>Horario semanal</h3>
                              @if (canManageAcademic && addingScheduleFor !== teacher.id) {
                                <button class="btn btn-sm btn-outline-primary" type="button" (click)="startAddScheduleEntry(teacher.id)">
                                  <i class="bi bi-plus-circle me-1"></i>Agregar
                                </button>
                              }
                            </div>

                            @if (addingScheduleFor === teacher.id) {
                              <form [formGroup]="scheduleForm" class="row g-2 p-3 rounded-3 editor-panel mb-3">
                                <div class="col-12 col-md-3">
                                  <label class="form-label small fw-semibold">Dia</label>
                                  <select class="form-select form-select-sm" formControlName="weekday">
                                    @for (d of weekdays; track d.value) {
                                      <option [value]="d.value">{{ d.label }}</option>
                                    }
                                  </select>
                                </div>
                                <div class="col-12 col-md-3">
                                  <label class="form-label small fw-semibold">Bloque</label>
                                  <select class="form-select form-select-sm" formControlName="scheduleBlockId">
                                    @for (b of classBlocks(); track b.id) {
                                      <option [value]="b.id">{{ b.label }} ({{ b.startTime }}-{{ b.endTime }})</option>
                                    }
                                  </select>
                                </div>
                                <div class="col-12 col-md-3">
                                  <label class="form-label small fw-semibold">Materia</label>
                                  <select class="form-select form-select-sm" formControlName="subjectId">
                                    @for (s of overviewSubjects; track s.id) {
                                      <option [value]="s.id">{{ s.name }}</option>
                                    }
                                  </select>
                                </div>
                                <div class="col-12 col-md-3">
                                  <label class="form-label small fw-semibold">Curso</label>
                                  <select class="form-select form-select-sm" formControlName="courseId">
                                    @for (c of overviewCourses; track c.id) {
                                      <option [value]="c.id">{{ c.name }} {{ c.parallel }}</option>
                                    }
                                  </select>
                                </div>
                                <div class="col-12 col-md-6">
                                  <label class="form-label small fw-semibold">Aula</label>
                                  <input class="form-control form-control-sm" type="text" formControlName="classroom" placeholder="Aula 1">
                                </div>
                                <div class="col-12 col-md-6 d-flex align-items-end gap-2">
                                  <button class="btn btn-sm btn-primary" type="button" (click)="saveScheduleEntry(teacher.id)">Guardar</button>
                                  <button class="btn btn-sm btn-outline-secondary" type="button" (click)="cancelScheduleEdit()">Cancelar</button>
                                </div>
                              </form>
                            }

                            @if (teacherSchedule(teacher.id).length === 0) {
                              <p class="text-muted small mb-0">Sin horario asignado.</p>
                            } @else {
                              @for (day of weekdays; track day.value) {
                                @let entries = teacherScheduleByDay(teacher.id, day.value);
                                @if (entries.length > 0) {
                                  <div class="mb-3">
                                    <div class="fw-semibold small text-uppercase text-primary mb-2">{{ day.label }}</div>
                                    <div class="table-responsive">
                                      <table class="table table-sm align-middle mb-0">
                                        <thead>
                                          <tr>
                                            <th>Bloque</th>
                                            <th>Materia</th>
                                            <th>Curso</th>
                                            <th>Aula</th>
                                            <th class="text-end"></th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          @for (entry of entries; track entry.id) {
                                            @if (editingScheduleEntryId === entry.id) {
                                              <tr>
                                                <td colspan="5" class="p-2 border-0">
                                                  <form [formGroup]="scheduleForm" class="row g-2 p-2 rounded-3 editor-panel">
                                                    <div class="col-12 col-md-2">
                                                      <select class="form-select form-select-sm" formControlName="weekday">
                                                        @for (d of weekdays; track d.value) {
                                                          <option [value]="d.value">{{ d.label }}</option>
                                                        }
                                                      </select>
                                                    </div>
                                                    <div class="col-12 col-md-2">
                                                      <select class="form-select form-select-sm" formControlName="scheduleBlockId">
                                                        @for (b of classBlocks(); track b.id) {
                                                          <option [value]="b.id">{{ b.label }}</option>
                                                        }
                                                      </select>
                                                    </div>
                                                    <div class="col-12 col-md-2">
                                                      <select class="form-select form-select-sm" formControlName="subjectId">
                                                        @for (s of overviewSubjects; track s.id) {
                                                          <option [value]="s.id">{{ s.name }}</option>
                                                        }
                                                      </select>
                                                    </div>
                                                    <div class="col-12 col-md-2">
                                                      <select class="form-select form-select-sm" formControlName="courseId">
                                                        @for (c of overviewCourses; track c.id) {
                                                          <option [value]="c.id">{{ c.name }} {{ c.parallel }}</option>
                                                        }
                                                      </select>
                                                    </div>
                                                    <div class="col-12 col-md-2">
                                                      <input class="form-control form-control-sm" type="text" formControlName="classroom" placeholder="Aula">
                                                    </div>
                                                    <div class="col-12 col-md-2 d-flex gap-1">
                                                      <button class="btn btn-sm btn-primary" type="button" (click)="saveScheduleEntry(teacher.id)">
                                                        <i class="bi bi-check"></i>
                                                      </button>
                                                      <button class="btn btn-sm btn-outline-secondary" type="button" (click)="cancelScheduleEdit()">
                                                        <i class="bi bi-x"></i>
                                                      </button>
                                                    </div>
                                                  </form>
                                                </td>
                                              </tr>
                                            } @else {
                                              <tr>
                                                <td class="small">{{ entry.scheduleLabel }}</td>
                                                <td class="fw-semibold small">{{ entry.subjectName }}</td>
                                                <td class="small">{{ entry.courseName }}</td>
                                                <td class="small">{{ entry.classroom || 'Sin aula' }}</td>
                                                <td class="text-end">
                                                  @if (canManageAcademic) {
                                                    <button class="btn btn-sm btn-link text-primary p-0 me-2" type="button"
                                                            (click)="startEditScheduleEntry(entry)">
                                                      <i class="bi bi-pencil"></i>
                                                    </button>
                                                    <button class="btn btn-sm btn-link text-danger p-0" type="button"
                                                            (click)="deleteScheduleEntry(entry.id)">
                                                      <i class="bi bi-trash"></i>
                                                    </button>
                                                  }
                                                </td>
                                              </tr>
                                            }
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
                <tr><td colspan="5" class="text-center text-muted py-4">No hay docentes vinculados al horario.</td></tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <input id="teachers-import-input" class="d-none" type="file" accept=".xlsx" (change)="handleImport($event)">
  `
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
  overviewCourses: Array<{ id: number; name: string; parallel: string }> = [];
  overviewSubjects: Array<{ id: number; name: string }> = [];
  periods: Array<{ id: number; name: string; active: boolean }> = [];

  search = '';
  editorOpen = false;
  editingId: number | null = null;
  selectedTeacherId: number | null = null;
  editingSubjectsFor: number | null = null;
  editingCoursesFor: number | null = null;
  pendingSubjectSelection: Set<string> = new Set();
  pendingCourseSelection: Set<string> = new Set();
  editingScheduleEntryId: number | null = null;
  addingScheduleFor: number | null = null;

  scheduleForm = this.fb.nonNullable.group({
    courseId: [0, Validators.required],
    subjectId: [0, Validators.required],
    scheduleBlockId: [0, Validators.required],
    weekday: [1, Validators.required],
    classroom: ['']
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
      this.allCourseNames = data.courses.map(c => c.name + ' ' + c.parallel);
      this.overviewCourses = data.courses;
      this.overviewSubjects = data.subjects;
      this.periods = data.periods;
    });
    this.http.get<ScheduleOverview>(`${API_URL}/schedules/overview`).pipe(
      catchError(() => of({ blocks: [], schedules: [], courses: [], periods: [], subjects: [], teachers: [] }))
    ).subscribe(data => {
      this.scheduleBlocks = data.blocks;
      this.allSchedules = data.schedules;
    });
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

  toggleInfo(teacherId: number): void {
    this.selectedTeacherId = this.selectedTeacherId === teacherId ? null : teacherId;
    if (this.selectedTeacherId !== teacherId) {
      this.cancelEditSection();
    }
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

  togglePendingCourse(course: string): void {
    if (this.pendingCourseSelection.has(course)) {
      this.pendingCourseSelection.delete(course);
    } else {
      this.pendingCourseSelection.add(course);
    }
  }

  saveSubjects(teacher: AcademicTeacher): void {
    if (!this.canManageAcademic) return;
    const updated = Array.from(this.pendingSubjectSelection);
    this.http.put(`${API_URL}/academic/teachers/${teacher.id}`, { subjects: updated }).pipe(
      catchError(() => of(null))
    ).subscribe({
      next: () => {
        const idx = this.teachers.findIndex(t => t.id === teacher.id);
        if (idx !== -1) {
          this.teachers[idx] = { ...this.teachers[idx], subjects: updated };
        }
        this.cancelEditSection();
      }
    });
  }

  saveCourses(teacher: AcademicTeacher): void {
    if (!this.canManageAcademic) return;
    const updated = Array.from(this.pendingCourseSelection);
    this.http.put(`${API_URL}/academic/teachers/${teacher.id}`, { courses: updated }).pipe(
      catchError(() => of(null))
    ).subscribe({
      next: () => {
        const idx = this.teachers.findIndex(t => t.id === teacher.id);
        if (idx !== -1) {
          this.teachers[idx] = { ...this.teachers[idx], courses: updated };
        }
        this.cancelEditSection();
      }
    });
  }

  classBlocks(): ScheduleBlockItem[] {
    return this.scheduleBlocks.filter(b => b.blockType === 'CLASS');
  }

  activePeriodId(): number {
    return this.periods.find(p => p.active)?.id ?? this.periods[0]?.id ?? 0;
  }

  startAddScheduleEntry(teacherId: number): void {
    this.editingScheduleEntryId = null;
    this.addingScheduleFor = teacherId;
    this.scheduleForm.reset({
      courseId: this.overviewCourses[0]?.id ?? 0,
      subjectId: this.overviewSubjects[0]?.id ?? 0,
      scheduleBlockId: this.classBlocks()[0]?.id ?? 0,
      weekday: 1,
      classroom: ''
    });
  }

  startEditScheduleEntry(entry: CourseScheduleItem): void {
    this.addingScheduleFor = null;
    this.editingScheduleEntryId = entry.id;
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
    this.scheduleForm.reset({ courseId: 0, subjectId: 0, scheduleBlockId: 0, weekday: 1, classroom: '' });
  }

  saveScheduleEntry(teacherId: number): void {
    if (!this.canManageAcademic || this.scheduleForm.invalid) return;
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

    request$.pipe(catchError(() => of(null))).subscribe({
      next: () => {
        this.cancelScheduleEdit();
        this.loadData();
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
  }

  editTeacher(teacher: AcademicTeacher): void {
    this.editingId = teacher.id;
    this.editorOpen = true;
    this.selectedTeacherId = null;
    this.http.get<any>(`${API_URL}/academic/teachers/${teacher.id}`).pipe(
      catchError(() => of(null))
    ).subscribe(detail => {
      if (detail) {
        this.form.setValue({
          username: detail.username || teacher.username,
          email: detail.email || '',
          identification: detail.identification || '',
          firstName: detail.firstName || '',
          lastName: detail.lastName || '',
          specialization: detail.specialization || teacher.specialization,
          enabled: detail.enabled ?? teacher.enabled
        });
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

  cancelEdit(): void {
    this.editorOpen = false;
    this.editingId = null;
    this.form.reset({
      username: '', email: '', identification: '',
      firstName: '', lastName: '', specialization: '', enabled: true
    });
  }

  save(): void {
    if (!this.canManageAcademic || this.form.invalid) return;
    const payload = this.form.getRawValue();
    const url = this.editingId
      ? `${API_URL}/academic/teachers/${this.editingId}`
      : `${API_URL}/academic/teachers`;
    const request$ = this.editingId
      ? this.http.put(url, payload)
      : this.http.post(url, payload);
    request$.subscribe({
      next: () => { this.cancelEdit(); this.loadData(); },
      error: () => {}
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
    this.exportHtmlTable('docentes-leccionario.xls', ['Docente', 'Especialidad', 'Materias', 'Cursos', 'Bloques/semana'], rows);
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
