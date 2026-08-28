import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../core/api.config';
import { AuthService } from '../../core/auth.service';

@Component({
  templateUrl: './assets.component.html',
  styleUrl: './assets.component.css',
    selector: 'app-assets',
  standalone: true,
  imports: [CommonModule, FormsModule],
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
