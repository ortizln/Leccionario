import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../core/api.config';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-book-categories',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h5 class="mb-0"><i class="bi bi-collection me-2"></i>Categorias de Libros</h5>
      <button class="btn btn-sm btn-primary" (click)="showCreateModal=true"><i class="bi bi-plus-circle me-1"></i>Nueva Categoria</button>
    </div>

    <div class="card border-0 shadow-sm">
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-sm mb-0">
            <thead class="table-light">
              <tr><th>Nombre</th><th>Descripcion</th><th>Categoria Padre</th><th></th></tr>
            </thead>
            <tbody>
              <tr *ngFor="let c of categories">
                <td class="fw-semibold">{{ c.name }}</td>
                <td>{{ c.description }}</td>
                <td>{{ c.parentId ? ('ID: ' + c.parentId) : '-' }}</td>
                <td>
                  <button class="btn btn-sm btn-outline-primary" (click)="editCategory(c)"><i class="bi bi-pencil"></i></button>
                  <button class="btn btn-sm btn-outline-danger" (click)="deleteCategory(c.id)"><i class="bi bi-trash"></i></button>
                </td>
              </tr>
              <tr *ngIf="categories.length===0"><td colspan="4" class="text-center text-muted py-3">Sin categorias</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div class="modal d-block" *ngIf="showCreateModal" tabindex="-1" style="background:rgba(0,0,0,0.5)">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header"><h6 class="modal-title">{{ editMode ? 'Editar' : 'Nueva' }} Categoria</h6></div>
          <div class="modal-body">
            <div class="row g-3">
              <div class="col-md-6"><label class="form-label small">Nombre *</label><input class="form-control form-control-sm" [(ngModel)]="formData.name"></div>
              <div class="col-md-6"><label class="form-label small">Categoria Padre ID</label><input type="number" class="form-control form-control-sm" [(ngModel)]="formData.parentId"></div>
              <div class="col-12"><label class="form-label small">Descripcion</label><textarea class="form-control form-control-sm" [(ngModel)]="formData.description" rows="2"></textarea></div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-sm btn-secondary" (click)="closeModal()">Cancelar</button>
            <button class="btn btn-sm btn-primary" (click)="save()">{{ editMode ? 'Actualizar' : 'Crear' }}</button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class BookCategoriesComponent implements OnInit {
  categories: any[] = [];
  showCreateModal = false;
  editMode = false;
  editId: number | null = null;
  formData: any = { name: '', description: '', parentId: null };

  constructor(private http: HttpClient, private auth: AuthService) {}
  ngOnInit() { this.load(); }

  private get instId(): number { return this.auth.institutionId() || 1; }

  load() {
    this.http.get<any[]>(`${API_URL}/library/categories?institutionId=${this.instId}`).subscribe({ next: r => this.categories = r, error: () => {} });
  }

  editCategory(c: any) { this.editMode = true; this.editId = c.id; this.formData = { ...c }; this.showCreateModal = true; }

  save() {
    const req = this.editMode
      ? this.http.put(`${API_URL}/library/categories/${this.editId}`, this.formData)
      : this.http.post(`${API_URL}/library/categories`, { ...this.formData, institutionId: this.instId });
    req.subscribe({ next: () => { this.closeModal(); this.load(); }, error: e => alert(e.error?.message || 'Error') });
  }

  deleteCategory(id: number) {
    if (!confirm('Eliminar categoria?')) return;
    this.http.delete(`${API_URL}/library/categories/${id}`).subscribe({ next: () => this.load() });
  }

  closeModal() { this.showCreateModal = false; this.editMode = false; this.editId = null; this.formData = { name: '', description: '', parentId: null }; }
}
