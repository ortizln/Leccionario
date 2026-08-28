import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../core/api.config';
import { AuthService } from '../../core/auth.service';

@Component({
  templateUrl: './enrollment.component.html',
  styleUrl: './enrollment.component.css',
    selector: 'app-enrollment',
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class EnrollmentComponent implements OnInit {
  tab = 'list';
  periods: any[] = [];
  courses: any[] = [];
  enrollments: any[] = [];
  stats: any = null;
  filterPeriodId: number | null = null;
  filterCourseId: number | null = null;

  formStudentId: number | null = null;
  formCourseId: number | null = null;
  formPeriodId: number | null = null;
  formParallelCode = '';
  formEnrollmentNumber = '';
  formObservations = '';

  message = '';
  messageIsError = false;

  constructor(private http: HttpClient, private auth: AuthService) {}

  ngOnInit() {
    const instId = this.auth.institutionId() || 1;
    this.http.get<any[]>(`${API_URL}/academic/periods`).subscribe({ next: d => this.periods = d });
    this.http.get<any[]>(`${API_URL}/academic/courses`, { params: { institutionId: instId } })
      .subscribe({ next: d => this.courses = d });
    this.load();
  }

  private showMsg(msg: string, err = false) { this.message = msg; this.messageIsError = err; setTimeout(() => this.message = '', 4000); }

  load() {
    if (this.filterPeriodId) {
      this.http.get<any>(`${API_URL}/enrollment/stats/${this.filterPeriodId}`).subscribe({ next: d => this.stats = d });
      if (this.filterCourseId) {
        this.http.get<any[]>(`${API_URL}/enrollment/course/${this.filterCourseId}/period/${this.filterPeriodId}`)
          .subscribe({ next: d => this.enrollments = d });
      } else {
        this.http.get<any[]>(`${API_URL}/enrollment/period/${this.filterPeriodId}`)
          .subscribe({ next: d => this.enrollments = d });
      }
    }
  }

  create() {
    this.http.post(`${API_URL}/enrollment`, {
      studentId: this.formStudentId, courseId: this.formCourseId, periodId: this.formPeriodId,
      enrollmentNumber: this.formEnrollmentNumber || null,
      parallelCode: this.formParallelCode, observations: this.formObservations
    }).subscribe({
      next: () => { this.showMsg('Matricula creada'); this.tab = 'list'; this.load(); this.resetForm(); },
      error: () => this.showMsg('Error al crear', true)
    });
  }

  deleteEnrollment(id: number) {
    if (!confirm('Retirar esta matricula?')) return;
    this.http.delete(`${API_URL}/enrollment/${id}`).subscribe({
      next: () => { this.load(); this.showMsg('Matricula retirada'); },
      error: () => this.showMsg('Error', true)
    });
  }

  resetForm() { this.formStudentId = null; this.formCourseId = null; this.formParallelCode = ''; this.formEnrollmentNumber = ''; this.formObservations = ''; }

  statusLabel(s: string): string {
    const m: Record<string, string> = { ACTIVE: 'Activa', TRANSFERRED: 'Trasladado', WITHDRAWN: 'Retirado', PROMOTED: 'Promovido' };
    return m[s] || s;
  }
}
