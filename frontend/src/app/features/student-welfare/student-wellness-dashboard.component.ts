import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../core/api.config';
import { AuthService } from '../../core/auth.service';

@Component({
  templateUrl: './student-wellness-dashboard.component.html',
  styleUrl: './student-wellness-dashboard.component.css',
    selector: 'app-student-wellness-dashboard',
  standalone: true,
  imports: [CommonModule],
})
export class StudentWellnessDashboardComponent implements OnInit {
  stats: any = {
    totalScholarships: 0, totalClubs: 0, totalTransport: 0, totalInsurance: 0,
    healthRecords: 0, psychEvaluations: 0, vaccinations: 0, transportStudents: 0,
    activeRoutes: 0, unassignedTransport: 0, totalStudents: 0, criticalCases: 0,
    completedVaccinations: 0
  };
  clubsList: any[] = [];
  scholarshipsList: any[] = [];

  constructor(private http: HttpClient, private auth: AuthService) {}
  ngOnInit() { this.load(); }

  private get instId(): number { return this.auth.institutionId() || 1; }

  load() {
    this.http.get<any>(`${API_URL}/student-wellness/overview?institutionId=${this.instId}`).subscribe({
      next: r => {
        this.stats.totalStudents = r.totalStudents || 0;
        this.stats.psychEvaluations = r.totalEvaluations || 0;
        this.stats.criticalCases = r.criticalCases || 0;
        this.stats.totalInsurance = r.activeInsurances || 0;
        this.stats.vaccinations = r.totalVaccinations || 0;
        this.stats.completedVaccinations = r.completedVaccinations || 0;
        this.stats.healthRecords = r.totalStudents || 0;
      },
      error: () => {}
    });
    this.http.get<any[]>(`${API_URL}/clubs/institution/${this.instId}`).subscribe({
      next: r => { this.clubsList = r; this.stats.totalClubs = r.length; },
      error: () => {}
    });
    this.http.get<any[]>(`${API_URL}/scholarships/types/institution/${this.instId}`).subscribe({
      next: (r: any) => {
        const list = Array.isArray(r) ? r : [];
        this.stats.totalScholarships = list.length;
        const typeMap = new Map<string, number>();
        list.forEach((s: any) => { const t = s.scholarshipTypeName || 'General'; typeMap.set(t, (typeMap.get(t) || 0) + 1); });
        this.scholarshipsList = Array.from(typeMap.entries()).map(([type, count]) => ({ type, count }));
      },
      error: () => {}
    });
    this.http.get<any>(`${API_URL}/transport/stats?institutionId=${this.instId}`).subscribe({
      next: r => { this.stats.totalTransport = r.totalRoutes || 0; this.stats.activeRoutes = r.activeRoutes || 0; this.stats.transportStudents = r.totalStudents || 0; this.stats.unassignedTransport = r.unassigned || 0; },
      error: () => {}
    });
  }
}
