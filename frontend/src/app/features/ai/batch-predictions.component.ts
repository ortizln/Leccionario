import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../core/api.config';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-batch-predictions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h5 class="mb-0"><i class="bi bi-lightning me-2"></i>Predicciones Masivas</h5>
      <div class="d-flex gap-2">
        <button class="btn btn-sm btn-outline-warning" (click)="runBulkAnalysis()" [disabled]="running">
          <i class="bi bi-lightning me-1" [class.bi-arrow-clockwise]="running" [class.spinner-border.spinner-border-sm]="running"></i>
          {{ running ? 'Analizando...' : 'Analisis Masivo' }}
        </button>
        <button class="btn btn-sm btn-outline-primary" (click)="load()"><i class="bi bi-arrow-clockwise me-1"></i>Actualizar</button>
      </div>
    </div>

    <div class="row g-3 mb-4">
      <div class="col-md-3">
        <div class="card border-0 shadow-sm bg-primary text-white text-center">
          <div class="card-body py-3"><div class="fs-3 fw-bold">{{ stats.totalStudents || 0 }}</div><div class="small">Estudiantes</div></div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card border-0 shadow-sm bg-danger text-white text-center">
          <div class="card-body py-3"><div class="fs-3 fw-bold">{{ stats.highRiskStudents || 0 }}</div><div class="small">Alto Riesgo</div></div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card border-0 shadow-sm bg-warning text-dark text-center">
          <div class="card-body py-3"><div class="fs-3 fw-bold">{{ stats.activeAnomalies || 0 }}</div><div class="small">Anomalias</div></div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card border-0 shadow-sm bg-info text-white text-center">
          <div class="card-body py-3"><div class="fs-3 fw-bold">{{ stats.pendingRecommendations || 0 }}</div><div class="small">Recomendaciones</div></div>
        </div>
      </div>
    </div>

    <ul class="nav nav-tabs mb-3">
      <li class="nav-item"><a class="nav-link" [class.active]="tab==='results'" (click)="tab='results'" role="button">Resultados</a></li>
      <li class="nav-item"><a class="nav-link" [class.active]="tab==='high-risk'" (click)="tab='high-risk'" role="button">Alto Riesgo</a></li>
      <li class="nav-item"><a class="nav-link" [class.active]="tab==='anomalies'" (click)="tab='anomalies'" role="button">Anomalias</a></li>
      <li class="nav-item"><a class="nav-link" [class.active]="tab==='predictions'" (click)="tab='predictions'" role="button">Predicciones</a></li>
    </ul>

    @if (tab === 'results') {
      <div class="card border-0 shadow-sm">
        <div class="card-header bg-white"><h6 class="mb-0">Ultimos Analisis</h6></div>
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table table-sm mb-0">
              <thead class="table-light">
                <tr><th>Estudiante</th><th>Riesgo Acad.</th><th>Riesgo Asist.</th><th>Conducta</th><th>Engagement</th><th>Estilo</th><th></th></tr>
              </thead>
              <tbody>
                <tr *ngFor="let p of profiles">
                  <td>#{{ p.studentId }}</td>
                  <td><span class="badge" [class.bg-danger]="p.academicRisk>0.6" [class.bg-warning]="p.academicRisk>0.3" [class.bg-success]="p.academicRisk<=0.3">{{ (p.academicRisk*100)|number:'1.0-0' }}%</span></td>
                  <td><span class="badge" [class.bg-danger]="p.attendanceRisk>0.5" [class.bg-warning]="p.attendanceRisk>0.2" [class.bg-success]="p.attendanceRisk<=0.2">{{ (p.attendanceRisk*100)|number:'1.0-0' }}%</span></td>
                  <td><span class="badge bg-info">{{ (p.behaviorScore*100)|number:'1.0-0' }}%</span></td>
                  <td>
                    <div class="progress" style="height:6px">
                      <div class="progress-bar" [class.bg-danger]="p.engagementScore<0.4" [class.bg-warning]="p.engagementScore<0.7" [class.bg-success]="p.engagementScore>=0.7" [style.width.%]="p.engagementScore*100"></div>
                    </div>
                    <small>{{ (p.engagementScore*100)|number:'1.0-0' }}%</small>
                  </td>
                  <td><span class="badge bg-secondary">{{ p.learningStyle }}</span></td>
                  <td><button class="btn btn-sm btn-outline-primary" (click)="viewDetail(p)"><i class="bi bi-eye"></i></button></td>
                </tr>
                <tr *ngIf="profiles.length===0"><td colspan="7" class="text-center text-muted py-3">Sin resultados de analisis</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    }

    @if (tab === 'high-risk') {
      <div class="card border-0 shadow-sm">
        <div class="card-header bg-white"><h6 class="mb-0"><i class="bi bi-exclamation-triangle text-danger me-2"></i>Estudiantes en Alto Riesgo</h6></div>
        <div class="card-body p-0">
          <div class="list-group list-group-flush">
            <div class="list-group-item" *ngFor="let p of highRiskProfiles">
              <div class="d-flex justify-content-between align-items-center">
                <div>
                  <strong>Estudiante #{{ p.studentId }}</strong>
                  <span class="badge bg-danger ms-2">Riesgo {{ (p.academicRisk*100)|number:'1.0-0' }}%</span>
                </div>
                <div class="d-flex gap-2">
                  <span class="badge bg-info">{{ p.learningStyle }}</span>
                  <button class="btn btn-sm btn-outline-primary" (click)="viewDetail(p)"><i class="bi bi-eye"></i></button>
                </div>
              </div>
              <p class="mb-0 small text-muted mt-1">{{ p.weaknesses || 'Sin datos' }}</p>
            </div>
            <div *ngIf="highRiskCount()===0" class="text-center text-muted py-3">No hay estudiantes en alto riesgo</div>
          </div>
        </div>
      </div>
    }

    @if (tab === 'anomalies') {
      <div class="card border-0 shadow-sm">
        <div class="card-header bg-white"><h6 class="mb-0"><i class="bi bi-bug me-2"></i>Anomalias Detectadas</h6></div>
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table table-sm mb-0">
              <thead class="table-light">
                <tr><th>Tipo</th><th>Entidad</th><th>Descripcion</th><th>Severidad</th><th>Estado</th><th></th></tr>
              </thead>
              <tbody>
                <tr *ngFor="let a of anomalies">
                  <td><span class="badge bg-secondary">{{ a.anomalyType }}</span></td>
                  <td>{{ a.entityType }} #{{ a.entityId }}</td>
                  <td class="small">{{ a.description }}</td>
                  <td><span class="badge" [class.bg-danger]="a.severity==='CRITICA'||a.severity==='CRITICAL'" [class.bg-warning]="a.severity==='ALTA'||a.severity==='HIGH'" [class.bg-info]="a.severity==='MEDIA'||a.severity==='MEDIUM'">{{ a.severity }}</span></td>
                  <td><span class="badge" [class.bg-warning]="a.status==='DETECTADA'||a.status==='DETECTED'" [class.bg-success]="a.status==='RESUELTA'||a.status==='RESOLVED'">{{ a.status }}</span></td>
                  <td><button class="btn btn-sm btn-outline-success" *ngIf="a.status!=='RESUELTA'&&a.status!=='RESOLVED'" (click)="resolveAnomaly(a.id)"><i class="bi bi-check-circle"></i></button></td>
                </tr>
                <tr *ngIf="anomalies.length===0"><td colspan="6" class="text-center text-muted py-3">Sin anomalias</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    }

    @if (tab === 'predictions') {
      <div class="card border-0 shadow-sm">
        <div class="card-header bg-white"><h6 class="mb-0"><i class="bi bi-graph-up me-2"></i>Historial de Predicciones</h6></div>
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table table-sm mb-0">
              <thead class="table-light">
                <tr><th>Estudiante</th><th>Tipo</th><th>Valor Predicho</th><th>Confianza</th><th>Fecha</th></tr>
              </thead>
              <tbody>
                <tr *ngFor="let p of predictions">
                  <td>#{{ p.studentId }}</td>
                  <td><span class="badge bg-info">{{ p.predictionType }}</span></td>
                  <td>{{ p.predictedValue }}</td>
                  <td>
                    <div class="d-flex align-items-center gap-2">
                      <div class="progress flex-grow-1" style="height:6px">
                        <div class="progress-bar" [class.bg-success]="p.confidenceScore>=0.7" [class.bg-warning]="p.confidenceScore>=0.4" [class.bg-danger]="p.confidenceScore<0.4" [style.width.%]="p.confidenceScore*100"></div>
                      </div>
                      <small>{{ (p.confidenceScore*100)|number:'1.0-0' }}%</small>
                    </div>
                  </td>
                  <td class="small text-muted">{{ p.createdAt | date:'dd/MM/yyyy HH:mm' }}</td>
                </tr>
                <tr *ngIf="predictions.length===0"><td colspan="5" class="text-center text-muted py-3">Sin predicciones</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    }

    @if (selectedProfile) {
      <div class="modal d-block" tabindex="-1" style="background:rgba(0,0,0,0.5)">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header"><h6 class="modal-title">Detalle Estudiante #{{ selectedProfile.studentId }}</h6></div>
            <div class="modal-body">
              <div class="row g-3">
                <div class="col-6">
                  <div class="small text-muted">Riesgo Academico</div>
                  <div class="progress mb-1" style="height:8px"><div class="progress-bar bg-danger" [style.width.%]="selectedProfile.academicRisk*100"></div></div>
                  <small>{{ (selectedProfile.academicRisk*100)|number:'1.0-0' }}%</small>
                </div>
                <div class="col-6">
                  <div class="small text-muted">Riesgo Asistencia</div>
                  <div class="progress mb-1" style="height:8px"><div class="progress-bar bg-warning" [style.width.%]="selectedProfile.attendanceRisk*100"></div></div>
                  <small>{{ (selectedProfile.attendanceRisk*100)|number:'1.0-0' }}%</small>
                </div>
                <div class="col-6">
                  <div class="small text-muted">Engagement</div>
                  <div class="progress mb-1" style="height:8px"><div class="progress-bar bg-success" [style.width.%]="selectedProfile.engagementScore*100"></div></div>
                  <small>{{ (selectedProfile.engagementScore*100)|number:'1.0-0' }}%</small>
                </div>
                <div class="col-6">
                  <div class="small text-muted">Estilo</div>
                  <span class="badge bg-info fs-6">{{ selectedProfile.learningStyle }}</span>
                </div>
                <div class="col-12"><div class="small text-muted">Fortalezas</div><p class="small">{{ selectedProfile.strengths || 'No evaluado' }}</p></div>
                <div class="col-12"><div class="small text-muted">Debilidades</div><p class="small">{{ selectedProfile.weaknesses || 'No evaluado' }}</p></div>
                <div class="col-12"><div class="small text-muted">Recomendaciones</div><p class="small">{{ selectedProfile.recommendations || 'Sin recomendaciones' }}</p></div>
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn btn-sm btn-secondary" (click)="selectedProfile=null">Cerrar</button>
            </div>
          </div>
        </div>
      </div>
    }
  `
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
