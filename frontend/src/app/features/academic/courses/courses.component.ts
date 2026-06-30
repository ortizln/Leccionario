import { HttpClient } from '@angular/common/http';
import { Component, OnInit, inject } from '@angular/core';
import { AbstractControl, FormBuilder, FormsModule, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { catchError, map, of } from 'rxjs';
import { API_URL } from '../../../core/api.config';
import { AuthService } from '../../../core/auth.service';
import { AcademicCourse, AcademicStudent, AcademicOverview, AcademicYearItem, ImportSummaryResult, SchoolDayItem, SchoolModalityItem, WeekStudentAssignment } from '../academic.models';
import { SortableHeaderComponent } from '../../../shared/sortable-header.component';
import { FilterDropdownComponent } from '../../../shared/filter-dropdown.component';
import { SortState, FilterState, applySort, applyFilters, getFilterOptions, toggleFilter, clearFilter, SortDir } from '../../../shared/table-utils';

interface ScheduleBlockItem { id: number; label: string; startTime: string; endTime: string; blockOrder: number; blockType: string; active: boolean; }
interface ScheduleOverviewData { blocks: ScheduleBlockItem[]; periods: Array<{ id: number; name: string; startDate: string; endDate: string; active: boolean }>; subjects: Array<{ id: number; name: string; code: string; curriculumArea: string }>; teachers: Array<{ id: number; name: string; specialization: string; subjectIds: number[]; courseNames: string[] }>; }
interface ScheduleItem { id: number; courseId: number; courseName: string; periodId: number; periodName: string; scheduleBlockId: number; scheduleLabel: string; subjectId: number; subjectName: string; teacherId: number; teacherName: string; weekday: number; classroom: string | null; }

@Component({
  selector: 'app-academic-courses',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, SortableHeaderComponent, FilterDropdownComponent],
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
    .auto-name-preview {
      background: var(--app-bg);
      border: 1px dashed var(--bs-border-color);
      border-radius: 0.375rem;
      padding: 0.5rem 0.75rem;
      font-weight: 600;
      min-height: 38px;
      display: flex;
      align-items: center;
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
          <div class="modal-shell" (click)="cancelEdit()">
            <div class="modal-card modal-card-lg" (click)="$event.stopPropagation()">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <h3 class="h6 mb-0"><i class="bi bi-mortarboard me-2"></i>{{ editingId ? 'Editar curso' : 'Nuevo curso' }}</h3>
                <button class="btn btn-sm btn-outline-secondary" type="button" (click)="cancelEdit()"><i class="bi bi-x-lg"></i></button>
              </div>
              @if (saveError) {
                <div class="alert alert-danger py-2 small mb-3">{{ saveError }}</div>
              }
              <form [formGroup]="form" class="row g-3">
                <div class="col-12 col-md-4">
                  <label class="form-label fw-semibold small">A&ntilde;o Lectivo</label>
                  <select class="form-select form-select-sm" formControlName="academicYearId">
                    <option [ngValue]="null">Seleccionar...</option>
                    @for (y of academicYears; track y.id) {
                      <option [ngValue]="y.id">{{ y.year }}</option>
                    }
                  </select>
                </div>
                <div class="col-12 col-md-4">
                  <label class="form-label fw-semibold small">Jornada</label>
                  <select class="form-select form-select-sm" formControlName="schoolDayId">
                    <option [ngValue]="null">Seleccionar...</option>
                    @for (d of schoolDays; track d.id) {
                      <option [ngValue]="d.id">{{ d.name }}</option>
                    }
                  </select>
                </div>
                <div class="col-12 col-md-4">
                  <label class="form-label fw-semibold small">Modalidad</label>
                  <select class="form-select form-select-sm" formControlName="schoolModalityId">
                    <option [ngValue]="null">Seleccionar...</option>
                    @for (m of schoolModalities; track m.id) {
                      <option [ngValue]="m.id">{{ m.name }}</option>
                    }
                  </select>
                </div>
                <div class="col-12 col-md-4">
                  <label class="form-label fw-semibold small">Subnivel Educativo</label>
                  <select class="form-select form-select-sm" formControlName="subLevel" (change)="onSubLevelChange()">
                    <option [ngValue]="null">Seleccionar...</option>
                    <option value="INICIAL">Inicial</option>
                    <option value="PREPARATORIA">Basica Preparatoria</option>
                    <option value="ELEMENTAL">Basica Elemental</option>
                    <option value="MEDIA">Basica Media</option>
                    <option value="SUPERIOR">Basica Superior</option>
                    <option value="BGU">Bachillerato General Unificado</option>
                  </select>
                </div>
                <div class="col-12 col-md-2">
                  <label class="form-label fw-semibold small">Grado</label>
                  <select class="form-select form-select-sm" formControlName="grade" (change)="onGradeChange()">
                    <option [ngValue]="null">...</option>
                    @for (g of gradeOptions; track g) {
                      <option [ngValue]="g">{{ gradeLabel(g) }}</option>
                    }
                  </select>
                </div>
                <div class="col-12 col-md-2">
                  <label class="form-label fw-semibold small">Paralelo</label>
                  <input class="form-control form-control-sm text-uppercase" type="text" formControlName="parallel" placeholder="A" maxlength="1">
                  @if (form.controls.parallel.hasError('singleLetter')) {
                    <div class="text-danger small mt-1">Una sola letra (A-Z)</div>
                  }
                </div>
                <div class="col-12 col-md-2">
                  <label class="form-label fw-semibold small">Capacidad</label>
                  <input class="form-control form-control-sm" type="number" formControlName="capacity" placeholder="40" min="1">
                  @if (form.controls.capacity.hasError('min') || form.controls.capacity.hasError('required')) {
                    <div class="text-danger small mt-1">Minimo 1 estudiante</div>
                  }
                </div>
                <div class="col-12">
                  <label class="form-label fw-semibold small">Nombre del Curso (auto-generado)</label>
                  <div class="auto-name-preview">{{ autoName() || 'Complete grado y paralelo...' }}</div>
                </div>
                @if (oldSystemName(); as old) {
                  <div class="col-12">
                    <small class="text-muted fst-italic">Sistema antiguo: {{ old }}</small>
                  </div>
                }
                <div class="col-12 d-flex justify-content-end gap-2 mt-2">
                  <button class="btn btn-sm btn-outline-secondary" type="button" (click)="cancelEdit()">Cancelar</button>
                  <button class="btn btn-sm btn-primary" type="button" (click)="save()" [disabled]="form.invalid"><i class="bi bi-check-lg me-1"></i>Guardar</button>
                </div>
              </form>
            </div>
          </div>
        }

        <div class="table-responsive">
          <table class="table table-xs table-striped align-middle mb-0">
            <thead>
              <tr>
                <th>
                  <div class="d-flex align-items-center gap-1">
                    <span appSortableHeader label="Curso" [dir]="sortColumn('name')" (toggle)="onSort('name')"></span>
                    <span appFilterDropdown label="Curso" [options]="filterOpts('name')" [selected]="getFilter('name')"
                          [activeCount]="getFilter('name').size" (toggle)="onFilter('name', $event)" (clear)="onClearFilter('name')"></span>
                  </div>
                </th>
                <th>
                  <div class="d-flex align-items-center gap-1">
                    <span appSortableHeader label="Paralelo" [dir]="sortColumn('parallel')" (toggle)="onSort('parallel')"></span>
                    <span appFilterDropdown label="Paralelo" [options]="filterOpts('parallel')" [selected]="getFilter('parallel')"
                          [activeCount]="getFilter('parallel').size" (toggle)="onFilter('parallel', $event)" (clear)="onClearFilter('parallel')"></span>
                  </div>
                </th>
                <th>
                  <div class="d-flex align-items-center gap-1">
                    <span appSortableHeader label="Subnivel" [dir]="sortColumn('subLevel')" (toggle)="onSort('subLevel')"></span>
                    <span appFilterDropdown label="Subnivel" [options]="filterOpts('subLevel')" [selected]="getFilter('subLevel')"
                          [activeCount]="getFilter('subLevel').size" (toggle)="onFilter('subLevel', $event)" (clear)="onClearFilter('subLevel')"></span>
                  </div>
                </th>
                <th>
                  <div class="d-flex align-items-center gap-1">
                    <span appSortableHeader label="Grado" [dir]="sortColumn('grade')" (toggle)="onSort('grade')"></span>
                    <span appFilterDropdown label="Grado" [options]="filterOpts('grade')" [selected]="getFilter('grade')"
                          [activeCount]="getFilter('grade').size" (toggle)="onFilter('grade', $event)" (clear)="onClearFilter('grade')"></span>
                  </div>
                </th>
                <th>
                  <div class="d-flex align-items-center gap-1">
                    <span appSortableHeader label="A&ntilde;o" [dir]="sortColumn('academicYear')" (toggle)="onSort('academicYear')"></span>
                    <span appFilterDropdown label="A&ntilde;o" [options]="filterOpts('academicYear')" [selected]="getFilter('academicYear')"
                          [activeCount]="getFilter('academicYear').size" (toggle)="onFilter('academicYear', $event)" (clear)="onClearFilter('academicYear')"></span>
                  </div>
                </th>
                <th>
                  <div class="d-flex align-items-center gap-1">
                    <span appSortableHeader label="Jornada" [dir]="sortColumn('schoolDayName')" (toggle)="onSort('schoolDayName')"></span>
                    <span appFilterDropdown label="Jornada" [options]="filterOpts('schoolDayName')" [selected]="getFilter('schoolDayName')"
                          [activeCount]="getFilter('schoolDayName').size" (toggle)="onFilter('schoolDayName', $event)" (clear)="onClearFilter('schoolDayName')"></span>
                  </div>
                </th>
                <th>
                  <div class="d-flex align-items-center gap-1">
                    <span appSortableHeader label="Modalidad" [dir]="sortColumn('schoolModalityName')" (toggle)="onSort('schoolModalityName')"></span>
                    <span appFilterDropdown label="Modalidad" [options]="filterOpts('schoolModalityName')" [selected]="getFilter('schoolModalityName')"
                          [activeCount]="getFilter('schoolModalityName').size" (toggle)="onFilter('schoolModalityName', $event)" (clear)="onClearFilter('schoolModalityName')"></span>
                  </div>
                </th>
                <th class="text-end"></th>
              </tr>
            </thead>
            <tbody>
              @for (course of displayedCourses; track course.id) {
                <tr>
                  <td>{{ course.name }}</td>
                  <td>{{ course.parallel }}</td>
                  <td>{{ subLevelDisplay(course.subLevel) }}</td>
                  <td>{{ course.grade != null ? gradeLabel(course.grade) : '-' }}</td>
                  <td>{{ course.academicYear ?? '-' }}</td>
                  <td>{{ course.schoolDayName ?? '-' }}</td>
                  <td>{{ course.schoolModalityName ?? '-' }}</td>
                  <td class="text-end">
                    @if (canManageAcademic) {
                      <details class="action-menu row-action-menu">
                        <summary class="btn btn-sm btn-outline-primary">
                          <i class="bi bi-three-dots"></i>
                        </summary>
                        <div class="action-menu-panel">
                          <button class="btn btn-sm btn-link text-start w-100" type="button" (click)="edit(course)">
                            <i class="bi bi-pencil-square me-2"></i>Editar
                          </button>
                          <button class="btn btn-sm btn-link text-start w-100" type="button" (click)="openScheduleModal(course)">
                            <i class="bi bi-calendar-week me-2"></i>Horario
                          </button>
                          <button class="btn btn-sm btn-link text-start w-100" type="button" (click)="openCourseStudents(course)">
                            <i class="bi bi-people me-2"></i>Estudiantes
                          </button>
                          <button class="btn btn-sm btn-link text-start w-100 text-danger" type="button" (click)="confirmDeleteCourse(course)">
                            <i class="bi bi-trash me-2"></i>Eliminar
                          </button>
                        </div>
                      </details>
                    }
                  </td>
                </tr>
              } @empty {
                <tr><td colspan="8" class="text-center text-muted py-4">Sin cursos registrados.</td></tr>
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

          <form [formGroup]="scheduleForm" class="schedule-form-grid mb-3">
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
              <label class="form-label fw-semibold small mb-1">Hora Clase</label>
              <select class="form-select form-select-sm" formControlName="sBlockId">
                @for (b of classBlocks; track b.id) {
                  <option [value]="b.id">{{ b.label }} ({{ b.startTime }}&ndash;{{ b.endTime }})</option>
                }
              </select>
            </div>
            <div class="schedule-form-field">
              <label class="form-label fw-semibold small mb-1">Docente</label>
              <select class="form-select form-select-sm" formControlName="sTeacherId" (change)="onScheduleTeacherChange()">
                @for (t of filteredTeachers; track t.id) {
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
                <button class="btn btn-sm btn-primary" type="button" (click)="saveSchedule()" [disabled]="!canManageAcademic || !!teacherConflictMessage">Asignar</button>
                <button class="btn btn-sm btn-outline-secondary" type="button" (click)="resetScheduleForm()">Limpiar</button>
              </div>
            </div>
          </form>

          @if (teacherConflictMessage) {
            <div class="alert alert-danger py-2 small mb-3">
              <i class="bi bi-exclamation-triangle me-1"></i>{{ teacherConflictMessage }}
            </div>
          }

          @if (courseSchedules.length > 0) {
            <div class="table-responsive">
              <table class="table table-sm table-striped align-middle mb-0">
                <thead>
                  <tr class="small text-muted">
                    <th>D&iacute;a</th>
                    <th>Hora Clase</th>
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

    @if (courseStudentsModalOpen) {
      <div class="modal-shell" (click)="closeCourseStudents()">
        <div class="modal-card" style="max-width:700px" (click)="$event.stopPropagation()">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h5 class="mb-0"><i class="bi bi-people me-2"></i>Estudiantes &mdash; {{ courseStudentsCourseName }}</h5>
            <button class="btn btn-sm btn-outline-secondary" type="button" (click)="closeCourseStudents()"><i class="bi bi-x-lg"></i></button>
          </div>
          @if (courseStudents.length === 0) {
            <p class="text-muted small text-center py-4 mb-0">No hay estudiantes matriculados en este curso.</p>
          } @else {
            <div class="table-responsive" style="max-height:400px;overflow-y:auto">
              <table class="table table-sm align-middle mb-0">
                <thead>
                  <tr>
                    <th>Matricula</th>
                    <th>Estudiante</th>
                    <th>Usuario</th>
                    <th>Estado</th>
                    @if (canManageAcademic) {
                      <th></th>
                    }
                  </tr>
                </thead>
                <tbody>
                  @for (student of courseStudents; track student.id) {
                    <tr>
                      <td class="small">{{ student.enrollmentNumber }}</td>
                      <td>
                        <div class="fw-semibold small">{{ student.fullName }}</div>
                        <div class="small text-muted">{{ student.identification }}</div>
                      </td>
                      <td class="small">{{ student.username }}</td>
                      <td>
                        <span class="badge" [class.text-bg-success]="student.enabled" [class.text-bg-secondary]="!student.enabled">
                          {{ student.enabled ? 'Activo' : 'Inactivo' }}
                        </span>
                      </td>
                      @if (canManageAcademic) {
                        <td class="text-end">
                          <button class="btn btn-sm btn-outline-danger" type="button" (click)="deleteConfirmStudent = student; deleteStudentError = ''" [disabled]="removingStudentId === student.id">
                            @if (removingStudentId === student.id) {
                              <span class="spinner-border spinner-border-sm"></span>
                            } @else {
                              <i class="bi bi-trash"></i>
                            }
                          </button>
                        </td>
                      }
                    </tr>
                  }
                </tbody>
              </table>
            </div>
            <div class="text-muted small text-end mt-2">{{ courseStudents.length }} estudiante(s)</div>
          }
          <div class="d-flex justify-content-end mt-3">
            <button class="btn btn-sm btn-outline-primary" type="button" (click)="closeCourseStudents()">Cerrar</button>
          </div>
        </div>
      </div>
    }

    @if (deleteConfirmCourse) {
      <div class="modal-shell" (click)="deleteConfirmCourse = null">
        <div class="modal-card" style="max-width:420px" (click)="$event.stopPropagation()">
          <div class="text-center mb-3">
            <i class="bi bi-exclamation-triangle text-danger" style="font-size:2.5rem"></i>
          </div>
          <h5 class="text-center mb-2">Eliminar curso</h5>
          <p class="text-muted small text-center mb-3">
            Se eliminara <strong>{{ deleteConfirmCourse.name }} {{ deleteConfirmCourse.parallel }}</strong> y todo su horario asignado. Esta accion no se puede deshacer.
          </p>
          @if (deleteError) {
            <div class="alert alert-danger py-2 small">{{ deleteError }}</div>
          }
          <div class="d-flex justify-content-center gap-2">
            <button class="btn btn-sm btn-outline-secondary" type="button" (click)="deleteConfirmCourse = null">Cancelar</button>
            <button class="btn btn-sm btn-danger" type="button" (click)="deleteCourse()" [disabled]="deleting">
              @if (deleting) {
                <span class="spinner-border spinner-border-sm me-1"></span>
              }
              Eliminar
            </button>
          </div>
        </div>
      </div>
    }

    @if (deleteConfirmStudent) {
      <div class="modal-shell" style="z-index:1060" (click)="deleteConfirmStudent = null; deleteStudentError = ''">
        <div class="modal-card" style="max-width:420px" (click)="$event.stopPropagation()">
          <div class="text-center mb-3">
            <i class="bi bi-person-dash text-danger" style="font-size:2.5rem"></i>
          </div>
          <h5 class="text-center mb-2">Retirar estudiante</h5>
          <p class="text-muted small text-center mb-3">
            Se retirara a <strong>{{ deleteConfirmStudent.fullName }}</strong> del curso. Esta accion no se puede deshacer.
          </p>
          @if (deleteStudentError) {
            <div class="alert alert-danger py-2 small">{{ deleteStudentError }}</div>
          }
          <div class="d-flex justify-content-center gap-2">
            <button class="btn btn-sm btn-outline-secondary" type="button" (click)="deleteConfirmStudent = null; deleteStudentError = ''">Cancelar</button>
            <button class="btn btn-sm btn-danger" type="button" (click)="confirmRemoveStudent()" [disabled]="removingStudentId === deleteConfirmStudent.id">
              @if (removingStudentId === deleteConfirmStudent.id) {
                <span class="spinner-border spinner-border-sm me-1"></span>
              }
              Retirar
            </button>
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

  academicYears: AcademicYearItem[] = [];
  schoolDays: SchoolDayItem[] = [];
  schoolModalities: SchoolModalityItem[] = [];

  gradeOptions: number[] = [];

  sort: SortState | null = null;
  filters: FilterState = {};
  displayedCourses: AcademicCourse[] = [];

  sortColumn(col: string): SortDir { return this.sort?.column === col ? this.sort.dir : null; }
  onSort(col: string): void {
    const dir: SortDir = this.sort?.column === col
      ? (this.sort.dir === 'asc' ? 'desc' : this.sort.dir === 'desc' ? null : 'asc')
      : 'asc';
    this.sort = dir ? { column: col, dir } : null;
    this.refreshDisplayed();
  }
  filterOpts(col: string): string[] { return getFilterOptions(this.courses, col); }
  getFilter(col: string): Set<string> { return this.filters[col] ?? new Set(); }
  onFilter(col: string, val: string): void { this.filters = toggleFilter(this.filters, col, val); this.refreshDisplayed(); }
  onClearFilter(col: string): void { this.filters = clearFilter(this.filters, col); this.refreshDisplayed(); }
  refreshDisplayed(): void {
    this.displayedCourses = applyFilters(applySort(this.courses, this.sort), this.filters);
  }

  private singleLetterValidator = (control: AbstractControl): ValidationErrors | null => {
    const val = control.value;
    if (!val) return null;
    return /^[A-Z]$/.test(val) ? null : { singleLetter: true };
  };

  form = this.fb.nonNullable.group({
    academicYearId: [null as number | null, Validators.required],
    schoolDayId: [null as number | null],
    schoolModalityId: [null as number | null],
    subLevel: [null as string | null, Validators.required],
    grade: [null as number | null, Validators.required],
    parallel: ['', [Validators.required, this.singleLetterValidator]],
    level: [''],
    name: [''],
    capacity: [null as number | null, [Validators.required, Validators.min(1)]],
    weekStudentId: [null as number | null]
  });

  saveError = '';

  onSubLevelChange(): void {
    const subLevel = this.form.controls.subLevel.value;
    if (!subLevel) {
      this.gradeOptions = [];
    } else {
      this.gradeOptions = this.getGradesForSubLevel(subLevel);
    }
    this.form.controls.grade.reset(null);
    this.updateNomenclatura();
  }

  onGradeChange(): void {
    this.updateNomenclatura();
  }

  private getGradesForSubLevel(subLevel: string): number[] {
    switch (subLevel) {
      case 'INICIAL': return [1, 2];
      case 'PREPARATORIA': return [1];
      case 'ELEMENTAL': return [2, 3, 4];
      case 'MEDIA': return [5, 6, 7];
      case 'SUPERIOR': return [8, 9, 10];
      case 'BGU': return [1, 2, 3];
      default: return [];
    }
  }

  private updateNomenclatura(): void {
    const subLevel = this.form.controls.subLevel.value;
    const grade = this.form.controls.grade.value;
    if (!subLevel || grade == null) {
      this.form.controls.level.setValue('');
      return;
    }
    const parts: string[] = [];
    parts.push(grade + '.\u00BA');
    if (subLevel === 'BGU') parts.push('Curso de Bachillerato');
    else if (subLevel === 'INICIAL') parts.push('Nivel Inicial');
    else parts.push('Grado de EGB');
    const section = (subLevel === 'BGU') ? 'BACHILLERATO' : (subLevel === 'INICIAL' ? 'INICIAL' : 'EGB');
    parts.push(section === 'EGB' ? 'EGB' : (section === 'INICIAL' ? 'Inicial' : 'Bachillerato'));
    this.form.controls.level.setValue(parts.join(' ') || '');
  }

  autoName(): string {
    const grade = this.form.controls.grade.value;
    const parallel = this.form.controls.parallel.value;
    const subLevel = this.form.controls.subLevel.value;
    if (grade == null || !parallel || !subLevel) return '';
    const gradeName = this.gradeLabel(grade);
    const suffix = subLevel === 'BGU' ? ' BGU' : (subLevel === 'INICIAL' ? ' INICIAL' : ' EGB');
    return gradeName + suffix + ' "' + parallel.trim().toUpperCase() + '"';
  }

  gradeLabel(grade: number): string {
    switch (grade) {
      case 1: return 'Primero';
      case 2: return 'Segundo';
      case 3: return 'Tercero';
      case 4: return 'Cuarto';
      case 5: return 'Quinto';
      case 6: return 'Sexto';
      case 7: return 'Septimo';
      case 8: return 'Octavo';
      case 9: return 'Noveno';
      case 10: return 'Decimo';
      default: return grade + '. Grado';
    }
  }

  subLevelDisplay(subLevel: string | null): string {
    if (!subLevel) return '-';
    switch (subLevel) {
      case 'INICIAL': return 'Inicial';
      case 'PREPARATORIA': return 'Basica Preparatoria';
      case 'ELEMENTAL': return 'Basica Elemental';
      case 'MEDIA': return 'Basica Media';
      case 'SUPERIOR': return 'Basica Superior';
      case 'BGU': return 'Bachillerato General Unificado';
      default: return subLevel;
    }
  }

  oldSystemName(): string | null {
    const subLevel = this.form.controls.subLevel.value;
    const grade = this.form.controls.grade.value;
    if (!subLevel || grade == null) return null;
    if (subLevel === 'INICIAL') return 'Inicial ' + grade;
    if (subLevel === 'PREPARATORIA') return 'Jardin de infantes (5 anos)';
    if (subLevel === 'ELEMENTAL') return '2.\u00BA Grado a 4.\u00BA Grado';
    if (subLevel === 'MEDIA') return '5.\u00BA Grado a 7.\u00BA Grado';
    if (subLevel === 'SUPERIOR') {
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
  scheduleTeachers: Array<{ id: number; name: string; specialization: string; subjectIds: number[]; courseNames: string[] }> = [];
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

  courseStudentsModalOpen = false;
  courseStudentsCourseName = '';
  courseStudents: AcademicStudent[] = [];
  removingStudentId: number | null = null;
  deleteConfirmStudent: AcademicStudent | null = null;
  deleteStudentError = '';

  deleteConfirmCourse: AcademicCourse | null = null;
  deleteError = '';
  deleting = false;

  get classBlocks(): ScheduleBlockItem[] {
    return this.scheduleBlocks.filter(b => b.blockType === 'CLASS' && b.active);
  }

  get filteredTeachers(): Array<{ id: number; name: string; specialization: string; subjectIds: number[]; courseNames: string[] }> {
    const courseId = this.selectedCourseId;
    if (!courseId) return this.scheduleTeachers;
    const course = this.courses.find(c => c.id === courseId);
    if (!course) return this.scheduleTeachers;
    const courseLabel = (course.name + ' ' + course.parallel).toLowerCase().trim();
    return this.scheduleTeachers.filter(t => t.courseNames.some(cn => cn.toLowerCase().trim() === courseLabel));
  }

  get filteredScheduleSubjects(): Array<{ id: number; name: string; code: string; curriculumArea: string }> {
    const teacherId = this.scheduleForm.controls.sTeacherId.value;
    if (!teacherId) return this.scheduleSubjects;
    const teacher = this.scheduleTeachers.find(t => t.id === teacherId);
    if (!teacher || !teacher.subjectIds || teacher.subjectIds.length === 0) return this.scheduleSubjects;
    return this.scheduleSubjects.filter(s => teacher.subjectIds.includes(s.id));
  }

  get teacherConflictMessage(): string {
    const teacherId = Number(this.scheduleForm.controls.sTeacherId.value);
    const blockId = Number(this.scheduleForm.controls.sBlockId.value);
    const weekday = Number(this.scheduleForm.controls.sWeekday.value);
    const periodId = Number(this.scheduleForm.controls.sPeriodId.value);
    if (!teacherId || !blockId || !weekday || !periodId) return '';
    const conflict = this.courseSchedules.find(s =>
      s.teacherId === teacherId
      && s.scheduleBlockId === blockId
      && s.weekday === weekday
      && s.periodId === periodId
    );
    if (!conflict) return '';
    return `El docente ya tiene hora clase asignada el ${this.weekdayLabel(weekday)} en ${conflict.scheduleLabel}.`;
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

  openCourseStudents(course: AcademicCourse): void {
    this.courseStudentsCourseName = course.name + ' ' + course.parallel;
    this.courseStudents = this.students.filter(s => s.courseId === course.id);
    this.courseStudentsModalOpen = true;
  }

  closeCourseStudents(): void {
    this.courseStudentsModalOpen = false;
    this.courseStudentsCourseName = '';
    this.courseStudents = [];
  }

  removeStudentFromCourse(student: AcademicStudent): void {
    if (!this.canManageAcademic) return;
    this.removingStudentId = student.id;
    this.deleteStudentError = '';
    this.http.delete(`${API_URL}/academic/students/${student.id}`).pipe(
      map(() => true),
      catchError(err => {
        this.deleteStudentError = err?.error?.message ?? 'No se pudo retirar el estudiante.';
        return of(false);
      })
    ).subscribe(ok => {
      this.removingStudentId = null;
      if (ok) {
        this.deleteConfirmStudent = null;
        this.deleteStudentError = '';
        this.courseStudents = this.courseStudents.filter(s => s.id !== student.id);
        this.loadData();
      }
    });
  }

  confirmRemoveStudent(): void {
    if (!this.deleteConfirmStudent) return;
    this.removeStudentFromCourse(this.deleteConfirmStudent);
  }

  confirmDeleteCourse(course: AcademicCourse): void {
    this.deleteConfirmCourse = course;
    this.deleteError = '';
  }

  deleteCourse(): void {
    if (!this.deleteConfirmCourse || !this.canManageAcademic) return;
    this.deleting = true;
    this.deleteError = '';
    this.http.delete(`${API_URL}/academic/courses/${this.deleteConfirmCourse.id}`).pipe(
      map(() => true),
      catchError(err => {
        this.deleteError = err?.error?.message ?? 'No se pudo eliminar el curso.';
        return of(false);
      })
    ).subscribe(ok => {
      this.deleting = false;
      if (ok) {
        this.deleteConfirmCourse = null;
        this.closeCourseStudents();
        this.loadData();
      }
    });
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
    if (subjects.length === 1) {
      this.scheduleForm.controls.sSubjectId.setValue(subjects[0].id);
    } else if (subjects.length > 0 && !subjects.some(s => s.id === current)) {
      this.scheduleForm.controls.sSubjectId.setValue(subjects[0].id);
    }
  }

  saveSchedule(): void {
    if (!this.canManageAcademic || !this.selectedCourseId || this.teacherConflictMessage) return;
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
    this.loadCatalogs();
  }

  loadData(): void {
    this.http.get<AcademicOverview>(`${API_URL}/academic/overview`).pipe(
      catchError(() => of({ courses: [], subjects: [], periods: [], students: [], teachers: [] }))
    ).subscribe(data => {
      this.courses = data.courses;
      this.students = data.students;
      this.refreshDisplayed();
    });
  }

  loadCatalogs(): void {
    this.http.get<AcademicYearItem[]>(`${API_URL}/academic/catalogs/academic-years`).pipe(
      catchError(() => of([]))
    ).subscribe(data => this.academicYears = data);

    this.http.get<SchoolDayItem[]>(`${API_URL}/academic/catalogs/school-days`).pipe(
      catchError(() => of([]))
    ).subscribe(data => this.schoolDays = data);

    this.http.get<SchoolModalityItem[]>(`${API_URL}/academic/catalogs/school-modalities`).pipe(
      catchError(() => of([]))
    ).subscribe(data => this.schoolModalities = data);
  }

  courseStudentOptions(): AcademicStudent[] {
    if (this.editingId == null) return [];
    return this.students.filter(s => s.courseId === this.editingId);
  }

  startCreate(): void {
    this.editingId = null;
    this.editorOpen = true;
    this.saveError = '';
    this.gradeOptions = [];
    this.assignments = [];
    const currentYear = new Date().getFullYear();
    const defaultYear = this.academicYears.find(y => y.year === currentYear)?.id ?? this.academicYears[0]?.id ?? null;
    const defaultDay = this.schoolDays.find(d => d.name.toLowerCase().includes('matutina'))?.id ?? this.schoolDays[0]?.id ?? null;
    const defaultModality = this.schoolModalities.find(m => m.name.toLowerCase().includes('presencial'))?.id ?? this.schoolModalities[0]?.id ?? null;
    this.form.reset({
      academicYearId: defaultYear,
      schoolDayId: defaultDay,
      schoolModalityId: defaultModality,
      subLevel: null,
      grade: null,
      parallel: '',
      level: '',
      name: '',
      capacity: null,
      weekStudentId: null
    });
  }

  edit(course: AcademicCourse): void {
    this.editingId = course.id;
    this.editorOpen = true;
    this.gradeOptions = [];
    this.form.reset({
      academicYearId: null,
      schoolDayId: null,
      schoolModalityId: null,
      subLevel: null,
      grade: null,
      parallel: '',
      level: '',
      name: '',
      capacity: null,
      weekStudentId: null
    });
    const subLevel = course.subLevel ?? null;
    if (subLevel) {
      this.form.controls.subLevel.setValue(subLevel);
      this.gradeOptions = this.getGradesForSubLevel(subLevel);
    }
    this.form.patchValue({
      academicYearId: course.academicYearId ?? null,
      schoolDayId: course.schoolDayId ?? null,
      schoolModalityId: course.schoolModalityId ?? null,
      subLevel,
      grade: course.grade ?? null,
      parallel: course.parallel,
      level: course.level,
      capacity: course.capacity ?? null,
      weekStudentId: course.weekStudentId ?? null
    });
    this.updateNomenclatura();
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
    this.form.reset({
      academicYearId: null,
      schoolDayId: null,
      schoolModalityId: null,
      subLevel: null,
      grade: null,
      parallel: '',
      level: '',
      name: '',
      capacity: null,
      weekStudentId: null
    });
  }

  save(): void {
    if (!this.canManageAcademic || this.form.invalid) {
      return;
    }
    this.saveError = '';
    const raw = this.form.getRawValue();
    const request = {
      name: this.autoName() || raw.name || '',
      parallel: raw.parallel.toUpperCase(),
      level: raw.level || '',
      section: raw.subLevel === 'BGU' ? 'BACHILLERATO' : (raw.subLevel === 'INICIAL' ? 'INICIAL' : (raw.subLevel ? 'EGB' : null)),
      subLevel: raw.subLevel,
      grade: raw.grade,
      weekStudentId: raw.weekStudentId,
      academicYearId: raw.academicYearId,
      schoolDayId: raw.schoolDayId,
      schoolModalityId: raw.schoolModalityId,
      capacity: raw.capacity
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
      error: (err) => {
        this.saveError = err?.error?.message ?? 'No se pudo guardar el curso.';
      }
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
        <td>${this.subLevelDisplay(course.subLevel)}</td>
        <td>${course.grade != null ? this.gradeLabel(course.grade) : '-'}</td>
        <td>${course.academicYear ?? '-'}</td>
        <td>${course.schoolDayName ?? '-'}</td>
        <td>${course.schoolModalityName ?? '-'}</td>
      </tr>
    `).join('');
    this.exportHtmlTable('cursos-leccionario.xls', ['Curso', 'Paralelo', 'Subnivel', 'Grado', 'Año', 'Jornada', 'Modalidad'], rows);
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
