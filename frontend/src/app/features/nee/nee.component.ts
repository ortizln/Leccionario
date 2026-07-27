import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../core/api.config';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-nee',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h4 class="mb-0 fw-bold">NEE y Adaptaciones Curriculares</h4>
    </div>

    <ul class="nav nav-tabs nav-tabs-sm mb-3">
      <li><a class="nav-link" [class.active]="tab==='list'" (click)="tab='list'; loadNEE()">Casos NEE</a></li>
      <li><a class="nav-link" [class.active]="tab==='new'" (click)="tab='new'; resetForm()">Nuevo Registro NEE</a></li>
      <li><a class="nav-link" [class.active]="tab==='adapt'" (click)="tab='adapt'; loadAdaptations()">Adaptaciones</a></li>
      <li><a class="nav-link" [class.active]="tab==='new-adapt'" (click)="tab='new-adapt'; resetAdaptForm()">Nueva Adaptacion</a></li>
    </ul>

    <!-- Stats -->
    <div class="row g-2 mb-3" *ngIf="neeStats">
      <div class="col-md-4">
        <div class="card border-0 shadow-sm"><div class="card-body text-center py-2">
          <div class="small text-muted">Casos Activos</div><div class="fs-5 fw-bold" style="color:#3B4436">{{neeStats.activeCount}}</div>
        </div></div>
      </div>
      <div class="col-md-4">
        <div class="card border-0 shadow-sm"><div class="card-body text-center py-2">
          <div class="small text-muted">Cognitiva</div><div class="fs-5 fw-bold text-primary">{{neeStats.byType?.COGNITIVA || 0}}</div>
        </div></div>
      </div>
      <div class="col-md-4">
        <div class="card border-0 shadow-sm"><div class="card-body text-center py-2">
          <div class="small text-muted">Sensorial</div><div class="fs-5 fw-bold text-info">{{neeStats.byType?.SENSORIAL || 0}}</div>
        </div></div>
      </div>
    </div>

    <!-- Lista NEE -->
    <div *ngIf="tab==='list'">
      <div class="row g-2 mb-3">
        <div class="col-md-3">
          <label class="form-label form-label-sm">Tipo</label>
          <select class="form-select form-select-sm" [(ngModel)]="filterType" (change)="loadNEE()">
            <option value="">Todos</option>
            <option value="COGNITIVA">Cognitiva</option>
            <option value="SENSORIAL">Sensorial</option>
            <option value="MOTRIZ">Motriz</option>
            <option value="COMUNICATIVA">Comunicativa</option>
            <option value="EMOCIONAL">Emocional</option>
            <option value="MULTIPLE">Multiple</option>
          </select>
        </div>
      </div>
      <div class="table-responsive">
        <table class="table table-xs table-hover">
          <thead><tr><th>ID</th><th>Estudiante</th><th>Diagnostico</th><th>Tipo</th><th>Severidad</th><th>Profesional</th><th>Estado</th><th></th></tr></thead>
          <tbody>
            <tr *ngFor="let n of neeList">
              <td>{{n.id}}</td>
              <td>{{n.studentName || 'ID: '+n.studentId}}</td>
              <td class="cell-truncate">{{n.diagnosis}}</td>
              <td><span class="badge text-bg-info">{{typeLabel(n.needType)}}</span></td>
              <td>
                <span class="badge" [class.text-bg-success]="n.severity==='LEVE'" [class.text-bg-warning]="n.severity==='MODERADA'" [class.text-bg-danger]="n.severity==='SEVERA'||n.severity==='GRAVE'">
                  {{n.severity}}
                </span>
              </td>
              <td>{{n.professional || '-'}}</td>
              <td>
                <span class="badge" [class.text-bg-primary]="n.status==='ACTIVA'" [class.text-bg-info]="n.status==='EN_SEGUIMIENTO'" [class.text-bg-secondary]="n.status==='CERRADA'">
                  {{n.status}}
                </span>
              </td>
              <td><button class="btn btn-sm btn-outline-primary" (click)="editNEE(n)">Editar</button></td>
            </tr>
            <tr *ngIf="neeList.length===0"><td colspan="8" class="text-muted text-center">No hay registros NEE</td></tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Nueva NEE -->
    <div *ngIf="tab==='new'||tab==='edit'">
      <div class="card">
        <div class="card-body">
          <div class="row g-2">
            <div class="col-md-3">
              <label class="form-label form-label-sm">Estudiante ID</label>
              <input type="number" class="form-control form-control-sm" [(ngModel)]="neeFormStudentId" [disabled]="tab==='edit'">
            </div>
            <div class="col-md-3">
              <label class="form-label form-label-sm">Tipo</label>
              <select class="form-select form-select-sm" [(ngModel)]="neeFormType">
                <option value="COGNITIVA">Cognitiva</option>
                <option value="SENSORIAL">Sensorial</option>
                <option value="MOTRIZ">Motriz</option>
                <option value="COMUNICATIVA">Comunicativa</option>
                <option value="EMOCIONAL">Emocional</option>
                <option value="MULTIPLE">Multiple</option>
              </select>
            </div>
            <div class="col-md-3">
              <label class="form-label form-label-sm">Severidad</label>
              <select class="form-select form-select-sm" [(ngModel)]="neeFormSeverity">
                <option value="LEVE">Leve</option>
                <option value="MODERADA">Moderada</option>
                <option value="SEVERA">Severa</option>
                <option value="GRAVE">Grave</option>
              </select>
            </div>
            <div class="col-md-3">
              <label class="form-label form-label-sm">Estado</label>
              <select class="form-select form-select-sm" [(ngModel)]="neeFormStatus">
                <option value="ACTIVA">Activa</option>
                <option value="EN_SEGUIMIENTO">En Seguimiento</option>
                <option value="CERRADA">Cerrada</option>
              </select>
            </div>
          </div>
          <div class="row g-2 mt-1">
            <div class="col-md-6">
              <label class="form-label form-label-sm">Diagnostico</label>
              <input class="form-control form-control-sm" [(ngModel)]="neeFormDiagnosis">
            </div>
            <div class="col-md-3">
              <label class="form-label form-label-sm">Fecha Diagnostico</label>
              <input type="date" class="form-control form-control-sm" [(ngModel)]="neeFormDiagnosisDate">
            </div>
            <div class="col-md-3">
              <label class="form-label form-label-sm">Profesional</label>
              <input class="form-control form-control-sm" [(ngModel)]="neeFormProfessional">
            </div>
          </div>
          <div class="row g-2 mt-1">
            <div class="col-md-6">
              <label class="form-label form-label-sm">Descripcion</label>
              <textarea class="form-control form-control-sm" rows="2" [(ngModel)]="neeFormDescription"></textarea>
            </div>
            <div class="col-md-6">
              <label class="form-label form-label-sm">Resumen PIE</label>
              <textarea class="form-control form-control-sm" rows="2" [(ngModel)]="neeFormIepSummary"></textarea>
            </div>
          </div>
          <div class="mt-3">
            <button class="btn btn-sm btn-primary" (click)="saveNEE()">{{tab==='edit'?'Actualizar':'Crear'}} Registro NEE</button>
            <button class="btn btn-sm btn-outline-secondary ms-1" (click)="tab='list'; loadNEE()">Cancelar</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Lista Adaptaciones -->
    <div *ngIf="tab==='adapt'">
      <div class="table-responsive">
        <table class="table table-xs table-hover">
          <thead><tr><th>ID</th><th>Estudiante</th><th>Materia</th><th>Tipo</th><th>Area</th><th>Descripcion</th><th>Estado</th><th></th></tr></thead>
          <tbody>
            <tr *ngFor="let a of adaptations">
              <td>{{a.id}}</td>
              <td>{{a.studentName || 'ID: '+a.studentId}}</td>
              <td>{{a.subjectName || 'Global'}}</td>
              <td><span class="badge text-bg-secondary">{{adaptTypeLabel(a.adaptationType)}}</span></td>
              <td>{{a.area || '-'}}</td>
              <td class="cell-truncate">{{a.description}}</td>
              <td>
                <span class="badge" [class.text-bg-primary]="a.status==='ACTIVE'" [class.text-bg-info]="a.status==='REVIEWED'" [class.text-bg-success]="a.status==='COMPLETED'">
                  {{a.status}}
                </span>
              </td>
              <td><button class="btn btn-sm btn-outline-primary" (click)="editAdapt(a)">Editar</button></td>
            </tr>
            <tr *ngIf="adaptations.length===0"><td colspan="8" class="text-muted text-center">No hay adaptaciones</td></tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Nueva Adaptacion -->
    <div *ngIf="tab==='new-adapt'||tab==='edit-adapt'">
      <div class="card">
        <div class="card-body">
          <div class="row g-2">
            <div class="col-md-3">
              <label class="form-label form-label-sm">Caso NEE ID</label>
              <input type="number" class="form-control form-control-sm" [(ngModel)]="adaptFormNeeId">
            </div>
            <div class="col-md-3">
              <label class="form-label form-label-sm">Estudiante ID</label>
              <input type="number" class="form-control form-control-sm" [(ngModel)]="adaptFormStudentId">
            </div>
            <div class="col-md-3">
              <label class="form-label form-label-sm">Tipo</label>
              <select class="form-select form-select-sm" [(ngModel)]="adaptFormType">
                <option value="ACCOMMODATION">Acomodo</option>
                <option value="MODIFICATION">Modificacion</option>
                <option value="AUXILIARY_SUPPORT">Apoyo Auxiliar</option>
                <option value="TOTAL">Adaptacion Total</option>
              </select>
            </div>
            <div class="col-md-3">
              <label class="form-label form-label-sm">Area</label>
              <input class="form-control form-control-sm" [(ngModel)]="adaptFormArea">
            </div>
          </div>
          <div class="row g-2 mt-1">
            <div class="col-md-6">
              <label class="form-label form-label-sm">Descripcion</label>
              <textarea class="form-control form-control-sm" rows="2" [(ngModel)]="adaptFormDescription"></textarea>
            </div>
            <div class="col-md-6">
              <label class="form-label form-label-sm">Metas</label>
              <textarea class="form-control form-control-sm" rows="2" [(ngModel)]="adaptFormGoals"></textarea>
            </div>
          </div>
          <div class="row g-2 mt-1">
            <div class="col-md-6">
              <label class="form-label form-label-sm">Estrategias</label>
              <textarea class="form-control form-control-sm" rows="2" [(ngModel)]="adaptFormStrategies"></textarea>
            </div>
            <div class="col-md-6">
              <label class="form-label form-label-sm">Ajustes Evaluativos</label>
              <textarea class="form-control form-control-sm" rows="2" [(ngModel)]="adaptFormEvalAdjust"></textarea>
            </div>
          </div>
          <div class="mt-3">
            <button class="btn btn-sm btn-primary" (click)="saveAdaptation()">{{tab==='edit-adapt'?'Actualizar':'Crear'}} Adaptacion</button>
            <button class="btn btn-sm btn-outline-secondary ms-1" (click)="tab='adapt'; loadAdaptations()">Cancelar</button>
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
export class NeeComponent implements OnInit {
  tab = 'list';
  neeList: any[] = [];
  neeStats: any = null;
  adaptations: any[] = [];
  filterType = '';
  editNeeId: number | null = null;
  editAdaptId: number | null = null;

