import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../core/api.config';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-asset-custodians',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h5 class="mb-0"><i class="bi bi-person-check me-2"></i>Custodios de Bienes</h5>
      <button class="btn btn-sm btn-primary" (click)="showCreateModal=true"><i class="bi bi-plus-circle me-1"></i>Nueva Asignacion</button>
    </div>
    <div class="card border-0 shadow-sm">
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-sm mb-0">
            <thead class="table-light"><tr><th>Activo</th><th>Empleado ID</th><th>Asignado</th><th>Devuelto</th><th>Estado</th><th></th></tr></thead>
            <tbody>
              <tr *ngFor="let c of custodians">
                <td>{{ c.asset?.name || 'ID: ' + c.asset?.id }}</td>
                <td>{{ c.employeeId }}</td>
                <td>{{ c.assignedDate }}</td>
                <td>{{ c.returnedDate || '-' }}</td>
                <td><span class="badge" [class.bg-warning]="c.status==='ASIGNADO'" [class.bg-success]="c.status==='DEVUELTO'">{{ c.status }}</span></td>
                <td><button *ngIf="c.status==='ASIGNADO'" class="btn btn-sm btn-outline-success" (click)="returnAsset(c.id)"><i class="bi bi-arrow-return-left"></i></button></td>
              </tr>
              <tr *ngIf="custodians.length===0"><td colspan="6" class="text-center text-muted py-3">No hay asignaciones</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    <div class="modal d-block" *ngIf="showCreateModal" tabindex="-1" style="background:rgba(0,0,0,0.5)">
      <div class="modal-dialog"><div class="modal-content">
        <div class="modal-header py-2"><h6 class="modal-title">Asignar Custodio</h6></div>
        <div class="modal-body">
          <div class="row g-3">
            <div class="col-md-6"><label class="form-label small">ID Activo *</label><input type="number" class="form-control form-control-sm" [(ngModel)]="form.assetId"></div>
            <div class="col-md-6"><label class="form-label small">ID Empleado *</label><input type="number" class="form-control form-control-sm" [(ngModel)]="form.employeeId"></div>
            <div class="col-12"><label class="form-label small">Observaciones</label><textarea class="form-control form-control-sm" [(ngModel)]="form.observations" rows="2"></textarea></div>
          </div>
        </div>
        <div class="modal-footer py-2">
          <button class="btn btn-sm btn-secondary" (click)="showCreateModal=false">Cancelar</button>
          <button class="btn btn-sm btn-primary" (click)="assign()" [disabled]="!form.assetId || !form.employeeId">Asignar</button>
        </div>
      </div></div>
    </div>
  `
})
export class AssetCustodiansComponent implements OnInit {
  custodians: any[] = [];
  showCreateModal = false;
  form: any = { assetId: null, employeeId: null, observations: '' };
  constructor(private http: HttpClient, private auth: AuthService) {}
  ngOnInit() { this.load(); }
  private get instId(): number { return this.auth.institutionId() || 1; }
  load() { this.http.get<any[]>(`${API_URL}/inventory/custodians?institutionId=${this.instId}`).subscribe({ next: r => this.custodians = r, error: () => {} }); }
  assign() {
    this.http.post<any>(`${API_URL}/inventory/custodians`, { asset: { id: this.form.assetId }, employeeId: this.form.employeeId, observations: this.form.observations, institutionId: this.instId }).subscribe({
      next: () => { this.showCreateModal = false; this.load(); this.form = { assetId: null, employeeId: null, observations: '' }; },
      error: e => alert(e.error?.message || 'Error')
    });
  }
  returnAsset(id: number) { this.http.post<any>(`${API_URL}/inventory/custodians/${id}/return`, {}).subscribe({ next: () => this.load() }); }
}
