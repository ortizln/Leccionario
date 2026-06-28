import { Component, inject, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { catchError, of } from 'rxjs';
import { API_URL } from '../../core/api.config';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-demerit-management',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule],
  styles: [`
    .cell-truncate {
      max-width: 220px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
      position: relative; cursor: default;
    }
    .cell-truncate:hover {
      overflow: visible; white-space: normal; position: absolute; z-index: 10;
      background: var(--app-surface); border: 1px solid var(--app-border);
      border-radius: var(--radius-md); padding: 0.5rem 0.75rem;
      box-shadow: 0 4px 16px rgba(0,0,0,0.12); min-width: 220px; max-width: 420px;
    }
  `],
  template: `
    <section class="d-grid gap-4">
      @if (errorMessage) {
        <div class="alert alert-warning d-flex align-items-center gap-2 mb-0">
          <i class="bi bi-exclamation-triangle"></i>
          <span>{{ errorMessage }}</span>
          <button class="btn btn-sm btn-link ms-auto p-0" type="button" (click)="errorMessage = ''">Cerrar</button>
        </div>
      }

      <div class="card border-0 shadow-sm">
        <div class="card-body p-4 d-grid gap-4">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <span class="badge rounded-pill text-bg-success-subtle text-success-emphasis mb-2">
                <i class="bi bi-shield-exclamation me-1"></i>Convivencia
              </span>
              <h2 class="h4 mb-1">Catalogo de demeritos</h2>
              <p class="text-muted small mb-0">Administra categorias, faltas y su ponderacion segun el reglamento institucional.</p>
            </div>
          </div>
          <ul class="nav nav-tabs nav-tabs-sm mb-0">
            <li class="nav-item">
              <button class="nav-link" [class.active]="activeTab === 'categorias'" type="button" (click)="activeTab = 'categorias'">
                <i class="bi bi-tag me-1"></i>Categorias
              </button>
            </li>
            <li class="nav-item">
              <button class="nav-link" [class.active]="activeTab === 'faltas'" type="button" (click)="activeTab = 'faltas'">
                <i class="bi bi-list-ul me-1"></i>Faltas
              </button>
            </li>
          </ul>
        </div>
      </div>

      @if (activeTab === 'categorias') {
        <div class="card border-0 shadow-sm">
          <div class="card-body p-4 d-grid gap-4">
            <div class="d-flex justify-content-between align-items-center">
              <h3 class="h5 mb-0">Categorias de demerito</h3>
              @if (canManage) {
                <button class="btn btn-sm btn-primary" type="button" (click)="openCategoryForm()">
                  <i class="bi bi-plus-lg me-1"></i>Nueva categoria
                </button>
              }
            </div>
            <div class="table-responsive">
              <table class="table table-xs table-hover align-middle mb-0">
                <thead>
                  <tr>
                    <th>Codigo</th>
                    <th>Nombre</th>
                    <th>Descripcion</th>
                    <th>Orden</th>
                    <th>Estado</th>
                    <th>Faltas</th>
                    <th class="text-end"></th>
                  </tr>
                </thead>
                <tbody>
                  @for (cat of categories; track cat.id) {
                    <tr>
                      <td class="fw-semibold">{{ cat.code }}</td>
                      <td>{{ cat.name }}</td>
                      <td class="cell-truncate">{{ cat.description || '-' }}</td>
                      <td>{{ cat.displayOrder }}</td>
                      <td>
                        <span class="badge rounded-pill" [class.text-bg-success]="cat.active" [class.text-bg-secondary]="!cat.active">
                          {{ cat.active ? 'Activa' : 'Inactiva' }}
                        </span>
                      </td>
                      <td>
                        <span class="badge rounded-pill text-bg-light">{{ countFaltas(cat.id) }}</span>
                      </td>
                      <td class="text-end">
                        @if (canManage) {
                          <details class="action-menu">
                            <summary class="btn btn-sm btn-outline-primary"><i class="bi bi-three-dots"></i></summary>
                            <div class="action-menu-panel">
                              <button class="btn btn-sm btn-link text-start w-100" type="button" (click)="editCategory(cat)">
                                <i class="bi bi-pencil me-2"></i>Editar
                              </button>
                              <button class="btn btn-sm btn-link text-start w-100 text-danger" type="button" (click)="deleteCategory(cat)">
                                <i class="bi bi-trash me-2"></i>Eliminar
                              </button>
                            </div>
                          </details>
                        }
                      </td>
                    </tr>
                  } @empty {
                    <tr>
                      <td colspan="7" class="text-center text-muted py-4">
                        <i class="bi bi-tag fs-3 d-block mb-2"></i>No hay categorias registradas.
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        </div>

        @if (categoryFormOpen) {
          <div class="modal-shell" (click)="closeCategoryForm()">
            <div class="modal-card" style="max-width:420px" (click)="$event.stopPropagation()">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <span class="badge rounded-pill text-bg-primary"><i class="bi bi-tag me-1"></i>{{ editingCategoryId ? 'Editar' : 'Nueva' }} categoria</span>
                <button class="btn btn-sm btn-outline-secondary" type="button" (click)="closeCategoryForm()"><i class="bi bi-x-lg"></i></button>
              </div>
              <form [formGroup]="categoryForm" class="d-grid gap-2">
                <div class="row g-2">
                  <div class="col-4">
                    <label class="form-label small fw-semibold mb-1">Codigo</label>
                    <input class="form-control form-control-sm" type="text" formControlName="code" placeholder="Ej: COM">
                  </div>
                  <div class="col-8">
                    <label class="form-label small fw-semibold mb-1">Nombre</label>
                    <input class="form-control form-control-sm" type="text" formControlName="name" placeholder="Ej: Comportamiento">
                  </div>
                </div>
                <div>
                  <label class="form-label small fw-semibold mb-1">Descripcion</label>
                  <input class="form-control form-control-sm" type="text" formControlName="description" placeholder="Descripcion de la categoria">
                </div>
                <div class="row g-2">
                  <div class="col-5">
                    <label class="form-label small fw-semibold mb-1">Orden</label>
                    <input class="form-control form-control-sm" type="number" formControlName="displayOrder" min="0">
                  </div>
                  <div class="col-7 d-flex align-items-end">
                    <div class="form-check form-switch border rounded px-2 py-1 w-100">
                      <input class="form-check-input" id="catActive" type="checkbox" formControlName="active">
                      <label class="form-check-label ms-1 small fw-semibold" for="catActive">Activa</label>
                    </div>
                  </div>
                </div>
              </form>
              <div class="d-flex justify-content-end gap-2 mt-3">
                <button class="btn btn-sm btn-outline-secondary" type="button" (click)="closeCategoryForm()">Cancelar</button>
                <button class="btn btn-sm btn-primary" type="button" (click)="saveCategory()" [disabled]="categoryForm.invalid">Guardar</button>
              </div>
            </div>
          </div>
        }
      }

      @if (activeTab === 'faltas') {
        <div class="card border-0 shadow-sm">
          <div class="card-body p-4 d-grid gap-4">
            <div class="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3">
              <div>
                <h3 class="h5 mb-0">Faltas del reglamento</h3>
                <p class="text-muted small mb-0">Cada falta tiene un codigo, descripcion y ponderacion en demeritos.</p>
              </div>
              <div class="d-flex gap-2">
                <select class="form-select form-select-sm" style="min-width:180px" [(ngModel)]="faltaCategoryFilter">
                  <option value="">Todas las categorias</option>
                  @for (cat of categories; track cat.id) {
                    <option [value]="cat.id">{{ cat.code }} - {{ cat.name }}</option>
                  }
                </select>
                @if (canManage) {
                  <button class="btn btn-sm btn-primary" type="button" (click)="openFaltaForm()">
                    <i class="bi bi-plus-lg me-1"></i>Nueva falta
                  </button>
                }
              </div>
            </div>
            <div class="table-responsive">
              <table class="table table-xs table-hover align-middle mb-0">
                <thead>
                  <tr>
                    <th>Codigo</th>
                    <th>Categoria</th>
                    <th>Descripcion</th>
                    <th>Puntaje</th>
                    <th>Gravedad</th>
                    <th>Estado</th>
                    <th class="text-end"></th>
                  </tr>
                </thead>
                <tbody>
                  @for (falta of filteredFaltas(); track falta.id) {
                    <tr>
                      <td class="fw-semibold">{{ falta.categoryCode }}-{{ falta.code }}</td>
                      <td class="cell-truncate"><span class="badge rounded-pill text-bg-light">{{ falta.categoryName }}</span></td>
                      <td class="cell-truncate">{{ falta.description }}</td>
                      <td>
                        <span class="badge rounded-pill" [class.text-bg-danger]="falta.score >= 40" [class.text-bg-warning]="falta.score >= 15 && falta.score < 40" [class.text-bg-success]="falta.score < 15">
                          {{ falta.score }} pts
                        </span>
                      </td>
                      <td>
                        <span class="badge rounded-pill" [class.text-bg-danger]="falta.severity === 'MUY_GRAVE'" [class.text-bg-warning]="falta.severity === 'GRAVE'" [class.text-bg-secondary]="falta.severity === 'MEDIA'" [class.text-bg-light]="falta.severity === 'LEVE'">
                          {{ severityLabel(falta.severity) }}
                        </span>
                      </td>
                      <td>
                        <span class="badge rounded-pill" [class.text-bg-success]="falta.active" [class.text-bg-secondary]="!falta.active">
                          {{ falta.active ? 'Activa' : 'Inactiva' }}
                        </span>
                      </td>
                      <td class="text-end">
                        @if (canManage) {
                          <details class="action-menu">
                            <summary class="btn btn-sm btn-outline-primary"><i class="bi bi-three-dots"></i></summary>
                            <div class="action-menu-panel">
                              <button class="btn btn-sm btn-link text-start w-100" type="button" (click)="editFalta(falta)">
                                <i class="bi bi-pencil me-2"></i>Editar
                              </button>
                              <button class="btn btn-sm btn-link text-start w-100 text-danger" type="button" (click)="deleteFalta(falta)">
                                <i class="bi bi-trash me-2"></i>Eliminar
                              </button>
                            </div>
                          </details>
                        }
                      </td>
                    </tr>
                  } @empty {
                    <tr>
                      <td colspan="7" class="text-center text-muted py-4">
                        <i class="bi bi-list-ul fs-3 d-block mb-2"></i>No hay faltas registradas.
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        </div>

        @if (faltaFormOpen) {
          <div class="modal-shell" (click)="closeFaltaForm()">
            <div class="modal-card" style="max-width:480px" (click)="$event.stopPropagation()">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <span class="badge rounded-pill text-bg-primary"><i class="bi bi-list-ul me-1"></i>{{ editingFaltaId ? 'Editar' : 'Nueva' }} falta</span>
                <button class="btn btn-sm btn-outline-secondary" type="button" (click)="closeFaltaForm()"><i class="bi bi-x-lg"></i></button>
              </div>
              <form [formGroup]="faltaForm" class="d-grid gap-2">
                <div>
                  <label class="form-label small fw-semibold mb-1">Categoria</label>
                  <select class="form-select form-select-sm" formControlName="categoryId">
                    @for (cat of categories; track cat.id) {
                      <option [value]="cat.id">{{ cat.code }} - {{ cat.name }}</option>
                    }
                  </select>
                </div>
                <div class="row g-2">
                  <div class="col-4">
                    <label class="form-label small fw-semibold mb-1">Codigo</label>
                    <input class="form-control form-control-sm" type="text" formControlName="code" placeholder="Ej: A">
                  </div>
                  <div class="col-4">
                    <label class="form-label small fw-semibold mb-1">Puntaje</label>
                    <input class="form-control form-control-sm" type="number" formControlName="score" min="1" max="100">
                  </div>
                  <div class="col-4">
                    <label class="form-label small fw-semibold mb-1">Gravedad</label>
                    <select class="form-select form-select-sm" formControlName="severity">
                      <option value="LEVE">Leve</option>
                      <option value="MEDIA">Media</option>
                      <option value="GRAVE">Grave</option>
                      <option value="MUY_GRAVE">Muy grave</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label class="form-label small fw-semibold mb-1">Descripcion de la falta</label>
                  <textarea class="form-control form-control-sm" rows="2" formControlName="description"
                            placeholder="Descripcion detallada de la falta"></textarea>
                </div>
                <div class="row g-2">
                  <div class="col-4">
                    <div class="form-check form-switch border rounded px-2 py-1">
                      <input class="form-check-input" id="fObs" type="checkbox" formControlName="requiresObservation">
                      <label class="form-check-label ms-1 small" for="fObs">Observacion</label>
                    </div>
                  </div>
                  <div class="col-4">
                    <div class="form-check form-switch border rounded px-2 py-1">
                      <input class="form-check-input" id="fEvid" type="checkbox" formControlName="requiresEvidence">
                      <label class="form-check-label ms-1 small" for="fEvid">Evidencia</label>
                    </div>
                  </div>
                  <div class="col-4">
                    <div class="form-check form-switch border rounded px-2 py-1">
                      <input class="form-check-input" id="fRepr" type="checkbox" formControlName="requiresRepresentative">
                      <label class="form-check-label ms-1 small" for="fRepr">Representante</label>
                    </div>
                  </div>
                </div>
                <div class="form-check form-switch border rounded px-2 py-1">
                  <input class="form-check-input" id="fActive" type="checkbox" formControlName="active">
                  <label class="form-check-label ms-1 small fw-semibold" for="fActive">Activa para seleccion</label>
                </div>
              </form>
              <div class="d-flex justify-content-end gap-2 mt-3">
                <button class="btn btn-sm btn-outline-secondary" type="button" (click)="closeFaltaForm()">Cancelar</button>
                <button class="btn btn-sm btn-primary" type="button" (click)="saveFalta()" [disabled]="faltaForm.invalid">Guardar</button>
              </div>
            </div>
          </div>
        }
      }
    </section>
  `
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
