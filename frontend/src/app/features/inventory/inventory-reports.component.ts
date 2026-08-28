import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../core/api.config';
import { AuthService } from '../../core/auth.service';

@Component({
  templateUrl: './inventory-reports.component.html',
  styleUrl: './inventory-reports.component.css',
    selector: 'app-inventory-reports',
  standalone: true,
  imports: [CommonModule],
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
