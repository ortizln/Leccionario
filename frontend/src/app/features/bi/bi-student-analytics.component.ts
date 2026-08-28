import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../core/api.config';
import { AuthService } from '../../core/auth.service';

@Component({
  templateUrl: './bi-student-analytics.component.html',
  styleUrl: './bi-student-analytics.component.css',
    selector: 'app-bi-student-analytics',
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class BiStudentAnalyticsComponent implements OnInit {
  tab = 'risk';
  highRiskProfiles: any[] = [];
  coursePerformance: any[] = [];
  gradeDistribution: any[] = [];
  learningStyles: any[] = [];
  anomalies: any[] = [];
  attendanceTrend: any[] = [];
  financialSummary: any[] = [];
  selectedProfile: any = null;

  constructor(private http: HttpClient, private auth: AuthService) {}
  ngOnInit() { this.load(); }
  private get instId(): number { return this.auth.institutionId() || 1; }

  load() {
    this.http.get<any>(`${API_URL}/ai/stats?institutionId=${this.instId}`).subscribe({
      next: (stats: any) => {
        this.gradeDistribution = (stats.gradeDistribution || []).map((d: any, i: number) => ({ ...d, percent: 0 }));
        this.learningStyles = stats.learningStyles || [];
      },
      error: () => {}
    });
    this.http.get<any[]>(`${API_URL}/ai/profiles/high-risk?institutionId=${this.instId}`).subscribe({
      next: r => this.highRiskProfiles = r,
      error: () => {}
    });
    this.http.get<any[]>(`${API_URL}/bi/courses?institutionId=${this.instId}`).subscribe({
      next: r => this.coursePerformance = r,
      error: () => {}
    });
    this.http.get<any[]>(`${API_URL}/ai/anomalies?institutionId=${this.instId}`).subscribe({
      next: r => this.anomalies = r,
      error: () => {}
    });
    this.http.get<any[]>(`${API_URL}/bi/attendance-trend?institutionId=${this.instId}`).subscribe({
      next: r => this.attendanceTrend = r,
      error: () => {}
    });
    this.http.get<any[]>(`${API_URL}/bi/financial-summary?institutionId=${this.instId}`).subscribe({
      next: r => this.financialSummary = r,
      error: () => {}
    });
  }

  viewProfile(p: any) { this.selectedProfile = p; }

  getAttendanceRate(a: any): number {
    if (!a.total || a.total === 0) return 0;
    return ((a.total - a.absences - a.tardies) / a.total) * 100;
  }
}
