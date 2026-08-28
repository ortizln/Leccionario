import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../core/api.config';
import { AuthService } from '../../core/auth.service';

@Component({
  templateUrl: './employees.component.html',
  styleUrl: './employees.component.css',
    selector: 'app-employees',
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class EmployeesComponent implements OnInit {
  tab = 'list';
  employees: any[] = [];
  stats: any = null;
  editId: number | null = null;
  f: any = {};
  message = ''; isError = false;
  instId = 1;

  constructor(private http: HttpClient, private auth: AuthService) {}
  ngOnInit() { this.instId = this.auth.institutionId() || 1; this.load(); this.loadStats(); }

  private showMsg(m: string, e = false) { this.message = m; this.isError = e; setTimeout(() => this.message = '', 4000); }
  load() { this.http.get<any[]>(`${API_URL}/hr/employees/institution/${this.instId}`).subscribe({ next: d => this.employees = d }); }
  loadStats() { this.http.get<any>(`${API_URL}/hr/employees/stats/${this.instId}`).subscribe({ next: d => this.stats = d }); }

  save() {
    const body = { ...this.f, institutionId: this.instId };
    const obs = this.editId ? this.http.put(`${API_URL}/hr/employees/${this.editId}`, body) : this.http.post(`${API_URL}/hr/employees`, body);
    obs.subscribe({ next: () => { this.showMsg('Guardado'); this.tab = 'list'; this.load(); this.loadStats(); this.resetForm(); }, error: () => this.showMsg('Error', true) });
  }

  edit(e: any) { this.editId = e.id; this.f = { ...e }; this.tab = 'new'; }
  deleteEmp(id: number) { if (!confirm('Eliminar?')) return; this.http.delete(`${API_URL}/hr/employees/${id}`).subscribe({ next: () => { this.load(); this.loadStats(); } }); }
  resetForm() { this.editId = null; this.f = { employeeNumber: '', firstName: '', lastName: '', identification: '', idType: 'CEDULA', birthDate: null, gender: '', civilStatus: '', nationality: '', province: '', city: '', position: '', department: '', hireDate: null, phone: '', mobile: '', email: '', address: '', emergencyContact: '', emergencyPhone: '' }; }
}
