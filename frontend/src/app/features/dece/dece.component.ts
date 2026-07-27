import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../core/api.config';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-dece',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h4 class="mb-0 fw-bold">DECE - Consejeria Estudiantil</h4>
    </div>

    <ul class="nav nav-tabs nav-tabs-sm mb-3">
      <li><a class="nav-link" [class.active]="tab==='list'" (click)="tab='list'; loadCases()">Casos</a></li>
      <li><a class="nav-link" [class.active]="tab==='new'" (click)="tab='new'; resetForm()">Nuevo Caso</a></li>
    </ul>

    <div class="row g-2 mb-3" *ngIf="stats">
      <div class="col-md-4">
        <div class="card border-0 shadow-sm"><div class="card-body text-center py-2">
          <div class="small text-muted">Casos Abiertos</div><div class="fs-5 fw-bold" style="color:#3B4436">{{stats.openCases}}</div>
        </div></div>
      </div>
      <div class="col-md-4">
        <div class="card border-0 shadow-sm"><div class="card-body text-center py-2">
          <div class="small text-muted">Comportamiento</div><div class="fs-5 fw-bold text-warning">{{stats.byType?.COMPORTAMIENTO || 0}}</div>
        </div></div>
      </div>
      <div class="col-md-4">
        <div class="card border-0 shadow-sm"><div class="card-body text-center py-2">
          <div class="small text-muted">Academicos</div><div class="fs-5 fw-bold text-info">{{stats.byType?.ACADEMICA || 0}}</div>
        </div></div>
      </div>
    </div>

    <div *ngIf="tab==='list'">
      <div class="row g-2 mb-3">
        <div class="col-md-3">
          <label class="form-label form-label-sm">Tipo</label>
          <select class="form-select form-select-sm" [(ngModel)]="filterType" (change)="loadCases()">
            <option value="">Todos</option>
            <option value="ACADEMICA">Academica</option>
            <option value="EMOCIONAL">Emocional</option>
            <option value="COMPORTAMIENTO">Comportamiento</option>
            <option value="FAMILIAR">Familiar</option>
            <option value="VIOLENCIA">Violencia</option>
            <option value="BULLYING">Bullying</option>
            <option value="OTRA">Otra</option>
          </select>
        </div>
        <div class="col-md-3">
          <label class="form-label form-label-sm">Estado</label>
          <select class="form-select form-select-sm" [(ngModel)]="filterStatus" (change)="loadCases()">
            <option value="">Todos</option>
            <option value="ABIERTO">Abierto</option>
            <option value="EN_PROCESO">En Proceso</option>
            <option value="CERRADO">Cerrado</option>
            <option value="REFERIDO">Referido</option>
          </select>
        </div>
      </div>

      <div class="table-responsive">
        <table class="table table-xs table-hover">
          <thead><tr><th>ID</th><th>Estudiante</th><th>Tipo</th><th>Prioridad</th><th>Descripcion</th><th>Asesor</th><th>Estado</th><th></th></tr></thead>
          <tbody>
            <tr *ngFor="let c of cases" (click)="viewCase(c)" style="cursor:pointer">
              <td>{{c.id}}</td>
              <td>{{c.studentName || 'ID: '+c.studentId}}</td>
              <td><span class="badge text-bg-secondary">{{caseTypeLabel(c.caseType)}}</span></td>
              <td>
                <span class="badge" [class.text-bg-success]="c.priority==='BAJA'" [class.text-bg-primary]="c.priority==='NORMAL'" [class.text-bg-warning]="c.priority==='ALTA'" [class.text-bg-danger]="c.priority==='URGENTE'">
                  {{c.priority}}
                </span>
              </td>
              <td class="cell-truncate">{{c.description}}</td>
              <td>{{c.counselorName || '-'}}</td>
              <td>
                <span class="badge" [class.text-bg-warning]="c.status==='ABIERTO'" [class.text-bg-info]="c.status==='EN_PROCESO'" [class.text-bg-secondary]="c.status==='CERRADO'" [class.text-bg-danger]="c.status==='REFERIDO'">
                  {{statusLabel(c.status)}}
                </span>
              </td>
              <td>
                <button class="btn btn-sm btn-outline-primary" (click)="$event.stopPropagation(); editCase(c)">Editar</button>
              </td>
            </tr>
            <tr *ngIf="cases.length===0"><td colspan="8" class="text-muted text-center">No hay casos</td></tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Nuevo / Editar Caso -->
    <div *ngIf="tab==='new'||tab==='edit'">
      <div class="card">
        <div class="card-body">
          <div class="row g-2">
            <div class="col-md-3">
              <label class="form-label form-label-sm">Estudiante ID</label>
              <input type="number" class="form-control form-control-sm" [(ngModel)]="formStudentId">
            </div>
            <div class="col-md-3">
              <label class="form-label form-label-sm">Tipo</label>
              <select class="form-select form-select-sm" [(ngModel)]="formCaseType">
                <option value="ACADEMICA">Academica</option>
                <option value="EMOCIONAL">Emocional</option>
                <option value="COMPORTAMIENTO">Comportamiento</option>
                <option value="FAMILIAR">Familiar</option>
                <option value="VIOLENCIA">Violencia</option>
                <option value="BULLYING">Bullying</option>
                <option value="OTRA">Otra</option>
              </select>
            </div>
            <div class="col-md-3">
              <label class="form-label form-label-sm">Prioridad</label>
              <select class="form-select form-select-sm" [(ngModel)]="formPriority">
                <option value="BAJA">Baja</option>
                <option value="NORMAL">Normal</option>
                <option value="ALTA">Alta</option>
                <option value="URGENTE">Urgente</option>
              </select>
            </div>
            <div class="col-md-3">
              <label class="form-label form-label-sm">Estado</label>
              <select class="form-select form-select-sm" [(ngModel)]="formStatus">
                <option value="ABIERTO">Abierto</option>
                <option value="EN_PROCESO">En Proceso</option>
                <option value="CERRADO">Cerrado</option>
                <option value="REFERIDO">Referido</option>
              </select>
            </div>
          </div>
          <div class="row g-2 mt-1">
            <div class="col-md-6">
              <label class="form-label form-label-sm">Descripcion</label>
              <textarea class="form-control form-control-sm" rows="2" [(ngModel)]="formDescription"></textarea>
            </div>
            <div class="col-md-6">
              <label class="form-label form-label-sm">Asesor</label>
              <input class="form-control form-control-sm" [(ngModel)]="formCounselor">
            </div>
          </div>
          <div class="row g-2 mt-1">
            <div class="col-md-6">
              <label class="form-label form-label-sm">Intervenciones</label>
              <textarea class="form-control form-control-sm" rows="2" [(ngModel)]="formInterventions"></textarea>
            </div>
            <div class="col-md-6">
              <label class="form-label form-label-sm">Resultado</label>
              <textarea class="form-control form-control-sm" rows="2" [(ngModel)]="formResult"></textarea>
            </div>
          </div>
          <div class="mt-3">
            <button class="btn btn-sm btn-primary" (click)="saveCase()">{{editId?'Actualizar':'Crear'}} Caso</button>
            <button class="btn btn-sm btn-outline-secondary ms-1" (click)="tab='list'; loadCases()">Cancelar</button>
          </div>
        </div>
      </div>

      <!-- Follow-ups -->
      <div *ngIf="editId && followUps.length > 0" class="mt-3">
        <h6 class="fw-bold">Seguimientos</h6>
        <div *ngFor="let f of followUps" class="card mb-2">
          <div class="card-body py-2">
            <div class="d-flex justify-content-between">
              <small class="text-muted">{{f.date}}</small>
              <small class="text-muted">{{f.createdBy}}</small>
            </div>
            <div>{{f.notes}}</div>
            <div *ngIf="f.actionsTaken" class="small text-muted">Acciones: {{f.actionsTaken}}</div>
            <div *ngIf="f.nextSteps" class="small text-primary">Siguientes pasos: {{f.nextSteps}}</div>
          </div>
        </div>
      </div>
      <div *ngIf="editId" class="mt-2">
        <h6 class="fw-bold">Nuevo Seguimiento</h6>
        <div class="row g-2">
          <div class="col-md-4">
            <textarea class="form-control form-control-sm" rows="2" [(ngModel)]="fuNotes" placeholder="Notas"></textarea>
          </div>
          <div class="col-md-3">
            <input class="form-control form-control-sm" [(ngModel)]="fuActions" placeholder="Acciones tomadas">
          </div>
          <div class="col-md-3">
            <input class="form-control form-control-sm" [(ngModel)]="fuNextSteps" placeholder="Siguientes pasos">
          </div>
          <div class="col-md-2">
            <button class="btn btn-sm btn-primary" (click)="addFollowUp()">Agregar</button>
          </div>
        </div>
      </div>
    </div>

    <div *ngIf="message" class="position-fixed bottom-0 end-0 p-3" style="z-index:1050">
      <div class="toast show" [class.bg-success]="!messageIsError" [class.bg-danger]="messageIsError">
        <div class="toast-body text-white">{{message}}</div>
      </div>
    </div>
  `
})
export class DeceComponent implements OnInit {
  tab = 'list';
  cases: any[] = [];
  stats: any = null;
  followUps: any[] = [];
  filterType = '';
  filterStatus = '';
  editId: number | null = null;

  formStudentId: number | null = null;
  formCaseType = 'ACADEMICA';
  formPriority = 'NORMAL';
  formDescription = '';
  formCounselor = '';
  formInterventions = '';
  formResult = '';
  formStatus = 'ABIERTO';

  fuNotes = '';
  fuActions = '';
  fuNextSteps = '';

  message = '';
  messageIsError = false;

  constructor(private http: HttpClient, private auth: AuthService) {}

  ngOnInit() {
    this.loadCases();
    this.loadStats();
  }

  private showMsg(msg: string, err = false) { this.message = msg; this.messageIsError = err; setTimeout(() => this.message = '', 4000); }

  loadStats() {
    this.http.get<any>(`${API_URL}/dece/stats`).subscribe({ next: d => this.stats = d });
  }

  loadCases() {
    if (this.filterType) {
      this.http.get<any[]>(`${API_URL}/dece/cases/type/${this.filterType}`).subscribe({ next: d => this.cases = d });
    } else if (this.filterStatus) {
      this.http.get<any[]>(`${API_URL}/dece/cases/open`).subscribe({ next: d => this.cases = d });
    } else {
      this.http.get<any[]>(`${API_URL}/dece/cases/open`).subscribe({ next: d => this.cases = d });
    }
  }

  viewCase(c: any) {
    this.editId = c.id;
    this.formStudentId = c.studentId;
    this.formCaseType = c.caseType;
    this.formPriority = c.priority;
    this.formDescription = c.description;
    this.formCounselor = c.counselorName || '';
    this.formInterventions = c.interventions || '';
    this.formResult = c.result || '';
    this.formStatus = c.status;
    this.loadFollowUps();
    this.tab = 'edit';
  }

  editCase(c: any) { this.viewCase(c); }

  loadFollowUps() {
    if (this.editId) {
      this.http.get<any[]>(`${API_URL}/dece/cases/${this.editId}/follow-ups`)
        .subscribe({ next: d => this.followUps = d });
    }
  }

  saveCase() {
    const body: any = {
      studentId: this.formStudentId, caseType: this.formCaseType, priority: this.formPriority,
      description: this.formDescription, counselorName: this.formCounselor,
      interventions: this.formInterventions, result: this.formResult, status: this.formStatus,
      closeDate: this.formStatus === 'CERRADO' ? new Date().toISOString().split('T')[0] : null
    };
    const obs = this.editId
      ? this.http.put(`${API_URL}/dece/cases/${this.editId}`, body)
      : this.http.post(`${API_URL}/dece/cases`, body);
    obs.subscribe({
      next: () => { this.showMsg(this.editId ? 'Actualizado' : 'Creado'); this.tab = 'list'; this.loadCases(); this.loadStats(); this.resetForm(); },
      error: () => this.showMsg('Error', true)
    });
  }

  addFollowUp() {
    if (!this.editId || !this.fuNotes) return;
    this.http.post(`${API_URL}/dece/cases/${this.editId}/follow-ups`, {
      notes: this.fuNotes, actionsTaken: this.fuActions, nextSteps: this.fuNextSteps
    }).subscribe({
      next: () => { this.fuNotes = ''; this.fuActions = ''; this.fuNextSteps = ''; this.loadFollowUps(); this.showMsg('Seguimiento agregado'); },
      error: () => this.showMsg('Error', true)
    });
  }

  resetForm() {
    this.editId = null; this.formStudentId = null; this.formDescription = '';
    this.formCounselor = ''; this.formInterventions = ''; this.formResult = ''; this.followUps = [];
  }

  caseTypeLabel(t: string): string {
    const m: Record<string, string> = { ACADEMICA: 'Academica', EMOCIONAL: 'Emocional', COMPORTAMIENTO: 'Comportamiento', FAMILIAR: 'Familiar', VIOLENCIA: 'Violencia', BULLYING: 'Bullying', OTRA: 'Otra' };
    return m[t] || t;
  }

  statusLabel(s: string): string {
    const m: Record<string, string> = { ABIERTO: 'Abierto', EN_PROCESO: 'En Proceso', CERRADO: 'Cerrado', REFERIDO: 'Referido' };
    return m[s] || s;
  }
}
