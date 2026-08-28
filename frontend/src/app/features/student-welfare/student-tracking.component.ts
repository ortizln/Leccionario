import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../core/api.config';

@Component({
  templateUrl: './student-tracking.component.html',
  styleUrl: './student-tracking.component.css',
    selector: 'app-student-tracking',
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class StudentTrackingComponent implements OnInit {
  studentId: number | null = null;
  tab = 'grades';
  grades: any[] = [];
  attendance: any[] = [];
  meritList: any[] = [];
  demeritList: any[] = [];
  health: any = {};
  vaccinations: any[] = [];
  loans: any[] = [];
  avgGrade = 0;
  absences = 0;
  merits = 0;
  riskLevel = '';

  constructor(private http: HttpClient) {}
  ngOnInit() {}

  loadAll() {
    if (!this.studentId) return;
    this.http.get<any[]>(`${API_URL}/grading/student/${this.studentId}`).subscribe({
      next: r => { this.grades = r; this.avgGrade = r.length ? r.reduce((s, g) => s + (g.averageScore || 0), 0) / r.length : 0; this.checkRisk(); },
      error: () => {}
    });
    this.http.get<any[]>(`${API_URL}/attendance/student/${this.studentId}`).subscribe({
      next: r => { this.attendance = r; this.absences = r.filter((a: any) => a.absenceType === 'INASISTENCIA').length; this.checkRisk(); },
      error: () => {}
    });
    this.http.get<any[]>(`${API_URL}/conduct/merits/student/${this.studentId}`).subscribe({
      next: r => { this.meritList = r; this.merits = r.length; },
      error: () => {}
    });
    this.http.get<any[]>(`${API_URL}/student-demers/by-student/${this.studentId}`).subscribe({
      next: r => this.demeritList = r,
      error: () => {}
    });
    this.http.get<any>(`${API_URL}/student-health/records/student/${this.studentId}`).subscribe({
      next: r => this.health = r || {},
      error: () => {}
    });
    this.http.get<any[]>(`${API_URL}/student-health/vaccinations/student/${this.studentId}`).subscribe({
      next: r => this.vaccinations = r,
      error: () => {}
    });
    this.http.get<any[]>(`${API_URL}/library/loans/student/${this.studentId}`).subscribe({
      next: r => this.loans = r,
      error: () => {}
    });
  }

  checkRisk() {
    if (this.avgGrade < 5 || this.absences > 5) this.riskLevel = 'ALTO';
    else if (this.avgGrade < 7 || this.absences > 3) this.riskLevel = 'MEDIO';
    else this.riskLevel = '';
  }
}
