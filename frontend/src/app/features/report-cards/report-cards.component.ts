import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../core/api.config';

interface Course { id: number; name: string; }
interface AcademicPeriod { id: number; name: string; }
interface Student { id: number; firstName: string; lastName: string; enrollmentNumber: string; }

interface ReportCardDetail {
  id: number;
  subjectId: number;
  subjectName: string;
  teacherName: string;
  averageScore: number;
  status: string;
  teacherComment: string;
  evaluationCount: number;
}

interface ReportCard {
  id: number;
  studentId: number;
  studentName: string;
  enrollmentNumber: string;
  courseId: number;
  courseName: string;
  academicPeriodId: number;
  academicPeriodName: string;
  status: string;
  overallAverage: number;
  finalStatus: string;
  teacherComments: string;
  conductNotes: string;
  observations: string;
  generatedBy: string;
  generatedAt: string;
  signedAt: string;
  deliveredAt: string;
  details: ReportCardDetail[];
}

@Component({
  templateUrl: './report-cards.component.html',
  styleUrl: './report-cards.component.css',
    selector: 'app-report-cards',
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class ReportCardsComponent implements OnInit {
  tab = 'list';
  courses: Course[] = [];
  periods: AcademicPeriod[] = [];
  students: Student[] = [];
  reportCards: ReportCard[] = [];
  selectedReportCard: ReportCard | null = null;

  filterPeriodId: number | null = null;
  filterCourseId: number | null = null;
  genCourseId: number | null = null;
  genPeriodId: number | null = null;
  genStudentId: number | null = null;
  genComments = '';
  genConduct = '';
  genObservations = '';

  message = '';
  messageIsError = false;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.http.get<Course[]>(`${API_URL}/academic/courses`).subscribe({ next: d => this.courses = d });
    this.http.get<AcademicPeriod[]>(`${API_URL}/academic/catalogs/academic-years`).subscribe({ next: d => this.periods = d as any });
  }

  private showMsg(msg: string, err = false) {
    this.message = msg;
    this.messageIsError = err;
    setTimeout(() => this.message = '', 4000);
  }

  loadReportCards() {
    let url = `${API_URL}/report-cards`;
    if (this.filterPeriodId) {
      url += `/period/${this.filterPeriodId}`;
    }
    this.http.get<ReportCard[]>(url).subscribe({
      next: d => this.reportCards = d,
      error: () => this.showMsg('Error al cargar libretas', true)
    });
  }

  loadStudents() {
    if (!this.genCourseId) { this.students = []; return; }
    this.http.get<Student[]>(`${API_URL}/academic/students`, { params: { courseId: this.genCourseId } })
      .subscribe({ next: d => this.students = d, error: () => {} });
  }

  generateReportCard() {
    if (!this.genCourseId || !this.genPeriodId || !this.genStudentId) return;
    this.http.post<ReportCard>(`${API_URL}/report-cards/generate`, {
      studentId: this.genStudentId,
      courseId: this.genCourseId,
      academicPeriodId: this.genPeriodId,
      teacherComments: this.genComments,
      conductNotes: this.genConduct,
      observations: this.genObservations
    }).subscribe({
      next: rc => {
        this.selectedReportCard = rc;
        this.showMsg('Libreta generada exitosamente');
        this.tab = 'list';
        this.loadReportCards();
      },
      error: () => this.showMsg('Error al generar libreta', true)
    });
  }

  viewReportCard(rc: ReportCard) {
    this.http.get<ReportCard>(`${API_URL}/report-cards`, { params: {
      studentId: rc.studentId, courseId: rc.courseId, periodId: rc.academicPeriodId
    }}).subscribe({
      next: d => this.selectedReportCard = d,
      error: () => this.showMsg('Error al cargar libreta', true)
    });
  }

  updateStatus(newStatus: string) {
    if (!this.selectedReportCard) return;
    this.http.put<ReportCard>(`${API_URL}/report-cards/${this.selectedReportCard.id}/status`, null, { params: { status: newStatus } })
      .subscribe({
        next: d => { this.selectedReportCard = d; this.showMsg('Estado actualizado'); this.loadReportCards(); },
        error: () => this.showMsg('Error al actualizar estado', true)
      });
  }

  downloadPdf() {
    if (!this.selectedReportCard) return;
    window.open(`${API_URL}/report-cards/${this.selectedReportCard.id}/pdf`, '_blank');
  }

  statusLabel(status: string): string {
    const labels: Record<string, string> = { DRAFT: 'Borrador', FINALIZED: 'Finalizada', SIGNED: 'Firmada', DELIVERED: 'Entregada' };
    return labels[status] || status;
  }
}
