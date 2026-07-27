import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../core/api.config';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-data-export',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h5 class="mb-0"><i class="bi bi-download me-2"></i>Exportar Datos</h5>
    </div>

    <div class="row g-3">
      <div class="col-md-4" *ngFor="let mod of modules">
        <div class="card border-0 shadow-sm h-100">
          <div class="card-body text-center">
            <i [class]="mod.icon + ' display-6 text-primary mb-3'"></i>
            <h6>{{ mod.name }}</h6>
            <p class="text-muted small">{{ mod.description }}</p>
            <button class="btn btn-sm btn-outline-primary" (click)="exportCsv(mod.endpoint)">
              <i class="bi bi-filetype-csv me-1"></i>CSV
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class DataExportComponent {
  modules = [
    { name: 'Estudiantes', description: 'Listado completo de estudiantes', endpoint: 'students', icon: 'bi bi-people' },
    { name: 'Empleados', description: 'Personal de la institucion', endpoint: 'employees', icon: 'bi bi-person-badge' },
    { name: 'Facturas', description: 'Todas las facturas emitidas', endpoint: 'invoices', icon: 'bi bi-receipt' },
    { name: 'Activos', description: 'Inventario de activos fijos', endpoint: 'assets', icon: 'bi bi-box-seam' },
    { name: 'Libros', description: 'Catalogo de biblioteca', endpoint: 'books', icon: 'bi bi-book' },
    { name: 'Nomina', description: 'Historial de nomina', endpoint: 'payroll', icon: 'bi bi-cash-stack' },
  ];

  constructor(private http: HttpClient, private auth: AuthService) {}
  private get instId(): number { return this.auth.institutionId() || 1; }

  exportCsv(endpoint: string) {
    window.open(`${API_URL}/export/${endpoint}?institutionId=${this.instId}`, '_blank');
  }
}
