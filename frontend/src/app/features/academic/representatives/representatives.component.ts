import { HttpClient } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { catchError, of } from 'rxjs';
import { API_URL } from '../../../core/api.config';
import { AuthService } from '../../../core/auth.service';
import { AcademicCourse, AcademicStudent, AcademicOverview } from '../academic.models';

export type StudentRepresentative = {
  id: number;
  studentId: number;
  studentName: string;
  enrollmentNumber: string;
  fullName: string;
  relationship: string;
  phone: string;
  email: string;
  address: string;
  emergencyContact: string;
  emergencyPhone: string;
};

@Component({
  selector: 'app-academic-representatives',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule],
  template: `
    <div class="card border-0 shadow-sm h-100">
      <div class="card-body p-4 d-grid gap-4">
        <div class="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3">
          <div>
            <h2 class="h4 mb-1">Representantes de estudiantes</h2>
            <p class="text-muted mb-0">Registra los datos de contacto de padres, madres o tutores responsables de cada estudiante.</p>
          </div>
          @if (canManageAcademic) {
            <button class="btn btn-sm btn-primary" type="button" (click)="startCreate()">
              <i class="bi bi-person-plus me-2"></i>Nuevo representante
            </button>
          }
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
            <input class="form-control form-control-sm" type="text" [value]="search" (input)="search = $any($event.target).value" placeholder="Representante o estudiante">
            @if (errorMessage()) {
              <div class="alert alert-danger alert-sm mt-2 mb-0 py-2 small">{{ errorMessage() }}</div>
            }
          </div>
        </div>

        @if (editorOpen) {
          <div class="modal-shell" (click)="cancelEdit()">
            <div class="modal-card" style="max-width:680px" (click)="$event.stopPropagation()">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <h3 class="h6 mb-0"><i class="bi bi-people me-2"></i>{{ editingId ? 'Editar representante' : 'Nuevo representante' }}</h3>
                <button class="btn btn-sm btn-outline-secondary" type="button" (click)="cancelEdit()"><i class="bi bi-x-lg"></i></button>
              </div>
              <form [formGroup]="form" class="row g-3">
                <div class="col-12">
                  <label class="form-label fw-semibold small">Estudiante</label>
                  <select class="form-select form-select-sm" formControlName="studentId">
                    @for (student of filteredStudents; track student.id) {
                      <option [value]="student.id">{{ student.enrollmentNumber }} · {{ student.fullName }}</option>
                    }
                  </select>
                </div>
                <div class="col-12">
                  <label class="form-label fw-semibold small">Nombre completo</label>
                  <input class="form-control form-control-sm" type="text" formControlName="fullName" placeholder="Nombres y apellidos">
                </div>
                <div class="col-12 col-md-4">
                  <label class="form-label fw-semibold small">Parentesco</label>
                  <select class="form-select form-select-sm" formControlName="relationship">
                    <option value="PADRE">Padre</option>
                    <option value="MADRE">Madre</option>
                    <option value="TUTOR">Tutor legal</option>
                    <option value="ABUELO">Abuelo(a)</option>
                    <option value="HERMANO">Hermano(a)</option>
                    <option value="OTRO">Otro familiar</option>
                  </select>
                </div>
                <div class="col-12 col-md-4">
                  <label class="form-label fw-semibold small">Telefono</label>
                  <input class="form-control form-control-sm" type="tel" formControlName="phone" placeholder="0999999999">
                </div>
                <div class="col-12 col-md-4">
                  <label class="form-label fw-semibold small">Correo</label>
                  <input class="form-control form-control-sm" type="email" formControlName="email" placeholder="correo@ejemplo.com">
                </div>
                <div class="col-12">
                  <label class="form-label fw-semibold small">Direccion</label>
                  <input class="form-control form-control-sm" type="text" formControlName="address" placeholder="Direccion completa">
                </div>
                <div class="col-12 col-md-6">
                  <label class="form-label fw-semibold small">Contacto emergencia</label>
                  <input class="form-control form-control-sm" type="text" formControlName="emergencyContact" placeholder="Nombre">
                </div>
                <div class="col-12 col-md-6">
                  <label class="form-label fw-semibold small">Telefono emergencia</label>
                  <input class="form-control form-control-sm" type="tel" formControlName="emergencyPhone" placeholder="Telefono">
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
                <th>Estudiante</th>
                <th>Representante</th>
                <th>Parentesco</th>
                <th>Telefono</th>
                <th>Email</th>
                <th>Emergencia</th>
                <th class="text-end"></th>
              </tr>
            </thead>
            <tbody>
              @for (rep of filtered(); track rep.id) {
                <tr>
                  <td>
                    <div class="fw-semibold small">{{ rep.enrollmentNumber }}</div>
                    <div class="small text-muted">{{ rep.studentName }}</div>
                  </td>
                  <td class="fw-semibold">{{ rep.fullName }}</td>
                  <td>{{ relationshipLabel(rep.relationship) }}</td>
                  <td>{{ rep.phone }}</td>
                  <td class="small">{{ rep.email }}</td>
                  <td class="small">
                    @if (rep.emergencyContact) {
                      <div>{{ rep.emergencyContact }}</div>
                      <div class="text-muted">{{ rep.emergencyPhone }}</div>
                    } @else {
                      <span class="text-muted">-</span>
                    }
                  </td>
                  <td class="text-end">
                    @if (canManageAcademic) {
                      <button class="btn btn-sm btn-outline-primary" type="button" (click)="edit(rep)">Editar</button>
                    }
                  </td>
                </tr>
              } @empty {
                <tr><td colspan="7" class="text-center text-muted py-4">No hay representantes registrados.</td></tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class RepresentativesComponent implements OnInit {
  private http = inject(HttpClient);
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);

  errorMessage = signal('');
  courses: AcademicCourse[] = [];
  students: AcademicStudent[] = [];
  canManageAcademic = this.auth.hasPermission('ACADEMIC_MANAGE');

  representatives: StudentRepresentative[] = [];
  selectedCourseFilter = 'all';
  search = '';
  editorOpen = false;
  editingId: number | null = null;

  form = this.fb.nonNullable.group({
    studentId: [0, Validators.required],
    fullName: ['', Validators.required],
    relationship: ['PADRE', Validators.required],
    phone: ['', Validators.required],
    email: [''],
    address: [''],
    emergencyContact: [''],
    emergencyPhone: ['']
  });

  get filteredStudents(): AcademicStudent[] {
    return this.students.filter(s => {
      if (this.editingId) {
        const rep = this.representatives.find(r => r.id === this.editingId);
        if (rep && rep.studentId === s.id) return true;
      }
      return !this.representatives.some(r => r.studentId === s.id);
    });
  }

  relationshipLabel(value: string): string {
    const labels: Record<string, string> = {
      PADRE: 'Padre', MADRE: 'Madre', TUTOR: 'Tutor legal',
      ABUELO: 'Abuelo(a)', HERMANO: 'Hermano(a)', OTRO: 'Otro'
    };
    return labels[value] || value;
  }

  filtered(): StudentRepresentative[] {
    const courseFilter = this.selectedCourseFilter;
    const term = this.search.trim().toLowerCase();
    return this.representatives.filter(rep => {
      const student = this.students.find(s => s.id === rep.studentId);
      const courseMatch = courseFilter === 'all' || (student && String(student.courseId) === courseFilter);
      const searchMatch = !term
        || rep.fullName.toLowerCase().includes(term)
        || rep.studentName.toLowerCase().includes(term)
        || rep.enrollmentNumber.toLowerCase().includes(term);
      return courseMatch && searchMatch;
    });
  }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.http.get<StudentRepresentative[]>(`${API_URL}/academic/representatives`).pipe(
      catchError(() => of([]))
    ).subscribe(data => {
      this.representatives = data;
    });
    this.http.get<AcademicOverview>(`${API_URL}/academic/overview`).pipe(
      catchError(() => of({ courses: [], subjects: [], periods: [], students: [], teachers: [] }))
    ).subscribe(data => {
      this.courses = data.courses;
      this.students = data.students;
    });
  }

  startCreate(): void {
    this.editingId = null;
    this.editorOpen = true;
    const available = this.filteredStudents;
    this.form.reset({
      studentId: available[0]?.id ?? 0,
      fullName: '', relationship: 'PADRE',
      phone: '', email: '', address: '',
      emergencyContact: '', emergencyPhone: ''
    });
  }

  edit(rep: StudentRepresentative): void {
    this.editingId = rep.id;
    this.editorOpen = true;
    this.form.setValue({
      studentId: rep.studentId,
      fullName: rep.fullName,
      relationship: rep.relationship,
      phone: rep.phone,
      email: rep.email,
      address: rep.address,
      emergencyContact: rep.emergencyContact,
      emergencyPhone: rep.emergencyPhone
    });
  }

  cancelEdit(): void {
    this.editorOpen = false;
    this.editingId = null;
  }

  save(): void {
    if (!this.canManageAcademic || this.form.invalid) return;
    this.errorMessage.set('');
    const payload = this.form.getRawValue();
    const request$ = this.editingId
      ? this.http.put(`${API_URL}/academic/representatives/${this.editingId}`, payload)
      : this.http.post(`${API_URL}/academic/representatives`, payload);

    request$.pipe(catchError((err) => {
      this.errorMessage.set(err?.error?.message || 'Error al guardar el representante. Verifique los datos.');
      return of(null);
    })).subscribe((res) => {
      if (res) {
        this.cancelEdit();
        this.load();
      }
    });
  }
}
