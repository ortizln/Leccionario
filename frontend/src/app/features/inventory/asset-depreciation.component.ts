import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../core/api.config';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-asset-depreciation',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h5 class="mb-0"><i class="bi bi-graph-down me-2"></i>Depreciacion y Garantias</h5>
      <button class="btn btn-primary btn-sm" (click)="updateValues()"><i class="bi bi-arrow-clockwise me-1"></i>Actualizar Valores</button>
    </div>

    <div class="row g-3 mb-4">
      <div class="col-md-3">
        <div class="card border-0 shadow-sm bg-primary text-white text-center">
          <div class="card-body py-3"><div class="fs-4 fw-bold">{{ assets.length }}</div><div class="small">Total Activos</div></div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card border-0 shadow-sm bg-warning text-dark text-center">
          <div class="card-body py-3"><div class="fs-4 fw-bold">{{ expiringWarranties.length }}</div><div class="small">Garantias por Vencer</div></div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card border-0 shadow-sm bg-success text-white text-center">
          <div class="card-body py-3"><div class="fs-4 fw-bold">\${{ totalCurrentValue | number:'1.2-2' }}</div><div class="small">Valor Actual Total</div></div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card border-0 shadow-sm bg-danger text-white text-center">
          <div class="card-body py-3"><div class="fs-4 fw-bold">\${{ totalDepreciation | number:'1.2-2' }}</div><div class="small">Depreciacion Total</div></div>
        </div>
      </div>
    </div>

    <div class="card border-0 shadow-sm mb-3">
      <div class="card-body">
        <h6>Activos - Valor Actual vs Compra</h6>
        <div class="table-responsive">
          <table class="table table-sm mb-0">
            <thead class="table-light"><tr><th>Codigo</th><th>Nombre</th><th>Compra</th><th>Valor Compra</th><th>Valor Actual</th><th>Depreciacion</th></tr></thead>
            <tbody>
              <tr *ngFor="let a of assets">
                <td>{{ a.code }}</td>
                <td>{{ a.name }}</td>
                <td>{{ a.purchaseDate | date:'dd/MM/yyyy' }}</td>
                <td>\${{ a.purchaseCost | number:'1.2-2' }}</td>
                <td>\${{ a.currentValue | number:'1.2-2' }}</td>
                <td class="text-danger">\${{ (a.purchaseCost - a.currentValue) | number:'1.2-2' }}</td>
              </tr>
              <tr *ngIf="!assets.length"><td colspan="6" class="text-center text-muted">Sin activos</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div class="card border-0 shadow-sm">
      <div class="card-body">
        <h6>Garantias por Vencer (3 meses)</h6>
        <div class="table-responsive">
          <table class="table table-sm mb-0">
            <thead class="table-light"><tr><th>Activo ID</th><th>Proveedor</th><th>Inicio</th><th>Fin</th><th>Tipo</th></tr></thead>
            <tbody>
              <tr *ngFor="let w of expiringWarranties">
                <td>{{ w.assetId }}</td>
                <td>{{ w.provider }}</td>
                <td>{{ w.startDate | date:'dd/MM/yyyy' }}</td>
                <td class="text-danger fw-bold">{{ w.endDate | date:'dd/MM/yyyy' }}</td>
                <td><span class="badge bg-info">{{ w.warrantyType }}</span></td>
              </tr>
              <tr *ngIf="!expiringWarranties.length"><td colspan="5" class="text-center text-muted">Sin garantias proximas a vencer</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class AssetDepreciationComponent implements OnInit {
  assets: any[] = [];
  expiringWarranties: any[] = [];
  totalCurrentValue = 0;
  totalDepreciation = 0;
  constructor(private http: HttpClient, private auth: AuthService) {}
  ngOnInit() { this.load(); }
  private get instId(): number { return this.auth.institutionId() || 1; }

  load() {
    this.http.get<any[]>(`${API_URL}/inventory/assets?institutionId=${this.instId}`).subscribe(r => {
      this.assets = r;
      this.totalCurrentValue = r.reduce((s: number, a: any) => s + (a.currentValue || 0), 0);
      this.totalDepreciation = r.reduce((s: number, a: any) => s + ((a.purchaseCost || 0) - (a.currentValue || 0)), 0);
    });
    this.http.get<any[]>(`${API_URL}/inventory/warranties/expiring?institutionId=${this.instId}`).subscribe(r => this.expiringWarranties = r);
  }
  updateValues() {
    this.http.post(`${API_URL}/inventory/assets/update-values?institutionId=${this.instId}`, {}).subscribe(() => this.load());
  }
}
