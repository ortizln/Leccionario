import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../core/api.config';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-rubrics',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h5 class="mb-0"><i class="bi bi-list-check me-2"></i>Rubricas de Evaluacion</h5>
      <button class="btn btn-primary btn-sm" (click)="showForm=true; editItem=null; resetForm()"><i class="bi bi-plus me-1"></i>Nueva Rubrica</button>
    </div>

    @if (showForm) {
      <div class="card border-0 shadow-sm mb-3">
        <div class="card-body">
          <h6>{{ editItem ? 'Editar' : 'Nueva' }} Rubrica</h6>
          <div class="row g-2">
            <div class="col-md-4">
              <label class="form-label form-label-sm">Nombre</label>
              <input class="form-control form-control-sm" [(ngModel)]="form.name" placeholder="Evaluacion de Proyectos">
            </div>
            <div class="col-md-2">
              <label class="form-label form-label-sm">Puntos Totales</label>
              <input type="number" class="form-control form-control-sm" [(ngModel)]="form.totalPoints">
            </div>
            <div class="col-md-6">
              <label class="form-label form-label-sm">Descripcion</label>
              <input class="form-control form-control-sm" [(ngModel)]="form.description" placeholder="Descripcion de la rubrica">
            </div>
            <div class="col-md-12">
              <label class="form-label form-label-sm">Criterios (JSON)</label>
              <textarea class="form-control form-control-sm" rows="3" [(ngModel)]="form.criteria" placeholder='[{"name":"Investigacion","weight":30,"levels":["Excelente","Bueno","Regular"]}]'></textarea>
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
          <thead class="table-light"><tr><th>Nombre</th><th>Puntos</th><th>Criterios</th><th>Creado por</th><th></th></tr></thead>
          <tbody>
            <tr *ngFor="let r of rubrics">
              <td class="fw-semibold">{{ r.name }}</td>
              <td>{{ r.totalPoints }}</td>
              <td><span class="badge bg-info">{{ countCriteria(r.criteria) }} criterios</span></td>
              <td>{{ r.createdBy || '-' }}</td>
              <td>
                <button class="btn btn-outline-primary btn-sm me-1" (click)="edit(r)"><i class="bi bi-pencil"></i></button>
                <button class="btn btn-outline-danger btn-sm" (click)="delete(r.id)"><i class="bi bi-trash"></i></button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class RubricsComponent implements OnInit {
  rubrics: any[] = [];
  showForm = false;
  editItem: any = null;
  form: any = { name: '', description: '', totalPoints: 100, criteria: '[]' };
  private get instId(): number { return this.auth.institutionId() || 1; }

  constructor(private http: HttpClient, private auth: AuthService) {}

  ngOnInit() { this.load(); }

  load() {
    this.http.get<any[]>(`${API_URL}/api/grading/rubrics?institutionId=${this.instId}`).subscribe(d => this.rubrics = d);
  }

  resetForm() { this.form = { name: '', description: '', totalPoints: 100, criteria: '[]' }; }

  countCriteria(c: string): number { try { return JSON.parse(c).length; } catch { return 0; } }

  save() {
    const payload = { ...this.form, institutionId: this.instId, totalPoints: +this.form.totalPoints };
    const req = this.editItem
      ? this.http.put(`${API_URL}/api/grading/rubrics/${this.editItem.id}`, payload)
      : this.http.post(`${API_URL}/api/grading/rubrics`, payload);
    req.subscribe(() => { this.showForm = false; this.load(); });
  }

  edit(r: any) { this.editItem = r; this.form = { ...r }; this.showForm = true; }

  delete(id: number) {
    if (confirm('Eliminar rubrica?')) this.http.delete(`${API_URL}/api/grading/rubrics/${id}`).subscribe(() => this.load());
  }
}
