import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../core/api.config';
import { AuthService } from '../../core/auth.service';

interface Course { id: number; name: string; }
interface AcademicPeriod { id: number; name: string; }
interface Student { id: number; firstName: string; lastName: string; enrollmentNumber: string; }
interface Teacher { id: number; firstName: string; lastName: string; }

interface TutoringSession {
  id: number;
  teacherId: number;
  teacherName: string;
  studentId: number;
  studentName: string;
  enrollmentNumber: string;
  courseId: number;
  courseName: string;
  academicPeriodId: number;
  academicPeriodName: string;
  sessionDate: string;
  sessionTime: string;
  durationMinutes: number;
  sessionType: string;
  status: string;
  topic: string;
  description: string;
  recommendations: string;
  followUpRequired: boolean;
  followUpDate: string;
  createdBy: string;
  followUps: any[];
}

@Component({
  templateUrl: './tutoring.component.html',
  styleUrl: './tutoring.component.css',
    selector: 'app-tutoring',
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class TutoringComponent implements OnInit {
  tab = 'list';
  courses: Course[] = [];
  periods: AcademicPeriod[] = [];
  students: Student[] = [];
  teachers: Teacher[] = [];
  sessions: TutoringSession[] = [];
  stats: any = null;

  filterCourseId: number | null = null;
  filterPeriodId: number | null = null;
  formCourseId: number | null = null;
  formStudentId: number | null = null;
  formPeriodId: number | null = null;
  formTeacherId: number | null = null;
  formDate = '';
  formTime = '08:00';
  formDuration = 30;
  formType = 'ACADEMICA';
  formTopic = '';
  formDescription = '';
  formRecommendations = '';
  formFollowUpRequired = false;

  message = '';
  messageIsError = false;

  constructor(private http: HttpClient, private auth: AuthService) {}

  ngOnInit() {
    this.http.get<Course[]>(`${API_URL}/academic/courses`).subscribe({ next: d => this.courses = d });
    this.http.get<AcademicPeriod[]>(`${API_URL}/academic/catalogs/academic-years`).subscribe({ next: d => this.periods = d as any });
    this.http.get<Teacher[]>(`${API_URL}/academic/teachers`).subscribe({ next: d => this.teachers = d });
    this.formDate = new Date().toISOString().split('T')[0];
  }

  private showMsg(msg: string, err = false) {
    this.message = msg;
    this.messageIsError = err;
    setTimeout(() => this.message = '', 4000);
  }

  loadSessions() {
    if (!this.filterCourseId || !this.filterPeriodId) { this.sessions = []; return; }
    this.http.get<TutoringSession[]>(`${API_URL}/tutoring/sessions/course/${this.filterCourseId}/period/${this.filterPeriodId}`)
      .subscribe({ next: d => this.sessions = d, error: () => this.showMsg('Error al cargar sesiones', true) });
    this.http.get(`${API_URL}/tutoring/stats/course/${this.filterCourseId}/period/${this.filterPeriodId}`)
      .subscribe({ next: d => this.stats = d, error: () => {} });
  }

  loadStudents() {
    if (!this.formCourseId) { this.students = []; return; }
    this.http.get<Student[]>(`${API_URL}/academic/students`, { params: { courseId: this.formCourseId } })
      .subscribe({ next: d => this.students = d });
  }

  createSession() {
    if (!this.formStudentId || !this.formCourseId || !this.formPeriodId || !this.formTeacherId) return;
    const instId = this.auth.institutionId() || 1;
    this.http.post(`${API_URL}/tutoring/sessions`, {
      studentId: this.formStudentId,
      courseId: this.formCourseId,
      academicPeriodId: this.formPeriodId,
      institutionId: instId,
      teacherId: this.formTeacherId,
      sessionDate: this.formDate,
      sessionTime: this.formTime,
      durationMinutes: this.formDuration,
      sessionType: this.formType,
      topic: this.formTopic,
      description: this.formDescription,
      recommendations: this.formRecommendations,
      followUpRequired: this.formFollowUpRequired
    }).subscribe({
      next: () => { this.showMsg('Sesion creada'); this.tab = 'list'; this.loadSessions(); },
      error: () => this.showMsg('Error al crear sesion', true)
    });
  }

  updateStatus(id: number, status: string) {
    this.http.put(`${API_URL}/tutoring/sessions/${id}/status`, null, { params: { status } })
      .subscribe({
        next: () => { this.showMsg('Estado actualizado'); this.loadSessions(); },
        error: () => this.showMsg('Error al actualizar', true)
      });
  }

  typeLabel(type: string): string {
    const labels: Record<string, string> = { ACADEMICA: 'Academica', CONDUCTUAL: 'Conductual', ORIENTACION: 'Orientacion', FAMILIAR: 'Familiar', OTRO: 'Otro' };
    return labels[type] || type;
  }

  statusLabel(status: string): string {
    const labels: Record<string, string> = { PROGRAMADA: 'Programada', REALIZADA: 'Realizada', CANCELADA: 'Cancelada', REPROGRAMADA: 'Reprogramada' };
    return labels[status] || status;
  }
}
