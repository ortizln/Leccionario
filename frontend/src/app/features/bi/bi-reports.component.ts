import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../core/api.config';
import { AuthService } from '../../core/auth.service';

@Component({
  templateUrl: './bi-reports.component.html',
  styleUrl: './bi-reports.component.css',
    selector: 'app-bi-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class BiReportsComponent implements OnInit {
  tab = 'academic';
  academicData: any[] = [];
  financialData: any[] = [];
  enrollmentData: any[] = [];
  attendanceStats = { absences: 0, tardies: 0, justified: 0 };
  hrData: any = {};
  libData: any = {};
  conducta: any = {};
  showExportModal = false;

  constructor(private http: HttpClient, private auth: AuthService) {}
  ngOnInit() { this.load(); }

  private get instId(): number { return this.auth.institutionId() || 1; }

  load() {
    this.http.get<any[]>(`${API_URL}/bi/courses?institutionId=${this.instId}`).subscribe({ next: r => this.academicData = r, error: () => {} });
    this.http.get<any[]>(`${API_URL}/bi/finance?institutionId=${this.instId}`).subscribe({ next: r => this.financialData = r, error: () => {} });
    this.http.get<any[]>(`${API_URL}/bi/enrollments?institutionId=${this.instId}`).subscribe({ next: r => this.enrollmentData = r, error: () => {} });
  }

  loadHR() {
    this.http.get<any[]>(`${API_URL}/hr/employees/institution/${this.instId}`).subscribe({ next: r => this.hrData.totalEmployees = r.length, error: () => {} });
    this.http.get<any[]>(`${API_URL}/hr/contracts/active`).subscribe({ next: r => this.hrData.activeContracts = r.length, error: () => {} });
    this.http.get<any[]>(`${API_URL}/hr/vacations/requests/pending`).subscribe({ next: r => this.hrData.pendingVacations = r.length, error: () => {} });
    this.http.get<any[]>(`${API_URL}/hr/training/courses/institution/${this.instId}`).subscribe({ next: r => this.hrData.activeTrainings = r.length, error: () => {} });
  }

  loadLibrary() {
    this.http.get<any>(`${API_URL}/library/stats?institutionId=${this.instId}`).subscribe({ next: r => this.libData = r, error: () => {} });
  }

  loadConducta() {
    this.http.get<any>(`${API_URL}/academic/merits?institutionId=${this.instId}`).subscribe({ next: r => this.conducta.merits = Array.isArray(r) ? r.length : 0, error: () => { this.conducta.merits = 0; } });
    this.http.get<any[]>(`${API_URL}/academic/demerits?institutionId=${this.instId}`).subscribe({ next: r => this.conducta.demerits = r.length, error: () => {} });
    this.http.get<any>(`${API_URL}/academic/students?institutionId=${this.instId}`).subscribe({ next: r => this.conducta.totalStudents = Array.isArray(r) ? r.length : 0, error: () => { this.conducta.totalStudents = 0; } });
  }

  refresh() { this.http.post(`${API_URL}/bi/refresh`, {}).subscribe({ next: () => this.load() }); }

  getPassRate(r: any) { return r.enrolled_students ? (r.passing_count / r.enrolled_students * 100) : 0; }
  getOverallAvg() { return this.academicData.length ? this.academicData.reduce((s, r) => s + (r.average_score || 0), 0) / this.academicData.length : 0; }
  getOverallPassRate() { const total = this.academicData.reduce((s, r) => s + r.enrolled_students, 0); const pass = this.academicData.reduce((s, r) => s + r.passing_count, 0); return total ? (pass / total * 100) : 0; }
  getTotalFailing() { return this.academicData.reduce((s, r) => s + (r.failing_count || 0), 0); }
  getCollectionRate(f: any) { return f.total_billed ? (f.total_collected / f.total_billed * 100) : 0; }
  getTotalBilled() { return this.financialData.reduce((s, f) => s + (f.total_billed || 0), 0); }
  getTotalCollected() { return this.financialData.reduce((s, f) => s + (f.total_collected || 0), 0); }
  getTotalPending() { return this.financialData.reduce((s, f) => s + (f.total_pending || 0), 0); }
  getOverallCollectionRate() { const billed = this.getTotalBilled(); const collected = this.getTotalCollected(); return billed ? (collected / billed * 100) : 0; }
  getRetentionRate(e: any) { return e.total_enrollments ? (e.active_enrollments / e.total_enrollments * 100) : 0; }
  getAvailabilityRate() { return this.libData.totalCopies ? ((this.libData.availableCopies || 0) / this.libData.totalCopies * 100) : 0; }
  getLoanRate() { return this.libData.totalCopies ? ((this.libData.activeLoans || 0) / this.libData.totalCopies * 100) : 0; }

  exportCSV(type: string) {
    this.showExportModal = true;
    window.open(`${API_URL}/bi/export/${type}?institutionId=${this.instId}`, '_blank');
    setTimeout(() => this.showExportModal = false, 1000);
  }

  exportPDF(type: string) {
    this.showExportModal = true;
    window.open(`${API_URL}/bi/pdf/${type}?institutionId=${this.instId}`, '_blank');
    setTimeout(() => this.showExportModal = false, 1000);
  }
}
