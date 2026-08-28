import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../core/api.config';
import { AuthService } from '../../core/auth.service';

@Component({
  templateUrl: './competencies.component.html',
  styleUrl: './competencies.component.css',
    selector: 'app-competencies',
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class CompetenciesComponent implements OnInit {
  competencies: any[] = [];
  showForm = false;
  editItem: any = null;
  filterType = '';
  form: any = { code: '', name: '', competencyType: 'GENERALES', area: '', gradeLevel: '', description: '' };
  private get instId(): number { return this.auth.institutionId() || 1; }

  constructor(private http: HttpClient, private auth: AuthService) {}

  ngOnInit() { this.load(); }

  load() {
    const url = this.filterType
      ? `${API_URL}/grading/competencies/type?institutionId=${this.instId}&type=${this.filterType}`
      : `${API_URL}/grading/competencies?institutionId=${this.instId}`;
    this.http.get<any[]>(url).subscribe(d => this.competencies = d);
  }

  resetForm() { this.form = { code: '', name: '', competencyType: 'GENERALES', area: '', gradeLevel: '', description: '' }; }

  save() {
    const payload = { ...this.form, institutionId: this.instId, isActive: true };
    const req = this.editItem
      ? this.http.put(`${API_URL}/grading/competencies/${this.editItem.id}`, payload)
      : this.http.post(`${API_URL}/grading/competencies`, payload);
    req.subscribe(() => { this.showForm = false; this.load(); });
  }

  edit(c: any) { this.editItem = c; this.form = { ...c }; this.showForm = true; }

  delete(id: number) {
    if (confirm('Eliminar competencia?')) this.http.delete(`${API_URL}/grading/competencies/${id}`).subscribe(() => this.load());
  }
}
