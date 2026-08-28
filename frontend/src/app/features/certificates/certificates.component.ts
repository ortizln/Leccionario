import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../core/api.config';
import { AuthService } from '../../core/auth.service';

interface CertificateTemplate {
  id: number;
  name: string;
  templateType: string;
  description: string;
  headerText: string;
  footerText: string;
  requiresGrades: boolean;
  requiresConduct: boolean;
  active: boolean;
}

interface CertificateDetail {
  id: number;
  subjectName: string;
  score: number;
  status: string;
  observation: string;
}

interface Certificate {
  id: number;
  templateId: number;
  templateName: string;
  templateType: string;
  studentId: number;
  studentName: string;
  enrollmentNumber: string;
  courseId: number;
  courseName: string;
  academicPeriodId: number;
  academicPeriodName: string;
  certificateNumber: string;
  status: string;
  issuedAt: string;
  issuedBy: string;
  validUntil: string;
  observations: string;
  headerText: string;
  footerText: string;
  details: CertificateDetail[];
  createdAt: string;
}

interface Course { id: number; name: string; }
interface AcademicPeriod { id: number; name: string; }
interface Student { id: number; firstName: string; lastName: string; enrollmentNumber: string; }

@Component({
  templateUrl: './certificates.component.html',
  styleUrl: './certificates.component.css',
    selector: 'app-certificates',
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class CertificatesComponent implements OnInit {
  tab = 'list';
  templates: CertificateTemplate[] = [];
  certificates: Certificate[] = [];
  courses: Course[] = [];
  periods: AcademicPeriod[] = [];
  students: Student[] = [];
  selectedCert: Certificate | null = null;
  stats: any = null;

  filterPeriodId: number | null = null;
  searchNumber = '';
  genTemplateId: number | null = null;
  genCourseId: number | null = null;
  genPeriodId: number | null = null;
  genStudentId: number | null = null;
  genObservations = '';

  message = '';
  messageIsError = false;

  constructor(private http: HttpClient, private auth: AuthService) {}

  ngOnInit() {
    const instId = this.auth.institutionId() || 1;
    this.http.get<Course[]>(`${API_URL}/academic/courses`).subscribe({ next: d => this.courses = d });
    this.http.get<AcademicPeriod[]>(`${API_URL}/academic/catalogs/academic-years`).subscribe({ next: d => this.periods = d as any });
    this.http.get<CertificateTemplate[]>(`${API_URL}/certificates/templates`, { params: { institutionId: instId } })
      .subscribe({ next: d => this.templates = d });
    this.loadStats();
  }

  private showMsg(msg: string, err = false) {
    this.message = msg;
    this.messageIsError = err;
    setTimeout(() => this.message = '', 4000);
  }

  loadCertificates() {
    let url = `${API_URL}/certificates`;
    if (this.filterPeriodId) {
      url = `${API_URL}/certificates/period/${this.filterPeriodId}`;
    }
    this.http.get<Certificate[]>(url).subscribe({
      next: d => this.certificates = d,
      error: () => this.showMsg('Error al cargar certificados', true)
    });
  }

  loadStats() {
    const instId = this.auth.institutionId() || 1;
    this.http.get(`${API_URL}/certificates/stats/${instId}`).subscribe({
      next: d => this.stats = d,
      error: () => {}
    });
  }

  loadStudents() {
    if (!this.genCourseId) { this.students = []; return; }
    this.http.get<Student[]>(`${API_URL}/academic/students`, { params: { courseId: this.genCourseId } })
      .subscribe({ next: d => this.students = d });
  }

  searchByNumber() {
    if (!this.searchNumber) return;
    this.http.get<Certificate>(`${API_URL}/certificates/number/${this.searchNumber}`).subscribe({
      next: d => { this.selectedCert = d; this.certificates = [d]; },
      error: () => this.showMsg('Certificado no encontrado', true)
    });
  }

  generateCertificate() {
    if (!this.genTemplateId || !this.genStudentId) return;
    const instId = this.auth.institutionId() || 1;
    this.http.post<Certificate>(`${API_URL}/certificates/generate`, {
      templateId: this.genTemplateId,
      studentId: this.genStudentId,
      courseId: this.genCourseId,
      academicPeriodId: this.genPeriodId,
      observations: this.genObservations
    }, { params: { institutionId: instId } }).subscribe({
      next: c => {
        this.selectedCert = c;
        this.showMsg('Certificado generado: ' + c.certificateNumber);
        this.tab = 'list';
        this.loadCertificates();
        this.loadStats();
      },
      error: () => this.showMsg('Error al generar certificado', true)
    });
  }

  viewCertificate(cert: Certificate) {
    this.http.get<Certificate>(`${API_URL}/certificates/${cert.id}`).subscribe({
      next: d => this.selectedCert = d,
      error: () => this.showMsg('Error al cargar certificado', true)
    });
  }

  issueCert() {
    if (!this.selectedCert) return;
    this.http.put<Certificate>(`${API_URL}/certificates/${this.selectedCert.id}/issue`, {}).subscribe({
      next: d => { this.selectedCert = d; this.showMsg('Certificado emitido'); this.loadCertificates(); this.loadStats(); },
      error: () => this.showMsg('Error al emitir', true)
    });
  }

  revokeCert() {
    if (!this.selectedCert || !confirm('Anular este certificado?')) return;
    this.http.put<Certificate>(`${API_URL}/certificates/${this.selectedCert.id}/revoke`, {}).subscribe({
      next: d => { this.selectedCert = d; this.showMsg('Certificado anulado'); this.loadCertificates(); this.loadStats(); },
      error: () => this.showMsg('Error al anular', true)
    });
  }

  downloadPdf() {
    if (!this.selectedCert) return;
    window.open(`${API_URL}/certificates/${this.selectedCert.id}/pdf`, '_blank');
  }

  statusLabel(s: string): string {
    const labels: Record<string, string> = { DRAFT: 'Borrador', ISSUED: 'Emitido', REVOKED: 'Anulado' };
    return labels[s] || s;
  }
}
