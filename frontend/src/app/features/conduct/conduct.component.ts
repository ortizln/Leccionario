import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../core/api.config';
import { AuthService } from '../../core/auth.service';

interface Course { id: number; name: string; }
interface AcademicPeriod { id: number; name: string; }
interface Student { id: number; firstName: string; lastName: string; enrollmentNumber: string; }

interface MeritCategory {
  id: number;
  name: string;
  description: string;
  meritPoints: number;
  active: boolean;
}

interface StudentMerit {
  id: number;
  studentId: number;
  studentName: string;
  enrollmentNumber: string;
  courseId: number;
  courseName: string;
  categoryId: number;
  categoryName: string;
  meritDate: string;
  points: number;
  description: string;
  registeredBy: string;
}

@Component({
  templateUrl: './conduct.component.html',
  styleUrl: './conduct.component.css',
    selector: 'app-conduct',
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class ConductComponent implements OnInit {
  tab = 'dashboard';
  courses: Course[] = [];
  periods: AcademicPeriod[] = [];
  students: Student[] = [];
  categories: MeritCategory[] = [];
  courseMerits: StudentMerit[] = [];
  studentMerits: StudentMerit[] = [];
  selectedStudent: Student | null = null;
  dashMeritStats: any = null;
  attendanceCount = 0;
  conductBalance = 0;

  dashCourseId: number | null = null;
  dashPeriodId: number | null = null;
  meritCourseId: number | null = null;
  meritPeriodId: number | null = null;
  meritStudentId: number | null = null;

  showMeritForm = false;
  showCatForm = false;
  meritFormCategoryId: number | null = null;
  meritFormDate = '';
  meritFormPoints = 1;
  meritFormDescription = '';
  catFormName = '';
  catFormDescription = '';
  catFormPoints = 1;

  message = '';
  messageIsError = false;

  constructor(private http: HttpClient, private auth: AuthService) {}

  ngOnInit() {
    this.http.get<Course[]>(`${API_URL}/academic/courses`).subscribe({ next: d => this.courses = d });
    this.http.get<AcademicPeriod[]>(`${API_URL}/academic/catalogs/academic-years`).subscribe({ next: d => this.periods = d as any });
    this.meritFormDate = new Date().toISOString().split('T')[0];
  }

  private showMsg(msg: string, err = false) {
    this.message = msg;
    this.messageIsError = err;
    setTimeout(() => this.message = '', 4000);
  }

  loadCategories() {
    const instId = this.auth.institutionId() || 1;
    this.http.get<MeritCategory[]>(`${API_URL}/conduct/merit-categories`, { params: { institutionId: instId } })
      .subscribe({ next: d => this.categories = d });
  }

  loadDashboard() {
    if (!this.dashCourseId || !this.dashPeriodId) return;
    this.http.get(`${API_URL}/conduct/merits/course/${this.dashCourseId}/period/${this.dashPeriodId}/stats`)
      .subscribe({ next: d => this.dashMeritStats = d, error: () => {} });
    this.http.get<any[]>(`${API_URL}/conduct/merits/course/${this.dashCourseId}/period/${this.dashPeriodId}`)
      .subscribe({ next: d => this.courseMerits = d, error: () => {} });
  }

  loadMeritData() {
    this.loadCategories();
    if (this.meritCourseId && this.meritPeriodId) this.loadStudents();
  }

  loadStudents() {
    if (!this.meritCourseId) { this.students = []; return; }
    this.http.get<Student[]>(`${API_URL}/academic/students`, { params: { courseId: this.meritCourseId } })
      .subscribe({ next: d => this.students = d });
  }

  registerMerit() {
    if (!this.meritStudentId || !this.meritPeriodId || !this.meritFormCategoryId) return;
    const instId = this.auth.institutionId() || 1;
    this.http.post(`${API_URL}/conduct/merits`, {
      studentId: this.meritStudentId,
      courseId: this.meritCourseId,
      academicPeriodId: this.meritPeriodId,
      categoryId: this.meritFormCategoryId,
      institutionId: instId,
      meritDate: this.meritFormDate,
      points: this.meritFormPoints,
      description: this.meritFormDescription
    }).subscribe({
      next: () => {
        this.showMeritForm = false;
        this.showMsg('Merito registrado');
        this.loadStudents();
      },
      error: () => this.showMsg('Error al registrar merito', true)
    });
  }

  createCategory() {
    const instId = this.auth.institutionId() || 1;
    this.http.post(`${API_URL}/conduct/merit-categories`, {
      name: this.catFormName,
      description: this.catFormDescription,
      meritPoints: this.catFormPoints
    }, { params: { institutionId: instId } }).subscribe({
      next: () => { this.showCatForm = false; this.loadCategories(); this.showMsg('Categoria creada'); },
      error: () => this.showMsg('Error al crear categoria', true)
    });
  }

  deleteCategory(id: number) {
    if (!confirm('Eliminar esta categoria?')) return;
    this.http.delete(`${API_URL}/conduct/merit-categories/${id}`).subscribe({
      next: () => { this.loadCategories(); this.showMsg('Categoria eliminada'); },
      error: () => this.showMsg('Error al eliminar', true)
    });
  }

  resetCatForm() {
    this.catFormName = '';
    this.catFormDescription = '';
    this.catFormPoints = 1;
  }
}
