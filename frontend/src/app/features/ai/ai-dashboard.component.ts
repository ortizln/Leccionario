import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../core/api.config';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-ai-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h5 class="mb-0"><i class="bi bi-robot me-2"></i>Inteligencia Artificial</h5>
      <div class="d-flex gap-2">
        <button class="btn btn-sm btn-outline-warning" (click)="bulkAnalyze()" title="Analizar todos"><i class="bi bi-lightning me-1"></i>Analisis Masivo</button>
        <button class="btn btn-sm btn-outline-primary" (click)="showAnalyzeModal=true"><i class="bi bi-search me-1"></i>Analizar Estudiante</button>
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
      <li class="nav-item"><a class="nav-link" [class.active]="tab==='profiles'" (click)="tab='profiles'" role="button">Perfiles</a></li>
      <li class="nav-item"><a class="nav-link" [class.active]="tab==='anomalies'" (click)="tab='anomalies'" role="button">Anomalias</a></li>
      <li class="nav-item"><a class="nav-link" [class.active]="tab==='recommendations'" (click)="tab='recommendations'" role="button">Recomendaciones</a></li>
      <li class="nav-item"><a class="nav-link" [class.active]="tab==='models'" (click)="tab='models'" role="button">Modelos</a></li>
    </ul>

    @if (tab === 'profiles') {
      <div class="card border-0 shadow-sm">
        <div class="card-header bg-white"><h6 class="mb-0">Estudiantes en Riesgo</h6></div>
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table table-sm mb-0">
              <thead class="table-light"><tr><th>Estudiante</th><th>Riesgo Academico</th><th>Riesgo Asistencia</th><th>Conducta</th><th>Estilo</th><th></th></tr></thead>
              <tbody>
                <tr *ngFor="let p of profiles">
                  <td>{{ p.studentId }}</td>
                  <td><span class="badge" [class.bg-danger]="p.academicRisk>0.6" [class.bg-warning]="p.academicRisk>0.3">{{ (p.academicRisk*100)|number:'1.0-0' }}%</span></td>
                  <td><span class="badge" [class.bg-danger]="p.attendanceRisk>0.5" [class.bg-warning]="p.attendanceRisk>0.2">{{ (p.attendanceRisk*100)|number:'1.0-0' }}%</span></td>
                  <td><span class="badge bg-success">{{ (p.behaviorScore*100)|number:'1.0-0' }}%</span></td>
                  <td><span class="badge bg-info">{{ p.learningStyle }}</span></td>
                  <td><button class="btn btn-sm btn-outline-primary" (click)="analyzeStudent(p.studentId)"><i class="bi bi-arrow-clockwise"></i></button></td>
                </tr>
                <tr *ngIf="profiles.length===0"><td colspan="6" class="text-center text-muted py-3">Sin estudiantes en riesgo</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    }

    @if (tab === 'anomalies') {
      <div class="card border-0 shadow-sm">
        <div class="card-header bg-white"><h6 class="mb-0">Anomalias Detectadas</h6></div>
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table table-sm mb-0">
              <thead class="table-light"><tr><th>Tipo</th><th>Entidad</th><th>Descripcion</th><th>Severidad</th><th>Estado</th><th></th></tr></thead>
              <tbody>
                <tr *ngFor="let a of anomalies">
                  <td><span class="badge bg-secondary">{{ a.anomalyType }}</span></td>
                  <td>{{ a.entityType }} #{{ a.entityId }}</td>
                  <td>{{ a.description }}</td>
                  <td><span class="badge" [class.bg-danger]="a.severity==='CRITICA'" [class.bg-warning]="a.severity==='ALTA'" [class.bg-info]="a.severity==='MEDIA'" [class.bg-secondary]="a.severity==='BAJA'">{{ a.severity }}</span></td>
                  <td><span class="badge" [class.bg-warning]="a.status==='DETECTADA'" [class.bg-info]="a.status==='INVESTIGANDO'" [class.bg-success]="a.status==='RESUELTA'">{{ a.status }}</span></td>
                  <td><button class="btn btn-sm btn-outline-success" *ngIf="a.status!=='RESUELTA'" (click)="resolveAnomaly(a.id)"><i class="bi bi-check-circle"></i></button></td>
                </tr>
                <tr *ngIf="anomalies.length===0"><td colspan="6" class="text-center text-muted py-3">Sin anomalias</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    }

    @if (tab === 'recommendations') {
      <div class="card border-0 shadow-sm">
        <div class="card-header bg-white"><h6 class="mb-0">Recomendaciones IA</h6></div>
        <div class="card-body p-0">
          <div class="list-group list-group-flush">
            <div class="list-group-item" *ngFor="let r of recommendations">
              <div class="d-flex justify-content-between">
                <h6 class="mb-0">{{ r.title }}</h6>
                <span class="badge" [class.bg-danger]="r.priority==='URGENTE'" [class.bg-warning]="r.priority==='ALTA'" [class.bg-info]="r.priority==='NORMAL'">{{ r.priority }}</span>
              </div>
              <p class="mb-1 small text-muted">{{ r.description }}</p>
              <div class="d-flex gap-2">
                <span class="badge bg-secondary">{{ r.category }}</span>
                <span class="badge" [class.bg-warning]="r.status==='PENDIENTE'" [class.bg-success]="r.status==='APLICADA'">{{ r.status }}</span>
                <button class="btn btn-sm btn-outline-success ms-auto" *ngIf="r.status==='PENDIENTE'" (click)="applyRecommendation(r.id)"><i class="bi bi-check2"></i> Aplicar</button>
                <button class="btn btn-sm btn-outline-secondary ms-1" *ngIf="r.status==='PENDIENTE'" (click)="dismissRecommendation(r.id)"><i class="bi bi-x-lg"></i></button>
              </div>
            </div>
            <div *ngIf="recommendations.length===0" class="text-center text-muted py-3">Sin recomendaciones</div>
          </div>
        </div>
      </div>
    }

    @if (tab === 'models') {
      <div class="card border-0 shadow-sm">
        <div class="card-header bg-white"><h6 class="mb-0">Modelos IA</h6></div>
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table table-sm mb-0">
              <thead class="table-light"><tr><th>Nombre</th><th>Tipo</th><th>Version</th><th>Precision</th><th>Estado</th></tr></thead>
              <tbody>
                <tr *ngFor="let m of models">
                  <td>{{ m.name }}</td>
                  <td><span class="badge bg-info">{{ m.modelType }}</span></td>
                  <td>{{ m.version }}</td>
                  <td>{{ m.accuracy ? (m.accuracy*100|number:'1.1-1')+'%' : 'N/A' }}</td>
                  <td><span class="badge" [class.bg-success]="m.status==='ACTIVO'" [class.bg-secondary]="m.status==='INACTIVO'">{{ m.status }}</span></td>
                </tr>
                <tr *ngIf="models.length===0"><td colspan="5" class="text-center text-muted py-3">Sin modelos</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    }

    <div class="modal d-block" *ngIf="showAnalyzeModal" tabindex="-1" style="background:rgba(0,0,0,0.5)">
      <div class="modal-dialog modal-sm">
        <div class="modal-content">
          <div class="modal-header"><h6 class="modal-title">Analizar Estudiante</h6></div>
          <div class="modal-body">
            <label class="form-label small">ID Estudiante *</label>
            <input type="number" class="form-control form-control-sm" [(ngModel)]="analyzeStudentId">
          </div>
          <div class="modal-footer">
            <button class="btn btn-sm btn-secondary" (click)="showAnalyzeModal=false">Cancelar</button>
            <button class="btn btn-sm btn-primary" (click)="analyzeStudent(analyzeStudentId)">Analizar</button>
          </div>
        </div>
      </div>
    </div>
  `
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
