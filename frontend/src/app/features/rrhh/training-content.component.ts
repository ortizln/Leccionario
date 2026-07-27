import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../core/api.config';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-training-content',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h5 class="mb-0"><i class="bi bi-book me-2"></i>Contenido de Capacitacion</h5>
      <button class="btn btn-primary btn-sm" (click)="openForm()"><i class="bi bi-plus me-1"></i>Nuevo Contenido</button>
    </div>

    <div class="mb-3">
      <label class="form-label small">Curso</label>
      <select class="form-select form-select-sm w-auto" [(ngModel)]="selectedCourseId" (change)="loadContents()">
        <option [ngValue]="null">Seleccionar curso...</option>
        <option *ngFor="let c of courses" [ngValue]="c.id">{{ c.title }}</option>
      </select>
    </div>

    <div class="card border-0 shadow-sm" *ngIf="contents.length">
      <div class="card-body">
        <div class="list-group list-group-flush">
          <div *ngFor="let c of contents" class="list-group-item d-flex justify-content-between align-items-center">
            <div>
              <span class="badge bg-secondary me-2">{{ c.contentType }}</span>
              <strong>{{ c.title }}</strong>
              <div class="text-muted small">{{ c.description }}</div>
            </div>
            <div class="btn-group btn-group-sm">
              <button class="btn btn-outline-primary" (click)="openForm(c)"><i class="bi bi-pencil"></i></button>
              <button class="btn btn-outline-danger" (click)="remove(c.id!)"><i class="bi bi-trash"></i></button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="modal fade show d-block" *ngIf="showForm" tabindex="-1" style="background:rgba(0,0,0,0.5)">
      <div class="modal-dialog"><div class="modal-content">
        <div class="modal-header"><h6 class="modal-title">{{ form.id ? 'Editar' : 'Nuevo' }} Contenido</h6><button class="btn-close" (click)="showForm=false"></button></div>
        <div class="modal-body">
          <div class="mb-2"><label class="form-label small">Curso ID</label><input type="number" class="form-control form-control-sm" [(ngModel)]="form.courseId"></div>
          <div class="mb-2"><label class="form-label small">Titulo</label><input class="form-control form-control-sm" [(ngModel)]="form.title"></div>
          <div class="mb-2"><label class="form-label small">Tipo</label><select class="form-select form-select-sm" [(ngModel)]="form.contentType"><option>LESSON</option><option>VIDEO</option><option>DOCUMENT</option><option>QUIZ</option></select></div>
          <div class="mb-2"><label class="form-label small">Descripcion</label><textarea class="form-control form-control-sm" rows="2" [(ngModel)]="form.description"></textarea></div>
          <div class="mb-2"><label class="form-label small">Contenido</label><textarea class="form-control form-control-sm" rows="4" [(ngModel)]="form.content"></textarea></div>
          <div class="row mb-2">
            <div class="col"><label class="form-label small">URL Recurso</label><input class="form-control form-control-sm" [(ngModel)]="form.resourceUrl"></div>
            <div class="col"><label class="form-label small">Duracion (min)</label><input type="number" class="form-control form-control-sm" [(ngModel)]="form.durationMinutes"></div>
          </div>
        </div>
        <div class="modal-footer"><button class="btn btn-secondary btn-sm" (click)="showForm=false">Cancelar</button><button class="btn btn-primary btn-sm" (click)="save()">Guardar</button></div>
      </div></div>
    </div>
  `
})
export class TrainingContentComponent implements OnInit {
  courses: any[] = [];
  contents: any[] = [];
  selectedCourseId: number | null = null;
  showForm = false;
  form: any = {};
  constructor(private http: HttpClient, private auth: AuthService) {}
  ngOnInit() {
    this.http.get<any[]>(`${API_URL}/hr/training/courses?institutionId=${this.instId}`).subscribe(r => this.courses = r);
  }
  private get instId(): number { return this.auth.institutionId() || 1; }

  loadContents() {
    if (!this.selectedCourseId) { this.contents = []; return; }
    this.http.get<any[]>(`${API_URL}/hr/training-content/course/${this.selectedCourseId}`).subscribe(r => this.contents = r);
  }
  openForm(c?: any) {
    this.form = c ? {...c} : {contentType:'LESSON', sortOrder:0};
    this.showForm = true;
  }
  save() {
    const req = this.form.id
      ? this.http.put(`${API_URL}/hr/training-content/${this.form.id}`, {...this.form, institutionId: this.instId})
      : this.http.post(`${API_URL}/hr/training-content`, {...this.form, institutionId: this.instId});
    req.subscribe(() => { this.showForm = false; this.loadContents(); });
  }
  remove(id: number) {
    if (confirm('Eliminar contenido?')) this.http.delete(`${API_URL}/hr/training-content/${id}`).subscribe(() => this.loadContents());
  }
}
