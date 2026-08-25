import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../core/api.config';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-recovery-exams',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h5 class="mb-0"><i class="bi bi-arrow-counterclockwise me-2"></i>Recuperaciones y Supletorios</h5>
      <button class="btn btn-primary btn-sm" (click)="showForm=true; editItem=null; resetForm()"><i class="bi bi-plus me-1"></i>Nuevo Examen</button>
    </div>

    <div class="row g-3 mb-3">
      <div class="col-md-3">
        <div class="card border-0 shadow-sm bg-warning text-dark text-center">
          <div class="card-body py-3"><div class="fs-4 fw-bold">{{ pending.length }}</div><div class="small">Pendientes</div></div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card border-0 shadow-sm bg-success text-white text-center">
          <div class="card-body py-3"><div class="fs-4 fw-bold">{{ all.length - pending.length }}</div><div class="small">Aplicados</div></div>
        </div>
      </div>
    </div>

    @if (showForm) {
      <div class="card border-0 shadow-sm mb-3">
        <div class="card-body">
          <h6>{{ editItem ? 'Editar' : 'Nuevo' }} Examen de Recuperacion</h6>
          <div class="row g-2">
            <div class="col-md-2">
              <label class="form-label form-label-sm">Tipo</label>
              <select class="form-select form-select-sm" [(ngModel)]="form.examType">
                <option value="SUPLETORIO">Supletorio</option>
                <option value="MEJORAMIENTO">Mejoramiento</option>
                <option value="GRACIA">De Gracia</option>
                <option value="REMEDIAL">Remedial</option>
              </select>
            </div>
            <div class="col-md-2">
              <label class="form-label form-label-sm">Estudiante ID</label>
              <input type="number" class="form-control form-control-sm" [(ngModel)]="form.studentId">
            </div>
            <div class="col-md-2">
              <label class="form-label form-label-sm">Curso ID</label>
              <input type="number" class="form-control form-control-sm" [(ngModel)]="form.courseId">
            </div>
            <div class="col-md-2">
              <label class="form-label form-label-sm">Materia ID</label>
              <input type="number" class="form-control form-control-sm" [(ngModel)]="form.subjectId">
            </div>
            <div class="col-md-2">
              <label class="form-label form-label-sm">Fecha</label>
              <input type="date" class="form-control form-control-sm" [(ngModel)]="form.scheduledDate">
            </div>
            <div class="col-md-2 d-flex align-items-end">
              <button class="btn btn-success btn-sm w-100" (click)="save()"><i class="bi bi-check-lg me-1"></i>Guardar</button>
            </div>
            <div class="col-md-12">
              <label class="form-label form-label-sm">Notas</label>
              <textarea class="form-control form-control-sm" rows="2" [(ngModel)]="form.notes"></textarea>
            </div>
          </div>
          <button class="btn btn-secondary btn-sm mt-2" (click)="showForm=false"><i class="bi bi-x-lg me-1"></i>Cancelar</button>
        </div>
      </div>
    }

    <div class="card border-0 shadow-sm">
      <div class="table-responsive">
        <table class="table table-sm mb-0">
          <thead class="table-light"><tr><th>Tipo</th><th>Estudiante</th><th>Curso</th><th>Materia</th><th>Fecha</th><th>Nota</th><th>Estado</th><th></th></tr></thead>
          <tbody>
            <tr *ngFor="let e of all">
              <td><span class="badge" [class.bg-danger]="e.examType==='SUPLETORIO'" [class.bg-warning]="e.examType==='MEJORAMIENTO'" [class.bg-info]="e.examType==='GRACIA'" [class.bg-secondary]="e.examType==='REMEDIAL'">{{ e.examType }}</span></td>
              <td>{{ e.studentId }}</td>
              <td>{{ e.courseId }}</td>
              <td>{{ e.subjectId }}</td>
              <td>{{ e.scheduledDate | date:'dd/MM/yyyy' }}</td>
              <td>{{ e.score != null ? e.score : '-' }}</td>
              <td><span class="badge" [class.bg-success]="e.status==='APLICADO'" [class.bg-warning]="e.status==='PENDIENTE'" [class.bg-secondary]="e.status==='CANCELADO'">{{ e.status }}</span></td>
              <td>
                <button *ngIf="e.status==='PENDIENTE'" class="btn btn-outline-success btn-sm me-1" (click)="applyScore(e)"><i class="bi bi-check2"></i></button>
                <button *ngIf="e.status==='PENDIENTE'" class="btn btn-outline-warning btn-sm me-1" (click)="cancel(e.id)"><i class="bi bi-x-lg"></i></button>
                <button class="btn btn-outline-danger btn-sm" (click)="delete(e.id)"><i class="bi bi-trash"></i></button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class RecoveryExamsComponent implements OnInit {
  all: any[] = [];
  pending: any[] = [];
  showForm = false;
  editItem: any = null;
  form: any = { examType: 'SUPLETORIO', studentId: null, courseId: null, subjectId: null, scheduledDate: '', notes: '' };
  private get instId(): number { return this.auth.institutionId() || 1; }

  constructor(private http: HttpClient, private auth: AuthService) {}

  ngOnInit() { this.load(); }

  load() {
    this.http.get<any[]>(`${API_URL}/grading/recoveries?institutionId=${this.instId}`).subscribe(d => this.all = d);
    this.http.get<any[]>(`${API_URL}/grading/recoveries/pending?institutionId=${this.instId}`).subscribe(d => this.pending = d);
  }

  resetForm() { this.form = { examType: 'SUPLETORIO', studentId: null, courseId: null, subjectId: null, scheduledDate: '', notes: '' }; }

  save() {
    const payload = { ...this.form, institutionId: this.instId, status: 'PENDIENTE' };
    this.http.post(`${API_URL}/grading/recoveries`, payload).subscribe(() => { this.showForm = false; this.load(); });
  }

  applyScore(e: any) {
    const score = prompt('Ingrese la nota:');
    if (score) this.http.put(`${API_URL}/grading/recoveries/${e.id}/score`, { score: +score }).subscribe(() => this.load());
  }

  cancel(id: number) {
    if (confirm('Cancelar examen?')) this.http.put(`${API_URL}/grading/recoveries/${id}/cancel`, {}).subscribe(() => this.load());
  }

  delete(id: number) {
    if (confirm('Eliminar examen?')) this.http.delete(`${API_URL}/grading/recoveries/${id}`).subscribe(() => this.load());
  }
}
