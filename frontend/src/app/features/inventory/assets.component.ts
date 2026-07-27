import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../core/api.config';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-assets',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h5 class="mb-0"><i class="bi bi-box-seam me-2"></i>Inventario y Bienes</h5>
      <div class="d-flex gap-2">
        <select class="form-select form-select-sm" [(ngModel)]="tab" style="width:auto">
          <option value="assets">Bienes</option>
          <option value="categories">Categorias</option>
          <option value="maintenances">Mantenimientos</option>
          <option value="stats">Estadisticas</option>
        </select>
        <button class="btn btn-sm btn-outline-success" (click)="exportCSV()" title="Exportar"><i class="bi bi-download"></i></button>
        <button class="btn btn-sm btn-primary" (click)="showCreateModal=true"><i class="bi bi-plus-circle me-1"></i>Nuevo Bien</button>
      </div>
    </div>

    <div class="row g-3 mb-4">
      <div class="col-md-3">
        <div class="card border-0 shadow-sm bg-primary text-white"><div class="card-body text-center"><div class="fs-4 fw-bold">{{ totalAssets }}</div><div class="small">Total Bienes</div></div></div>
      </div>
      <div class="col-md-3">
        <div class="card border-0 shadow-sm bg-success text-white"><div class="card-body text-center"><div class="fs-4 fw-bold">{{ availableCount }}</div><div class="small">Disponibles</div></div></div>
      </div>
      <div class="col-md-3">
        <div class="card border-0 shadow-sm bg-info text-white"><div class="card-body text-center"><div class="fs-4 fw-bold">{{ assignedCount }}</div><div class="small">Asignados</div></div></div>
      </div>
      <div class="col-md-3">
        <div class="card border-0 shadow-sm bg-warning text-dark"><div class="card-body text-center"><div class="fs-4 fw-bold">{{ maintenanceCount }}</div><div class="small">En Mantenimiento</div></div></div>
      </div>
    </div>

    @if (tab === 'assets') {
      <div class="card border-0 shadow-sm mb-3">
        <div class="card-body py-2">
          <div class="row g-2 align-items-center">
            <div class="col-md-4">
              <input class="form-control form-control-sm" placeholder="Buscar por nombre..." [(ngModel)]="searchQuery" (input)="onSearch()">
            </div>
            <div class="col-md-3">
              <select class="form-select form-select-sm" [(ngModel)]="filterStatus" (change)="load()">
                <option value="">Todos los estados</option>
                <option value="DISPONIBLE">Disponible</option>
                <option value="ASIGNADO">Asignado</option>
                <option value="MANTENIMIENTO">Mantenimiento</option>
                <option value="RETIRADO">Retirado</option>
              </select>
            </div>
            <div class="col-md-3">
              <select class="form-select form-select-sm" [(ngModel)]="filterCategory" (change)="load()">
                <option value="">Todas las categorias</option>
                <option *ngFor="let c of categories" [value]="c.id">{{ c.name }}</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    }

    @if (tab === 'assets') {
      <div class="card border-0 shadow-sm">
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table table-sm mb-0">
              <thead class="table-light">
                <tr><th>Codigo</th><th>Nombre</th><th>Marca</th><th>Modelo</th><th>Valor</th><th>Condicion</th><th>Estado</th><th></th></tr>
              </thead>
              <tbody>
                <tr *ngFor="let a of assets">
                  <td><span class="badge bg-secondary">{{ a.code }}</span></td>
                  <td>{{ a.name }}</td>
                  <td>{{ a.brand }}</td>
                  <td>{{ a.model }}</td>
                  <td>\${{ a.currentValue | number:'1.2-2' }}</td>
                  <td><span class="badge" [class.bg-success]="a.conditionStatus==='BUENO'" [class.bg-warning]="a.conditionStatus==='REGULAR'" [class.bg-danger]="a.conditionStatus==='MALO'">{{ a.conditionStatus }}</span></td>
                  <td><span class="badge" [class.bg-info]="a.status==='DISPONIBLE'" [class.bg-primary]="a.status==='ASIGNADO'" [class.bg-warning]="a.status==='MANTENIMIENTO'" [class.bg-secondary]="a.status==='BAJA'">{{ a.status }}</span></td>
                  <td>
                    <button class="btn btn-sm btn-outline-primary" *ngIf="a.status==='DISPONIBLE'" (click)="openAssignModal(a)" title="Asignar"><i class="bi bi-person-plus"></i></button>
                    <button class="btn btn-sm btn-outline-warning" (click)="openMaintenanceModal(a)" title="Mantenimiento"><i class="bi bi-tools"></i></button>
                  </td>
                </tr>
                <tr *ngIf="assets.length===0"><td colspan="8" class="text-center text-muted py-3">Sin bienes registrados</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    }

    @if (tab === 'categories') {
      <div class="card border-0 shadow-sm">
        <div class="card-header bg-white d-flex justify-content-between">
          <h6 class="mb-0">Categorias de Bienes</h6>
          <button class="btn btn-sm btn-outline-primary" (click)="showCatModal=true"><i class="bi bi-plus"></i></button>
        </div>
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table table-sm mb-0">
              <thead class="table-light"><tr><th>Nombre</th><th>Descripcion</th><th>Vida Util</th><th>Depreciacion</th></tr></thead>
              <tbody>
                <tr *ngFor="let c of categories"><td>{{ c.name }}</td><td>{{ c.description }}</td><td>{{ c.usefulLifeYears }} anios</td><td>{{ c.depreciationRate }}%</td></tr>
                <tr *ngIf="categories.length===0"><td colspan="4" class="text-center text-muted py-3">Sin categorias</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    }

    @if (tab === 'maintenances') {
      <div class="card border-0 shadow-sm">
        <div class="card-header bg-white"><h6 class="mb-0">Mantenimientos Pendientes</h6></div>
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table table-sm mb-0">
              <thead class="table-light"><tr><th>Bien</th><th>Tipo</th><th>Descripcion</th><th>Costo</th><th>Fecha</th><th>Estado</th><th></th></tr></thead>
              <tbody>
                <tr *ngFor="let m of pendingMaintenances">
                  <td>{{ m.assetId }}</td>
                  <td><span class="badge bg-info">{{ m.maintenanceType }}</span></td>
                  <td>{{ m.description }}</td>
                  <td>\${{ m.cost | number:'1.2-2' }}</td>
                  <td>{{ m.scheduledDate | date:'dd/MM/yyyy' }}</td>
                  <td><span class="badge" [class.bg-warning]="m.status==='PENDIENTE'" [class.bg-info]="m.status==='EN_PROCESO'" [class.bg-success]="m.status==='COMPLETADO'">{{ m.status }}</span></td>
                  <td><button class="btn btn-sm btn-outline-success" *ngIf="m.status!=='COMPLETADO'" (click)="completeMaintenance(m.id)"><i class="bi bi-check-circle"></i></button></td>
                </tr>
                <tr *ngIf="pendingMaintenances.length===0"><td colspan="7" class="text-center text-muted py-3">Sin mantenimientos pendientes</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    }

    @if (tab === 'stats') {
      <div class="row g-3">
        <div class="col-md-4">
          <div class="card border-0 shadow-sm">
            <div class="card-header bg-white"><h6 class="mb-0">Por Categoria</h6></div>
            <div class="card-body">
              <div *ngFor="let item of categoryStats" class="d-flex justify-content-between mb-2">
                <span class="small">{{ item.label }}</span>
                <span class="badge bg-primary">{{ item.count }}</span>
              </div>
              <p *ngIf="categoryStats.length===0" class="text-muted small">Sin datos</p>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card border-0 shadow-sm">
            <div class="card-header bg-white"><h6 class="mb-0">Por Condicion</h6></div>
            <div class="card-body">
              <div *ngFor="let item of conditionStats" class="d-flex justify-content-between mb-2">
                <span class="small">{{ item.label }}</span>
                <span class="badge" [class.bg-success]="item.label==='BUENO'" [class.bg-warning]="item.label==='REGULAR'" [class.bg-danger]="item.label==='MALO'">{{ item.count }}</span>
              </div>
              <p *ngIf="conditionStats.length===0" class="text-muted small">Sin datos</p>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card border-0 shadow-sm">
            <div class="card-header bg-white"><h6 class="mb-0">Valor Total</h6></div>
            <div class="card-body text-center">
              <div class="fs-3 fw-bold text-primary">\${{ totalValue | number:'1.2-2' }}</div>
              <div class="small text-muted">Valor en libros</div>
            </div>
          </div>
        </div>
      </div>
    }

    <div class="modal d-block" *ngIf="showCreateModal" tabindex="-1" style="background:rgba(0,0,0,0.5)">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header"><h6 class="modal-title">Nuevo Bien</h6></div>
          <div class="modal-body">
            <div class="row g-3">
              <div class="col-md-6"><label class="form-label small">Codigo *</label><input class="form-control form-control-sm" [(ngModel)]="newAsset.code"></div>
              <div class="col-md-6"><label class="form-label small">Nombre *</label><input class="form-control form-control-sm" [(ngModel)]="newAsset.name"></div>
              <div class="col-md-6"><label class="form-label small">Categoria ID *</label><input type="number" class="form-control form-control-sm" [(ngModel)]="newAsset.categoryId"></div>
              <div class="col-md-6"><label class="form-label small">Marca</label><input class="form-control form-control-sm" [(ngModel)]="newAsset.brand"></div>
              <div class="col-md-6"><label class="form-label small">Modelo</label><input class="form-control form-control-sm" [(ngModel)]="newAsset.model"></div>
              <div class="col-md-6"><label class="form-label small">Serial</label><input class="form-control form-control-sm" [(ngModel)]="newAsset.serialNumber"></div>
              <div class="col-md-6"><label class="form-label small">Valor Compra</label><input type="number" class="form-control form-control-sm" [(ngModel)]="newAsset.purchaseCost" step="0.01"></div>
              <div class="col-md-6"><label class="form-label small">Valor Actual</label><input type="number" class="form-control form-control-sm" [(ngModel)]="newAsset.currentValue" step="0.01"></div>
              <div class="col-md-6"><label class="form-label small">Condicion</label>
                <select class="form-select form-select-sm" [(ngModel)]="newAsset.conditionStatus"><option value="BUENO">Bueno</option><option value="REGULAR">Regular</option><option value="MALO">Malo</option></select>
              </div>
              <div class="col-md-6"><label class="form-label small">Ubicacion</label><input class="form-control form-control-sm" [(ngModel)]="newAsset.location"></div>
              <div class="col-12"><label class="form-label small">Descripcion</label><textarea class="form-control form-control-sm" [(ngModel)]="newAsset.description" rows="2"></textarea></div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-sm btn-secondary" (click)="showCreateModal=false">Cancelar</button>
            <button class="btn btn-sm btn-primary" (click)="createAsset()">Crear</button>
          </div>
        </div>
      </div>
    </div>

    <div class="modal d-block" *ngIf="showCatModal" tabindex="-1" style="background:rgba(0,0,0,0.5)">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header"><h6 class="modal-title">Nueva Categoria</h6></div>
          <div class="modal-body">
            <div class="row g-3">
              <div class="col-md-6"><label class="form-label small">Nombre *</label><input class="form-control form-control-sm" [(ngModel)]="newCat.name"></div>
              <div class="col-md-6"><label class="form-label small">Vida Util (anios)</label><input type="number" class="form-control form-control-sm" [(ngModel)]="newCat.usefulLifeYears"></div>
              <div class="col-md-6"><label class="form-label small">Tasa Depreciacion %</label><input type="number" class="form-control form-control-sm" [(ngModel)]="newCat.depreciationRate" step="0.01"></div>
              <div class="col-12"><label class="form-label small">Descripcion</label><textarea class="form-control form-control-sm" [(ngModel)]="newCat.description" rows="2"></textarea></div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-sm btn-secondary" (click)="showCatModal=false">Cancelar</button>
            <button class="btn btn-sm btn-primary" (click)="createCategory()">Crear</button>
          </div>
        </div>
      </div>
    </div>

    <div class="modal d-block" *ngIf="showAssignModal" tabindex="-1" style="background:rgba(0,0,0,0.5)">
      <div class="modal-dialog modal-sm">
        <div class="modal-content">
          <div class="modal-header"><h6 class="modal-title">Asignar Bien</h6></div>
          <div class="modal-body">
            <label class="form-label small">Asignar a *</label>
            <input class="form-control form-control-sm" [(ngModel)]="assignTo">
          </div>
          <div class="modal-footer">
            <button class="btn btn-sm btn-secondary" (click)="showAssignModal=false">Cancelar</button>
            <button class="btn btn-sm btn-primary" (click)="confirmAssign()">Asignar</button>
          </div>
        </div>
      </div>
    </div>

    <div class="modal d-block" *ngIf="showMaintenanceModal" tabindex="-1" style="background:rgba(0,0,0,0.5)">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header"><h6 class="modal-title">Registrar Mantenimiento</h6></div>
          <div class="modal-body">
            <div class="row g-3">
              <div class="col-md-6"><label class="form-label small">Tipo *</label>
                <select class="form-select form-select-sm" [(ngModel)]="newMaint.maintenanceType"><option value="PREVENTIVO">Preventivo</option><option value="CORRECTIVO">Correctivo</option><option value="ESTADO">Estado</option></select>
              </div>
              <div class="col-md-6"><label class="form-label small">Costo</label><input type="number" class="form-control form-control-sm" [(ngModel)]="newMaint.cost" step="0.01"></div>
              <div class="col-md-6"><label class="form-label small">Fecha Programada</label><input type="date" class="form-control form-control-sm" [(ngModel)]="newMaint.scheduledDate"></div>
              <div class="col-md-6"><label class="form-label small">Tecnico</label><input class="form-control form-control-sm" [(ngModel)]="newMaint.technician"></div>
              <div class="col-12"><label class="form-label small">Descripcion *</label><textarea class="form-control form-control-sm" [(ngModel)]="newMaint.description" rows="2"></textarea></div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-sm btn-secondary" (click)="showMaintenanceModal=false">Cancelar</button>
            <button class="btn btn-sm btn-primary" (click)="createMaintenance()">Crear</button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AssetsComponent implements OnInit {
  tab = 'assets';
  assets: any[] = [];
  categories: any[] = [];
  pendingMaintenances: any[] = [];
  totalAssets = 0;
  availableCount = 0;
  assignedCount = 0;
  maintenanceCount = 0;
  totalValue = 0;
  categoryStats: { label: string; count: number }[] = [];
  conditionStats: { label: string; count: number }[] = [];
  searchQuery = '';
  filterStatus = '';
  filterCategory = '';
  showCreateModal = false;
  showCatModal = false;
  showAssignModal = false;
  showMaintenanceModal = false;
  newAsset: any = { code: '', name: '', categoryId: null, brand: '', model: '', serialNumber: '', purchaseCost: 0, currentValue: 0, conditionStatus: 'BUENO', location: '', description: '' };
  newCat: any = { name: '', description: '', usefulLifeYears: null, depreciationRate: 0 };
  selectedAsset: any = null;
  assignTo = '';
  newMaint: any = { maintenanceType: 'PREVENTIVO', description: '', cost: 0, scheduledDate: '', technician: '' };

  constructor(private http: HttpClient, private auth: AuthService) {}

  ngOnInit() { this.load(); }

  private get instId(): number { return this.auth.institutionId() || 1; }

  load() {
    let url = `${API_URL}/inventory/assets?institutionId=${this.instId}`;
    if (this.filterStatus) {
      this.http.get<any[]>(`${API_URL}/inventory/assets/status/${this.filterStatus}?institutionId=${this.instId}`).subscribe({
        next: r => this.processAssets(r), error: () => {}
      });
      return;
    }
    if (this.filterCategory) {
      this.http.get<any[]>(`${API_URL}/inventory/assets/category/${this.filterCategory}?institutionId=${this.instId}`).subscribe({
        next: r => this.processAssets(r), error: () => {}
      });
      return;
    }
    this.http.get<any[]>(url).subscribe({
      next: r => this.processAssets(r),
      error: () => {}
    });
    this.http.get<any[]>(`${API_URL}/inventory/categories?institutionId=${this.instId}`).subscribe({ next: r => this.categories = r, error: () => {} });
    this.http.get<any[]>(`${API_URL}/inventory/maintenances/pending`).subscribe({ next: r => this.pendingMaintenances = r, error: () => {} });
  }

  processAssets(list: any[]) {
    this.assets = list;
    this.totalAssets = list.length;
    this.availableCount = list.filter(a => a.status === 'DISPONIBLE').length;
    this.assignedCount = list.filter(a => a.status === 'ASIGNADO').length;
    this.maintenanceCount = list.filter(a => a.status === 'MANTENIMIENTO').length;
    this.totalValue = list.reduce((s, a) => s + (a.currentValue || 0), 0);
    this.loadStats();
  }

  loadStats() {
    const catMap = new Map<string, number>();
    const condMap = new Map<string, number>();
    this.assets.forEach(a => {
      const cat = this.categories.find(c => c.id === a.categoryId);
      const catName = cat ? cat.name : 'Sin categoria';
      catMap.set(catName, (catMap.get(catName) || 0) + 1);
      const cond = a.conditionStatus || 'Sin definir';
      condMap.set(cond, (condMap.get(cond) || 0) + 1);
    });
    this.categoryStats = Array.from(catMap.entries()).map(([label, count]) => ({ label, count }));
    this.conditionStats = Array.from(condMap.entries()).map(([label, count]) => ({ label, count }));
  }

  onSearch() {
    if (this.searchQuery.length > 1) {
      this.http.get<any[]>(`${API_URL}/inventory/assets/search?institutionId=${this.instId}&name=${this.searchQuery}`).subscribe({
        next: r => this.processAssets(r), error: () => {}
      });
    } else if (this.searchQuery.length === 0) {
      this.load();
    }
  }

  exportCSV() { window.open(`${API_URL}/inventory/assets/export?institutionId=${this.instId}`, '_blank'); }

  createAsset() {
    this.http.post<any>(`${API_URL}/inventory/assets`, { ...this.newAsset, institutionId: this.instId }).subscribe({
      next: () => { this.showCreateModal = false; this.load(); },
      error: e => alert(e.error?.message || 'Error')
    });
  }

  createCategory() {
    this.http.post<any>(`${API_URL}/inventory/categories`, { ...this.newCat, institutionId: this.instId }).subscribe({
      next: () => { this.showCatModal = false; this.load(); },
      error: e => alert(e.error?.message || 'Error')
    });
  }

  openAssignModal(a: any) { this.selectedAsset = a; this.assignTo = ''; this.showAssignModal = true; }

  confirmAssign() {
    this.http.post<any>(`${API_URL}/inventory/assets/${this.selectedAsset.id}/assign`, { assignedTo: this.assignTo }).subscribe({
      next: () => { this.showAssignModal = false; this.load(); },
      error: e => alert(e.error?.message || 'Error')
    });
  }

  openMaintenanceModal(a: any) { this.selectedAsset = a; this.newMaint = { maintenanceType: 'PREVENTIVO', description: '', cost: 0, scheduledDate: '', technician: '' }; this.showMaintenanceModal = true; }

  createMaintenance() {
    this.http.post<any>(`${API_URL}/inventory/maintenances`, { ...this.newMaint, assetId: this.selectedAsset.id }).subscribe({
      next: () => { this.showMaintenanceModal = false; this.load(); },
      error: e => alert(e.error?.message || 'Error')
    });
  }

  completeMaintenance(id: number) {
    this.http.post<any>(`${API_URL}/inventory/maintenances/${id}/complete`, {}).subscribe({ next: () => this.load() });
  }
}
