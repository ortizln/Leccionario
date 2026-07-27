import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../core/api.config';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-ai-learning-style',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h5 class="mb-0"><i class="bi bi-palette me-2"></i>Estilos de Aprendizaje IA</h5>
    </div>

    <div class="card border-0 shadow-sm mb-3">
      <div class="card-body">
        <div class="row g-2 align-items-end">
          <div class="col-md-3"><label class="form-label small">Estudiante ID</label><input type="number" class="form-control form-control-sm" [(ngModel)]="studentId"></div>
          <div class="col-md-2"><button class="btn btn-primary btn-sm w-100" (click)="loadStyle()"><i class="bi bi-search me-1"></i>Buscar</button></div>
        </div>
      </div>
    </div>

    <div *ngIf="style" class="row g-3 mb-4">
      <div class="col-md-3">
        <div class="card border-0 shadow-sm text-center bg-primary text-white">
          <div class="card-body py-3"><div class="fs-3 fw-bold">{{ style.visualScore | number:'1.0-0' }}%</div><div class="small">Visual</div></div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card border-0 shadow-sm text-center bg-success text-white">
          <div class="card-body py-3"><div class="fs-3 fw-bold">{{ style.auditoryScore | number:'1.0-0' }}%</div><div class="small">Auditivo</div></div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card border-0 shadow-sm text-center bg-warning text-dark">
          <div class="card-body py-3"><div class="fs-3 fw-bold">{{ style.kinestheticScore | number:'1.0-0' }}%</div><div class="small">Cinesico</div></div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card border-0 shadow-sm text-center bg-info text-white">
          <div class="card-body py-3"><div class="fs-3 fw-bold">{{ style.readingScore | number:'1.0-0' }}%</div><div class="small">Lectura/Escritura</div></div>
        </div>
      </div>
    </div>

    <div *ngIf="style" class="card border-0 shadow-sm">
      <div class="card-body">
        <h6>Estilo Dominante: <span class="badge bg-primary">{{ style.dominantStyle }}</span></h6>
        <p class="text-muted small">Evaluaciones realizadas: {{ style.assessmentCount }}</p>
        <p *ngIf="style.observations">{{ style.observations }}</p>
      </div>
    </div>

    <div class="modal fade show d-block" *ngIf="showForm" tabindex="-1" style="background:rgba(0,0,0,0.5)">
      <div class="modal-dialog"><div class="modal-content">
        <div class="modal-header"><h6 class="modal-title">Registrar Estilo</h6><button class="btn-close" (click)="showForm=false"></button></div>
        <div class="modal-body">
          <div class="mb-2"><label class="form-label small">Estudiante ID</label><input type="number" class="form-control form-control-sm" [(ngModel)]="form.studentId"></div>
          <div class="mb-2"><label class="form-label small">Visual (0-100)</label><input type="number" class="form-control form-control-sm" [(ngModel)]="form.visualScore"></div>
          <div class="mb-2"><label class="form-label small">Auditivo (0-100)</label><input type="number" class="form-control form-control-sm" [(ngModel)]="form.auditoryScore"></div>
          <div class="mb-2"><label class="form-label small">Cinesico (0-100)</label><input type="number" class="form-control form-control-sm" [(ngModel)]="form.kinestheticScore"></div>
          <div class="mb-2"><label class="form-label small">Lectura/Escritura (0-100)</label><input type="number" class="form-control form-control-sm" [(ngModel)]="form.readingScore"></div>
        </div>
        <div class="modal-footer"><button class="btn btn-secondary btn-sm" (click)="showForm=false">Cancelar</button><button class="btn btn-primary btn-sm" (click)="save()">Guardar</button></div>
      </div></div>
    </div>
  `
})
export class AiLearningStyleComponent implements OnInit {
  style: any = null;
  studentId = 0;
  showForm = false;
  form: any = {};
  constructor(private http: HttpClient, private auth: AuthService) {}
  ngOnInit() {}
  private get instId(): number { return this.auth.institutionId() || 1; }

  loadStyle() {
    if (!this.studentId) return;
    this.http.get<any>(`${API_URL}/ai/learning-styles/student/${this.studentId}?institutionId=${this.instId}`).subscribe({
      next: r => this.style = r,
      error: () => this.style = null
    });
  }
  save() {
    this.http.post(`${API_URL}/ai/learning-styles`, {...this.form, institutionId: this.instId}).subscribe(() => {
      this.showForm = false; this.loadStyle();
    });
  }
}
