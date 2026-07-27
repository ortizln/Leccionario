import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../core/api.config';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-purchase-orders',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h5 class="mb-0"><i class="bi bi-cart me-2"></i>Ordenes de Compra</h5>
      <button class="btn btn-sm btn-primary" (click)="showCreateModal=true"><i class="bi bi-plus-circle me-1"></i>Nueva Orden</button>
    </div>
    <div class="card border-0 shadow-sm">
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-sm mb-0">
            <thead class="table-light"><tr><th># Orden</th><th>Proveedor</th><th>Fecha</th><th>Monto</th><th>Estado</th><th></th></tr></thead>
            <tbody>
              <tr *ngFor="let o of orders">
                <td class="fw-semibold">{{ o.orderNumber }}</td>
                <td>{{ o.supplier?.name || '-' }}</td>
                <td>{{ o.orderDate }}</td>
                <td>\${{ o.totalAmount | number:'1.2-2' }}</td>
                <td><span class="badge" [class.bg-warning]="o.status==='PENDIENTE'" [class.bg-info]="o.status==='APROBADA'" [class.bg-success]="o.status==='RECIBIDA'" [class.bg-danger]="o.status==='CANCELADA'">{{ o.status }}</span></td>
                <td>
                  <div class="dropdown">
                    <button class="btn btn-sm btn-outline-secondary dropdown-toggle" data-bs-toggle="dropdown">Acciones</button>
                    <ul class="dropdown-menu dropdown-menu-end">
                      <li><a class="dropdown-item" (click)="updateStatus(o.id, 'APROBADA')" *ngIf="o.status==='PENDIENTE'">Aprobar</a></li>
                      <li><a class="dropdown-item" (click)="updateStatus(o.id, 'RECIBIDA')" *ngIf="o.status==='APROBADA'">Recibida</a></li>
                      <li><a class="dropdown-item text-danger" (click)="updateStatus(o.id, 'CANCELADA')" *ngIf="o.status!=='CANCELADA' && o.status!=='RECIBIDA'">Cancelar</a></li>
                    </ul>
                  </div>
                </td>
              </tr>
              <tr *ngIf="orders.length===0"><td colspan="6" class="text-center text-muted py-3">No hay ordenes de compra</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    <div class="modal d-block" *ngIf="showCreateModal" tabindex="-1" style="background:rgba(0,0,0,0.5)">
      <div class="modal-dialog"><div class="modal-content">
        <div class="modal-header py-2"><h6 class="modal-title">Nueva Orden de Compra</h6></div>
        <div class="modal-body">
          <div class="row g-3">
            <div class="col-md-6"><label class="form-label small">ID Proveedor</label><input type="number" class="form-control form-control-sm" [(ngModel)]="form.supplierId"></div>
            <div class="col-md-6"><label class="form-label small">Monto Total *</label><input type="number" class="form-control form-control-sm" [(ngModel)]="form.totalAmount"></div>
            <div class="col-md-6"><label class="form-label small">Fecha Esperada</label><input type="date" class="form-control form-control-sm" [(ngModel)]="form.expectedDate"></div>
            <div class="col-12"><label class="form-label small">Descripcion</label><textarea class="form-control form-control-sm" [(ngModel)]="form.description" rows="2"></textarea></div>
          </div>
        </div>
        <div class="modal-footer py-2">
          <button class="btn btn-sm btn-secondary" (click)="showCreateModal=false">Cancelar</button>
          <button class="btn btn-sm btn-primary" (click)="save()" [disabled]="!form.totalAmount">Crear</button>
        </div>
      </div></div>
    </div>
  `
})
export class PurchaseOrdersComponent implements OnInit {
  orders: any[] = [];
  showCreateModal = false;
  form: any = { supplierId: null, totalAmount: 0, expectedDate: '', description: '' };
  constructor(private http: HttpClient, private auth: AuthService) {}
  ngOnInit() { this.load(); }
  private get instId(): number { return this.auth.institutionId() || 1; }
  load() { this.http.get<any[]>(`${API_URL}/inventory/purchase-orders?institutionId=${this.instId}`).subscribe({ next: r => this.orders = r, error: () => {} }); }
  save() {
    this.http.post<any>(`${API_URL}/inventory/purchase-orders`, { ...this.form, supplier: this.form.supplierId ? { id: this.form.supplierId } : null, institutionId: this.instId, requestedByUserId: 1 }).subscribe({
      next: () => { this.showCreateModal = false; this.load(); this.form = { supplierId: null, totalAmount: 0, expectedDate: '', description: '' }; },
      error: e => alert(e.error?.message || 'Error')
    });
  }
  updateStatus(id: number, status: string) {
    if (!confirm(`Cambiar estado a ${status}?`)) return;
    this.http.put<any>(`${API_URL}/inventory/purchase-orders/${id}/status?status=${status}`, {}).subscribe({ next: () => this.load() });
  }
}
