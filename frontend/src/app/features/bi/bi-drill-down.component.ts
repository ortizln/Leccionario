import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../core/api.config';
import { AuthService } from '../../core/auth.service';

@Component({
  templateUrl: './bi-drill-down.component.html',
  styleUrl: './bi-drill-down.component.css',
    selector: 'app-bi-drill-down',
  standalone: true,
  imports: [CommonModule],
})
export class BiDrillDownComponent implements OnInit {
  tab = 'grades';
  gradesData: any = null;
  attendanceData: any[] = [];
  financialData: any = null;
  trendsData: any = null;

  constructor(private http: HttpClient, private auth: AuthService) {}
  ngOnInit() { this.loadGrades(); }
  private get instId(): number { return this.auth.institutionId() || 1; }

  loadGrades() {
    this.http.get<any>(`${API_URL}/bi/drill-down/grades?institutionId=${this.instId}`).subscribe(r => this.gradesData = r);
  }
  loadAttendance() {
    this.http.get<any>(`${API_URL}/bi/drill-down/attendance?institutionId=${this.instId}`).subscribe(r => this.attendanceData = r.attendanceTrend || []);
  }
  loadFinancial() {
    this.http.get<any>(`${API_URL}/bi/drill-down/financial?institutionId=${this.instId}`).subscribe(r => this.financialData = r);
  }
  loadTrends() {
    this.http.get<any>(`${API_URL}/bi/trends?institutionId=${this.instId}`).subscribe(r => this.trendsData = r);
  }
}
