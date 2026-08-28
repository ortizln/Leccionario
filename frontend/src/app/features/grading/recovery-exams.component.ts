import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../core/api.config';
import { AuthService } from '../../core/auth.service';

@Component({
  templateUrl: './recovery-exams.component.html',
  styleUrl: './recovery-exams.component.css',
    selector: 'app-recovery-exams',
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class RecoveryExamsComponent implements OnInit {
  all: any[] = [];
  pending: any[] = [];
  showForm = false;
  editItem: any = null;
  form: any = { examType: 'SUPLETORIO', studentId: null, courseId: null, subjectId: null, scheduledDate: '', notes: '' };
  private get instId(): number { return this.auth.institutionId() || 1; }

  constructor(private http: HttpClient, private auth: AuthService) {}

  ngOnInit() { this.load(); }

  load() {
    this.http.get<any[]>(`${API_URL}/grading/recoveries?institutionId=${this.instId}`).subscribe(d => this.all = d);
    this.http.get<any[]>(`${API_URL}/grading/recoveries/pending?institutionId=${this.instId}`).subscribe(d => this.pending = d);
  }

  resetForm() { this.form = { examType: 'SUPLETORIO', studentId: null, courseId: null, subjectId: null, scheduledDate: '', notes: '' }; }

  save() {
    const payload = { ...this.form, institutionId: this.instId, status: 'PENDIENTE' };
    this.http.post(`${API_URL}/grading/recoveries`, payload).subscribe(() => { this.showForm = false; this.load(); });
  }

  applyScore(e: any) {
    const score = prompt('Ingrese la nota:');
    if (score) this.http.put(`${API_URL}/grading/recoveries/${e.id}/score`, { score: +score }).subscribe(() => this.load());
  }

  cancel(id: number) {
    if (confirm('Cancelar examen?')) this.http.put(`${API_URL}/grading/recoveries/${id}/cancel`, {}).subscribe(() => this.load());
  }

  delete(id: number) {
    if (confirm('Eliminar examen?')) this.http.delete(`${API_URL}/grading/recoveries/${id}`).subscribe(() => this.load());
  }
}
