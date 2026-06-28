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
      <div class="card-body p-4 d-grid gap-4">
        <div class="d-flex justify-content-between align-items-center">
          <div>
            <h2 class="h4 mb-1">Docentes y carga asignada</h2>
            <p class="text-muted small mb-0">Gestiona la informacion, asignacion de materias, cursos y horarios de los docentes.</p>
          </div>
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

        <div class="row g-3">
          <div class="col-12 col-md-6">
            <label class="form-label fw-semibold small">Buscar docente</label>
            <input class="form-control form-control-sm" type="text" [value]="search" (input)="search = $any($event.target).value" placeholder="Nombre, usuario o especialidad">
          </div>
        </div>

        <div class="table-responsive">
          <table class="table table-xs table-hover align-middle mb-0">
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
                  <td>
                    <span class="table-cell-truncate">{{ teacher.subjects.length > 0 ? teacher.subjects.join(', ') : 'Sin materias' }}</span>
                  </td>
                  <td>
                    <span class="table-cell-truncate">{{ teacher.courses.length > 0 ? teacher.courses.join(', ') : 'Sin cursos' }}</span>
                  </td>
                  <td>
                    <span class="badge rounded-pill" [class.text-bg-success]="teacher.weeklyBlocks > 0" [class.text-bg-secondary]="teacher.weeklyBlocks === 0">
                      {{ teacher.weeklyBlocks }}
                    </span>
                  </td>
                  <td class="text-end">
                    <button class="btn btn-sm btn-outline-primary" type="button" (click)="openTeacherDetail(teacher)" title="Ver detalle">
                      <i class="bi bi-eye me-1"></i>Ver
                    </button>
                  </td>
                </tr>
              } @empty {
                <tr><td colspan="5" class="text-center text-muted py-4">No hay docentes vinculados al horario.</td></tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <input id="teachers-import-input" class="d-none" type="file" accept=".xlsx" (change)="handleImport($event)">

    @if (detailTeacher) {
      <div class="modal-shell" (click)="closeTeacherDetail()">
        <div class="modal-card modal-card-lg" style="max-width:720px" (click)="$event.stopPropagation()">
          @let dt = detailTeacher;
          <div class="d-flex justify-content-between align-items-start gap-3 mb-3">
            <div>
              <span class="badge rounded-pill text-bg-primary mb-2"><i class="bi bi-person-badge me-1"></i>Ficha del docente</span>
              <h2 class="h4 mb-0">{{ dt.fullName }}</h2>
              <div class="text-muted small">{{ dt.specialization || 'Sin especialidad' }} &middot; {{ dt.weeklyBlocks }} bloques/semana</div>
            </div>
            <button class="btn btn-sm btn-outline-primary" type="button" (click)="closeTeacherDetail()"><i class="bi bi-x-lg"></i></button>
          </div>

          <ul class="nav nav-tabs nav-tabs-sm mb-3">
            <li class="nav-item">
              <button class="nav-link" [class.active]="detailTab === 'datos'" type="button" (click)="detailTab = 'datos'">
                <i class="bi bi-person-vcard me-1"></i>Datos personales
              </button>
            </li>
            <li class="nav-item">
              <button class="nav-link" [class.active]="detailTab === 'materias'" type="button" (click)="detailTab = 'materias'">
                <i class="bi bi-book me-1"></i>Materias
              </button>
            </li>
            <li class="nav-item">
              <button class="nav-link" [class.active]="detailTab === 'cursos'" type="button" (click)="detailTab = 'cursos'">
                <i class="bi bi-mortarboard me-1"></i>Cursos
              </button>
            </li>
            <li class="nav-item">
              <button class="nav-link" [class.active]="detailTab === 'horario'" type="button" (click)="detailTab = 'horario'">
                <i class="bi bi-calendar-week me-1"></i>Horario
              </button>
            </li>
          </ul>

          @if (detailTab === 'datos') {
            <div class="card border-0 shadow-sm">
              <div class="card-body p-4">
                <div class="d-flex justify-content-between align-items-center mb-3">
                  <h3 class="h6 mb-0">Informacion personal</h3>
                  @if (canManageAcademic) {
                    <button class="btn btn-sm btn-outline-primary" type="button" (click)="editTeacher(dt)"><i class="bi bi-pencil me-1"></i>Editar</button>
                  }
                </div>
                <dl class="row mb-0 small">
                  <dt class="col-4 col-md-3 text-muted">Nombres</dt>
                  <dd class="col-8 col-md-9 mb-1">{{ dt.firstName }} {{ dt.lastName }}</dd>
                  <dt class="col-4 col-md-3 text-muted">Usuario</dt>
                  <dd class="col-8 col-md-9 mb-1">{{ dt.username }}</dd>
                  <dt class="col-4 col-md-3 text-muted">Correo</dt>
                  <dd class="col-8 col-md-9 mb-1">{{ dt.username }}&#64;educacion.gob.ec</dd>
                  <dt class="col-4 col-md-3 text-muted">Especialidad</dt>
                  <dd class="col-8 col-md-9 mb-1">{{ dt.specialization || 'Sin especialidad' }}</dd>
                  <dt class="col-4 col-md-3 text-muted">Estado</dt>
                  <dd class="col-8 col-md-9 mb-1">
                    <span class="badge rounded-pill" [class.text-bg-success]="dt.enabled" [class.text-bg-secondary]="!dt.enabled">
                      {{ dt.enabled ? 'Activo' : 'Inactivo' }}
                    </span>
                  </dd>
                </dl>
              </div>
            </div>
          }

          @if (detailTab === 'materias') {
            <div class="card border-0 shadow-sm">
              <div class="card-body p-4">
                <div class="d-flex justify-content-between align-items-center mb-3">
                  <h3 class="h6 mb-0"><i class="bi bi-book me-2"></i>Materias asignadas</h3>
                  @if (canManageAcademic) {
                    <button class="btn btn-sm btn-outline-primary" type="button" (click)="editTeacher(dt)">
                      <i class="bi bi-pencil me-1"></i>Editar
                    </button>
                  }
                </div>
                @if (dt.subjects.length > 0) {
                  <div class="d-flex flex-wrap gap-2">
                    @for (subj of dt.subjects; track subj) {
                      <span class="badge rounded-pill text-bg-light">{{ subj }}</span>
                    }
                  </div>
                } @else {
                  <div class="text-center py-4">
                    <i class="bi bi-book text-muted" style="font-size:2rem"></i>
                    <p class="text-muted small mt-2 mb-0">Sin materias asignadas.</p>
                  </div>
                }
              </div>
            </div>
          }

          @if (detailTab === 'cursos') {
            <div class="card border-0 shadow-sm">
              <div class="card-body p-4">
                <div class="d-flex justify-content-between align-items-center mb-3">
                  <h3 class="h6 mb-0"><i class="bi bi-mortarboard me-2"></i>Cursos asignados</h3>
                  @if (canManageAcademic) {
                    <button class="btn btn-sm btn-outline-primary" type="button" (click)="editTeacher(dt)">
                      <i class="bi bi-pencil me-1"></i>Editar
                    </button>
                  }
                </div>
                @if (dt.courses.length > 0) {
                  <div class="d-flex flex-wrap gap-2">
                    @for (course of dt.courses; track course) {
                      <span class="badge rounded-pill text-bg-light">{{ course }}</span>
                    }
                  </div>
                } @else {
                  <div class="text-center py-4">
                    <i class="bi bi-mortarboard text-muted" style="font-size:2rem"></i>
                    <p class="text-muted small mt-2 mb-0">Sin cursos asignados.</p>
                  </div>
                }
              </div>
            </div>
          }

          @if (detailTab === 'horario') {
            <div class="card border-0 shadow-sm">
              <div class="card-body p-4">
                <div class="d-flex justify-content-between align-items-center mb-3">
                  <h3 class="h6 mb-0"><i class="bi bi-calendar-week me-2"></i>Horario semanal</h3>
                  @if (canManageAcademic) {
                    <button class="btn btn-sm btn-outline-primary" type="button" (click)="startAddScheduleEntry(dt.id)">
                      <i class="bi bi-plus-circle me-1"></i>Agregar bloque
                    </button>
                  }
                </div>
                @if (teacherSchedule(dt.id).length === 0) {
                  <div class="text-center py-4">
                    <i class="bi bi-calendar-x text-muted" style="font-size:2rem"></i>
                    <p class="text-muted small mt-2 mb-0">Sin horario asignado.</p>
                  </div>
                } @else {
                  <ul class="nav nav-tabs nav-tabs-sm mb-3">
                    @for (day of weekdays; track day.value) {
                      @if (teacherScheduleByDay(dt.id, day.value).length > 0) {
                        <li class="nav-item">
                          <button class="nav-link" [class.active]="selectedScheduleDay === day.value" type="button" (click)="selectedScheduleDay = day.value">
                            {{ day.shortLabel }}
                          </button>
                        </li>
                      }
                    }
                  </ul>
                  @let dayEntries = teacherScheduleByDay(dt.id, selectedScheduleDay);
                  @if (dayEntries.length > 0) {
                    <div class="table-responsive">
                      <table class="table table-xs table-hover align-middle mb-0">
                        <thead>
                          <tr><th>Bloque</th><th>Materia</th><th>Curso</th><th>Aula</th><th class="text-end"></th></tr>
                        </thead>
                        <tbody>
                          @for (entry of dayEntries; track entry.id) {
                            <tr>
                              <td>{{ entry.scheduleLabel }}</td>
                              <td class="fw-semibold">{{ entry.subjectName }}</td>
                              <td>{{ entry.courseName }}</td>
                              <td>{{ entry.classroom || '—' }}</td>
                              <td class="text-end">
                                @if (canManageAcademic) {
                                  <button class="btn btn-sm btn-link text-primary p-0 me-2" type="button" (click)="startEditScheduleEntry(entry)"><i class="bi bi-pencil"></i></button>
                                  <button class="btn btn-sm btn-link text-danger p-0" type="button" (click)="deleteScheduleEntry(entry.id)"><i class="bi bi-trash"></i></button>
                                }
                              </td>
                            </tr>
                          }
                        </tbody>
                      </table>
                    </div>
                  } @else {
                    <p class="text-muted small mb-0">Sin bloques programados este dia.</p>
                  }
                }
              </div>
            </div>
          }

          <div class="d-flex justify-content-end gap-2 mt-3">
            <button class="btn btn-sm btn-primary" type="button" (click)="closeTeacherDetail()">Cerrar</button>
          </div>
        </div>
      </div>
    }

    @if (editorOpen) {
      <div class="modal-shell" (click)="cancelEdit()">
        <div class="modal-card" style="max-width: 720px;" (click)="$event.stopPropagation()">
          <div class="d-flex justify-content-between align-items-start mb-3">
            <h5 class="mb-0">{{ editingId ? 'Editar docente' : 'Nuevo docente' }}</h5>
            <button class="btn-close" type="button" (click)="cancelEdit()"></button>
          </div>
          <form [formGroup]="form" class="d-grid gap-3">
            <div class="row g-3">
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
                <label class="form-label fw-semibold small">Area curricular</label>
                <select class="form-select form-select-sm" formControlName="specialization" (change)="onAreaChange()">
                  <option value="">Seleccionar area...</option>
                  @for (area of allAreas; track area) {
                    <option [value]="area">{{ area }}</option>
                  }
                </select>
              </div>
            </div>

            <hr class="my-1">

            <div class="row g-3">
              <div class="col-12 col-md-6">
                <label class="form-label fw-semibold small">Materias que imparte</label>
                <div class="d-flex align-items-center gap-2">
                  @if (pendingSubjectSelection.size > 0) {
                    <span class="text-muted small">{{ pendingSubjectSelection.size }} materia(s) seleccionada(s)</span>
                  } @else {
                    <span class="text-muted small">Ninguna materia seleccionada</span>
                  }
                  <button class="btn btn-sm btn-outline-primary ms-auto" type="button" (click)="openSubjectModal()">
                    <i class="bi bi-eye me-1"></i>{{ pendingSubjectSelection.size > 0 ? 'Ver y editar' : 'Seleccionar' }}
                  </button>
                </div>
              </div>
              <div class="col-12 col-md-6">
                <label class="form-label fw-semibold small">Cursos asignados</label>
                <div class="d-flex align-items-center gap-2">
                  @if (pendingCourseSelection.size > 0) {
                    <span class="text-muted small">{{ pendingCourseSelection.size }} curso(s) seleccionado(s)</span>
                  } @else {
                    <span class="text-muted small">Ningun curso seleccionado</span>
                  }
                  <button class="btn btn-sm btn-outline-primary ms-auto" type="button" (click)="openCourseModal()">
                    <i class="bi bi-eye me-1"></i>{{ pendingCourseSelection.size > 0 ? 'Ver y editar' : 'Seleccionar' }}
                  </button>
                </div>
              </div>
            </div>

            <div class="form-check form-switch border rounded px-3 py-2">
              <input class="form-check-input" id="teacher-enabled-modal" type="checkbox" formControlName="enabled">
              <label class="form-check-label ms-2 fw-semibold" for="teacher-enabled-modal">Docente habilitado</label>
            </div>

            @if (saveError) {
              <div class="alert alert-danger py-2 mb-0 small">{{ saveError }}</div>
            }

            <div class="d-flex justify-content-end gap-2 pt-2 border-top">
              <button class="btn btn-sm btn-outline-primary" type="button" (click)="cancelEdit()">Cancelar</button>
              <button class="btn btn-sm btn-primary" type="button" (click)="save()">Guardar docente</button>
            </div>
          </form>
        </div>
      </div>
    }

    @if (subjectModalOpen) {
      <div class="modal-shell">
        <div class="modal-card" style="max-width: 520px;">
          <div class="d-flex justify-content-between align-items-start mb-3">
            <h5 class="mb-0">Materias que imparte</h5>
            <button class="btn-close" type="button" (click)="subjectModalOpen = false"></button>
          </div>
          <div class="mb-2">
            <input class="form-control form-control-sm" type="search" placeholder="Buscar materia..."
                   [value]="subjectSearch" (input)="subjectSearch = $any($event.target).value">
          </div>
          <div class="d-grid gap-1" style="max-height: 320px; overflow-y: auto;">
            @for (subj of filteredSubjectOptions; track subj) {
              <label class="d-flex align-items-center gap-2 px-2 py-1 rounded-2 small" style="cursor:pointer"
                     [class.bg-primary]="subjectTempSelection.has(subj)" [class.text-white]="subjectTempSelection.has(subj)"
                     [class.bg-light]="!subjectTempSelection.has(subj)"
                     (click)="toggleSubjectTemp(subj)">
                <input class="form-check-input m-0" type="checkbox" [checked]="subjectTempSelection.has(subj)">
                {{ subj }}
              </label>
            } @empty {
              <p class="text-muted small text-center py-3 mb-0">
                @if (selectedArea) {
                  No hay materias en el area "{{ selectedArea }}".
                } @else {
                  Seleccione un area curricular primero.
                }
              </p>
            }
          </div>
          <div class="d-flex justify-content-end gap-2 mt-3">
            <button class="btn btn-sm btn-outline-primary" type="button" (click)="subjectModalOpen = false">Cancelar</button>
            <button class="btn btn-sm btn-primary" type="button" (click)="confirmSubjectSelection()">Aceptar</button>
          </div>
        </div>
      </div>
    }

    @if (courseModalOpen) {
      <div class="modal-shell">
        <div class="modal-card" style="max-width: 680px;">
          <div class="d-flex justify-content-between align-items-start mb-3">
            <h5 class="mb-0">Asignacion de cursos</h5>
            <button class="btn-close" type="button" (click)="courseModalOpen = false"></button>
          </div>
          <div class="mb-3">
            <input class="form-control form-control-sm" type="search" placeholder="Buscar curso..."
                   [value]="courseSearch" (input)="courseSearch = $any($event.target).value">
          </div>
          <div class="row g-3" style="max-height: 400px; overflow-y: auto;">
            <div class="col-6">
              <div class="small fw-semibold text-muted mb-2">
                <i class="bi bi-check-circle me-1 text-success"></i>Asignados ({{ courseTempSelection.size }})
              </div>
              <div class="d-grid gap-1">
                @for (course of filteredAssignedCourses(); track course) {
                  <div class="d-flex align-items-center gap-2 px-2 py-1 rounded-2 small bg-success-subtle border border-success-subtle"
                       style="cursor:pointer" (click)="toggleCourseTemp(course)">
                    <i class="bi bi-check-circle-fill text-success"></i>
                    <span class="flex-grow-1">{{ course }}</span>
                    <i class="bi bi-x-lg text-danger small"></i>
                  </div>
                } @empty {
                  <p class="text-muted small text-center py-3 mb-0">Sin cursos asignados.</p>
                }
              </div>
            </div>
            <div class="col-6">
              <div class="small fw-semibold text-muted mb-2">
                <i class="bi bi-plus-circle me-1 text-primary"></i>Disponibles ({{ filteredAvailableCourses().length }})
              </div>
              <div class="d-grid gap-1">
                @for (course of filteredAvailableCourses(); track course) {
                  <div class="d-flex align-items-center gap-2 px-2 py-1 rounded-2 small bg-light"
                       style="cursor:pointer" (click)="toggleCourseTemp(course)">
                    <i class="bi bi-plus-circle text-primary"></i>
                    <span class="flex-grow-1">{{ course }}</span>
                  </div>
                } @empty {
                  <p class="text-muted small text-center py-3 mb-0">No hay cursos pendientes.</p>
                }
              </div>
            </div>
          </div>
          <div class="d-flex justify-content-end gap-2 mt-3">
            <button class="btn btn-sm btn-outline-primary" type="button" (click)="courseModalOpen = false">Cancelar</button>
            <button class="btn btn-sm btn-primary" type="button" (click)="confirmCourseSelection()">Aceptar</button>
          </div>
        </div>
      </div>
    }

    @if (scheduleModalTeacher && (addingScheduleFor !== null || editingScheduleEntryId !== null)) {
      <div class="modal-shell" (click)="cancelScheduleEdit()">
        <div class="modal-card" style="max-width: 720px;" (click)="$event.stopPropagation()">
          <div class="d-flex justify-content-between align-items-start mb-3">
            <h5 class="mb-0">
              <i class="bi bi-calendar-week me-2"></i>
              {{ editingScheduleEntryId ? 'Editar bloque' : 'Agregar bloque' }}
              <span class="text-muted small ms-2">— {{ scheduleModalTeacher.fullName }}</span>
            </h5>
            <button class="btn-close" type="button" (click)="cancelScheduleEdit()"></button>
          </div>

          @if (teacherSchedule(scheduleModalTeacher.id).length > 0) {
            <div class="mb-3">
              <h6 class="small fw-bold text-muted mb-2">Horario asignado</h6>
              <div class="table-responsive" style="max-height: 260px; overflow-y: auto;">
                <table class="table table-xs align-middle mb-0">
                  <thead class="sticky-top bg-light">
                    <tr>
                      <th class="small">Dia</th>
                      <th class="small">Bloque</th>
                      <th class="small">Materia</th>
                      <th class="small">Curso</th>
                      <th class="small">Aula</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (day of weekdays; track day.value) {
                      @let entries = teacherScheduleByDay(scheduleModalTeacher.id, day.value);
                      @for (entry of entries; track entry.id) {
                        <tr>
                          <td class="small fw-semibold">{{ day.label }}</td>
                          <td class="small">{{ entry.scheduleLabel }}</td>
                          <td class="small">{{ entry.subjectName }}</td>
                          <td class="small">{{ entry.courseName }}</td>
                          <td class="small text-muted">{{ entry.classroom || '—' }}</td>
                        </tr>
                      }
                    }
                  </tbody>
                </table>
              </div>
              <hr class="my-3">
            </div>
          } @else {
            <div class="text-center text-muted small py-2 mb-3 border-bottom">
              <i class="bi bi-calendar-x me-1"></i>Este docente no tiene bloques asignados aun.
            </div>
          }

          <h6 class="small fw-bold text-muted mb-2">{{ editingScheduleEntryId ? 'Editar bloque' : 'Nuevo bloque' }}</h6>
          @if (scheduleError) {
            <div class="alert alert-danger d-flex align-items-center gap-2 py-2 mb-2 small">
              <i class="bi bi-exclamation-triangle"></i>
              <span>{{ scheduleError }}</span>
            </div>
          }
          <form [formGroup]="scheduleForm" class="d-grid gap-3">
            <div class="row g-3">
              <div class="col-12 col-md-6">
                <label class="form-label fw-semibold small">Dia</label>
                <select class="form-select form-select-sm" formControlName="weekday">
                  @for (d of weekdays; track d.value) {
                    <option [value]="d.value">{{ d.label }}</option>
                  }
                </select>
              </div>
              <div class="col-12 col-md-6">
                <label class="form-label fw-semibold small">Bloque horario</label>
                <select class="form-select form-select-sm" formControlName="scheduleBlockId">
                  @for (b of classBlocks(); track b.id) {
                    <option [value]="b.id">{{ b.label }}</option>
                  }
                </select>
              </div>
            </div>
            <div class="row g-3">
              <div class="col-12 col-md-6">
                <label class="form-label fw-semibold small">Materia</label>
                <select class="form-select form-select-sm" formControlName="subjectId">
                  @for (s of teacherScheduleSubjects(); track s.id) {
                    <option [value]="s.id">{{ s.name }}</option>
                  } @empty {
                    <option value="" disabled>No tiene materias asignadas</option>
                  }
                </select>
              </div>
              <div class="col-12 col-md-6">
                <label class="form-label fw-semibold small">Curso</label>
                <select class="form-select form-select-sm" formControlName="courseId">
                  @for (c of teacherScheduleCourses(); track c.id) {
                    <option [value]="c.id">{{ c.name }} {{ c.parallel }}</option>
                  } @empty {
                    <option value="" disabled>No tiene cursos asignados</option>
                  }
                </select>
              </div>
            </div>
            <div>
              <label class="form-label fw-semibold small">Aula</label>
              <input class="form-control form-control-sm" type="text" formControlName="classroom" placeholder="Aula">
            </div>
            <div class="d-flex justify-content-end gap-2 pt-2 border-top">
              <button class="btn btn-sm btn-outline-primary" type="button" (click)="cancelScheduleEdit()">Cancelar</button>
              <button class="btn btn-sm btn-primary" type="button" (click)="saveScheduleEntry(scheduleModalTeacher.id)">{{ editingScheduleEntryId ? 'Actualizar' : 'Guardar' }}</button>
            </div>
          </form>
        </div>
      </div>
    }
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
        this.scheduleError = error?.error?.message || 'No se pudo guardar el bloque horario.';
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
