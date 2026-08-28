import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../core/api.config';
import { AuthService } from '../../core/auth.service';

@Component({
  templateUrl: './data-export.component.html',
  styleUrl: './data-export.component.css',
    selector: 'app-data-export',
  standalone: true,
  imports: [CommonModule],
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
