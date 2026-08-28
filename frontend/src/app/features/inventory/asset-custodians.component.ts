import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../core/api.config';
import { AuthService } from '../../core/auth.service';

@Component({
  templateUrl: './asset-custodians.component.html',
  styleUrl: './asset-custodians.component.css',
    selector: 'app-asset-custodians',
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class AssetCustodiansComponent implements OnInit {
  custodians: any[] = [];
  showCreateModal = false;
  form: any = { assetId: null, employeeId: null, observations: '' };
  constructor(private http: HttpClient, private auth: AuthService) {}
  ngOnInit() { this.load(); }
  private get instId(): number { return this.auth.institutionId() || 1; }
  load() { this.http.get<any[]>(`${API_URL}/inventory/custodians?institutionId=${this.instId}`).subscribe({ next: r => this.custodians = r, error: () => {} }); }
  assign() {
    this.http.post<any>(`${API_URL}/inventory/custodians`, { asset: { id: this.form.assetId }, employeeId: this.form.employeeId, observations: this.form.observations, institutionId: this.instId }).subscribe({
      next: () => { this.showCreateModal = false; this.load(); this.form = { assetId: null, employeeId: null, observations: '' }; },
      error: e => alert(e.error?.message || 'Error')
    });
  }
  returnAsset(id: number) { this.http.post<any>(`${API_URL}/inventory/custodians/${id}/return`, {}).subscribe({ next: () => this.load() }); }
}
