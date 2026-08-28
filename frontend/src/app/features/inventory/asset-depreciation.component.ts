import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../core/api.config';
import { AuthService } from '../../core/auth.service';

@Component({
  templateUrl: './asset-depreciation.component.html',
  styleUrl: './asset-depreciation.component.css',
    selector: 'app-asset-depreciation',
  standalone: true,
  imports: [CommonModule, FormsModule],
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
