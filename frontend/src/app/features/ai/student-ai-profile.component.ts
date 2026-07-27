import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../core/api.config';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-student-ai-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h5 class="mb-0"><i class="bi bi-person-badge me-2"></i>Perfil IA del Estudiante</h5>
    </div>

    <div class="card border-0 shadow-sm mb-4">
      <div class="card-body">
        <div class="row g-3">
          <div class="col-md-8">
            <label class="form-label small">ID Estudiante *</label>
            <input type="number" class="form-control form-control-sm" [(ngModel)]="studentId" placeholder="Ingrese ID del estudiante">
          </div>
          <div class="col-md-4 d-flex align-items-end gap-2">
            <button class="btn btn-sm btn-primary" (click)="analyze()">Analizar</button>
            <button class="btn btn-sm btn-outline-secondary" (click)="loadProfile()">Cargar Perfil</button>
          </div>
        </div>
      </div>
    </div>

    <div *ngIf="profile">
      <div class="row g-3 mb-4">
        <div class="col-md-3">
          <div class="card border-0 shadow-sm" [class.border-danger]="profile.academicRisk>0.6">
            <div class="card-body text-center">
              <div class="text-muted small">Riesgo Academico</div>
              <div class="fs-4 fw-bold" [class.text-danger]="profile.academicRisk>0.6" [class.text-warning]="profile.academicRisk>0.3" [class.text-success]="profile.academicRisk<=0.3">
                {{ (profile.academicRisk*100)|number:'1.0-0' }}%
              </div>
              <div class="progress mt-2" style="height:6px">
                <div class="progress-bar" [class.bg-danger]="profile.academicRisk>0.6" [class.bg-warning]="profile.academicRisk>0.3" [class.bg-success]="profile.academicRisk<=0.3" [style.width.%]="profile.academicRisk*100"></div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card border-0 shadow-sm" [class.border-danger]="profile.attendanceRisk>0.5">
            <div class="card-body text-center">
              <div class="text-muted small">Riesgo Asistencia</div>
              <div class="fs-4 fw-bold" [class.text-danger]="profile.attendanceRisk>0.5" [class.text-warning]="profile.attendanceRisk>0.2" [class.text-success]="profile.attendanceRisk<=0.2">
                {{ (profile.attendanceRisk*100)|number:'1.0-0' }}%
              </div>
              <div class="progress mt-2" style="height:6px">
                <div class="progress-bar" [class.bg-danger]="profile.attendanceRisk>0.5" [class.bg-warning]="profile.attendanceRisk>0.2" [class.bg-success]="profile.attendanceRisk<=0.2" [style.width.%]="profile.attendanceRisk*100"></div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card border-0 shadow-sm">
            <div class="card-body text-center">
              <div class="text-muted small">Puntaje Conducta</div>
              <div class="fs-4 fw-bold text-primary">{{ (profile.behaviorScore*100)|number:'1.0-0' }}%</div>
              <div class="progress mt-2" style="height:6px">
                <div class="progress-bar bg-primary" [style.width.%]="profile.behaviorScore*100"></div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card border-0 shadow-sm">
            <div class="card-body text-center">
              <div class="text-muted small">Participacion</div>
              <div class="fs-4 fw-bold text-info">{{ (profile.engagementScore*100)|number:'1.0-0' }}%</div>
              <div class="progress mt-2" style="height:6px">
                <div class="progress-bar bg-info" [style.width.%]="profile.engagementScore*100"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="row g-3">
        <div class="col-md-6">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-header bg-white"><h6 class="mb-0"><i class="bi bi-lightning me-2"></i>Fortalezas</h6></div>
            <div class="card-body">
              <p class="mb-0">{{ profile.strengths || 'No evaluado aun' }}</p>
            </div>
          </div>
        </div>
        <div class="col-md-6">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-header bg-white"><h6 class="mb-0"><i class="bi bi-exclamation-triangle me-2"></i>Debilidades</h6></div>
            <div class="card-body">
              <p class="mb-0">{{ profile.weaknesses || 'No evaluado aun' }}</p>
            </div>
          </div>
        </div>
        <div class="col-md-6">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-header bg-white"><h6 class="mb-0"><i class="bi bi-clipboard2-check me-2"></i>Recomendaciones IA</h6></div>
            <div class="card-body">
              <p class="mb-0">{{ profile.recommendations || 'Sin recomendaciones' }}</p>
            </div>
          </div>
        </div>
        <div class="col-md-6">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-header bg-white"><h6 class="mb-0"><i class="bi bi-book me-2"></i>Estilo de Aprendizaje</h6></div>
            <div class="card-body">
              <span class="badge bg-info fs-6">{{ profile.learningStyle || 'No determinado' }}</span>
              <p class="small text-muted mt-2 mb-0">Ultimo analisis: {{ profile.lastAnalyzed | date:'dd/MM/yyyy HH:mm' }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div *ngIf="!profile && searched" class="text-center py-5">
      <i class="bi bi-person-x fs-1 text-muted"></i>
      <p class="text-muted mt-2">No se encontro perfil para este estudiante</p>
    </div>
  `
})
export class StudentAiProfileComponent implements OnInit {
  studentId: number | null = null;
  profile: any = null;
  searched = false;

  constructor(private http: HttpClient, private auth: AuthService) {}
  ngOnInit() {}

  private get instId(): number { return this.auth.institutionId() || 1; }

  loadProfile() {
    if (!this.studentId) return;
    this.http.get<any>(`${API_URL}/ai/profiles/${this.studentId}?institutionId=${this.instId}`).subscribe({
      next: r => { this.profile = r; this.searched = true; },
      error: () => { this.profile = null; this.searched = true; }
    });
  }

  analyze() {
    if (!this.studentId) return;
    this.http.post<any>(`${API_URL}/ai/analyze/${this.studentId}?institutionId=${this.instId}`, {}).subscribe({
      next: r => { this.profile = r; this.searched = true; },
      error: e => alert(e.error?.message || 'Error')
    });
  }
}
