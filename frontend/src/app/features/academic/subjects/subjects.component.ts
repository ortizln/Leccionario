import { HttpClient } from '@angular/common/http';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { catchError, forkJoin, of } from 'rxjs';
import { API_URL } from '../../../core/api.config';
import { AcademicTeacher } from '../academic.models';
import { AuthService } from '../../../core/auth.service';

type Subject = { id: number; name: string; code: string; curriculumArea: string };

@Component({
  selector: 'app-academic-subjects',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule],
  template: `
    <div class="card border-0 shadow-sm">
      <div class="card-body p-4 d-grid gap-4">
        <div class="d-flex justify-content-between align-items-center">
          <div>
            <h2 class="h4 mb-1">Materias, areas y docentes</h2>
            <p class="text-muted mb-0">Organiza las materias por area curricular y asigna los docentes a cada materia.</p>
          </div>
          @if (canManageAcademic) {
            <button class="btn btn-sm btn-primary" type="button" (click)="startCreate()">
              <i class="bi bi-plus-circle me-2"></i>Nueva materia
            </button>
          }
        </div>

        @if (canManageAcademic) {
          <div class="card border-0 shadow-sm">
            <div class="card-body p-3">
              <div class="d-flex justify-content-between align-items-center">
                <h3 class="h6 mb-0"><i class="bi bi-folder me-2"></i>Areas curriculares</h3>
                <span class="text-muted small">Se crean automaticamente al agregar materias</span>
              </div>
              <div class="d-flex flex-wrap gap-2 mt-3">
                @for (area of areas; track area) {
                  <div class="d-flex align-items-center gap-2 border rounded px-3 py-2">
                    <span class="small fw-semibold">{{ area }}</span>
                    <span class="badge text-bg-light small">{{ subjectsByArea(area).length }}</span>
                  </div>
                } @empty {
                  <p class="text-muted small mb-0">No hay areas registradas. Las areas se crean automaticamente al asignar una materia.</p>
                }
              </div>
            </div>
          </div>
        }

        @if (editorOpen) {
          <form [formGroup]="form" class="row g-3 p-3 rounded-4 editor-panel">
            <div class="col-12">
              <h3 class="h6 mb-0">{{ editingId ? 'Editar materia' : 'Nueva materia' }}</h3>
            </div>
            <div class="col-12 col-md-4">
              <label class="form-label fw-semibold">Nombre de la materia</label>
              <input class="form-control form-control-sm" type="text" formControlName="name" placeholder="Lengua y Literatura">
            </div>
            <div class="col-12 col-md-4">
              <label class="form-label fw-semibold">Codigo</label>
              <input class="form-control form-control-sm" type="text" formControlName="code" placeholder="LL-01">
            </div>
            <div class="col-12 col-md-4">
              <label class="form-label fw-semibold">Area curricular</label>
              <select class="form-select form-select-sm" formControlName="curriculumArea">
                <option value="">Selecciona un area...</option>
                @for (area of areas; track area) {
                  <option [value]="area">{{ area }}</option>
                }
              </select>
            </div>
            <div class="col-12 d-flex justify-content-end gap-2">
              <button class="btn btn-sm btn-outline-primary" type="button" (click)="cancelEdit()">Cancelar</button>
              <button class="btn btn-sm btn-primary" type="button" (click)="save()">Guardar materia</button>
            </div>
          </form>
        }

        @for (group of groupedSubjects(); track group.area) {
          <div class="card border-0 shadow-sm">
            <div class="card-body p-3">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <h3 class="h6 mb-0">
                  <i class="bi bi-folder me-2"></i>{{ group.area }}
                  <span class="badge text-bg-light ms-2">{{ group.subjects.length }}</span>
                </h3>
              </div>
              <div class="table-responsive">
                <table class="table table-striped align-middle mb-0">
                  <thead>
                    <tr>
                      <th>Materia</th>
                      <th>Codigo</th>
                      <th class="text-end">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (subject of group.subjects; track subject.id) {
                      <tr>
                        <td>
                          <div class="d-flex align-items-center gap-2">
                            <span>{{ subject.name }}</span>
                            @if (selectedSubjectId === subject.id) {
                              <span class="badge text-bg-primary">Seleccionada</span>
                            }
                          </div>
                        </td>
                        <td><code>{{ subject.code }}</code></td>
                        <td class="text-end">
                          <button class="btn btn-sm btn-outline-primary me-1" type="button"
                                  (click)="toggleTeacherPanel(subject)">
                            <i class="bi bi-person-gear me-1"></i>Docentes
                          </button>
                          @if (canManageAcademic) {
                            <button class="btn btn-sm btn-outline-secondary" type="button" (click)="edit(subject)">
                              <i class="bi bi-pencil"></i>
                            </button>
                          }
                        </td>
                      </tr>
                      @if (selectedSubjectId === subject.id) {
                        <tr>
                          <td colspan="3" class="p-0 border-0">
                            <div class="p-3 bg-white rounded-3">
                              <div class="d-flex justify-content-between align-items-center mb-2">
                                <span class="fw-semibold small">
                                  <i class="bi bi-people me-1"></i>Docentes del area "{{ subject.curriculumArea }}"
                                </span>
                                <span class="small text-muted">{{ areaTeachers(subject.curriculumArea).length }} docente(s)</span>
                              </div>
                              @if (areaTeachers(subject.curriculumArea).length === 0) {
                                <p class="text-muted small mb-0">No hay docentes registrados en esta area curricular.</p>
                              } @else {
                                <div class="table-responsive">
                                  <table class="table table-sm align-middle mb-0">
                                    <thead>
                                      <tr>
                                        <th>Docente</th>
                                        <th>Especialidad</th>
                                        <th>Materias asignadas</th>
                                        <th class="text-center">Asignar</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      @for (teacher of areaTeachers(subject.curriculumArea); track teacher.id) {
                                        <tr>
                                          <td class="fw-semibold small">{{ teacher.fullName }}</td>
                                          <td class="small">{{ teacher.specialization }}</td>
                                          <td class="small">
                                            @if (teacher.subjects.length > 0) {
                                              {{ teacher.subjects.join(', ') }}
                                            } @else {
                                              <span class="text-muted">Sin materias</span>
                                            }
                                          </td>
                                          <td class="text-center">
                                            <div class="form-check form-switch d-inline-block mb-0">
                                              <input class="form-check-input" type="checkbox"
                                                     [checked]="teacher.subjects.includes(subject.name)"
                                                     [disabled]="!canManageAcademic"
                                                     (change)="toggleSubjectAssignment(teacher, subject, $any($event.target).checked)">
                                            </div>
                                          </td>
                                        </tr>
                                      }
                                    </tbody>
                                  </table>
                                </div>
                              }
                            </div>
                          </td>
                        </tr>
                      }
                    } @empty {
                      <tr><td colspan="3" class="text-center text-muted py-4">Sin materias en esta area.</td></tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        } @empty {
          <div class="card border-0 shadow-sm">
            <div class="card-body text-center py-5">
              <i class="bi bi-book display-6 text-muted"></i>
              <p class="text-muted mt-3 mb-0">No hay materias registradas. Crea la primera materia para comenzar.</p>
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class SubjectsComponent implements OnInit {
  private http = inject(HttpClient);
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);

  canManageAcademic = this.auth.hasPermission('ACADEMIC_MANAGE');

  subjects: Subject[] = [];
  teachers: AcademicTeacher[] = [];
  areas: string[] = [];
  editorOpen = false;
  editingId: number | null = null;
  selectedSubjectId: number | null = null;
  form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    code: ['', Validators.required],
    curriculumArea: ['', Validators.required]
  });

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    forkJoin({
      overview: this.http.get<{ subjects: Subject[]; teachers: AcademicTeacher[] }>(`${API_URL}/academic/overview`),
      teachersList: this.http.get<AcademicTeacher[]>(`${API_URL}/academic/teachers`).pipe(
        catchError(() => of([]))
      ),
      areas: this.http.get<Array<{ name: string }>>(`${API_URL}/academic/areas`).pipe(
        catchError(() => of(null))
      )
    }).pipe(
      catchError(() => of({ overview: { subjects: [], teachers: [] }, teachersList: [], areas: null }))
    ).subscribe(({ overview, teachersList, areas }) => {
      this.subjects = overview.subjects;
      this.teachers = teachersList.length > 0 ? teachersList : overview.teachers;
      if (areas) {
        this.areas = areas.map(a => a.name);
      } else {
        this.areas = [...new Set(overview.subjects.map(s => s.curriculumArea))].sort();
      }
    });
  }

  subjectsByArea(area: string): Subject[] {
    return this.subjects.filter(s => s.curriculumArea === area);
  }

  groupedSubjects(): Array<{ area: string; subjects: Subject[] }> {
    const map = new Map<string, Subject[]>();
    for (const s of this.subjects) {
      if (!map.has(s.curriculumArea)) {
        map.set(s.curriculumArea, []);
      }
      map.get(s.curriculumArea)!.push(s);
    }
    return Array.from(map.entries())
      .map(([area, subjects]) => ({ area, subjects }))
      .sort((a, b) => a.area.localeCompare(b.area));
  }

  areaTeachers(area: string): AcademicTeacher[] {
    const term = area.toLowerCase();
    return this.teachers.filter(t =>
      t.specialization.toLowerCase().includes(term)
    );
  }

  toggleTeacherPanel(subject: Subject): void {
    this.selectedSubjectId = this.selectedSubjectId === subject.id ? null : subject.id;
  }

  startCreate(): void {
    this.editingId = null;
    this.editorOpen = true;
    this.form.reset({ name: '', code: '', curriculumArea: '' });
  }

  edit(subject: Subject): void {
    this.editingId = subject.id;
    this.editorOpen = true;
    this.form.setValue({
      name: subject.name,
      code: subject.code,
      curriculumArea: subject.curriculumArea
    });
  }

  cancelEdit(): void {
    this.editorOpen = false;
    this.editingId = null;
    this.form.reset({ name: '', code: '', curriculumArea: '' });
  }

  save(): void {
    if (!this.canManageAcademic || this.form.invalid) return;
    const payload = this.form.getRawValue();
    const url = this.editingId
      ? `${API_URL}/academic/subjects/${this.editingId}`
      : `${API_URL}/academic/subjects`;
    const request$ = this.editingId
      ? this.http.put(url, payload)
      : this.http.post(url, payload);

    request$.subscribe({
      next: () => {
        this.cancelEdit();
        this.loadData();
      },
      error: () => {}
    });
  }

  toggleSubjectAssignment(teacher: AcademicTeacher, subject: Subject, assign: boolean): void {
    if (!this.canManageAcademic) return;
    let updated = [...teacher.subjects];
    if (assign) {
      if (!updated.includes(subject.name)) {
        updated.push(subject.name);
      }
    } else {
      updated = updated.filter(s => s !== subject.name);
    }
    this.http.put(`${API_URL}/academic/teachers/${teacher.id}`, { ...teacher, subjects: updated }).pipe(
      catchError(() => {
        return of(null);
      })
    ).subscribe({
      next: () => {
        const idx = this.teachers.findIndex(t => t.id === teacher.id);
        if (idx !== -1) {
          this.teachers[idx] = { ...this.teachers[idx], subjects: updated };
        }
        if (assign) {
          this.selectedSubjectId = subject.id;
        }
      }
    });
  }
}
