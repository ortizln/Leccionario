import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../core/api.config';
import { AuthService } from '../../core/auth.service';

@Component({
  templateUrl: './contracts.component.html',
  styleUrl: './contracts.component.css',
    selector: 'app-contracts',
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class ContractsComponent implements OnInit {
  tab = 'list';
  contracts: any[] = [];
  editId: number | null = null;
  f: any = { contractType: 'INDEFINIDO', salaryType: 'MENSUAL', status: 'ACTIVO', trialPeriodDays: 90 };
  message = ''; isError = false;

  constructor(private http: HttpClient, private auth: AuthService) {}
  ngOnInit() { this.loadActive(); }

  private showMsg(m: string, e = false) { this.message = m; this.isError = e; setTimeout(() => this.message = '', 4000); }
  loadActive() { this.http.get<any[]>(`${API_URL}/hr/contracts/active`).subscribe({ next: d => this.contracts = d }); }

  save() {
    const obs = this.editId ? this.http.put(`${API_URL}/hr/contracts/${this.editId}`, this.f) : this.http.post(`${API_URL}/hr/contracts`, this.f);
    obs.subscribe({ next: () => { this.showMsg('Guardado'); this.tab = 'list'; this.loadActive(); this.resetForm(); }, error: () => this.showMsg('Error', true) });
  }

  edit(c: any) { this.editId = c.id; this.f = { ...c }; this.tab = 'new'; }

  deleteContract(id: number) {
    if (!confirm('Eliminar contrato?')) return;
    this.http.delete(`${API_URL}/hr/contracts/${id}`).subscribe({
      next: () => { this.loadActive(); this.showMsg('Contrato eliminado'); },
      error: () => this.showMsg('Error al eliminar', true)
    });
  }

  resetForm() { this.editId = null; this.f = { contractType: 'INDEFINIDO', salaryType: 'MENSUAL', status: 'ACTIVO', trialPeriodDays: 90 }; }
}
