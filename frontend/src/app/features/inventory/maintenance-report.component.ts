import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../core/api.config';

@Component({
  selector: 'app-maintenance-report',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h5 class="mb-0"><i class="bi bi-tools me-2"></i>Reportes de Mantenimiento</h5>
      <button class="btn btn-sm btn-outline-success" (click)="exportCSV()"><i class="bi bi-download me-1"></i>Exportar</button>
    </div>

    <div class="row g-3 mb-4">
      <div class="col-md-3">
        <div class="card border-0 shadow-sm bg-primary text-white text-center"><div class="card-body py-3"><div class="fs-3 fw-bold">{{ stats.total }}</div><div class="small">Total Mantenimientos</div></div></div>
      </div>
      <div class="col-md-3">
        <div class="card border-0 shadow-sm bg-warning text-dark text-center"><div class="card-body py-3"><div class="fs-3 fw-bold">{{ stats.pending }}</div><div class="small">Pendientes</div></div></div>
      </div>
      <div class="col-md-3">
        <div class="card border-0 shadow-sm bg-info text-white text-center"><div class="card-body py-3"><div class="fs-3 fw-bold">{{ stats.inProgress }}</div><div class="small">En Proceso</div></div></div>
      </div>
      <div class="col-md-3">
        <div class="card border-0 shadow-sm bg-success text-white text-center"><div class="card-body py-3"><div class="fs-3 fw-bold">{{ stats.completed }}</div><div class="small">Completados</div></div></div>
      </div>
    </div>

    <div class="card border-0 shadow-sm mb-4">
      <div class="card-header bg-white"><h6 class="mb-0">Costo Total de Mantenimiento</h6></div>
      <div class="card-body text-center">
        <div class="fs-2 fw-bold text-primary">\${{ totalCost | number:'1.2-2' }}</div>
      </div>
    </div>

    <div class="card border-0 shadow-sm">
      <div class="card-header bg-white d-flex justify-content-between">
        <h6 class="mb-0">Historial de Mantenimientos</h6>
        <select class="form-select form-select-sm" [(ngModel)]="filterStatus" (change)="load()" style="width:auto">
          <option value="">Todos</option>
          <option value="PENDIENTE">Pendientes</option>
          <option value="EN_PROCESO">En Proceso</option>
          <option value="COMPLETADO">Completados</option>
        </select>
      </div>
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-sm mb-0">
            <thead class="table-light">
              <tr><th>Bien</th><th>Tipo</th><th>Descripcion</th><th>Costo</th><th>Programado</th><th>Completado</th><th>Tecnico</th><th>Estado</th></tr>
            </thead>
            <tbody>
              <tr *ngFor="let m of filteredMaintenances">
                <td>{{ m.assetId }}</td>
                <td><span class="badge" [class.bg-primary]="m.maintenanceType==='PREVENTIVO'" [class.bg-warning]="m.maintenanceType==='CORRECTIVO'" [class.bg-info]="m.maintenanceType==='ESTADO'">{{ m.maintenanceType }}</span></td>
                <td>{{ m.description }}</td>
                <td>\${{ m.cost | number:'1.2-2' }}</td>
                <td>{{ m.scheduledDate | date:'dd/MM/yyyy' }}</td>
                <td>{{ m.completedDate | date:'dd/MM/yyyy' }}</td>
                <td>{{ m.technician || 'N/A' }}</td>
                <td><span class="badge" [class.bg-warning]="m.status==='PENDIENTE'" [class.bg-info]="m.status==='EN_PROCESO'" [class.bg-success]="m.status==='COMPLETADO'">{{ m.status }}</span></td>
              </tr>
              <tr *ngIf="filteredMaintenances.length===0"><td colspan="8" class="text-center text-muted py-3">Sin mantenimientos</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class MaintenanceReportComponent implements OnInit {
  maintenances: any[] = [];
  filteredMaintenances: any[] = [];
  filterStatus = '';
  stats = { total: 0, pending: 0, inProgress: 0, completed: 0 };
  totalCost = 0;

  constructor(private http: HttpClient) {}
  ngOnInit() { this.load(); }

  load() {
    this.http.get<any[]>(`${API_URL}/inventory/maintenances/pending`).subscribe({
      next: r => {
        this.maintenances = r;
        this.applyFilter();
      },
      error: () => {}
    });
  }

  applyFilter() {
    this.filteredMaintenances = this.filterStatus ? this.maintenances.filter(m => m.status === this.filterStatus) : this.maintenances;
    this.stats.total = this.maintenances.length;
    this.stats.pending = this.maintenances.filter(m => m.status === 'PENDIENTE').length;
    this.stats.inProgress = this.maintenances.filter(m => m.status === 'EN_PROCESO').length;
    this.stats.completed = this.maintenances.filter(m => m.status === 'COMPLETADO').length;
    this.totalCost = this.maintenances.reduce((s, m) => s + (m.cost || 0), 0);
  }

  exportCSV() {
    let csv = 'Bien,Tipo,Descripcion,Cost o,Programado,Completado,Tecnico,Estado\n';
    this.filteredMaintenances.forEach(m => {
      csv += `${m.assetId},${m.maintenanceType},${m.description},${m.cost},${m.scheduledDate},${m.completedDate || ''},${m.technician || ''},${m.status}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'mantenimientos.csv'; a.click();
  }
}
