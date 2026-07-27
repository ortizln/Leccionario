import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../core/api.config';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-inventory-reports',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h5 class="mb-0"><i class="bi bi-clipboard-data me-2"></i>Reportes de Inventario</h5>
      <button class="btn btn-sm btn-outline-success" (click)="exportCSV()"><i class="bi bi-download me-1"></i>Exportar CSV</button>
    </div>

    <div class="row g-3 mb-4">
      <div class="col-md-2">
        <div class="card border-0 shadow-sm bg-primary text-white text-center">
          <div class="card-body py-2"><div class="fs-4 fw-bold">{{ stats.totalAssets || 0 }}</div><div class="small">Total Activos</div></div>
        </div>
      </div>
      <div class="col-md-2">
        <div class="card border-0 shadow-sm bg-success text-white text-center">
          <div class="card-body py-2"><div class="fs-4 fw-bold">{{ stats.available || 0 }}</div><div class="small">Disponibles</div></div>
        </div>
      </div>
      <div class="col-md-2">
        <div class="card border-0 shadow-sm bg-info text-white text-center">
          <div class="card-body py-2"><div class="fs-4 fw-bold">{{ stats.assigned || 0 }}</div><div class="small">Asignados</div></div>
        </div>
      </div>
      <div class="col-md-2">
        <div class="card border-0 shadow-sm bg-warning text-dark text-center">
          <div class="card-body py-2"><div class="fs-4 fw-bold">{{ stats.maintenance || 0 }}</div><div class="small">Mantenimiento</div></div>
        </div>
      </div>
      <div class="col-md-2">
        <div class="card border-0 shadow-sm bg-secondary text-white text-center">
          <div class="card-body py-2"><div class="fs-4 fw-bold">{{ stats.retired || 0 }}</div><div class="small">Retirados</div></div>
        </div>
      </div>
      <div class="col-md-2">
        <div class="card border-0 shadow-sm bg-danger text-white text-center">
          <div class="card-body py-2"><div class="fs-4 fw-bold">\${{ stats.totalValue | number:'1.0-0' }}</div><div class="small">Valor Total</div></div>
        </div>
      </div>
    </div>

    <ul class="nav nav-tabs mb-3">
      <li class="nav-item"><a class="nav-link" [class.active]="tab==='status'" (click)="tab='status'" role="button">Por Estado</a></li>
      <li class="nav-item"><a class="nav-link" [class.active]="tab==='condition'" (click)="tab='condition'" role="button">Por Condicion</a></li>
      <li class="nav-item"><a class="nav-link" [class.active]="tab==='depreciation'" (click)="tab='depreciation'; loadDepreciation()" role="button">Depreciacion</a></li>
      <li class="nav-item"><a class="nav-link" [class.active]="tab==='pending'" (click)="tab='pending'; loadPendingMaint()" role="button">Mant. Pendientes</a></li>
    </ul>

    @if (tab === 'status') {
      <div class="row g-3">
        <div class="col-md-6">
          <div class="card border-0 shadow-sm">
            <div class="card-header bg-white"><h6 class="mb-0">Distribucion por Estado</h6></div>
            <div class="card-body p-0">
              <div class="list-group list-group-flush">
                <div class="list-group-item d-flex justify-content-between align-items-center" *ngFor="let item of getStatusEntries()">
                  <span><span class="badge me-2" [class.bg-success]="item.key==='DISPONIBLE'" [class.bg-info]="item.key==='ASIGNADO'" [class.bg-warning]="item.key==='MANTENIMIENTO'" [class.bg-secondary]="item.key==='RETIRADO'">{{ item.key }}</span></span>
                  <span class="fw-semibold">{{ item.value }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-6">
          <div class="card border-0 shadow-sm">
            <div class="card-header bg-white"><h6 class="mb-0">Distribucion por Condicion</h6></div>
            <div class="card-body p-0">
              <div class="list-group list-group-flush">
                <div class="list-group-item d-flex justify-content-between align-items-center" *ngFor="let item of getConditionEntries()">
                  <span><span class="badge me-2" [class.bg-success]="item.key==='BUENO'" [class.bg-info]="item.key==='REGULAR'" [class.bg-warning]="item.key==='MALO'">{{ item.key }}</span></span>
                  <span class="fw-semibold">{{ item.value }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    }

    @if (tab === 'condition') {
      <div class="card border-0 shadow-sm">
        <div class="card-header bg-white"><h6 class="mb-0">Activos por Condicion</h6></div>
        <div class="card-body">
          <div class="row g-3">
            <div class="col-md-4" *ngFor="let item of getConditionEntries()">
              <div class="card border-0 shadow-sm">
                <div class="card-body text-center">
                  <div class="fs-3 fw-bold" [class.text-success]="item.key==='BUENO'" [class.text-info]="item.key==='REGULAR'" [class.text-warning]="item.key==='MALO'">{{ item.value }}</div>
                  <div class="small text-muted">{{ item.key }}</div>
                  <div class="progress mt-2" style="height:6px">
                    <div class="progress-bar" [class.bg-success]="item.key==='BUENO'" [class.bg-info]="item.key==='REGULAR'" [class.bg-warning]="item.key==='MALO'" [style.width.%]="getConditionPct(item.value)"></div>
                  </div>
                  <small>{{ getConditionPct(item.value) | number:'1.0-0' }}%</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    }

    @if (tab === 'depreciation') {
      <div class="row g-3 mb-3">
        <div class="col-md-4">
          <div class="card border-0 shadow-sm bg-primary text-white text-center">
            <div class="card-body py-3"><div class="fs-4 fw-bold">\${{ deprReport.totalAcquisition | number:'1.0-0' }}</div><div class="small">Valor de Compra</div></div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card border-0 shadow-sm bg-info text-white text-center">
            <div class="card-body py-3"><div class="fs-4 fw-bold">\${{ deprReport.totalCurrent | number:'1.0-0' }}</div><div class="small">Valor Actual</div></div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card border-0 shadow-sm bg-danger text-white text-center">
            <div class="card-body py-3"><div class="fs-4 fw-bold">\${{ deprReport.totalDepreciation | number:'1.0-0' }}</div><div class="small">Depreciacion ({{ deprReport.depreciationPct || 0 }}%)</div></div>
          </div>
        </div>
      </div>
      <div class="card border-0 shadow-sm">
        <div class="card-header bg-white"><h6 class="mb-0">Detalle de Depreciacion por Activo</h6></div>
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table table-sm mb-0">
              <thead class="table-light">
                <tr><th>Codigo</th><th>Nombre</th><th>Compra</th><th>Actual</th><th>Depreciacion</th><th>%</th></tr>
              </thead>
              <tbody>
                <tr *ngFor="let i of deprReport.items || []">
                  <td>{{ i.code }}</td>
                  <td>{{ i.name }}</td>
                  <td>\${{ i.acquisitionValue | number:'1.2-2' }}</td>
                  <td>\${{ i.currentValue | number:'1.2-2' }}</td>
                  <td class="text-danger">\${{ i.depreciation | number:'1.2-2' }}</td>
                  <td><span class="badge" [class.bg-success]="i.depreciationPct<20" [class.bg-warning]="i.depreciationPct<50" [class.bg-danger]="i.depreciationPct>=50">{{ i.depreciationPct }}%</span></td>
                </tr>
                <tr *ngIf="!deprReport.items?.length"><td colspan="6" class="text-center text-muted py-3">Sin datos</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    }

    @if (tab === 'pending') {
      <div class="card border-0 shadow-sm">
        <div class="card-header bg-white"><h6 class="mb-0"><i class="bi bi-tools me-2"></i>Mantenimientos Pendientes</h6></div>
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table table-sm mb-0">
              <thead class="table-light">
                <tr><th>Activo</th><th>Tipo</th><th>Programado</th><th>Prioridad</th><th>Descripcion</th></tr>
              </thead>
              <tbody>
                <tr *ngFor="let m of pendingMaint">
                  <td>Activo #{{ m.assetId }}</td>
                  <td><span class="badge bg-info">{{ m.maintenanceType }}</span></td>
                  <td>{{ m.scheduledDate | date:'dd/MM/yyyy' }}</td>
                  <td><span class="badge" [class.bg-danger]="m.priority==='ALTA'" [class.bg-warning]="m.priority==='MEDIA'" [class.bg-secondary]="m.priority==='BAJA'">{{ m.priority }}</span></td>
                  <td class="small">{{ m.description || '-' }}</td>
                </tr>
                <tr *ngIf="pendingMaint.length===0"><td colspan="5" class="text-center text-muted py-3">Sin mantenimientos pendientes</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    }
  `
})
export class InventoryReportsComponent implements OnInit {
  tab = 'status';
  stats: any = {};
  deprReport: any = {};
  pendingMaint: any[] = [];

  constructor(private http: HttpClient, private auth: AuthService) {}
  ngOnInit() { this.load(); }

  private get instId(): number { return this.auth.institutionId() || 1; }

  load() {
    this.http.get<any>(`${API_URL}/inventory/stats?institutionId=${this.instId}`).subscribe({ next: r => this.stats = r, error: () => {} });
  }

  loadDepreciation() {
    this.http.get<any>(`${API_URL}/inventory/depreciation?institutionId=${this.instId}`).subscribe({ next: r => this.deprReport = r, error: () => {} });
  }

  loadPendingMaint() {
    this.http.get<any[]>(`${API_URL}/inventory/maintenances/pending`).subscribe({ next: r => this.pendingMaint = r, error: () => {} });
  }

  getStatusEntries() {
    return Object.entries(this.stats.byStatus || this.stats.byCategory || {}).map(([key, value]) => ({ key, value }));
  }

  getConditionEntries() {
    return Object.entries(this.stats.byCondition || {}).map(([key, value]) => ({ key, value }));
  }

  getConditionPct(val: any) {
    const total = Object.values(this.stats.byCondition || {}).reduce((s: number, v: any) => s + (Number(v) || 0), 0);
    return total ? (Number(val) / total * 100) : 0;
  }

  exportCSV() {
    window.open(`${API_URL}/inventory/assets/export?institutionId=${this.instId}`, '_blank');
  }
}
