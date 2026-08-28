import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../core/api.config';

interface Course { id: number; name: string; }
interface AcademicPeriod { id: number; name: string; }
interface Student { id: number; firstName: string; lastName: string; enrollmentNumber: string; }

interface AbsenceRecord {
  id: number;
  date: string;
  courseName: string;
  subjectName: string;
  blockLabel: string;
  absenceType: string;
  notes: string;
  studentId?: number;
  studentName?: string;
  enrollmentNumber?: string;
}

interface StudentAbsenceSummary {
  studentId: number;
  studentName: string;
  enrollmentNumber: string;
  absent: number;
  late: number;
  justified: number;
  total: number;
}

@Component({
  templateUrl: './attendance.component.html',
  styleUrl: './attendance.component.css',
    selector: 'app-attendance',
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class AttendanceComponent implements OnInit {
  tab = 'course';
  courses: Course[] = [];
  periods: AcademicPeriod[] = [];
  searchResults: Student[] = [];

  courseId: number | null = null;
  periodId: number | null = null;
  searchTerm = '';
  studentPeriodId: number | null = null;
  selectedStudent: Student | null = null;

  courseStats: any = null;
  courseAbsences: AbsenceRecord[] = [];
  studentSummaries: StudentAbsenceSummary[] = [];
  studentStats: any = null;
  studentAbsences: AbsenceRecord[] = [];

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

  loadCourseData() {
    if (!this.courseId || !this.periodId) return;
    this.http.get(`${API_URL}/attendance/course/${this.courseId}/period/${this.periodId}/stats`)
      .subscribe({ next: d => this.courseStats = d, error: () => this.showMsg('Error al cargar estadisticas', true) });
    this.http.get<AbsenceRecord[]>(`${API_URL}/attendance/course/${this.courseId}/period/${this.periodId}`)
      .subscribe({ next: d => this.courseAbsences = d, error: () => this.showMsg('Error al cargar inasistencias', true) });
    this.http.get<StudentAbsenceSummary[]>(`${API_URL}/attendance/course/${this.courseId}/period/${this.periodId}/by-student`)
      .subscribe({ next: d => this.studentSummaries = d, error: () => {} });
  }

  searchStudent() {
    if (!this.searchTerm) return;
    this.http.get<Student[]>(`${API_URL}/academic/students`, { params: { search: this.searchTerm } })
      .subscribe({ next: d => { this.searchResults = d; this.selectedStudent = null; }, error: () => this.showMsg('Error al buscar', true) });
  }

  selectStudent(student: Student) {
    this.selectedStudent = student;
    this.searchResults = [];
    if (this.studentPeriodId) this.loadStudentData(student.id);
  }

  loadStudentData(studentId: number) {
    if (!this.studentPeriodId) return;
    this.http.get(`${API_URL}/attendance/student/${studentId}/period/${this.studentPeriodId}/stats`)
      .subscribe({ next: d => this.studentStats = d, error: () => {} });
    this.http.get<AbsenceRecord[]>(`${API_URL}/attendance/student/${studentId}/period/${this.studentPeriodId}`)
      .subscribe({ next: d => this.studentAbsences = d, error: () => this.showMsg('Error al cargar historial', true) });
  }

  absenceLabel(type: string): string {
    const labels: Record<string, string> = { ABSENT: 'Ausente', LATE: 'Tardanza', JUSTIFIED: 'Justificada' };
    return labels[type] || type;
  }
}
