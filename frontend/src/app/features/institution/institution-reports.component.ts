import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../core/api.config';
import { AuthService } from '../../core/auth.service';

@Component({
  templateUrl: './institution-reports.component.html',
  styleUrl: './institution-reports.component.css',
    selector: 'app-institution-reports',
  standalone: true,
  imports: [CommonModule],
})
export class InstitutionReportsComponent implements OnInit {
  kpis: any = { totalStudents: 0, activeEnrollments: 0, totalTeachers: 0, attendanceRate: 0, totalRevenue: 0, pendingReceivable: 0, totalAssets: 0, activeLoans: 0 };
  distribution: any[] = [];
  trend: any[] = [];
  maxEnrolled = 1;

  constructor(private http: HttpClient, private auth: AuthService) {}
  ngOnInit() { this.load(); }
  private get instId(): number { return this.auth.institutionId() || 1; }

  load() {
    this.http.get<any>(`${API_URL}/bi/kpis?institutionId=${this.instId}`).subscribe({
      next: r => this.kpis = r,
      error: () => {}
    });
    this.http.get<any[]>(`${API_URL}/bi/student-distribution?institutionId=${this.instId}`).subscribe({
      next: r => { this.distribution = r; this.maxEnrolled = Math.max(...r.map((d: any) => d.enrolled || 1), 1); },
      error: () => {}
    });
    this.http.get<any[]>(`${API_URL}/bi/trend?institutionId=${this.instId}`).subscribe({
      next: r => this.trend = r,
      error: () => {}
    });
  }
}