  neeFormStudentId: number | null = null;
  neeFormType = 'COGNITIVA';
  neeFormSeverity = 'MODERADA';
  neeFormDiagnosis = '';
  neeFormDiagnosisDate = '';
  neeFormProfessional = '';
  neeFormDescription = '';
  neeFormIepSummary = '';
  neeFormStatus = 'ACTIVA';

  adaptFormNeeId: number | null = null;
  adaptFormStudentId: number | null = null;
  adaptFormType = 'ACCOMMODATION';
  adaptFormArea = '';
  adaptFormDescription = '';
  adaptFormGoals = '';
  adaptFormStrategies = '';
  adaptFormEvalAdjust = '';

  message = '';
  messageIsError = false;

  constructor(private http: HttpClient, private auth: AuthService) {}

  ngOnInit() {
    this.loadNEE();
    this.loadStats();
  }

  private showMsg(msg: string, err = false) { this.message = msg; this.messageIsError = err; setTimeout(() => this.message = '', 4000); }

  loadStats() {
    this.http.get<any>(`${API_URL}/nee/stats`).subscribe({ next: d => this.neeStats = d });
  }

  loadNEE() {
    if (this.filterType) {
      this.http.get<any[]>(`${API_URL}/nee/type/${this.filterType}`).subscribe({ next: d => this.neeList = d });
    } else {
      this.http.get<any[]>(`${API_URL}/nee/active`).subscribe({ next: d => this.neeList = d });
    }
  }

