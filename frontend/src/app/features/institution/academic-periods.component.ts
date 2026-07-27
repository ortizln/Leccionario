import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../core/api.config';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-academic-periods',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h5 class="mb-0"><i class="bi bi-calendar3 me-2"></i>Periodos Academicos</h5>
      <button class="btn btn-primary btn-sm" (click)="showForm=true; editItem=null; resetForm()"><i class="bi bi-plus me-1"></i>Nuevo Periodo</button>
    </div>

    @if (showForm) {
      <div class="card border-0 shadow-sm mb-3">
        <div class="card-body">
          <h6>{{ editItem ? 'Editar' : 'Nuevo' }} Periodo</h6>
          <div class="row g-2">
            <div class="col-md-3">
              <label class="form-label form-label-sm">Nombre</label>
              <input class="form-control form-control-sm" [(ngModel)]="form.name" placeholder="Primer Bimestre 2026">
            </div>
            <div class="col-md-2">
              <label class="form-label form-label-sm">Codigo</label>
              <input class="form-control form-control-sm" [(ngModel)]="form.code" placeholder="PB1-2026">
            </div>
            <div class="col-md-2">
              <label class="form-label form-label-sm">Tipo</label>
              <select class="form-select form-select-sm" [(ngModel)]="form.periodType">
                <option value="BIMESTRE">Bimestre</option>
                <option value="TRIMESTRE">Trimestre</option>
                <option value="SEMESTRE">Semestre</option>
                <option value="ANUAL">Anual</option>
              </select>
            </div>
            <div class="col-md-2">
              <label class="form-label form-label-sm">Inicio</label>
              <input type="date" class="form-control form-control-sm" [(ngModel)]="form.startDate">
            </div>
            <div class="col-md-2">
              <label class="form-label form-label-sm">Fin</label>
              <input type="date" class="form-control form-control-sm" [(ngModel)]="form.endDate">
            </div>
            <div class="col-md-1 d-flex align-items-end gap-1">
              <button class="btn btn-success btn-sm" (click)="save()"><i class="bi bi-check-lg"></i></button>
              <button class="btn btn-secondary btn-sm" (click)="showForm=false"><i class="bi bi-x-lg"></i></button>
            </div>
          </div>
        </div>
      </div>
    }

    <div class="card border-0 shadow-sm">
      <div class="table-responsive">
        <table class="table table-sm mb-0">
          <thead class="table-light"><tr><th>Codigo</th><th>Nombre</th><th>Tipo</th><th>Inicio</th><th>Fin</th><th>Estado</th><th></th></tr></thead>
          <tbody>
            <tr *ngFor="let p of periods">
              <td>{{ p.code }}</td>
              <td>{{ p.name }}</td>
              <td><span class="badge bg-info">{{ p.periodType }}</span></td>
              <td>{{ p.startDate | date:'dd/MM/yyyy' }}</td>
              <td>{{ p.endDate | date:'dd/MM/yyyy' }}</td>
              <td><span class="badge" [class.bg-success]="p.isActive" [class.bg-secondary]="!p.isActive">{{ p.isActive ? 'Activo' : 'Inactivo' }}</span></td>
              <td>
                <button class="btn btn-outline-primary btn-sm me-1" (click)="edit(p)"><i class="bi bi-pencil"></i></button>
                <button class="btn btn-outline-warning btn-sm me-1" (click)="toggleActive(p)">{{ p.isActive ? 'Desactivar' : 'Activar' }}</button>
                <button class="btn btn-outline-danger btn-sm" (click)="delete(p.id)"><i class="bi bi-trash"></i></button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class AcademicPeriodsComponent implements OnInit {
  periods: any[] = [];
  showForm = false;
  editItem: any = null;
  form: any = { name: '', code: '', periodType: 'BIMESTRE', startDate: '', endDate: '' };
  private get instId(): number { return this.auth.institutionId() || 1; }

  constructor(private http: HttpClient, private auth: AuthService) {}

  ngOnInit() { this.load(); }

  load() {
    this.http.get<any[]>(`${API_URL}/api/institution/periods?institutionId=${this.instId}`).subscribe(d => this.periods = d);
  }

  resetForm() { this.form = { name: '', code: '', periodType: 'BIMESTRE', startDate: '', endDate: '' }; }

  save() {
    const payload = { ...this.form, institutionId: this.instId, isActive: false };
    const req = this.editItem
      ? this.http.put(`${API_URL}/api/institution/periods/${this.editItem.id}`, payload)
      : this.http.post(`${API_URL}/api/institution/periods`, payload);
    req.subscribe(() => { this.showForm = false; this.load(); });
  }

  edit(p: any) { this.editItem = p; this.form = { ...p }; this.showForm = true; }

  toggleActive(p: any) {
    const url = p.isActive ? 'deactivate' : 'activate';
    this.http.put(`${API_URL}/api/institution/periods/${p.id}/${url}`, {}).subscribe(() => this.load());
  }

  delete(id: number) {
    if (confirm('Eliminar periodo?')) this.http.delete(`${API_URL}/api/institution/periods/${id}`).subscribe(() => this.load());
  }
}
