import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { API_URL } from '../../core/api.config';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-demerit-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './demerit-management.component.html',
  styleUrl: './demerit-management.component.css'
})
export class DemeritManagementComponent {
  private http = inject(HttpClient);
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);

  canManageDemerits = this.auth.hasPermission('ACADEMIC_MANAGE');
  demerits: DemeritItem[] = [];
  editingId: number | null = null;
  saving = false;
  searchTerm = '';
  errorMessage = '';
  dialogOpen = false;

  form = this.fb.nonNullable.group({
    code: [''],
    category: ['', Validators.required],
    description: ['', Validators.required],
    score: [2, [Validators.required, Validators.min(1), Validators.max(100)]],
    active: [true]
  });

  constructor() {
    this.load();
  }

  filteredDemerits(): DemeritItem[] {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) {
      return this.demerits;
    }
    return this.demerits.filter((item) =>
      [item.code ?? '', item.category, item.description].some((value) => value.toLowerCase().includes(term))
    );
  }

  load(): void {
    this.http.get<DemeritItem[]>(`${API_URL}/demerits`).subscribe({
      next: (response) => {
        this.demerits = response;
        this.errorMessage = '';
      },
      error: (error) => {
        this.errorMessage = error?.error?.message ?? 'No se pudo cargar el catálogo de deméritos.';
        this.demerits = [];
      }
    });
  }

  openCreateDialog(): void {
    if (!this.canManageDemerits) {
      return;
    }
    this.resetForm();
    this.dialogOpen = true;
  }

  edit(demerit: DemeritItem): void {
    this.editingId = demerit.id;
    this.dialogOpen = true;
    this.form.patchValue({
      code: demerit.code ?? '',
      category: demerit.category,
      description: demerit.description,
      score: demerit.score,
      active: demerit.active
    });
  }

  closeDialog(): void {
    this.dialogOpen = false;
    this.resetForm();
  }

  save(): void {
    if (!this.canManageDemerits || this.form.invalid) {
      return;
    }

    this.saving = true;
    this.errorMessage = '';
    const payload = this.form.getRawValue();
    const request = this.editingId
      ? this.http.put<DemeritItem>(`${API_URL}/demerits/${this.editingId}`, payload)
      : this.http.post<DemeritItem>(`${API_URL}/demerits`, payload);

    request.subscribe({
      next: () => {
        this.saving = false;
        this.closeDialog();
        this.load();
      },
      error: (error) => {
        this.errorMessage = error?.error?.message ?? 'No se pudo guardar el demérito.';
        this.saving = false;
      }
    });
  }

  removeSelected(): void {
    const selected = this.demerits.find(item => item.id === this.editingId);
    if (!selected || !this.canManageDemerits) {
      return;
    }
    if (!window.confirm(`¿Eliminar el demérito "${selected.description}"?`)) {
      return;
    }
    this.http.delete(`${API_URL}/demerits/${selected.id}`).subscribe({
      next: () => {
        this.closeDialog();
        this.load();
      },
      error: (error) => {
        this.errorMessage = error?.error?.message ?? 'No se pudo eliminar el demérito.';
      }
    });
  }

  downloadTemplate(): void {
    this.http.get(`${API_URL}/demerits/import-template`, { responseType: 'blob' }).subscribe({
      next: (file) => this.downloadBlob(file, 'demeritos-plantilla.xlsx'),
      error: () => this.errorMessage = 'No se pudo descargar el modelo de deméritos.'
    });
  }

  triggerImport(): void {
    document.getElementById('demerits-import-input')?.click();
  }

  handleImport(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    this.http.post<ImportSummaryResult>(`${API_URL}/demerits/import`, formData).subscribe({
      next: (response) => {
        this.errorMessage = this.formatImportSummary(response);
        this.load();
        input.value = '';
      },
      error: (error) => {
        this.errorMessage = error?.error?.message ?? 'No se pudo importar el archivo de deméritos.';
        input.value = '';
      }
    });
  }

  private resetForm(): void {
    this.editingId = null;
    this.form.reset({
      code: '',
      category: '',
      description: '',
      score: 2,
      active: true
    });
  }

  private downloadBlob(blob: Blob, fileName: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  }

  private formatImportSummary(summary: ImportSummaryResult): string {
    const lines = [
      `${summary.message} Procesadas: ${summary.total}. Importadas: ${summary.imported}. Fallidas: ${summary.failed}.`
    ];
    if (summary.errors.length > 0) {
      lines.push(`Detalle: ${summary.errors.slice(0, 5).join(' | ')}`);
      if (summary.errors.length > 5) {
        lines.push(`Se omitieron ${summary.errors.length - 5} errores adicionales.`);
      }
    }
    return lines.join(' ');
  }
}

type DemeritItem = {
  id: number;
  code: string | null;
  category: string;
  description: string;
  score: number;
  active: boolean;
};

type ImportSummaryResult = {
  module: string;
  total: number;
  imported: number;
  failed: number;
  message: string;
  errors: string[];
};