  loadAdaptations() {
    if (this.neeList.length > 0) {
      const id = this.neeList[0].id;
      this.http.get<any[]>(`${API_URL}/adaptations/nee/${id}`).subscribe({ next: d => this.adaptations = d });
    }
  }

  editNEE(n: any) {
    this.editNeeId = n.id;
    this.neeFormStudentId = n.studentId;
    this.neeFormType = n.needType;
    this.neeFormSeverity = n.severity;
    this.neeFormDiagnosis = n.diagnosis;
    this.neeFormDiagnosisDate = n.diagnosisDate || '';
    this.neeFormProfessional = n.professional || '';
    this.neeFormDescription = n.description || '';
    this.neeFormIepSummary = n.iepSummary || '';
    this.neeFormStatus = n.status;
    this.tab = 'edit';
  }

  saveNEE() {
    const body: any = {
      studentId: this.neeFormStudentId, needType: this.neeFormType, severity: this.neeFormSeverity,
      diagnosis: this.neeFormDiagnosis, diagnosisDate: this.neeFormDiagnosisDate || null,
      professional: this.neeFormProfessional, description: this.neeFormDescription,
      iepSummary: this.neeFormIepSummary, status: this.neeFormStatus
    };
    const obs = this.editNeeId
      ? this.http.put(`${API_URL}/nee/${this.editNeeId}`, body)
      : this.http.post(`${API_URL}/nee`, body);
    obs.subscribe({
      next: () => { this.showMsg(this.editNeeId ? 'Actualizado' : 'Creado'); this.tab = 'list'; this.loadNEE(); this.loadStats(); this.resetForm(); },
      error: () => this.showMsg('Error', true)
    });
  }

