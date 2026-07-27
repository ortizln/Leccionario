import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../core/api.config';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-ai-recommendations',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h5 class="mb-0"><i class="bi bi-lightbulb me-2"></i>Recomendaciones IA</h5>
      <div>
        <span class="badge bg-warning text-dark me-1">{{ stats.pending || 0 }} pendientes</span>
        <span class="badge bg-success">{{ stats.applied || 0 }} aplicadas</span>
      </div>
    </div>

    <div class="card border-0 shadow-sm">
      <div class="card-body">
        <div class="table-responsive">
          <table class="table table-sm mb-0">
            <thead class="table-light"><tr><th>Tipo</th><th>Estudiante</th><th>Descripcion</th><th>Prioridad</th><th>Estado</th><th></th></tr></thead>
            <tbody>
              <tr *ngFor="let r of recommendations">
                <td><span class="badge bg-info">{{ r.recommendationType }}</span></td>
                <td>{{ r.studentId }}</td>
                <td>{{ r.description | slice:0:80 }}</td>
                <td><span class="badge" [ngClass]="{'bg-danger': r.priority==='ALTA','bg-warning text-dark': r.priority==='MEDIA','bg-secondary': r.priority==='BAJA'}">{{ r.priority }}</span></td>
                <td><span class="badge" [ngClass]="{'bg-secondary': r.status==='PENDIENTE','bg-success': r.status==='APLICADA','bg-dark': r.status==='DESCARTADA'}">{{ r.status }}</span></td>
                <td>
                  <button *ngIf="r.status==='PENDIENTE'" class="btn btn-outline-success btn-sm me-1" (click)="apply(r.id!)"><i class="bi bi-check"></i></button>
                  <button *ngIf="r.status==='PENDIENTE'" class="btn btn-outline-secondary btn-sm" (click)="dismiss(r.id!)"><i class="bi bi-x"></i></button>
                </td>
              </tr>
              <tr *ngIf="!recommendations.length"><td colspan="6" class="text-center text-muted">Sin recomendaciones</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class AiRecommendationsComponent implements OnInit {
  recommendations: any[] = [];
  stats: any = {};
  constructor(private http: HttpClient, private auth: AuthService) {}
  ngOnInit() { this.load(); }
  private get instId(): number { return this.auth.institutionId() || 1; }

  load() {
    this.http.get<any[]>(`${API_URL}/ai/recommendations?institutionId=${this.instId}`).subscribe(r => this.recommendations = r);
    this.http.get<any>(`${API_URL}/ai/recommendations/stats?institutionId=${this.instId}`).subscribe(r => this.stats = r);
  }
  apply(id: number) {
    this.http.post(`${API_URL}/ai/recommendations/${id}/apply`, {}).subscribe(() => this.load());
  }
  dismiss(id: number) {
    this.http.post(`${API_URL}/ai/recommendations/${id}/dismiss`, {}).subscribe(() => this.load());
  }
}
