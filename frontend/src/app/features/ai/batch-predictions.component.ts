import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../core/api.config';
import { AuthService } from '../../core/auth.service';

@Component({
  templateUrl: './batch-predictions.component.html',
  styleUrl: './batch-predictions.component.css',
    selector: 'app-batch-predictions',
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class BatchPredictionsComponent implements OnInit {
  tab = 'results';
  stats: any = {};
  profiles: any[] = [];
  anomalies: any[] = [];
  predictions: any[] = [];
  selectedProfile: any = null;
  running = false;

  highRiskProfiles() { return this.profiles.filter((x: any) => x.academicRisk > 0.6); }
  highRiskCount() { return this.highRiskProfiles().length; }

  constructor(private http: HttpClient, private auth: AuthService) {}
  ngOnInit() { this.load(); }

  private get instId(): number { return this.auth.institutionId() || 1; }

  load() {
    this.http.get<any>(`${API_URL}/ai/stats?institutionId=${this.instId}`).subscribe({ next: r => this.stats = r, error: () => {} });
    this.http.get<any[]>(`${API_URL}/ai/profiles/high-risk?institutionId=${this.instId}`).subscribe({ next: r => this.profiles = r, error: () => {} });
    this.http.get<any[]>(`${API_URL}/ai/anomalies?institutionId=${this.instId}`).subscribe({ next: r => this.anomalies = r, error: () => {} });
    this.http.get<any[]>(`${API_URL}/ai/predictions/stats?institutionId=${this.instId}`).subscribe({ next: r => {
      this.predictions = Array.isArray(r) ? r : [];
    }, error: () => {} });
  }

  runBulkAnalysis() {
    if (!confirm('Ejecutar analisis masivo para todos los estudiantes?')) return;
    this.running = true;
    this.http.post<any>(`${API_URL}/ai/analyze/bulk?institutionId=${this.instId}`, {}).subscribe({
      next: r => { this.running = false; alert(`Completado: ${r.analyzed} de ${r.total}`); this.load(); },
      error: () => { this.running = false; alert('Error en el analisis'); }
    });
  }

  resolveAnomaly(id: number) {
    this.http.post<any>(`${API_URL}/ai/anomalies/${id}/resolve`, { notes: 'Resuelto desde analisis' }).subscribe({ next: () => this.load() });
  }

  viewDetail(p: any) { this.selectedProfile = p; }
}
