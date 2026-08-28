import { HttpClient } from '@angular/common/http';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { catchError, forkJoin, of } from 'rxjs';
import { API_URL } from '../../../core/api.config';
import { AuthService } from '../../../core/auth.service';
import { AcademicYearItem, SchoolDayItem, SchoolModalityItem } from '../academic.models';
import { SortableHeaderComponent } from '../../../shared/sortable-header.component';
import { FilterDropdownComponent } from '../../../shared/filter-dropdown.component';
import { SortState, FilterState, applySort, applyFilters, getFilterOptions, toggleFilter, clearFilter, SortDir } from '../../../shared/table-utils';

@Component({
  templateUrl: './catalogs.component.html',
  styleUrl: './catalogs.component.css',
    selector: 'app-catalogs',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, SortableHeaderComponent, FilterDropdownComponent],
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

  yearSort: SortState | null = null;
  yearFilters: FilterState = {};
  displayedYears: AcademicYearItem[] = [];
  daySort: SortState | null = null;
  dayFilters: FilterState = {};
  displayedDays: SchoolDayItem[] = [];
  modalitySort: SortState | null = null;
  modalityFilters: FilterState = {};
  displayedModalities: SchoolModalityItem[] = [];

  yearSortColumn(col: string): SortDir { return this.yearSort?.column === col ? this.yearSort.dir : null; }
  onYearSort(col: string): void {
    const dir: SortDir = this.yearSort?.column === col
      ? (this.yearSort.dir === 'asc' ? 'desc' : this.yearSort.dir === 'desc' ? null : 'asc')
      : 'asc';
    this.yearSort = dir ? { column: col, dir } : null;
    this.refreshDisplayedYears();
  }
  yearFilterOpts(col: string): string[] { return getFilterOptions(this.academicYears, col); }
  getYearFilter(col: string): Set<string> { return this.yearFilters[col] ?? new Set(); }
  onYearFilter(col: string, val: string): void { this.yearFilters = toggleFilter(this.yearFilters, col, val); this.refreshDisplayedYears(); }
  onClearYearFilter(col: string): void { this.yearFilters = clearFilter(this.yearFilters, col); this.refreshDisplayedYears(); }
  refreshDisplayedYears(): void {
    this.displayedYears = applyFilters(applySort(this.academicYears, this.yearSort), this.yearFilters);
  }

  daySortColumn(col: string): SortDir { return this.daySort?.column === col ? this.daySort.dir : null; }
  onDaySort(col: string): void {
    const dir: SortDir = this.daySort?.column === col
      ? (this.daySort.dir === 'asc' ? 'desc' : this.daySort.dir === 'desc' ? null : 'asc')
      : 'asc';
    this.daySort = dir ? { column: col, dir } : null;
    this.refreshDisplayedDays();
  }
  dayFilterOpts(col: string): string[] { return getFilterOptions(this.schoolDays, col); }
  getDayFilter(col: string): Set<string> { return this.dayFilters[col] ?? new Set(); }
  onDayFilter(col: string, val: string): void { this.dayFilters = toggleFilter(this.dayFilters, col, val); this.refreshDisplayedDays(); }
  onClearDayFilter(col: string): void { this.dayFilters = clearFilter(this.dayFilters, col); this.refreshDisplayedDays(); }
  refreshDisplayedDays(): void {
    this.displayedDays = applyFilters(applySort(this.schoolDays, this.daySort), this.dayFilters);
  }

  modalitySortColumn(col: string): SortDir { return this.modalitySort?.column === col ? this.modalitySort.dir : null; }
  onModalitySort(col: string): void {
    const dir: SortDir = this.modalitySort?.column === col
      ? (this.modalitySort.dir === 'asc' ? 'desc' : this.modalitySort.dir === 'desc' ? null : 'asc')
      : 'asc';
    this.modalitySort = dir ? { column: col, dir } : null;
    this.refreshDisplayedModalities();
  }
  modalityFilterOpts(col: string): string[] { return getFilterOptions(this.schoolModalities, col); }
  getModalityFilter(col: string): Set<string> { return this.modalityFilters[col] ?? new Set(); }
  onModalityFilter(col: string, val: string): void { this.modalityFilters = toggleFilter(this.modalityFilters, col, val); this.refreshDisplayedModalities(); }
  onClearModalityFilter(col: string): void { this.modalityFilters = clearFilter(this.modalityFilters, col); this.refreshDisplayedModalities(); }
  refreshDisplayedModalities(): void {
    this.displayedModalities = applyFilters(applySort(this.schoolModalities, this.modalitySort), this.modalityFilters);
  }

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
      this.refreshDisplayedYears();
      this.refreshDisplayedDays();
      this.refreshDisplayedModalities();
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
