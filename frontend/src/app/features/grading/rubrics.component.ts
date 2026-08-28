import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../core/api.config';
import { AuthService } from '../../core/auth.service';

@Component({
  templateUrl: './rubrics.component.html',
  styleUrl: './rubrics.component.css',
    selector: 'app-rubrics',
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class RubricsComponent implements OnInit {
  rubrics: any[] = [];
  showForm = false;
  editItem: any = null;
  form: any = { name: '', description: '', totalPoints: 100, criteria: '[]' };
  private get instId(): number { return this.auth.institutionId() || 1; }

  constructor(private http: HttpClient, private auth: AuthService) {}

  ngOnInit() { this.load(); }

  load() {
    this.http.get<any[]>(`${API_URL}/grading/rubrics?institutionId=${this.instId}`).subscribe(d => this.rubrics = d);
  }

  resetForm() { this.form = { name: '', description: '', totalPoints: 100, criteria: '[]' }; }

  countCriteria(c: string): number { try { return JSON.parse(c).length; } catch { return 0; } }

  save() {
    const payload = { ...this.form, institutionId: this.instId, totalPoints: +this.form.totalPoints };
    const req = this.editItem
      ? this.http.put(`${API_URL}/grading/rubrics/${this.editItem.id}`, payload)
      : this.http.post(`${API_URL}/grading/rubrics`, payload);
    req.subscribe(() => { this.showForm = false; this.load(); });
  }

  edit(r: any) { this.editItem = r; this.form = { ...r }; this.showForm = true; }

  delete(id: number) {
    if (confirm('Eliminar rubrica?')) this.http.delete(`${API_URL}/grading/rubrics/${id}`).subscribe(() => this.load());
  }
}
