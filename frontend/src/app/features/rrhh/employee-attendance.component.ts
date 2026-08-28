import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../core/api.config';
import { AuthService } from '../../core/auth.service';

@Component({
  templateUrl: './employee-attendance.component.html',
  styleUrl: './employee-attendance.component.css',
    selector: 'app-employee-attendance',
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class EmployeeAttendanceComponent implements OnInit {
  attendances: any[] = [];
  stats: any = {};
  showCheckInModal = false;
  employeeId: number | null = null;

  constructor(private http: HttpClient, private auth: AuthService) {}
  ngOnInit() { this.load(); this.loadStats(); }
  private get instId(): number { return this.auth.institutionId() || 1; }

  load() {
    this.http.get<any[]>(`${API_URL}/hr/attendances?institutionId=${this.instId}`).subscribe({ next: r => this.attendances = r, error: () => {} });
  }
  loadStats() {
    this.http.get<any>(`${API_URL}/hr/attendances/stats?institutionId=${this.instId}`).subscribe({ next: r => this.stats = r, error: () => {} });
  }
  checkIn() {
    this.http.post<any>(`${API_URL}/hr/attendances/check-in/${this.employeeId}?institutionId=${this.instId}`, {}).subscribe({
      next: () => { this.showCheckInModal = false; this.employeeId = null; this.load(); this.loadStats(); },
      error: e => alert(e.error?.message || 'Error')
    });
  }
  checkOut(id: number) {
    this.http.post<any>(`${API_URL}/hr/attendances/${id}/check-out`, {}).subscribe({ next: () => { this.load(); this.loadStats(); } });
  }
}
