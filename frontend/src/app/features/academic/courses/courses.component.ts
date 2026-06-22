import { HttpClient } from '@angular/common/http';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { catchError, of } from 'rxjs';
import { API_URL } from '../../../core/api.config';
import { AuthService } from '../../../core/auth.service';
import { AcademicCourse, AcademicStudent, AcademicOverview, ImportSummaryResult, WeekStudentAssignment } from '../academic.models';

interface ScheduleBlockItem { id: number; label: string; startTime: string; endTime: string; blockOrder: number; blockType: string; active: boolean; }
interface ScheduleOverviewData { blocks: ScheduleBlockItem[]; periods: Array<{ id: number; name: string; startDate: string; endDate: string; active: boolean }>; subjects: Array<{ id: number; name: string; code: string; curriculumArea: string }>; teachers: Array<{ id: number; name: string; specialization: string; subjectIds: number[] }>; }
interface ScheduleItem { id: number; courseId: number; courseName: string; periodId: number; periodName: string; scheduleBlockId: number; scheduleLabel: string; subjectId: number; subjectName: string; teacherId: number; teacherName: string; weekday: number; classroom: string | null; }

@Component({
  selector: 'app-academic-courses',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule],
  styles: [`
    .modal-card-lg { max-width: 960px; }
    .schedule-form-grid {
      display: grid;
      grid-template-columns: repeat(6, 1fr);
      gap: 0.75rem;
      align-items: end;
    }
    .schedule-form-actions {
      display: flex;
      flex-direction: column;
      justify-content: end;
    }
    @media (max-width: 768px) {
      .schedule-form-grid {
        grid-template-columns: 1fr 1fr;
      }
      .schedule-form-actions {
        grid-column: 1 / -1;
      }
      .schedule-form-actions label { display: none !important; }
    }
    @media (max-width: 480px) {
      .schedule-form-grid {
        grid-template-columns: 1fr;
      }
    }
  `],
  template: `
    <div class="card border-0 shadow-sm h-100">
      <div class="card-body p-4 d-grid gap-4">
        <div class="d-flex justify-content-between align-items-center">
          <div>
            <h2 class="h4 mb-1">Cursos y paralelos</h2>
            <p class="text-muted mb-0">Crea o ajusta la estructura base que utiliza el leccionario.</p>
          </div>
          <details class="action-menu">
            <summary class="btn btn-sm btn-primary">
              <i class="bi bi-list-ul me-2"></i>Acciones
            </summary>
            <div class="action-menu-panel">
              <button class="btn btn-sm btn-link text-start w-100" type="button" [disabled]="!canManageAcademic" (click)="startCreate()">
                <i class="bi bi-plus-circle me-2"></i>Nuevo curso
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

        @if (editorOpen) {
          <form [formGroup]="form" class="row g-3 p-3 rounded-4 editor-panel">
            <div class="col-12">
              <h3 class="h6 mb-0">{{ editingId ? 'Editar curso' : 'Nuevo curso' }}</h3>
            </div>
            <div class="col-12 col-md-6">
              <label class="form-label fw-semibold">Seccion</label>
              <select class="form-select form-select-sm" formControlName="section" (change)="onSectionChange()">
                <option [ngValue]="null">Seleccionar seccion...</option>
                <option value="EGB">EGB</option>
                <option value="BACHILLERATO">Bachillerato</option>
              </select>
            </div>
            <div class="col-12 col-md-3">
              <label class="form-label fw-semibold">Grado</label>
              <select class="form-select form-select-sm" formControlName="grade" (change)="onGradeChange()">
                <option [ngValue]="null">Seleccionar...</option>
                @for (g of gradeOptions; track g) {
                  <option [ngValue]="g">{{ g }}</option>
                }
              </select>
            </div>
            <div class="col-12 col-md-3">
              <label class="form-label fw-semibold">Paralelo</label>
              <input class="form-control form-control-sm text-uppercase" type="text" formControlName="parallel" placeholder="A">
            </div>
            <div class="col-12 col-md-4">
              <label class="form-label fw-semibold">Curso</label>
              <input class="form-control form-control-sm" type="text" formControlName="name" placeholder="Primero BGU">
            </div>
            <div class="col-12 col-md-4">
              <label class="form-label fw-semibold">Subnivel educativo</label>
              <input class="form-control form-control-sm" type="text" [value]="subLevelLabel()" readonly>
            </div>
            <div class="col-12 col-md-4">
              <label class="form-label fw-semibold">Nomenclatura actual</label>
              <input class="form-control form-control-sm" type="text" formControlName="level" readonly>
            </div>
            @if (oldSystemName(); as old) {
              <div class="col-12">
                <small class="text-muted fst-italic">Sistema antiguo: {{ old }}</small>
              </div>
            }
            <div class="col-12">
              <label class="form-label fw-semibold">Semanero del curso</label>
              <select class="form-select form-select-sm" formControlName="weekStudentId">
                <option [ngValue]="null">Sin semanero asignado</option>
                @for (student of courseStudentOptions(); track student.id) {
                  <option [ngValue]="student.id">{{ student.enrollmentNumber }} · {{ student.fullName }}</option>
                }
              </select>
              <div class="form-text">Solo puedes elegir entre estudiantes del curso seleccionado.</div>
            </div>
            @if (assignments.length > 0) {
              <div class="col-12">
                <hr>
                <h4 class="h6 mb-2">Historial de semaneros</h4>
                <div class="table-responsive">
                  <table class="table table-sm table-borderless mb-0">
                    <thead>
                      <tr class="small text-muted">
                        <th>Estudiante</th>
                        <th>Desde</th>
                        <th>Hasta</th>
                      </tr>
                    </thead>
                    <tbody>
                      @for (a of assignments; track a.id) {
                        <tr>
                          <td class="small">{{ a.enrollmentNumber }} · {{ a.studentName }}</td>
                          <td class="small">{{ a.startDate }}</td>
                          <td class="small">{{ a.endDate || 'Actual' }}</td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              </div>
            }
            <div class="col-12 d-flex justify-content-end gap-2">
              <button class="btn btn-sm btn-outline-primary" type="button" (click)="cancelEdit()">Cancelar</button>
              <button class="btn btn-sm btn-primary" type="button" (click)="save()">Guardar curso</button>
            </div>
          </form>
        }

        <div class="table-responsive">
          <table class="table table-striped align-middle mb-0">
            <thead>
              <tr>
                <th>Curso</th>
                <th>Paralelo</th>
                <th>Seccion</th>
                <th>Subnivel</th>
                <th>Grado</th>
                <th>Semanero</th>
                <th class="text-end"></th>
              </tr>
            </thead>
            <tbody>
              @for (course of courses; track course.id) {
                <tr>
                  <td>{{ course.name }}</td>
                  <td>{{ course.parallel }}</td>
                  <td>{{ course.section || '-' }}</td>
                  <td>{{ course.subLevel || '-' }}</td>
                  <td>{{ course.grade ?? '-' }}</td>
                  <td>{{ course.weekStudentName || 'Sin semanero' }}</td>
                  <td class="text-end">
                    @if (canManageAcademic) {
                      <button class="btn btn-sm btn-outline-primary me-1" type="button" (click)="edit(course)">Editar</button>
                      <button class="btn btn-sm btn-outline-primary" type="button" (click)="openScheduleModal(course)">Horario</button>
                    }
                  </td>
                </tr>
              } @empty {
                <tr><td colspan="7" class="text-center text-muted py-4">Sin cursos registrados.</td></tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <input id="courses-import-input" class="d-none" type="file" accept=".xlsx" (change)="handleImport($event)">

    @if (scheduleModalOpen) {
      <div class="modal-shell">
        <div class="modal-card modal-card-lg">
          <div class="d-flex justify-content-between align-items-start mb-3">
            <h5 class="mb-0">Gesti&oacute;n de horario &mdash; {{ selectedCourseName }}</h5>
            <button class="btn-close" type="button" (click)="closeScheduleModal()"></button>
          </div>

          @if (scheduleError) {
            <div class="alert alert-warning alert-dismissible fade show py-2 small" role="alert">
              {{ scheduleError }}
              <button class="btn-close py-2" type="button" (click)="scheduleError = ''"></button>
            </div>
          }

          <div class="schedule-form-grid mb-3">
            <div class="schedule-form-field">
              <label class="form-label fw-semibold small mb-1">Periodo</label>
              <select class="form-select form-select-sm" formControlName="sPeriodId">
                @for (p of schedulePeriods; track p.id) {
                  <option [value]="p.id">{{ p.name }}</option>
                }
              </select>
            </div>
            <div class="schedule-form-field">
              <label class="form-label fw-semibold small mb-1">D&iacute;a</label>
              <select class="form-select form-select-sm" formControlName="sWeekday">
                @for (day of scheduleWeekdays; track day.value) {
                  <option [value]="day.value">{{ day.label }}</option>
                }
              </select>
            </div>
            <div class="schedule-form-field">
              <label class="form-label fw-semibold small mb-1">Bloque</label>
              <select class="form-select form-select-sm" formControlName="sBlockId">
                @for (b of classBlocks; track b.id) {
                  <option [value]="b.id">{{ b.label }} ({{ b.startTime }}&ndash;{{ b.endTime }})</option>
                }
              </select>
            </div>
            <div class="schedule-form-field">
              <label class="form-label fw-semibold small mb-1">Docente</label>
              <select class="form-select form-select-sm" formControlName="sTeacherId" (change)="onScheduleTeacherChange()">
                @for (t of scheduleTeachers; track t.id) {
                  <option [value]="t.id">{{ t.name }}</option>
                }
              </select>
            </div>
            <div class="schedule-form-field">
              <label class="form-label fw-semibold small mb-1">Materia</label>
              <select class="form-select form-select-sm" formControlName="sSubjectId">
                @for (sub of filteredScheduleSubjects; track sub.id) {
                  <option [value]="sub.id">{{ sub.name }}</option>
                }
              </select>
            </div>
            <div class="schedule-form-field">
              <label class="form-label fw-semibold small mb-1">Aula</label>
              <input class="form-control form-control-sm" type="text" formControlName="sClassroom" placeholder="Aula 1">
            </div>
            <div class="schedule-form-actions">
              <label class="form-label fw-semibold small mb-1 d-none d-md-block">&nbsp;</label>
              <div class="d-flex gap-2">
                <button class="btn btn-sm btn-primary" type="button" (click)="saveSchedule()" [disabled]="!canManageAcademic">Asignar</button>
                <button class="btn btn-sm btn-outline-secondary" type="button" (click)="resetScheduleForm()">Limpiar</button>
              </div>
            </div>
          </div>

          @if (courseSchedules.length > 0) {
            <div class="table-responsive">
              <table class="table table-sm table-striped align-middle mb-0">
                <thead>
                  <tr class="small text-muted">
                    <th>D&iacute;a</th>
                    <th>Bloque</th>
                    <th>Periodo</th>
                    <th>Materia</th>
                    <th>Docente</th>
                    <th>Aula</th>
                    <th class="text-end"></th>
                  </tr>
                </thead>
                <tbody>
                  @for (s of courseSchedules; track s.id) {
                    <tr>
                      <td class="small">{{ weekdayLabel(s.weekday) }}</td>
                      <td class="small">{{ s.scheduleLabel }}</td>
                      <td class="small">{{ s.periodName }}</td>
                      <td class="small">{{ s.subjectName }}</td>
                      <td class="small">{{ s.teacherName }}</td>
                      <td class="small">{{ s.classroom || '&mdash;' }}</td>
                      <td class="text-end">
                        @if (canManageAcademic) {
                          <button class="btn btn-sm btn-outline-danger" type="button" (click)="deleteSchedule(s.id)">Eliminar</button>
                        }
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          } @else {
            <p class="text-muted small text-center my-4">Este curso a&uacute;n no tiene horario asignado.</p>
          }

          <div class="d-flex justify-content-end mt-3">
            <button class="btn btn-sm btn-outline-primary" type="button" (click)="closeScheduleModal()">Cerrar</button>
          </div>
        </div>
      </div>
    }
  `
})
export class CoursesComponent implements OnInit {
  private http = inject(HttpClient);
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);

  courses: AcademicCourse[] = [];
  students: AcademicStudent[] = [];
  assignments: WeekStudentAssignment[] = [];
  canManageAcademic = this.auth.hasPermission('ACADEMIC_MANAGE');

  editorOpen = false;
  editingId: number | null = null;

  gradeOptions: number[] = [];

  form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    parallel: ['', Validators.required],
    level: ['', Validators.required],
    section: [null as string | null],
    subLevel: [null as string | null],
    grade: [null as number | null],
    weekStudentId: [null as number | null]
  });

  onSectionChange(): void {
    const section = this.form.controls.section.value;
    if (section === 'EGB') {
      this.gradeOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    } else if (section === 'BACHILLERATO') {
      this.gradeOptions = [1, 2, 3];
    } else {
      this.gradeOptions = [];
    }
    this.form.controls.grade.reset(null);
    this.form.controls.subLevel.reset(null);
  }

  onGradeChange(): void {
    const section = this.form.controls.section.value;
    const grade = this.form.controls.grade.value;
    if (!section || grade == null) {
      this.form.controls.subLevel.reset(null);
    } else if (section === 'EGB') {
      if (grade === 1) this.form.controls.subLevel.setValue('PREPARATORIA');
      else if (grade >= 2 && grade <= 4) this.form.controls.subLevel.setValue('ELEMENTAL');
      else if (grade >= 5 && grade <= 7) this.form.controls.subLevel.setValue('MEDIA');
      else if (grade >= 8 && grade <= 10) this.form.controls.subLevel.setValue('SUPERIOR');
    } else if (section === 'BACHILLERATO') {
      if (grade >= 1 && grade <= 3) this.form.controls.subLevel.setValue('BGU');
    }
    this.updateNomenclatura();
  }

  private updateNomenclatura(): void {
    const section = this.form.controls.section.value;
    const subLevel = this.form.controls.subLevel.value;
    const grade = this.form.controls.grade.value;
    const parts: string[] = [];
    if (grade != null) parts.push(grade + '.\u00BA');
    if (subLevel) {
      if (subLevel === 'BGU') parts.push('Curso de Bachillerato');
      else parts.push('Grado de EGB');
    }
    if (section) parts.push(section === 'EGB' ? 'EGB' : 'Bachillerato');
    this.form.controls.level.setValue(parts.join(' ') || '');
  }

  subLevelLabel(): string {
    const subLevel = this.form.controls.subLevel.value;
    if (!subLevel) return '';
    switch (subLevel) {
      case 'PREPARATORIA': return 'Basica Preparatoria';
      case 'ELEMENTAL': return 'Basica Elemental';
      case 'MEDIA': return 'Basica Media';
      case 'SUPERIOR': return 'Basica Superior';
      case 'BGU': return 'Bachillerato General Unificado';
      default: return subLevel;
    }
  }

  oldSystemName(): string | null {
    const section = this.form.controls.section.value;
    const grade = this.form.controls.grade.value;
    if (!section || grade == null) return null;
    if (section === 'EGB') {
      if (grade === 1) return 'Jardin de infantes (5 anos)';
      if (grade >= 2 && grade <= 4) return '2.\u00BA Grado a 4.\u00BA Grado';
      if (grade >= 5 && grade <= 7) return '5.\u00BA Grado a 7.\u00BA Grado';
      if (grade === 8) return '1.\u00BA Curso (8.\u00BA ano)';
      if (grade === 9) return '2.\u00BA Curso (9.\u00BA ano)';
      if (grade === 10) return '3.\u00BA Curso (10.\u00BA ano)';
    }
    return null;
  }

  scheduleModalOpen = false;
  selectedCourseId: number | null = null;
  selectedCourseName = '';
  scheduleBlocks: ScheduleBlockItem[] = [];
  schedulePeriods: Array<{ id: number; name: string; startDate: string; endDate: string; active: boolean }> = [];
  scheduleSubjects: Array<{ id: number; name: string; code: string; curriculumArea: string }> = [];
  scheduleTeachers: Array<{ id: number; name: string; specialization: string; subjectIds: number[] }> = [];
  courseSchedules: ScheduleItem[] = [];
  scheduleError = '';

  scheduleWeekdays = [
    { value: 1, label: 'Lunes' }, { value: 2, label: 'Martes' },
    { value: 3, label: 'Miércoles' }, { value: 4, label: 'Jueves' },
    { value: 5, label: 'Viernes' }, { value: 6, label: 'Sábado' }, { value: 7, label: 'Domingo' }
  ];

  scheduleForm = this.fb.nonNullable.group({
    sPeriodId: [0],
    sWeekday: [1],
    sBlockId: [0],
    sTeacherId: [0],
    sSubjectId: [0],
    sClassroom: ['']
  });

  get classBlocks(): ScheduleBlockItem[] {
    return this.scheduleBlocks.filter(b => b.blockType === 'CLASS' && b.active);
  }

  get filteredScheduleSubjects(): Array<{ id: number; name: string; code: string; curriculumArea: string }> {
    const teacherId = this.scheduleForm.controls.sTeacherId.value;
    if (!teacherId) return this.scheduleSubjects;
    const teacher = this.scheduleTeachers.find(t => t.id === teacherId);
    if (!teacher || !teacher.subjectIds || teacher.subjectIds.length === 0) return this.scheduleSubjects;
    return this.scheduleSubjects.filter(s => teacher.subjectIds.includes(s.id));
  }

  weekdayLabel(weekday: number): string {
    return this.scheduleWeekdays.find(d => d.value === weekday)?.label ?? 'Día ' + weekday;
  }

  openScheduleModal(course: AcademicCourse): void {
    this.selectedCourseId = course.id;
    this.selectedCourseName = course.name + ' ' + course.parallel;
    this.scheduleModalOpen = true;
    this.scheduleError = '';
    this.http.get<ScheduleOverviewData>(`${API_URL}/schedules/overview`).pipe(
      catchError(() => of({ blocks: [], periods: [], subjects: [], teachers: [] }))
    ).subscribe(data => {
      this.scheduleBlocks = data.blocks;
      this.schedulePeriods = data.periods;
      this.scheduleSubjects = data.subjects;
      this.scheduleTeachers = data.teachers;
      this.resetScheduleForm();
    });
    this.http.get<ScheduleItem[]>(`${API_URL}/schedules/by-course/${course.id}`).pipe(
      catchError(() => of([]))
    ).subscribe(data => this.courseSchedules = data);
  }

  closeScheduleModal(): void {
    this.scheduleModalOpen = false;
    this.selectedCourseId = null;
    this.selectedCourseName = '';
    this.courseSchedules = [];
    this.scheduleError = '';
  }

  resetScheduleForm(): void {
    this.scheduleForm.setValue({
      sPeriodId: this.schedulePeriods[0]?.id ?? 0,
      sWeekday: 1,
      sBlockId: this.classBlocks[0]?.id ?? 0,
      sTeacherId: this.scheduleTeachers[0]?.id ?? 0,
      sSubjectId: this.filteredScheduleSubjects[0]?.id ?? 0,
      sClassroom: ''
    });
  }

  onScheduleTeacherChange(): void {
    const subjects = this.filteredScheduleSubjects;
    const current = this.scheduleForm.controls.sSubjectId.value;
    if (subjects.length > 0 && !subjects.some(s => s.id === current)) {
      this.scheduleForm.controls.sSubjectId.setValue(subjects[0].id);
    }
  }

  saveSchedule(): void {
    if (!this.canManageAcademic || !this.selectedCourseId) return;
    this.scheduleError = '';
    const raw = this.scheduleForm.getRawValue();
    const payload = {
      courseId: this.selectedCourseId,
      periodId: Number(raw.sPeriodId),
      scheduleBlockId: Number(raw.sBlockId),
      teacherId: Number(raw.sTeacherId),
      subjectId: Number(raw.sSubjectId),
      weekday: Number(raw.sWeekday),
      classroom: raw.sClassroom || null
    };
    this.http.post<ScheduleItem>(`${API_URL}/schedules/course-assignments`, payload).pipe(
      catchError(err => {
        this.scheduleError = err?.error?.message ?? 'No se pudo asignar el horario. Verifique conflictos de horario.';
        return of(null);
      })
    ).subscribe(res => {
      if (res) {
        this.scheduleError = '';
        this.http.get<ScheduleItem[]>(`${API_URL}/schedules/by-course/${this.selectedCourseId}`).pipe(
          catchError(() => of([]))
        ).subscribe(data => {
          this.courseSchedules = data;
          this.resetScheduleForm();
        });
      }
    });
  }

  deleteSchedule(id: number): void {
    if (!this.canManageAcademic) return;
    this.scheduleError = '';
    this.http.delete(`${API_URL}/schedules/course-assignments/${id}`).subscribe({
      next: () => {
        this.courseSchedules = this.courseSchedules.filter(s => s.id !== id);
      },
      error: (err) => {
        this.scheduleError = err?.error?.message ?? 'No se pudo eliminar la asignacion.';
      }
    });
  }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.http.get<AcademicOverview>(`${API_URL}/academic/overview`).pipe(
      catchError(() => of({ courses: [], subjects: [], periods: [], students: [], teachers: [] }))
    ).subscribe(data => {
      this.courses = data.courses;
      this.students = data.students;
    });
  }

  courseStudentOptions(): AcademicStudent[] {
    if (this.editingId == null) return [];
    return this.students.filter(s => s.courseId === this.editingId);
  }

  startCreate(): void {
    this.editingId = null;
    this.editorOpen = true;
    this.gradeOptions = [];
    this.assignments = [];
    this.form.reset({ name: '', parallel: '', level: '', section: null, subLevel: null, grade: null, weekStudentId: null });
  }

  edit(course: AcademicCourse): void {
    this.editingId = course.id;
    this.editorOpen = true;
    this.gradeOptions = [];
    this.form.reset({ name: '', parallel: '', level: '', section: null, subLevel: null, grade: null, weekStudentId: null });
    const section = course.section ?? null;
    if (section) {
      this.form.controls.section.setValue(section);
      this.onSectionChange();
    }
    this.form.patchValue({
      name: course.name,
      parallel: course.parallel,
      level: course.level,
      section,
      subLevel: course.subLevel ?? null,
      grade: course.grade ?? null,
      weekStudentId: course.weekStudentId ?? null
    });
    if (course.grade != null) {
      this.onGradeChange();
    }
    this.loadAssignments(course.id);
  }

  private loadAssignments(courseId: number): void {
    this.http.get<WeekStudentAssignment[]>(`${API_URL}/academic/courses/${courseId}/week-student-assignments`)
      .pipe(catchError(() => of([])))
      .subscribe(data => this.assignments = data);
  }

  cancelEdit(): void {
    this.editorOpen = false;
    this.editingId = null;
    this.gradeOptions = [];
    this.assignments = [];
    this.form.reset({ name: '', parallel: '', level: '', section: null, subLevel: null, grade: null, weekStudentId: null });
  }

  save(): void {
    if (!this.canManageAcademic || this.form.invalid) {
      return;
    }
    const request = {
      ...this.form.getRawValue(),
      parallel: this.form.controls.parallel.value.toUpperCase()
    };
    const url = this.editingId
      ? `${API_URL}/academic/courses/${this.editingId}`
      : `${API_URL}/academic/courses`;
    const operation = this.editingId
      ? this.http.put(url, request)
      : this.http.post(url, request);

    operation.subscribe({
      next: () => {
        this.cancelEdit();
        this.loadData();
      },
      error: () => {}
    });
  }

  downloadTemplate(): void {
    this.http.get(`${API_URL}/academic/import-template/courses`, { responseType: 'blob' }).subscribe({
      next: (file) => this.downloadBlob(file, 'cursos-plantilla.xlsx'),
      error: () => {}
    });
  }

  triggerImport(): void {
    document.getElementById('courses-import-input')?.click();
  }

  handleImport(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    this.http.post<ImportSummaryResult>(`${API_URL}/academic/import/courses`, formData).subscribe({
      next: () => {
        this.loadData();
        input.value = '';
      },
      error: () => { input.value = ''; }
    });
  }

  exportExcel(): void {
    const rows = this.courses.map(course => `
      <tr>
        <td>${course.name}</td>
        <td>${course.parallel}</td>
        <td>${course.section || '-'}</td>
        <td>${course.subLevel || '-'}</td>
        <td>${course.grade ?? '-'}</td>
        <td>${course.weekStudentName || 'Sin semanero'}</td>
      </tr>
    `).join('');
    this.exportHtmlTable('cursos-leccionario.xls', ['Curso', 'Paralelo', 'Seccion', 'Subnivel', 'Grado', 'Semanero'], rows);
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
