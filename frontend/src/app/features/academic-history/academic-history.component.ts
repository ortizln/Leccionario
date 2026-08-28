import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../core/api.config';

interface SubjectGrade {
  subjectId: number;
  subjectName: string;
  teacherName: string;
  averageScore: number;
  status: string;
}

interface PeriodSummary {
  periodId: number;
  periodName: string;
  periodStart: string;
  periodEnd: string;
  subjects: SubjectGrade[];
  periodAverage: number;
  periodStatus: string;
}

interface AcademicHistory {
  studentId: number;
  studentName: string;
  enrollmentNumber: string;
  periods: PeriodSummary[];
}

interface Student { id: number; firstName: string; lastName: string; enrollmentNumber: string; }

@Component({
  templateUrl: './academic-history.component.html',
  styleUrl: './academic-history.component.css',
    selector: 'app-academic-history',
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class AcademicHistoryComponent implements OnInit {
  searchTerm = '';
  searchResults: Student[] = [];
  history: AcademicHistory | null = null;
  totalSubjects = 0;
  totalApproved = 0;
  overallAverage: number | null = null;

  message = '';
  messageIsError = false;

  constructor(private http: HttpClient) {}

  ngOnInit() {}

  private showMsg(msg: string, err = false) {
    this.message = msg;
    this.messageIsError = err;
    setTimeout(() => this.message = '', 4000);
  }

  searchStudent() {
    if (!this.searchTerm) return;
    this.http.get<Student[]>(`${API_URL}/academic/students`, { params: { search: this.searchTerm } })
      .subscribe({
        next: d => { this.searchResults = d; this.history = null; },
        error: () => this.showMsg('Error al buscar estudiantes', true)
      });
  }

  loadHistory(studentId: number) {
    this.http.get<AcademicHistory>(`${API_URL}/report-cards/history/${studentId}`)
      .subscribe({
        next: d => {
          this.history = d;
          this.searchResults = [];
          this.computeStats();
        },
        error: () => this.showMsg('Error al cargar historial', true)
      });
  }

  private computeStats() {
    if (!this.history) return;
    this.totalSubjects = 0;
    this.totalApproved = 0;
    const allScores: number[] = [];
    for (const period of this.history.periods) {
      for (const subj of period.subjects) {
        this.totalSubjects++;
        if (subj.status === 'APPROVED') this.totalApproved++;
        if (subj.averageScore != null) allScores.push(subj.averageScore);
      }
    }
    if (allScores.length > 0) {
      this.overallAverage = Math.round((allScores.reduce((a, b) => a + b, 0) / allScores.length) * 100) / 100;
    } else {
      this.overallAverage = null;
    }
  }
}
