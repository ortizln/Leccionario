import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../core/api.config';
import { AuthService } from '../../core/auth.service';

@Component({
  templateUrl: './bi-dashboard.component.html',
  styleUrl: './bi-dashboard.component.css',
    selector: 'app-bi-dashboard',
  standalone: true,
  imports: [CommonModule],
})
export class BiDashboardComponent implements OnInit {
  courseData: any[] = [];
  financeData: any[] = [];
  assetData: any[] = [];
  enrollmentData: any[] = [];
  teacherRanking: any[] = [];
  libraryData: any = {};
  gradeDistribution: any[] = [];
  communicationStats: any = {};
  hrSummary: any = {};
  payrollSummary: any = {};
  kpis: any = {};
  summary = { totalStudents: 0, totalCourses: 0, avgScore: 0, failingStudents: 0, pendingReceivable: 0, activeLoans: 0 };

  constructor(private http: HttpClient, private auth: AuthService) {}

  ngOnInit() { this.load(); }

  private get instId(): number { return this.auth.institutionId() || 1; }

  load() {
    this.http.get<any>(`${API_URL}/bi/kpis?institutionId=${this.instId}`).subscribe({
      next: r => {
        this.kpis = r;
        this.summary.totalStudents = r.totalStudents || 0;
        this.summary.pendingReceivable = r.pendingReceivable || 0;
        this.summary.activeLoans = r.activeLoans || 0;
      },
      error: () => {}
    });
    this.http.get<any[]>(`${API_URL}/bi/courses?institutionId=${this.instId}`).subscribe({
      next: r => {
        this.courseData = r;
        this.summary.totalCourses = r.length;
        this.summary.avgScore = r.length ? r.reduce((s, c) => s + (c.average_score || 0), 0) / r.length : 0;
        this.summary.failingStudents = r.reduce((s, c) => s + (c.failing_count || 0), 0);
        if (!this.summary.totalStudents) this.summary.totalStudents = r.reduce((s, c) => s + (c.enrolled_students || 0), 0);
      },
      error: () => {}
    });
    this.http.get<any[]>(`${API_URL}/bi/finance?institutionId=${this.instId}`).subscribe({ next: r => this.financeData = r, error: () => {} });
    this.http.get<any[]>(`${API_URL}/bi/assets?institutionId=${this.instId}`).subscribe({ next: r => this.assetData = r, error: () => {} });
    this.http.get<any[]>(`${API_URL}/bi/enrollments?institutionId=${this.instId}`).subscribe({ next: r => this.enrollmentData = r, error: () => {} });
    this.http.get<any>(`${API_URL}/bi/library`).subscribe({ next: r => this.libraryData = r, error: () => {} });
    this.http.get<any[]>(`${API_URL}/bi/teacher-ranking?institutionId=${this.instId}`).subscribe({ next: r => this.teacherRanking = r, error: () => {} });
    this.http.get<any>(`${API_URL}/bi/grade-distribution?institutionId=${this.instId}`).subscribe({ next: r => { this.gradeDistribution = r.distribution || []; }, error: () => {} });
    this.http.get<any>(`${API_URL}/bi/communication-stats?institutionId=${this.instId}`).subscribe({ next: r => this.communicationStats = r, error: () => {} });
    this.http.get<any>(`${API_URL}/bi/hr-summary?institutionId=${this.instId}`).subscribe({ next: r => this.hrSummary = r, error: () => {} });
    this.http.get<any>(`${API_URL}/bi/payroll-summary?institutionId=${this.instId}`).subscribe({ next: r => this.payrollSummary = r, error: () => {} });
  }

  refresh() {
    this.http.post(`${API_URL}/bi/refresh`, {}).subscribe({ next: () => this.load() });
  }
}
