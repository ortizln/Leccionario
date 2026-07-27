import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../core/api.config';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-asset-warranties',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h5 class="mb-0"><i class="bi bi-shield-check me-2"></i>Garantias de Activos</h5>
      <button class="btn btn-primary btn-sm" (click)="showForm=true; editItem=null; resetForm()"><i class="bi bi-plus me-1"></i>Nueva Garantia</button>
    </div>

    <div class="row g-3 mb-3">
      <div class="col-md-3">
        <div class="card border-0 shadow-sm bg-success text-white text-center">
          <div class="card-body py-3"><div class="fs-4 fw-bold">{{ warranties.length }}</div><div class="small">Garantias Vigentes</div></div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card border-0 shadow-sm bg-warning text-dark text-center">
          <div class="card-body py-3"><div class="fs-4 fw-bold">{{ expiring.length }}</div><div class="small">Por Vencer</div></div>
        </div>
      </div>
    </div>

    @if (showForm) {
      <div class="card border-0 shadow-sm mb-3">
        <div class="card-body">
          <h6>{{ editItem ? 'Editar' : 'Nueva' }} Garantia</h6>
          <div class="row g-2">
            <div class="col-md-3">
              <label class="form-label form-label-sm">Activo ID</label>
              <input type="number" class="form-control form-control-sm" [(ngModel)]="form.assetId">
            </div>
            <div class="col-md-3">
              <label class="form-label form-label-sm">Proveedor</label>
              <input class="form-control form-control-sm" [(ngModel)]="form.provider">
            </div>
            <div class="col-md-2">
              <label class="form-label form-label-sm">Tipo</label>
              <select class="form-select form-select-sm" [(ngModel)]="form.warrantyType">
                <option value="ESTANDAR">Estandar</option>
                <option value="EXTENDIDA">Extendida</option>
                <option value="PREMIUM">Premium</option>
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
            <div class="col-md-12">
              <label class="form-label form-label-sm">Terminos</label>
              <textarea class="form-control form-control-sm" rows="2" [(ngModel)]="form.terms"></textarea>
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
          <thead class="table-light"><tr><th>Activo</th><th>Proveedor</th><th>Tipo</th><th>Inicio</th><th>Fin</th><th>Estado</th><th></th></tr></thead>
          <tbody>
            <tr *ngFor="let w of warranties">
              <td>{{ w.assetId }}</td>
              <td>{{ w.provider }}</td>
              <td><span class="badge bg-info">{{ w.warrantyType }}</span></td>
              <td>{{ w.startDate | date:'dd/MM/yyyy' }}</td>
              <td>{{ w.endDate | date:'dd/MM/yyyy' }}</td>
              <td><span class="badge bg-success">{{ w.status }}</span></td>
              <td>
                <button class="btn btn-outline-primary btn-sm me-1" (click)="edit(w)"><i class="bi bi-pencil"></i></button>
                <button class="btn btn-outline-danger btn-sm" (click)="deleteItem(w.id)"><i class="bi bi-trash"></i></button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    @if (expiring.length > 0) {
      <div class="card border-0 shadow-sm mt-3">
        <div class="card-header bg-warning text-dark py-2"><h6 class="mb-0"><i class="bi bi-exclamation-triangle me-2"></i>Garantias por Vencer</h6></div>
        <div class="table-responsive">
          <table class="table table-sm mb-0">
            <thead class="table-light"><tr><th>Activo</th><th>Proveedor</th><th>Fin</th></tr></thead>
            <tbody>
              <tr *ngFor="let e of expiring">
                <td>{{ e.assetId }}</td>
                <td>{{ e.provider }}</td>
                <td>{{ e.endDate | date:'dd/MM/yyyy' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    }
  `
})
export class AssetWarrantiesComponent implements OnInit {
  warranties: any[] = [];
  expiring: any[] = [];
  showForm = false;
  editItem: any = null;
  form: any = { assetId: null, provider: '', warrantyType: 'ESTANDAR', startDate: '', endDate: '', terms: '' };
  private get instId(): number { return this.auth.institutionId() || 1; }

  constructor(private http: HttpClient, private auth: AuthService) {}

  ngOnInit() { this.load(); }

  load() {
    this.http.get<any[]>(`${API_URL}/api/inventory/warranties?institutionId=${this.instId}`).subscribe(d => this.warranties = d);
    this.http.get<any[]>(`${API_URL}/api/inventory/warranties/expiring?institutionId=${this.instId}`).subscribe(d => this.expiring = d);
  }

  resetForm() { this.form = { assetId: null, provider: '', warrantyType: 'ESTANDAR', startDate: '', endDate: '', terms: '' }; }

  save() {
    const payload = { ...this.form, institutionId: this.instId, status: 'VIGENTE' };
    const req = this.editItem
      ? this.http.put(`${API_URL}/api/inventory/warranties/${this.editItem.id}`, payload)
      : this.http.post(`${API_URL}/api/inventory/warranties`, payload);
    req.subscribe(() => { this.showForm = false; this.load(); });
  }

  edit(w: any) { this.editItem = w; this.form = { ...w }; this.showForm = true; }

  deleteItem(id: number) {
    if (confirm('Eliminar garantia?')) this.http.delete(`${API_URL}/api/inventory/warranties/${id}`).subscribe(() => this.load());
  }
}
