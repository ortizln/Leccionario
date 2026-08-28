import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../core/api.config';
import { AuthService } from '../../core/auth.service';

@Component({
  templateUrl: './ai-dashboard.component.html',
  styleUrl: './ai-dashboard.component.css',
    selector: 'app-ai-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class AiDashboardComponent implements OnInit {
  tab = 'profiles';
  stats: any = {};
  profiles: any[] = [];
  anomalies: any[] = [];
  recommendations: any[] = [];
  models: any[] = [];
  showAnalyzeModal = false;
  analyzeStudentId: number | null = null;

  constructor(private http: HttpClient, private auth: AuthService) {}

  ngOnInit() { this.load(); }

  private get instId(): number { return this.auth.institutionId() || 1; }

  load() {
    this.http.get<any>(`${API_URL}/ai/stats?institutionId=${this.instId}`).subscribe({ next: r => this.stats = r, error: () => {} });
    this.http.get<any[]>(`${API_URL}/ai/profiles/high-risk?institutionId=${this.instId}`).subscribe({ next: r => this.profiles = r, error: () => {} });
    this.http.get<any[]>(`${API_URL}/ai/anomalies?institutionId=${this.instId}`).subscribe({ next: r => this.anomalies = r, error: () => {} });
    this.http.get<any[]>(`${API_URL}/ai/recommendations?institutionId=${this.instId}`).subscribe({ next: r => this.recommendations = r, error: () => {} });
    this.http.get<any[]>(`${API_URL}/ai/models?institutionId=${this.instId}`).subscribe({ next: r => this.models = r, error: () => {} });
  }

  analyzeStudent(studentId: number) {
    this.http.post<any>(`${API_URL}/ai/analyze/${studentId}?institutionId=${this.instId}`, {}).subscribe({
      next: () => { this.showAnalyzeModal = false; this.load(); },
      error: e => alert(e.error?.message || 'Error')
    });
  }

  resolveAnomaly(id: number) {
    this.http.post<any>(`${API_URL}/ai/anomalies/${id}/resolve`, { notes: 'Resuelto manualmente' }).subscribe({ next: () => this.load() });
  }

  applyRecommendation(id: number) {
    this.http.post<any>(`${API_URL}/ai/recommendations/${id}/apply`, {}).subscribe({ next: () => this.load() });
  }

  dismissRecommendation(id: number) {
    this.http.post<any>(`${API_URL}/ai/recommendations/${id}/dismiss`, {}).subscribe({ next: () => this.load() });
  }

  bulkAnalyze() {
    if (!confirm('Analizar todos los estudiantes? Esto puede tardar.')) return;
    this.http.post<any>(`${API_URL}/ai/analyze/bulk?institutionId=${this.instId}`, {}).subscribe({
      next: r => { alert(`Analisis completado: ${r.analyzed} de ${r.total} estudiantes`); this.load(); },
      error: e => alert(e.error?.message || 'Error')
    });
  }
}
