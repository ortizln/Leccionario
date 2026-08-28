import { Component, inject, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { catchError, of } from 'rxjs';
import { API_URL } from '../../core/api.config';
import { AuthService } from '../../core/auth.service';

@Component({
  templateUrl: './demerit-management.component.html',
  styleUrl: './demerit-management.component.css',
    selector: 'app-demerit-management',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule],
})
export class DemeritManagementComponent implements OnInit {
  private http = inject(HttpClient);
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);

  canManage = this.auth.hasPermission('ACADEMIC_MANAGE');
  errorMessage = '';
  activeTab: 'categorias' | 'faltas' = 'categorias';

  categories: DemeritCategoryItem[] = [];
  faltas: DemeritFaltaItem[] = [];
  faltaCategoryFilter = '';

  categoryFormOpen = false;
  editingCategoryId: number | null = null;
  categoryForm = this.fb.nonNullable.group({
    code: ['', Validators.required],
    name: ['', Validators.required],
    description: [''],
    displayOrder: [0],
    active: [true]
  });

  faltaFormOpen = false;
  editingFaltaId: number | null = null;
  faltaForm = this.fb.nonNullable.group({
    categoryId: [0, Validators.required],
    code: ['', Validators.required],
    description: ['', Validators.required],
    score: [5, [Validators.required, Validators.min(1), Validators.max(100)]],
    severity: ['MEDIA', Validators.required],
    requiresObservation: [false],
    requiresEvidence: [false],
    requiresRepresentative: [false],
    active: [true]
  });

  ngOnInit(): void {
    this.loadCategories();
    this.loadFaltas();
  }

  loadCategories(): void {
    this.http.get<DemeritCategoryItem[]>(`${API_URL}/demerit-categories`).pipe(
      catchError(() => of([]))
    ).subscribe(data => this.categories = data);
  }

  loadFaltas(): void {
    this.http.get<DemeritFaltaItem[]>(`${API_URL}/demerit-faltas`).pipe(
      catchError(() => of([]))
    ).subscribe(data => this.faltas = data);
  }

  countFaltas(categoryId: number): number {
    return this.faltas.filter(f => f.categoryId === categoryId).length;
  }

  filteredFaltas(): DemeritFaltaItem[] {
    if (!this.faltaCategoryFilter) return this.faltas;
    return this.faltas.filter(f => f.categoryId === Number(this.faltaCategoryFilter));
  }

  severityLabel(severity: string): string {
    const labels: Record<string, string> = { LEVE: 'Leve', MEDIA: 'Media', GRAVE: 'Grave', MUY_GRAVE: 'Muy grave' };
    return labels[severity] || severity;
  }

  openCategoryForm(): void {
    this.editingCategoryId = null;
    this.categoryForm.reset({ code: '', name: '', description: '', displayOrder: 0, active: true });
    this.categoryFormOpen = true;
  }

  editCategory(cat: DemeritCategoryItem): void {
    this.editingCategoryId = cat.id;
    this.categoryForm.patchValue({ code: cat.code, name: cat.name, description: cat.description ?? '', displayOrder: cat.displayOrder, active: cat.active });
    this.categoryFormOpen = true;
  }

  closeCategoryForm(): void { this.categoryFormOpen = false; this.editingCategoryId = null; }

  saveCategory(): void {
    if (!this.canManage || this.categoryForm.invalid) return;
    const payload = this.categoryForm.getRawValue();
    const dup = this.categories.find(c => c.code.toUpperCase() === payload.code.toUpperCase() && c.id !== this.editingCategoryId);
    if (dup) { this.errorMessage = `Ya existe una categoria con el codigo "${payload.code}".`; return; }
    this.errorMessage = '';
    const req = this.editingCategoryId
      ? this.http.put(`${API_URL}/demerit-categories/${this.editingCategoryId}`, payload)
      : this.http.post(`${API_URL}/demerit-categories`, payload);
    req.pipe(catchError(e => { this.errorMessage = e?.error?.message ?? 'Error al guardar'; return of(null); }))
      .subscribe(r => { if (r !== null) { this.closeCategoryForm(); this.loadCategories(); } });
  }

  deleteCategory(cat: DemeritCategoryItem): void {
    if (!this.canManage || !window.confirm(`Eliminar "${cat.name}"?`)) return;
    this.http.delete(`${API_URL}/demerit-categories/${cat.id}`).subscribe({
      next: () => this.loadCategories(),
      error: (e) => this.errorMessage = e?.error?.message ?? 'Error al eliminar'
    });
  }

  openFaltaForm(): void {
    this.editingFaltaId = null;
    this.faltaForm.reset({ categoryId: this.categories[0]?.id ?? 0, code: '', description: '', score: 5, severity: 'MEDIA', requiresObservation: false, requiresEvidence: false, requiresRepresentative: false, active: true });
    this.faltaFormOpen = true;
  }

  editFalta(falta: DemeritFaltaItem): void {
    this.editingFaltaId = falta.id;
    this.faltaForm.patchValue(falta);
    this.faltaFormOpen = true;
  }

  closeFaltaForm(): void { this.faltaFormOpen = false; this.editingFaltaId = null; }

  saveFalta(): void {
    if (!this.canManage || this.faltaForm.invalid) return;
    const payload = this.faltaForm.getRawValue();
    const dup = this.faltas.find(f => f.categoryId === payload.categoryId && f.code.toUpperCase() === payload.code.toUpperCase() && f.id !== this.editingFaltaId);
    if (dup) { this.errorMessage = `Ya existe una falta con el codigo "${payload.code}" en esta categoria.`; return; }
    this.errorMessage = '';
    const req = this.editingFaltaId
      ? this.http.put(`${API_URL}/demerit-faltas/${this.editingFaltaId}`, payload)
      : this.http.post(`${API_URL}/demerit-faltas`, payload);
    req.pipe(catchError(e => { this.errorMessage = e?.error?.message ?? 'Error al guardar'; return of(null); }))
      .subscribe(r => { if (r !== null) { this.closeFaltaForm(); this.loadFaltas(); } });
  }

  deleteFalta(falta: DemeritFaltaItem): void {
    if (!this.canManage || !window.confirm(`Eliminar "${falta.description}"?`)) return;
    this.http.delete(`${API_URL}/demerit-faltas/${falta.id}`).subscribe({
      next: () => this.loadFaltas(),
      error: (e) => this.errorMessage = e?.error?.message ?? 'Error al eliminar'
    });
  }
}

type DemeritCategoryItem = {
  id: number;
  code: string;
  name: string;
  description: string | null;
  displayOrder: number;
  active: boolean;
};

type DemeritFaltaItem = {
  id: number;
  categoryId: number;
  categoryName: string;
  categoryCode: string;
  code: string;
  description: string;
  score: number;
  severity: string;
  requiresObservation: boolean;
  requiresEvidence: boolean;
  requiresRepresentative: boolean;
  active: boolean;
};
