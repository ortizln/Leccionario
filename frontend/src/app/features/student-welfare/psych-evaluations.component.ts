import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../core/api.config';
import { AuthService } from '../../core/auth.service';

@Component({
  templateUrl: './psych-evaluations.component.html',
  styleUrl: './psych-evaluations.component.css',
    selector: 'app-psych-evaluations',
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class PsychEvaluationsComponent implements OnInit {
  evaluations: any[] = [];
  total = 0;
  completed = 0;
  pending = 0;
  flagged = 0;
  showCreateModal = false;
  newEval: any = { studentId: null, evaluationType: 'INICIAL', psychologistName: '', evaluationDate: '', resultSummary: '', followUpRequired: false };

  constructor(private http: HttpClient, private auth: AuthService) {}

  ngOnInit() { this.load(); }

  load() {
    this.http.get<any[]>(`${API_URL}/student-wellness/psych/student/${this.auth.userId() || 1}`).subscribe({
      next: r => {
        this.evaluations = r;
        this.total = r.length;
        this.completed = r.filter(e => e.status === 'COMPLETADA').length;
        this.pending = r.filter(e => e.status === 'PENDIENTE').length;
        this.flagged = r.filter(e => e.followUpRequired).length;
      },
      error: () => {}
    });
  }

  create() {
    this.http.post<any>(`${API_URL}/student-wellness/psych`, { ...this.newEval, institutionId: this.auth.institutionId() || 1 }).subscribe({
      next: () => { this.showCreateModal = false; this.load(); },
      error: e => alert(e.error?.message || 'Error')
    });
  }

  downloadPdf() {
    window.open(`${API_URL}/student-wellness/psych/student/${this.auth.userId() || 1}/pdf`, '_blank');
  }
}
