import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../core/api.config';

@Component({
  templateUrl: './maintenance-report.component.html',
  styleUrl: './maintenance-report.component.css',
    selector: 'app-maintenance-report',
  standalone: true,
  imports: [CommonModule, FormsModule],
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
