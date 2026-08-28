import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../core/api.config';
import { AuthService } from '../../core/auth.service';

@Component({
  templateUrl: './payroll.component.html',
  styleUrl: './payroll.component.css',
    selector: 'app-payroll',
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class PayrollComponent implements OnInit {
  tab = 'payrolls';
  payrolls: any[] = [];
  entries: any[] = [];
  selectedPayroll: any = null;
  stats = { total: 0, approved: 0, pending: 0 };
  totalNet = 0;
  showCreateModal = false;
  showEntryModal = false;
  form = { period: '', periodStart: '', periodEnd: '', notes: '' };
  entryForm: any = { employeeId: null, baseSalary: null, overtimeHours: 0, overtimeAmount: 0, bonusAmount: 0, loanDeduction: 0, otherDeductions: 0 };

  constructor(private http: HttpClient, private auth: AuthService) {}
  ngOnInit() { this.load(); }

  private get instId(): number { return this.auth.institutionId() || 1; }

  load() {
    this.http.get<any[]>(`${API_URL}/hr/payrolls?institutionId=${this.instId}`).subscribe({
      next: r => { this.payrolls = r; this.totalNet = r.reduce((s, p) => s + (p.totalNet || 0), 0); },
      error: () => {}
    });
    this.http.get<any>(`${API_URL}/hr/payrolls/stats?institutionId=${this.instId}`).subscribe({
      next: r => this.stats = r,
      error: () => {}
    });
  }

  createPayroll() {
    if (!this.form.period || !this.form.periodStart || !this.form.periodEnd) { alert('Complete los campos obligatorios'); return; }
    this.http.post(`${API_URL}/hr/payrolls`, { ...this.form, institutionId: this.instId }).subscribe({
      next: () => { this.showCreateModal = false; this.load(); },
      error: e => alert(e.error?.message || 'Error')
    });
  }

  viewPayroll(p: any) {
    this.selectedPayroll = p;
    this.tab = 'entries';
    this.http.get<any[]>(`${API_URL}/hr/payrolls/${p.id}/entries`).subscribe({
      next: r => this.entries = r,
      error: () => this.entries = []
    });
  }

  addEntry() {
    if (!this.entryForm.employeeId) { alert('Ingrese el ID del empleado'); return; }
    this.http.post(`${API_URL}/hr/payrolls/${this.selectedPayroll.id}/entries`, this.entryForm).subscribe({
      next: () => {
        this.showEntryModal = false;
        this.entryForm = { employeeId: null, baseSalary: null, overtimeHours: 0, overtimeAmount: 0, bonusAmount: 0, loanDeduction: 0, otherDeductions: 0 };
        this.viewPayroll(this.selectedPayroll);
        this.load();
      },
      error: e => alert(e.error?.message || 'Error')
    });
  }

  removeEntry(entryId: number) {
    if (!confirm('Eliminar esta entrada?')) return;
    this.http.delete(`${API_URL}/hr/payrolls/entries/${entryId}`).subscribe({
      next: () => { this.viewPayroll(this.selectedPayroll); this.load(); },
      error: e => alert(e.error?.message || 'Error')
    });
  }

  approve(p: any) {
    if (!confirm(`Aprobar nomina "${p.period}"?`)) return;
    this.http.put(`${API_URL}/hr/payrolls/${p.id}/status?status=APROBADO`, {}).subscribe({
      next: () => this.load(),
      error: e => alert(e.error?.message || 'Error')
    });
  }
}