  editAdapt(a: any) {
    this.editAdaptId = a.id;
    this.adaptFormNeeId = a.specialNeedsId;
    this.adaptFormStudentId = a.studentId;
    this.adaptFormType = a.adaptationType;
    this.adaptFormArea = a.area || '';
    this.adaptFormDescription = a.description;
    this.adaptFormGoals = a.goals || '';
    this.adaptFormStrategies = a.strategies || '';
    this.adaptFormEvalAdjust = a.evaluationAdjustments || '';
    this.tab = 'edit-adapt';
  }

  saveAdaptation() {
    const body: any = {
      specialNeedsId: this.adaptFormNeeId, studentId: this.adaptFormStudentId,
      adaptationType: this.adaptFormType, area: this.adaptFormArea,
      description: this.adaptFormDescription, goals: this.adaptFormGoals,
      strategies: this.adaptFormStrategies, evaluationAdjustments: this.adaptFormEvalAdjust
    };
    const obs = this.editAdaptId
      ? this.http.put(`${API_URL}/adaptations/${this.editAdaptId}`, body)
      : this.http.post(`${API_URL}/adaptations`, body);
    obs.subscribe({
      next: () => { this.showMsg(this.editAdaptId ? 'Actualizada' : 'Creada'); this.tab = 'adapt'; this.loadAdaptations(); this.resetAdaptForm(); },
      error: () => this.showMsg('Error', true)
    });
  }

  resetForm() { this.neeFormStudentId = null; this.neeFormDiagnosis = ''; this.neeFormProfessional = ''; this.neeFormDescription = ''; this.neeFormIepSummary = ''; this.editNeeId = null; }
  resetAdaptForm() { this.adaptFormNeeId = null; this.adaptFormStudentId = null; this.adaptFormArea = ''; this.adaptFormDescription = ''; this.adaptFormGoals = ''; this.adaptFormStrategies = ''; this.adaptFormEvalAdjust = ''; this.editAdaptId = null; }

  typeLabel(t: string): string {
    const m: Record<string, string> = { COGNITIVA: 'Cognitiva', SENSORIAL: 'Sensorial', MOTRIZ: 'Motriz', COMUNICATIVA: 'Comunicativa', EMOCIONAL: 'Emocional', MULTIPLE: 'Multiple' };
    return m[t] || t;
  }

  adaptTypeLabel(t: string): string {
    const m: Record<string, string> = { ACCOMMODATION: 'Acomodo', MODIFICATION: 'Modificacion', AUXILIARY_SUPPORT: 'Apoyo', TOTAL: 'Total' };
    return m[t] || t;
  }
}
