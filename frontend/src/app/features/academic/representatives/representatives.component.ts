import { HttpClient } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { catchError, forkJoin, map, of } from 'rxjs';
import { API_URL } from '../../../core/api.config';
import { AuthService } from '../../../core/auth.service';
import { AcademicCourse, AcademicStudent, AcademicOverview } from '../academic.models';
import { SortableHeaderComponent } from '../../../shared/sortable-header.component';
import { FilterDropdownComponent } from '../../../shared/filter-dropdown.component';
import { SortState, FilterState, applySort, applyFilters, getFilterOptions, toggleFilter, clearFilter, SortDir } from '../../../shared/table-utils';

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
  templateUrl: './representatives.component.html',
  styleUrl: './representatives.component.css',
    selector: 'app-academic-representatives',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, SortableHeaderComponent, FilterDropdownComponent],
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

  sort: SortState | null = null;
  filters: FilterState = {};
  displayedRepresentatives: StudentRepresentative[] = [];
  confirmDeleteRep: StudentRepresentative | null = null;
  deletingRep = false;
  deleteRepError = '';

  sortColumn(col: string): SortDir { return this.sort?.column === col ? this.sort.dir : null; }
  onSort(col: string): void {
    const dir: SortDir = this.sort?.column === col
      ? (this.sort.dir === 'asc' ? 'desc' : this.sort.dir === 'desc' ? null : 'asc')
      : 'asc';
    this.sort = dir ? { column: col, dir } : null;
    this.refreshDisplayed();
  }
  filterOpts(col: string): string[] { return getFilterOptions(this.representatives, col); }
  getFilter(col: string): Set<string> { return this.filters[col] ?? new Set(); }
  onFilter(col: string, val: string): void { this.filters = toggleFilter(this.filters, col, val); this.refreshDisplayed(); }
  onClearFilter(col: string): void { this.filters = clearFilter(this.filters, col); this.refreshDisplayed(); }
  refreshDisplayed(): void {
    this.displayedRepresentatives = applyFilters(applySort(this.representatives, this.sort), this.filters);
  }

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
    forkJoin({
      representatives: this.http.get<StudentRepresentative[]>(`${API_URL}/academic/representatives`).pipe(catchError(() => of([]))),
      overview: this.http.get<AcademicOverview>(`${API_URL}/academic/overview`).pipe(catchError(() => of({ courses: [], subjects: [], periods: [], students: [], teachers: [] })))
    }).subscribe(({ representatives, overview }) => {
      this.representatives = representatives;
      this.courses = overview.courses;
      this.students = overview.students;
      this.refreshDisplayed();
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

  deleteRepresentative(): void {
    if (!this.confirmDeleteRep || !this.canManageAcademic) return;
    this.deletingRep = true;
    this.deleteRepError = '';
    const id = this.confirmDeleteRep.id;
    this.http.delete(`${API_URL}/academic/representatives/${id}`).pipe(
      map(() => true),
      catchError(err => {
        this.deleteRepError = err?.error?.message ?? 'No se pudo eliminar el representante.';
        return of(false);
      })
    ).subscribe(ok => {
      this.deletingRep = false;
      if (ok) {
        this.confirmDeleteRep = null;
        this.deleteRepError = '';
        this.load();
      }
    });
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
