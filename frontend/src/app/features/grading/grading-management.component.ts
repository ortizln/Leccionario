import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../core/api.config';
import { AuthService } from '../../core/auth.service';

interface GradeScale {
  id?: number;
  name: string;
  scaleType: string;
  minValue: number;
  maxValue: number;
  passValue: number;
  isDefault: boolean;
  active: boolean;
}

interface EvaluationType {
  id?: number;
  name: string;
  code: string;
  description: string;
  weightPct: number;
  active: boolean;
}

interface Course { id: number; name: string; }
interface Subject { id: number; name: string; }
interface AcademicPeriod { id: number; name: string; }

@Component({
  templateUrl: './grading-management.component.html',
  styleUrl: './grading-management.component.css',
    selector: 'app-grading-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class GradingManagementComponent implements OnInit, AfterViewInit {
  tab = 'dashboard';
  scales: GradeScale[] = [];
  evalTypes: EvaluationType[] = [];
  courses: Course[] = [];
  subjects: Subject[] = [];
  periods: AcademicPeriod[] = [];
  gridData: any = null;
  gridCourseId: number | null = null;
  gridSubjectId: number | null = null;
  gridPeriodId: number | null = null;

  showScaleForm = false;
  showTypeForm = false;
  scaleForm: GradeScale = { name: '', scaleType: 'NUMERIC_10', minValue: 0, maxValue: 10, passValue: 7, isDefault: false, active: true };
  typeForm: EvaluationType = { name: '', code: '', description: '', weightPct: 100, active: true };

  dashboard: any = null;
  dashboardPeriodId: number | null = null;
  loadingDashboard = false;

  message = '';
  messageIsError = false;

  constructor(private http: HttpClient, private auth: AuthService) {}

  ngOnInit() {
    this.loadScales();
    this.loadTypes();
    this.loadCourses();
    this.loadPeriods();
  }

  ngAfterViewInit() {
    // Auto-select first period for dashboard if available
    setTimeout(() => {
      if (this.periods.length > 0 && !this.dashboardPeriodId) {
        this.dashboardPeriodId = this.periods[this.periods.length - 1].id;
        this.loadDashboard();
      }
    }, 500);
  }

  private showMsg(msg: string, err = false) {
    this.message = msg;
    this.messageIsError = err;
    setTimeout(() => this.message = '', 4000);
  }

  loadScales() {
    const instId = this.auth.institutionId() || 1;
    this.http.get<GradeScale[]>(`${API_URL}/grading/scales`, { params: { institutionId: instId } })
      .subscribe({ next: d => this.scales = d, error: () => this.showMsg('Error al cargar escalas', true) });
  }

  loadTypes() {
    const instId = this.auth.institutionId() || 1;
    this.http.get<EvaluationType[]>(`${API_URL}/grading/types`, { params: { institutionId: instId } })
      .subscribe({ next: d => this.evalTypes = d, error: () => this.showMsg('Error al cargar tipos', true) });
  }

  loadCourses() {
    this.http.get<Course[]>(`${API_URL}/academic/courses`)
      .subscribe({ next: d => this.courses = d, error: () => {} });
  }

  loadPeriods() {
    this.http.get<AcademicPeriod[]>(`${API_URL}/academic/catalogs/academic-years`)
      .subscribe({ next: d => this.periods = d as any, error: () => {} });
  }

  loadSubjectsForCourse() {
    if (!this.gridCourseId) { this.subjects = []; return; }
    this.http.get<Subject[]>(`${API_URL}/academic/subjects`)
      .subscribe({ next: d => this.subjects = d, error: () => {} });
  }

  loadGrid() {
    if (!this.gridCourseId || !this.gridSubjectId || !this.gridPeriodId) return;
    this.http.get(`${API_URL}/grading/grid`, { params: {
      courseId: this.gridCourseId, subjectId: this.gridSubjectId, periodId: this.gridPeriodId
    }}).subscribe({ next: d => this.gridData = d, error: () => this.showMsg('Error al cargar grilla', true) });
  }

  resetScaleForm() {
    this.scaleForm = { name: '', scaleType: 'NUMERIC_10', minValue: 0, maxValue: 10, passValue: 7, isDefault: false, active: true };
  }

  resetTypeForm() {
    this.typeForm = { name: '', code: '', description: '', weightPct: 100, active: true };
  }

  saveScale() {
    const instId = this.auth.institutionId() || 1;
    this.http.post(`${API_URL}/grading/scales`, this.scaleForm, { params: { institutionId: instId } })
      .subscribe({ next: () => { this.showScaleForm = false; this.loadScales(); this.showMsg('Escala guardada'); },
                   error: () => this.showMsg('Error al guardar escala', true) });
  }

  saveType() {
    const instId = this.auth.institutionId() || 1;
    this.http.post(`${API_URL}/grading/types`, this.typeForm, { params: { institutionId: instId } })
      .subscribe({ next: () => { this.showTypeForm = false; this.loadTypes(); this.showMsg('Tipo guardado'); },
                   error: () => this.showMsg('Error al guardar tipo', true) });
  }

  deleteScale(id: number) {
    if (!confirm('Eliminar esta escala?')) return;
    const instId = this.auth.institutionId() || 1;
    this.http.delete(`${API_URL}/grading/scales/${id}`, { params: { institutionId: instId } })
      .subscribe({ next: () => { this.loadScales(); this.showMsg('Escala eliminada'); },
                   error: () => this.showMsg('Error al eliminar', true) });
  }

  deleteType(id: number) {
    if (!confirm('Eliminar este tipo?')) return;
    const instId = this.auth.institutionId() || 1;
    this.http.delete(`${API_URL}/grading/types/${id}`, { params: { institutionId: instId } })
      .subscribe({ next: () => { this.loadTypes(); this.showMsg('Tipo eliminado'); },
                   error: () => this.showMsg('Error al eliminar', true) });
  }

  onCellChange(studentId: number, evaluationId: number, score: number) {
    this.http.post(`${API_URL}/grading/grades`, { evaluationId, studentId, score })
      .subscribe({ next: () => this.showMsg('Calificacion guardada'),
                   error: () => this.showMsg('Error al guardar calificacion', true) });
  }

  loadDashboard() {
    if (!this.dashboardPeriodId) return;
    this.loadingDashboard = true;
    this.http.get(`${API_URL}/grading/dashboard`, { params: { periodId: this.dashboardPeriodId } })
      .subscribe({
        next: d => { this.dashboard = d; this.loadingDashboard = false; },
        error: () => { this.showMsg('Error al cargar dashboard', true); this.loadingDashboard = false; }
      });
  }

  getBarWidth(count: number): number {
    if (!this.dashboard || !this.dashboard.distribution) return 0;
    const max = Math.max(...this.dashboard.distribution.map((b: any) => b.count), 1);
    return (count / max) * 100;
  }

  getBarColor(range: string): string {
    const colors: Record<string, string> = {
      '0-3.99': '#e74c3c',
      '4-5.99': '#e67e22',
      '6-6.99': '#f1c40f',
      '7-7.99': '#2ecc71',
      '8-8.99': '#27ae60',
      '9-10': '#1a7a3a'
    };
    return colors[range] || '#999';
  }
}
