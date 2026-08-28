import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../core/api.config';
import { AuthService } from '../../core/auth.service';

@Component({
  templateUrl: './employee-evaluation.component.html',
  styleUrl: './employee-evaluation.component.css',
    selector: 'app-employee-evaluation',
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class EmployeeEvaluationComponent implements OnInit {
  evaluations: any[] = [];
  showCreateModal = false;
  form: any = { employeeId: null, evaluationType: 'DOCENTE', evaluationDate: '', strengths: '', improvements: '' };

  constructor(private http: HttpClient, private auth: AuthService) {}
  ngOnInit() { this.load(); }
  private get instId(): number { return this.auth.institutionId() || 1; }

  get completedCount(): number { return this.evaluations.filter(e => e.status === 'COMPLETADA').length; }
  get pendingCount(): number { return this.evaluations.filter(e => e.status === 'PENDIENTE').length; }

  load() {
    this.http.get<any[]>(`${API_URL}/hr/evaluations?institutionId=${this.instId}`).subscribe({ next: r => this.evaluations = r, error: () => {} });
  }
  save() {
    this.http.post<any>(`${API_URL}/hr/evaluations`, { ...this.form, employee: { id: this.form.employeeId }, institutionId: this.instId }).subscribe({
      next: () => { this.showCreateModal = false; this.load(); },
      error: e => alert(e.error?.message || 'Error')
    });
  }
  complete(id: number) {
    const score = prompt('Nota (0.0 - 10.0):');
    if (score) this.http.post<any>(`${API_URL}/hr/evaluations/${id}/complete?score=${score}`, {}).subscribe({ next: () => this.load() });
  }
  deleteEval(id: number) {
    if (!confirm('Eliminar evaluacion?')) return;
    this.http.delete(`${API_URL}/hr/evaluations/${id}`).subscribe({ next: () => this.load() });
  }
}
