import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../core/api.config';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-suppliers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h5 class="mb-0"><i class="bi bi-truck me-2"></i>Proveedores</h5>
      <button class="btn btn-sm btn-primary" (click)="showCreateModal=true"><i class="bi bi-plus-circle me-1"></i>Nuevo Proveedor</button>
    </div>

    <div class="card border-0 shadow-sm">
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-sm mb-0">
            <thead class="table-light"><tr><th>Nombre</th><th>RUC</th><th>Contacto</th><th>Telefono</th><th>Email</th><th>Estado</th><th></th></tr></thead>
            <tbody>
              <tr *ngFor="let s of suppliers">
                <td class="fw-semibold">{{ s.name }}</td>
                <td>{{ s.ruc || '-' }}</td>
                <td>{{ s.contactName || '-' }}</td>
                <td>{{ s.phone || '-' }}</td>
                <td>{{ s.email || '-' }}</td>
                <td><span class="badge" [class.bg-success]="s.status==='ACTIVO'" [class.bg-secondary]="s.status==='INACTIVO'">{{ s.status }}</span></td>
                <td>
                  <button class="btn btn-sm btn-outline-primary me-1" (click)="editSupplier(s)"><i class="bi bi-pencil"></i></button>
                  <button class="btn btn-sm btn-outline-danger" (click)="deleteSupplier(s.id)"><i class="bi bi-trash"></i></button>
                </td>
              </tr>
              <tr *ngIf="suppliers.length===0"><td colspan="7" class="text-center text-muted py-3">No hay proveedores registrados</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div class="modal d-block" *ngIf="showCreateModal" tabindex="-1" style="background:rgba(0,0,0,0.5)">
      <div class="modal-dialog"><div class="modal-content">
        <div class="modal-header py-2"><h6 class="modal-title">{{ editMode ? 'Editar' : 'Nuevo' }} Proveedor</h6></div>
        <div class="modal-body">
          <div class="row g-3">
            <div class="col-md-6"><label class="form-label small">Nombre *</label><input class="form-control form-control-sm" [(ngModel)]="form.name"></div>
            <div class="col-md-6"><label class="form-label small">RUC</label><input class="form-control form-control-sm" [(ngModel)]="form.ruc"></div>
            <div class="col-md-6"><label class="form-label small">Contacto</label><input class="form-control form-control-sm" [(ngModel)]="form.contactName"></div>
            <div class="col-md-6"><label class="form-label small">Telefono</label><input class="form-control form-control-sm" [(ngModel)]="form.phone"></div>
            <div class="col-md-6"><label class="form-label small">Email</label><input type="email" class="form-control form-control-sm" [(ngModel)]="form.email"></div>
            <div class="col-md-6"><label class="form-label small">Direccion</label><input class="form-control form-control-sm" [(ngModel)]="form.address"></div>
          </div>
        </div>
        <div class="modal-footer py-2">
          <button class="btn btn-sm btn-secondary" (click)="closeModal()">Cancelar</button>
          <button class="btn btn-sm btn-primary" (click)="save()" [disabled]="!form.name">{{ editMode ? 'Actualizar' : 'Crear' }}</button>
        </div>
      </div></div>
    </div>
  `
})
export class SuppliersComponent implements OnInit {
  suppliers: any[] = [];
  showCreateModal = false;
  editMode = false;
  editId: number | null = null;
  form: any = { name: '', ruc: '', contactName: '', phone: '', email: '', address: '' };

  constructor(private http: HttpClient, private auth: AuthService) {}
  ngOnInit() { this.load(); }
  private get instId(): number { return this.auth.institutionId() || 1; }

  load() {
    this.http.get<any[]>(`${API_URL}/inventory/suppliers?institutionId=${this.instId}`).subscribe({ next: r => this.suppliers = r, error: () => {} });
  }
  save() {
    const req = this.editMode
      ? this.http.put(`${API_URL}/inventory/suppliers/${this.editId}`, { ...this.form, institutionId: this.instId })
      : this.http.post(`${API_URL}/inventory/suppliers`, { ...this.form, institutionId: this.instId });
    req.subscribe({ next: () => { this.closeModal(); this.load(); }, error: e => alert(e.error?.message || 'Error') });
  }
  editSupplier(s: any) { this.editMode = true; this.editId = s.id; this.form = { ...s }; this.showCreateModal = true; }
  closeModal() { this.showCreateModal = false; this.editMode = false; this.editId = null; this.form = { name: '', ruc: '', contactName: '', phone: '', email: '', address: '' }; }
  deleteSupplier(id: number) {
    if (!confirm('Eliminar proveedor?')) return;
    this.http.delete(`${API_URL}/inventory/suppliers/${id}`).subscribe({ next: () => this.load() });
  }
}
