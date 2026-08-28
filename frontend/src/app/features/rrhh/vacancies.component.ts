import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../core/api.config';
import { AuthService } from '../../core/auth.service';

@Component({
  templateUrl: './vacancies.component.html',
  styleUrl: './vacancies.component.css',
    selector: 'app-vacancies',
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class VacanciesComponent implements OnInit {
  vacancies: any[] = [];
  showForm = false;
  form: any = {};
  constructor(private http: HttpClient, private auth: AuthService) {}
  ngOnInit() { this.load(); }
  private get instId(): number { return this.auth.institutionId() || 1; }

  load() {
    this.http.get<any[]>(`${API_URL}/hr/vacancies?institutionId=${this.instId}`).subscribe(r => this.vacancies = r);
  }
  openForm(v?: any) {
    this.form = v ? {...v} : {positionType:'FULL_TIME', positionsAvailable:1, status:'OPEN'};
    this.showForm = true;
  }
  save() {
    const req = this.form.id
      ? this.http.put(`${API_URL}/hr/vacancies/${this.form.id}`, {...this.form, institutionId: this.instId})
      : this.http.post(`${API_URL}/hr/vacancies`, {...this.form, institutionId: this.instId});
    req.subscribe(() => { this.showForm = false; this.load(); });
  }
  remove(id: number) {
    if (confirm('Eliminar vacante?')) this.http.delete(`${API_URL}/hr/vacancies/${id}`).subscribe(() => this.load());
  }
}
