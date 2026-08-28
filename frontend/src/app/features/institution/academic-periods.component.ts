import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../core/api.config';
import { AuthService } from '../../core/auth.service';

@Component({
  templateUrl: './academic-periods.component.html',
  styleUrl: './academic-periods.component.css',
    selector: 'app-academic-periods',
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class AcademicPeriodsComponent implements OnInit {
  periods: any[] = [];
  showForm = false;
  editItem: any = null;
  form: any = { name: '', code: '', periodType: 'BIMESTRE', startDate: '', endDate: '' };
  private get instId(): number { return this.auth.institutionId() || 1; }

  constructor(private http: HttpClient, private auth: AuthService) {}

  ngOnInit() { this.load(); }

  load() {
    this.http.get<any[]>(`${API_URL}/institution/periods?institutionId=${this.instId}`).subscribe(d => this.periods = d);
  }

  resetForm() { this.form = { name: '', code: '', periodType: 'BIMESTRE', startDate: '', endDate: '' }; }

  save() {
    const payload = { ...this.form, institutionId: this.instId, isActive: false };
    const req = this.editItem
      ? this.http.put(`${API_URL}/institution/periods/${this.editItem.id}`, payload)
      : this.http.post(`${API_URL}/institution/periods`, payload);
    req.subscribe(() => { this.showForm = false; this.load(); });
  }

  edit(p: any) { this.editItem = p; this.form = { ...p }; this.showForm = true; }

  toggleActive(p: any) {
    const url = p.isActive ? 'deactivate' : 'activate';
    this.http.put(`${API_URL}/institution/periods/${p.id}/${url}`, {}).subscribe(() => this.load());
  }

  delete(id: number) {
    if (confirm('Eliminar periodo?')) this.http.delete(`${API_URL}/institution/periods/${id}`).subscribe(() => this.load());
  }
}
