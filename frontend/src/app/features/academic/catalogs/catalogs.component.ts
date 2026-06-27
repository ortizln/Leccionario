import { HttpClient } from '@angular/common/http';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { catchError, forkJoin, of } from 'rxjs';
import { API_URL } from '../../../core/api.config';
import { AuthService } from '../../../core/auth.service';
import { AcademicYearItem, SchoolDayItem, SchoolModalityItem } from '../academic.models';

@Component({
  selector: 'app-catalogs',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule],
  template: `
    <div class="card border-0 shadow-sm h-100">
      <div class="card-body p-4 d-grid gap-4">
        <div>
          <h2 class="h4 mb-1">Catalogos del sistema</h2>
          <p class="text-muted mb-0">Gestiona los catalogos base que estructuran la informacion academica.</p>
        </div>

        <ul class="nav nav-tabs nav-tabs-sm">
          <li class="nav-item">
            <button class="nav-link" [class.active]="activeTab === 'years'" type="button" (click)="activeTab = 'years'">
              <i class="bi bi-calendar3 me-1"></i>A&ntilde;os Lectivos
            </button>
          </li>
          <li class="nav-item">
            <button class="nav-link" [class.active]="activeTab === 'days'" type="button" (click)="activeTab = 'days'">
              <i class="bi bi-clock-history me-1"></i>Jornadas
            </button>
          </li>
          <li class="nav-item">
            <button class="nav-link" [class.active]="activeTab === 'modalities'" type="button" (click)="activeTab = 'modalities'">
              <i class="bi bi-easel me-1"></i>Modalidades
            </button>
          </li>
        </ul>

        @if (activeTab === 'years') {
          <div class="d-flex justify-content-between align-items-center">
            <h3 class="h6 mb-0">A&ntilde;os lectivos registrados</h3>
            @if (canManage) {
              <button class="btn btn-sm btn-primary" type="button" (click)="startCreateYear()">
                <i class="bi bi-plus-circle me-1"></i>Nuevo
              </button>
            }
          </div>

          @if (yearEditorOpen) {
            <div class="card border-0 shadow-sm">
              <div class="card-body p-3">
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <h4 class="h6 mb-0">{{ editingYearId ? 'Editar' : 'Nuevo' }} ano lectivo</h4>
                  <button class="btn btn-sm btn-outline-secondary" type="button" (click)="cancelYearEdit()"><i class="bi bi-x-lg"></i></button>
                </div>
                <form [formGroup]="yearForm" class="row g-3 align-items-end">
                  <div class="col-12 col-md-3">
                    <label class="form-label fw-semibold small">Ano</label>
                    <input class="form-control form-control-sm" type="number" formControlName="year" min="2020" placeholder="2026">
                  </div>
                  <div class="col-12 col-md-3">
                    <label class="form-label fw-semibold small">Estado</label>
                    <select class="form-select form-select-sm" formControlName="active">
                      <option [ngValue]="true">Activo</option>
                      <option [ngValue]="false">Inactivo</option>
                    </select>
                  </div>
                  <div class="col-12 col-md-6 d-flex justify-content-end gap-2">
                    <button class="btn btn-sm btn-outline-secondary" type="button" (click)="cancelYearEdit()">Cancelar</button>
                    <button class="btn btn-sm btn-primary" type="button" (click)="saveYear()"><i class="bi bi-check-lg me-1"></i>Guardar</button>
                  </div>
                </form>
              </div>
            </div>
          }

          <div class="table-responsive">
            <table class="table table-striped align-middle mb-0">
              <thead>
                <tr>
                  <th>Ano</th>
                  <th>Estado</th>
                  <th class="text-end"></th>
                </tr>
              </thead>
              <tbody>
                @for (y of academicYears; track y.id) {
                  <tr>
                    <td class="fw-semibold">{{ y.year }}</td>
                    <td>
                      <span class="badge" [class.text-bg-success]="y.active" [class.text-bg-secondary]="!y.active">
                        {{ y.active ? 'Activo' : 'Inactivo' }}
                      </span>
                    </td>
                    <td class="text-end">
                      @if (canManage) {
                        <button class="btn btn-sm btn-outline-secondary" type="button" (click)="editYear(y)"><i class="bi bi-pencil"></i></button>
                      }
                    </td>
                  </tr>
                } @empty {
                  <tr><td colspan="3" class="text-center text-muted py-4">No hay anos lectivos registrados.</td></tr>
                }
              </tbody>
            </table>
          </div>
        }

        @if (activeTab === 'days') {
          <div class="d-flex justify-content-between align-items-center">
            <h3 class="h6 mb-0">Jornadas registradas</h3>
            @if (canManage) {
              <button class="btn btn-sm btn-primary" type="button" (click)="startCreateDay()">
                <i class="bi bi-plus-circle me-1"></i>Nueva
              </button>
            }
          </div>

          @if (dayEditorOpen) {
            <div class="card border-0 shadow-sm">
              <div class="card-body p-3">
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <h4 class="h6 mb-0">{{ editingDayId ? 'Editar' : 'Nueva' }} jornada</h4>
                  <button class="btn btn-sm btn-outline-secondary" type="button" (click)="cancelDayEdit()"><i class="bi bi-x-lg"></i></button>
                </div>
                <form [formGroup]="dayForm" class="row g-3 align-items-end">
                  <div class="col-12 col-md-4">
                    <label class="form-label fw-semibold small">Nombre</label>
                    <input class="form-control form-control-sm" type="text" formControlName="name" placeholder="Matutino">
                  </div>
                  <div class="col-12 col-md-3">
                    <label class="form-label fw-semibold small">Estado</label>
                    <select class="form-select form-select-sm" formControlName="active">
                      <option [ngValue]="true">Activo</option>
                      <option [ngValue]="false">Inactivo</option>
                    </select>
                  </div>
                  <div class="col-12 col-md-5 d-flex justify-content-end gap-2">
                    <button class="btn btn-sm btn-outline-secondary" type="button" (click)="cancelDayEdit()">Cancelar</button>
                    <button class="btn btn-sm btn-primary" type="button" (click)="saveDay()"><i class="bi bi-check-lg me-1"></i>Guardar</button>
                  </div>
                </form>
              </div>
            </div>
          }

          <div class="table-responsive">
            <table class="table table-striped align-middle mb-0">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Estado</th>
                  <th class="text-end"></th>
                </tr>
              </thead>
              <tbody>
                @for (d of schoolDays; track d.id) {
                  <tr>
                    <td class="fw-semibold">{{ d.name }}</td>
                    <td>
                      <span class="badge" [class.text-bg-success]="d.active" [class.text-bg-secondary]="!d.active">
                        {{ d.active ? 'Activo' : 'Inactivo' }}
                      </span>
                    </td>
                    <td class="text-end">
                      @if (canManage) {
                        <button class="btn btn-sm btn-outline-secondary" type="button" (click)="editDay(d)"><i class="bi bi-pencil"></i></button>
                      }
                    </td>
                  </tr>
                } @empty {
                  <tr><td colspan="3" class="text-center text-muted py-4">No hay jornadas registradas.</td></tr>
                }
              </tbody>
            </table>
          </div>
        }

        @if (activeTab === 'modalities') {
          <div class="d-flex justify-content-between align-items-center">
            <h3 class="h6 mb-0">Modalidades registradas</h3>
            @if (canManage) {
              <button class="btn btn-sm btn-primary" type="button" (click)="startCreateModality()">
                <i class="bi bi-plus-circle me-1"></i>Nueva
              </button>
            }
          </div>

          @if (modalityEditorOpen) {
            <div class="card border-0 shadow-sm">
              <div class="card-body p-3">
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <h4 class="h6 mb-0">{{ editingModalityId ? 'Editar' : 'Nueva' }} modalidad</h4>
                  <button class="btn btn-sm btn-outline-secondary" type="button" (click)="cancelModalityEdit()"><i class="bi bi-x-lg"></i></button>
                </div>
                <form [formGroup]="modalityForm" class="row g-3 align-items-end">
                  <div class="col-12 col-md-4">
                    <label class="form-label fw-semibold small">Nombre</label>
                    <input class="form-control form-control-sm" type="text" formControlName="name" placeholder="Presencial">
                  </div>
                  <div class="col-12 col-md-3">
                    <label class="form-label fw-semibold small">Estado</label>
                    <select class="form-select form-select-sm" formControlName="active">
                      <option [ngValue]="true">Activo</option>
                      <option [ngValue]="false">Inactivo</option>
                    </select>
                  </div>
                  <div class="col-12 col-md-5 d-flex justify-content-end gap-2">
                    <button class="btn btn-sm btn-outline-secondary" type="button" (click)="cancelModalityEdit()">Cancelar</button>
                    <button class="btn btn-sm btn-primary" type="button" (click)="saveModality()"><i class="bi bi-check-lg me-1"></i>Guardar</button>
                  </div>
                </form>
              </div>
            </div>
          }

          <div class="table-responsive">
            <table class="table table-striped align-middle mb-0">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Estado</th>
                  <th class="text-end"></th>
                </tr>
              </thead>
              <tbody>
                @for (m of schoolModalities; track m.id) {
                  <tr>
                    <td class="fw-semibold">{{ m.name }}</td>
                    <td>
                      <span class="badge" [class.text-bg-success]="m.active" [class.text-bg-secondary]="!m.active">
                        {{ m.active ? 'Activo' : 'Inactivo' }}
                      </span>
                    </td>
                    <td class="text-end">
                      @if (canManage) {
                        <button class="btn btn-sm btn-outline-secondary" type="button" (click)="editModality(m)"><i class="bi bi-pencil"></i></button>
                      }
                    </td>
                  </tr>
                } @empty {
                  <tr><td colspan="3" class="text-center text-muted py-4">No hay modalidades registradas.</td></tr>
                }
              </tbody>
            </table>
          </div>
        }
      </div>
    </div>
  `
})
export class CatalogsComponent implements OnInit {
  private http = inject(HttpClient);
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);

  canManage = this.auth.hasPermission('ACADEMIC_MANAGE');

  activeTab: 'years' | 'days' | 'modalities' = 'years';

  academicYears: AcademicYearItem[] = [];
  schoolDays: SchoolDayItem[] = [];
  schoolModalities: SchoolModalityItem[] = [];

  yearEditorOpen = false;
  editingYearId: number | null = null;
  yearForm = this.fb.nonNullable.group({
    year: [new Date().getFullYear(), [Validators.required, Validators.min(2020)]],
    active: [true]
  });

  dayEditorOpen = false;
  editingDayId: number | null = null;
  dayForm = this.fb.nonNullable.group({
    name: ['', Validators.required],
    active: [true]
  });

  modalityEditorOpen = false;
  editingModalityId: number | null = null;
  modalityForm = this.fb.nonNullable.group({
    name: ['', Validators.required],
    active: [true]
  });

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    forkJoin({
      years: this.http.get<AcademicYearItem[]>(`${API_URL}/academic/catalogs/academic-years`).pipe(catchError(() => of([]))),
      days: this.http.get<SchoolDayItem[]>(`${API_URL}/academic/catalogs/school-days`).pipe(catchError(() => of([]))),
      modalities: this.http.get<SchoolModalityItem[]>(`${API_URL}/academic/catalogs/school-modalities`).pipe(catchError(() => of([])))
    }).subscribe(({ years, days, modalities }) => {
      this.academicYears = years;
      this.schoolDays = days;
      this.schoolModalities = modalities;
    });
  }

  startCreateYear(): void {
    this.editingYearId = null;
    this.yearEditorOpen = true;
    this.yearForm.reset({ year: new Date().getFullYear(), active: true });
  }

  editYear(y: AcademicYearItem): void {
    this.editingYearId = y.id;
    this.yearEditorOpen = true;
    this.yearForm.setValue({ year: y.year, active: y.active });
  }

  cancelYearEdit(): void {
    this.yearEditorOpen = false;
    this.editingYearId = null;
    this.yearForm.reset({ year: new Date().getFullYear(), active: true });
  }

  saveYear(): void {
    if (!this.canManage || this.yearForm.invalid) return;
    const payload = this.yearForm.getRawValue();
    const url = this.editingYearId
      ? `${API_URL}/academic/catalogs/academic-years/${this.editingYearId}`
      : `${API_URL}/academic/catalogs/academic-years`;
    const op = this.editingYearId
      ? this.http.put(url, payload)
      : this.http.post(url, payload);
    op.subscribe({ next: () => { this.cancelYearEdit(); this.loadData(); }, error: () => {} });
  }

  startCreateDay(): void {
    this.editingDayId = null;
    this.dayEditorOpen = true;
    this.dayForm.reset({ name: '', active: true });
  }

  editDay(d: SchoolDayItem): void {
    this.editingDayId = d.id;
    this.dayEditorOpen = true;
    this.dayForm.setValue({ name: d.name, active: d.active });
  }

  cancelDayEdit(): void {
    this.dayEditorOpen = false;
    this.editingDayId = null;
    this.dayForm.reset({ name: '', active: true });
  }

  saveDay(): void {
    if (!this.canManage || this.dayForm.invalid) return;
    const payload = this.dayForm.getRawValue();
    const url = this.editingDayId
      ? `${API_URL}/academic/catalogs/school-days/${this.editingDayId}`
      : `${API_URL}/academic/catalogs/school-days`;
    const op = this.editingDayId
      ? this.http.put(url, payload)
      : this.http.post(url, payload);
    op.subscribe({ next: () => { this.cancelDayEdit(); this.loadData(); }, error: () => {} });
  }

  startCreateModality(): void {
    this.editingModalityId = null;
    this.modalityEditorOpen = true;
    this.modalityForm.reset({ name: '', active: true });
  }

  editModality(m: SchoolModalityItem): void {
    this.editingModalityId = m.id;
    this.modalityEditorOpen = true;
    this.modalityForm.setValue({ name: m.name, active: m.active });
  }

  cancelModalityEdit(): void {
    this.modalityEditorOpen = false;
    this.editingModalityId = null;
    this.modalityForm.reset({ name: '', active: true });
  }

  saveModality(): void {
    if (!this.canManage || this.modalityForm.invalid) return;
    const payload = this.modalityForm.getRawValue();
    const url = this.editingModalityId
      ? `${API_URL}/academic/catalogs/school-modalities/${this.editingModalityId}`
      : `${API_URL}/academic/catalogs/school-modalities`;
    const op = this.editingModalityId
      ? this.http.put(url, payload)
      : this.http.post(url, payload);
    op.subscribe({ next: () => { this.cancelModalityEdit(); this.loadData(); }, error: () => {} });
  }
}
