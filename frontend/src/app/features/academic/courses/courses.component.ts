import { HttpClient } from '@angular/common/http';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { catchError, of } from 'rxjs';
import { API_URL } from '../../../core/api.config';
import { AuthService } from '../../../core/auth.service';
import { AcademicCourse, AcademicStudent, AcademicOverview, ImportSummaryResult } from '../academic.models';

@Component({
  selector: 'app-academic-courses',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule],
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
              <label class="form-label fw-semibold">Curso</label>
              <input class="form-control form-control-sm" type="text" formControlName="name" placeholder="Primero BGU">
            </div>
            <div class="col-12 col-md-3">
              <label class="form-label fw-semibold">Paralelo</label>
              <input class="form-control form-control-sm text-uppercase" type="text" formControlName="parallel" placeholder="A">
            </div>
            <div class="col-12 col-md-3">
              <label class="form-label fw-semibold">Nivel</label>
              <input class="form-control form-control-sm" type="text" formControlName="level" placeholder="Bachillerato">
            </div>
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
                <th>Nivel</th>
                <th>Semanero</th>
                <th class="text-end"></th>
              </tr>
            </thead>
            <tbody>
              @for (course of courses; track course.id) {
                <tr>
                  <td>{{ course.name }}</td>
                  <td>{{ course.parallel }}</td>
                  <td>{{ course.level }}</td>
                  <td>{{ course.weekStudentName || 'Sin semanero' }}</td>
                  <td class="text-end">
                    @if (canManageAcademic) {
                      <button class="btn btn-sm btn-outline-primary" type="button" (click)="edit(course)">Editar</button>
                    }
                  </td>
                </tr>
              } @empty {
                <tr><td colspan="5" class="text-center text-muted py-4">Sin cursos registrados.</td></tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <input id="courses-import-input" class="d-none" type="file" accept=".xlsx" (change)="handleImport($event)">
  `
})
export class CoursesComponent implements OnInit {
  private http = inject(HttpClient);
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);

  courses: AcademicCourse[] = [];
  students: AcademicStudent[] = [];
  canManageAcademic = this.auth.hasPermission('ACADEMIC_MANAGE');

  editorOpen = false;
  editingId: number | null = null;

  form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    parallel: ['', Validators.required],
    level: ['', Validators.required],
    weekStudentId: [null as number | null]
  });

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
    if (!this.editingId) {
      const editing = this.courses.find(c => c.id === this.editingId);
      return editing
        ? this.students.filter(s => s.courseId === editing.id)
        : [];
    }
    return this.students.filter(s => s.courseId === this.editingId);
  }

  startCreate(): void {
    this.editingId = null;
    this.editorOpen = true;
    this.form.reset({ name: '', parallel: '', level: '', weekStudentId: null });
  }

  edit(course: AcademicCourse): void {
    this.editingId = course.id;
    this.editorOpen = true;
    this.form.setValue({
      name: course.name,
      parallel: course.parallel,
      level: course.level,
      weekStudentId: course.weekStudentId ?? null
    });
  }

  cancelEdit(): void {
    this.editorOpen = false;
    this.editingId = null;
    this.form.reset({ name: '', parallel: '', level: '', weekStudentId: null });
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
        <td>${course.level}</td>
        <td>${course.weekStudentName || 'Sin semanero'}</td>
      </tr>
    `).join('');
    this.exportHtmlTable('cursos-leccionario.xls', ['Curso', 'Paralelo', 'Nivel', 'Semanero'], rows);
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
