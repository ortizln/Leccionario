import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../core/api.config';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-financial-discounts',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h5 class="mb-0"><i class="bi bi-percent me-2"></i>Descuentos Financieros</h5>
      <button class="btn btn-sm btn-primary" (click)="showCreateModal=true"><i class="bi bi-plus-circle me-1"></i>Nuevo Descuento</button>
    </div>

    <div class="card border-0 shadow-sm">
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-sm mb-0">
            <thead class="table-light"><tr><th>Nombre</th><th>Tipo</th><th>Valor</th><th>Vigencia</th><th>Estado</th><th></th></tr></thead>
            <tbody>
              <tr *ngFor="let d of discounts">
                <td class="fw-semibold">{{ d.name }}</td>
                <td><span class="badge bg-info">{{ d.discountType }}</span></td>
                <td>{{ d.discountType === 'PORCENTAJE' ? d.value + '%' : '$' + d.value }}</td>
                <td>{{ d.validFrom || 'Sin inicio' }} - {{ d.validUntil || 'Sin fin' }}</td>
                <td><span class="badge" [class.bg-success]="d.status==='ACTIVO'" [class.bg-secondary]="d.status==='INACTIVO'">{{ d.status }}</span></td>
                <td><button class="btn btn-sm btn-outline-danger" (click)="deleteDiscount(d.id)"><i class="bi bi-trash"></i></button></td>
              </tr>
              <tr *ngIf="discounts.length===0"><td colspan="6" class="text-center text-muted py-3">No hay descuentos registrados</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div class="modal d-block" *ngIf="showCreateModal" tabindex="-1" style="background:rgba(0,0,0,0.5)">
      <div class="modal-dialog"><div class="modal-content">
        <div class="modal-header py-2"><h6 class="modal-title">Nuevo Descuento</h6></div>
        <div class="modal-body">
          <div class="row g-3">
            <div class="col-md-6"><label class="form-label small">Nombre *</label><input class="form-control form-control-sm" [(ngModel)]="form.name"></div>
            <div class="col-md-6"><label class="form-label small">Tipo *</label>
              <select class="form-select form-select-sm" [(ngModel)]="form.discountType"><option value="PORCENTAJE">Porcentaje</option><option value="MONTO_FIJO">Monto Fijo</option><option value="BECA">Beca</option></select>
            </div>
            <div class="col-md-6"><label class="form-label small">Valor *</label><input type="number" class="form-control form-control-sm" [(ngModel)]="form.value"></div>
            <div class="col-md-6"><label class="form-label small">ID Estudiante (opcional)</label><input type="number" class="form-control form-control-sm" [(ngModel)]="form.studentId"></div>
            <div class="col-md-6"><label class="form-label small">Desde</label><input type="date" class="form-control form-control-sm" [(ngModel)]="form.validFrom"></div>
            <div class="col-md-6"><label class="form-label small">Hasta</label><input type="date" class="form-control form-control-sm" [(ngModel)]="form.validUntil"></div>
            <div class="col-12"><label class="form-label small">Descripcion</label><textarea class="form-control form-control-sm" [(ngModel)]="form.description" rows="2"></textarea></div>
          </div>
        </div>
        <div class="modal-footer py-2">
          <button class="btn btn-sm btn-secondary" (click)="showCreateModal=false">Cancelar</button>
          <button class="btn btn-sm btn-primary" (click)="save()" [disabled]="!form.name || !form.value">Crear</button>
        </div>
      </div></div>
    </div>
  `
})
export class FinancialDiscountsComponent implements OnInit {
  discounts: any[] = [];
  showCreateModal = false;
  form: any = { name: '', discountType: 'PORCENTAJE', value: 0, description: '', studentId: null, validFrom: '', validUntil: '' };

  constructor(private http: HttpClient, private auth: AuthService) {}
  ngOnInit() { this.load(); }
  private get instId(): number { return this.auth.institutionId() || 1; }

  load() {
    this.http.get<any[]>(`${API_URL}/finance/discounts?institutionId=${this.instId}`).subscribe({ next: r => this.discounts = r, error: () => {} });
  }
  save() {
    this.http.post<any>(`${API_URL}/finance/discounts`, { ...this.form, institutionId: this.instId }).subscribe({
      next: () => { this.showCreateModal = false; this.load(); this.form = { name: '', discountType: 'PORCENTAJE', value: 0, description: '', studentId: null, validFrom: '', validUntil: '' }; },
      error: e => alert(e.error?.message || 'Error')
    });
  }
  deleteDiscount(id: number) {
    if (!confirm('Eliminar descuento?')) return;
    this.http.delete(`${API_URL}/finance/discounts/${id}`).subscribe({ next: () => this.load() });
  }
}
