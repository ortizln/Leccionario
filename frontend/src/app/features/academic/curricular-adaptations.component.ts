import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../core/api.config';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-curricular-adaptations',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h5 class="mb-0"><i class="bi bi-clipboard2-pulse me-2"></i>Adaptaciones Curriculares</h5>
      <button class="btn btn-primary btn-sm" (click)="showForm=true; editItem=null; resetForm()"><i class="bi bi-plus me-1"></i>Nueva Adaptacion</button>
    </div>

    @if (showForm) {
      <div class="card border-0 shadow-sm mb-3">
        <div class="card-body">
          <h6>{{ editItem ? 'Editar' : 'Nueva' }} Adaptacion Curricular</h6>
          <div class="row g-2">
            <div class="col-md-3">
              <label class="form-label form-label-sm">Estudiante ID</label>
              <input type="number" class="form-control form-control-sm" [(ngModel)]="form.studentId">
            </div>
            <div class="col-md-3">
              <label class="form-label form-label-sm">NEE ID</label>
              <input type="number" class="form-control form-control-sm" [(ngModel)]="form.specialNeedsId">
            </div>
            <div class="col-md-3">
              <label class="form-label form-label-sm">Tipo</label>
              <select class="form-select form-select-sm" [(ngModel)]="form.adaptationType">
                <option value="MODIFICACION">Modificacion</option>
                <option value="SUSTITUCION">Sustitucion</option>
                <option value="SUPRESION">Supresion</option>
                <option value="REUBICACION">Reubicacion</option>
              </select>
            </div>
            <div class="col-md-3">
              <label class="form-label form-label-sm">Materia ID</label>
              <input type="number" class="form-control form-control-sm" [(ngModel)]="form.subjectId">
            </div>
            <div class="col-md-12">
              <label class="form-label form-label-sm">Descripcion</label>
              <textarea class="form-control form-control-sm" rows="2" [(ngModel)]="form.description"></textarea>
            </div>
            <div class="col-md-12">
              <label class="form-label form-label-sm">Estrategias</label>
              <textarea class="form-control form-control-sm" rows="2" [(ngModel)]="form.strategies"></textarea>
            </div>
            <div class="col-md-12 d-flex gap-1">
              <button class="btn btn-success btn-sm" (click)="save()"><i class="bi bi-check-lg me-1"></i>Guardar</button>
              <button class="btn btn-secondary btn-sm" (click)="showForm=false"><i class="bi bi-x-lg me-1"></i>Cancelar</button>
            </div>
          </div>
        </div>
      </div>
    }

    <div class="card border-0 shadow-sm">
      <div class="table-responsive">
        <table class="table table-sm mb-0">
          <thead class="table-light"><tr><th>Estudiante</th><th>NEE</th><th>Tipo</th><th>Materia</th><th>Descripcion</th><th></th></tr></thead>
          <tbody>
            <tr *ngFor="let a of adaptations">
              <td>{{ a.studentId }}</td>
              <td>{{ a.specialNeedsId }}</td>
              <td><span class="badge bg-info">{{ a.adaptationType }}</span></td>
              <td>{{ a.subjectId || '-' }}</td>
              <td>{{ a.description }}</td>
              <td>
                <button class="btn btn-outline-primary btn-sm me-1" (click)="edit(a)"><i class="bi bi-pencil"></i></button>
                <button class="btn btn-outline-danger btn-sm" (click)="deleteItem(a.id)"><i class="bi bi-trash"></i></button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class CurricularAdaptationsComponent implements OnInit {
  adaptations: any[] = [];
  showForm = false;
  editItem: any = null;
  form: any = { studentId: null, specialNeedsId: null, adaptationType: 'MODIFICACION', subjectId: null, description: '', strategies: '' };

  constructor(private http: HttpClient, private auth: AuthService) {}

  ngOnInit() { this.load(); }

  load() {
    this.http.get<any[]>(`${API_URL}/adaptations`).subscribe({
      next: d => this.adaptations = d,
      error: () => this.adaptations = []
    });
  }

  resetForm() { this.form = { studentId: null, specialNeedsId: null, adaptationType: 'MODIFICACION', subjectId: null, description: '', strategies: '' }; }

  save() {
    const payload = { ...this.form, institutionId: this.auth.institutionId() || 1 };
    const req = this.editItem
      ? this.http.put(`${API_URL}/adaptations/${this.editItem.id}`, payload)
      : this.http.post(`${API_URL}/adaptations`, payload);
    req.subscribe(() => { this.showForm = false; this.load(); });
  }

  edit(a: any) { this.editItem = a; this.form = { ...a }; this.showForm = true; }

  deleteItem(id: number) {
    if (confirm('Eliminar adaptacion?')) this.http.delete(`${API_URL}/adaptations/${id}`).subscribe(() => this.load());
  }
}
