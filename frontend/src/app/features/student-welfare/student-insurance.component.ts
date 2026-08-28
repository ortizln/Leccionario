import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../core/api.config';
import { AuthService } from '../../core/auth.service';

@Component({
  templateUrl: './student-insurance.component.html',
  styleUrl: './student-insurance.component.css',
    selector: 'app-student-insurance',
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class StudentInsuranceComponent implements OnInit {
  insurances: any[] = [];
  total = 0;
  active = 0;
  expiringSoon = 0;
  expired = 0;
  showCreateModal = false;
  newInsurance: any = { studentId: null, insuranceProvider: '', policyNumber: '', coverageAmount: 0, startDate: '', endDate: '' };
  selectedStudentId = 1;
  students: any[] = [];

  constructor(private http: HttpClient, private auth: AuthService) {}

  ngOnInit() { this.loadStudents(); }

  private get instId(): number { return this.auth.institutionId() || 1; }

  loadStudents() {
    this.http.get<any[]>(`${API_URL}/bi/courses?institutionId=${this.instId}`).subscribe({
      next: r => {
        const allStudents: any[] = [];
        r.forEach((c: any) => {
          if (c.students) c.students.forEach((s: any) => allStudents.push(s));
        });
        this.students = allStudents.length ? allStudents : [];
        if (this.students.length) this.load();
      },
      error: () => this.load()
    });
  }

  load() {
    if (!this.selectedStudentId) return;
    this.http.get<any[]>(`${API_URL}/student-wellness/insurance/student/${this.selectedStudentId}`).subscribe({
      next: r => {
        this.insurances = r;
        this.total = r.length;
        this.active = r.filter(s => s.status === 'ACTIVO').length;
        this.expiringSoon = r.filter(s => s.status === 'POR_VENCER').length;
        this.expired = r.filter(s => s.status === 'VENCIDO').length;
      },
      error: () => {}
    });
  }

  create() {
    this.http.post<any>(`${API_URL}/student-wellness/insurance`, { ...this.newInsurance, institutionId: this.instId }).subscribe({
      next: () => { this.showCreateModal = false; this.load(); },
      error: e => alert(e.error?.message || 'Error')
    });
  }
}
