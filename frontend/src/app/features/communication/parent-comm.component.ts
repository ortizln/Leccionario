import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../core/api.config';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-parent-comm',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h5 class="mb-0"><i class="bi bi-people me-2"></i>Comunicacion con Padres</h5>
      <button class="btn btn-sm btn-primary" (click)="showCreateModal=true"><i class="bi bi-plus-circle me-1"></i>Nueva Comunicacion</button>
    </div>

    <div class="row g-3 mb-4">
      <div class="col-md-3">
        <div class="card border-0 shadow-sm bg-primary text-white text-center">
          <div class="card-body py-3"><div class="fs-3 fw-bold">{{ total }}</div><div class="small">Total</div></div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card border-0 shadow-sm bg-warning text-dark text-center">
          <div class="card-body py-3"><div class="fs-3 fw-bold">{{ pending }}</div><div class="small">Sin Responder</div></div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card border-0 shadow-sm bg-success text-white text-center">
          <div class="card-body py-3"><div class="fs-3 fw-bold">{{ responded }}</div><div class="small">Respondidas</div></div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card border-0 shadow-sm bg-info text-white text-center">
          <div class="card-body py-3"><div class="fs-3 fw-bold">{{ read }}</div><div class="small">Leidas</div></div>
        </div>
      </div>
    </div>

    <div class="card border-0 shadow-sm">
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-sm mb-0">
            <thead class="table-light">
              <tr><th>Estudiante</th><th>Tipo</th><th>Asunto</th><th>Canal</th><th>Estado</th><th>Fecha</th><th></th></tr>
            </thead>
            <tbody>
              <tr *ngFor="let c of communications">
                <td>{{ c.studentId }}</td>
                <td><span class="badge bg-info">{{ c.communicationType }}</span></td>
                <td>{{ c.subject }}</td>
                <td>{{ c.channel }}</td>
                <td><span class="badge" [class.bg-warning]="c.status==='ENVIADO'" [class.bg-info]="c.status==='LEIDO'" [class.bg-success]="c.status==='RESPONDIDO'">{{ c.status }}</span></td>
                <td>{{ c.createdAt | date:'dd/MM/yyyy' }}</td>
                <td>
                  <button class="btn btn-sm btn-outline-primary" *ngIf="c.status!=='RESPONDIDO'" (click)="openRespondModal(c)"><i class="bi bi-reply"></i></button>
                </td>
              </tr>
              <tr *ngIf="communications.length===0"><td colspan="7" class="text-center text-muted py-3">Sin comunicaciones</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div class="modal d-block" *ngIf="showCreateModal" tabindex="-1" style="background:rgba(0,0,0,0.5)">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header"><h6 class="modal-title">Nueva Comunicacion</h6></div>
          <div class="modal-body">
            <div class="row g-3">
              <div class="col-md-6"><label class="form-label small">Estudiante ID *</label><input type="number" class="form-control form-control-sm" [(ngModel)]="newComm.studentId"></div>
              <div class="col-md-6"><label class="form-label small">Representante ID</label><input type="number" class="form-control form-control-sm" [(ngModel)]="newComm.representativeId"></div>
              <div class="col-md-6"><label class="form-label small">Tipo *</label>
                <select class="form-select form-select-sm" [(ngModel)]="newComm.communicationType">
                  <option value="ACADEMICO">Academico</option><option value="CONDUCTA">Conducta</option><option value="SALUD">Salud</option><option value="FINANCIERO">Financiero</option><option value="GENERAL">General</option>
                </select>
              </div>
              <div class="col-md-6"><label class="form-label small">Canal</label>
                <select class="form-select form-select-sm" [(ngModel)]="newComm.channel"><option value="IN_APP">In-App</option><option value="EMAIL">Email</option><option value="SMS">SMS</option></select>
              </div>
              <div class="col-12"><label class="form-label small">Asunto *</label><input class="form-control form-control-sm" [(ngModel)]="newComm.subject"></div>
              <div class="col-12"><label class="form-label small">Mensaje *</label><textarea class="form-control form-control-sm" [(ngModel)]="newComm.message" rows="4"></textarea></div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-sm btn-secondary" (click)="showCreateModal=false">Cancelar</button>
            <button class="btn btn-sm btn-primary" (click)="createComm()">Enviar</button>
          </div>
        </div>
      </div>
    </div>

    <div class="modal d-block" *ngIf="showRespondModal" tabindex="-1" style="background:rgba(0,0,0,0.5)">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header"><h6 class="modal-title">Responder</h6></div>
          <div class="modal-body">
            <div class="mb-2"><strong>Asunto:</strong> {{ selectedComm?.subject }}</div>
            <div class="mb-2"><strong>Mensaje:</strong> {{ selectedComm?.message }}</div>
            <label class="form-label small">Respuesta *</label>
            <textarea class="form-control form-control-sm" [(ngModel)]="responseText" rows="4"></textarea>
          </div>
          <div class="modal-footer">
            <button class="btn btn-sm btn-secondary" (click)="showRespondModal=false">Cancelar</button>
            <button class="btn btn-sm btn-primary" (click)="respond()">Enviar Respuesta</button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ParentCommComponent implements OnInit {
  communications: any[] = [];
  total = 0;
  pending = 0;
  responded = 0;
  read = 0;
  showCreateModal = false;
  showRespondModal = false;
  newComm: any = { studentId: null, representativeId: null, communicationType: 'ACADEMICO', subject: '', message: '', channel: 'IN_APP' };
  selectedComm: any = null;
  responseText = '';

  constructor(private http: HttpClient, private auth: AuthService) {}

  ngOnInit() { this.load(); }

  load() {
    this.http.get<any[]>(`${API_URL}/communication/parent-comm/student/${this.auth.userId() || 1}`).subscribe({
      next: r => {
        this.communications = r;
        this.total = r.length;
        this.pending = r.filter(c => c.status === 'ENVIADO').length;
        this.responded = r.filter(c => c.status === 'RESPONDIDO').length;
        this.read = r.filter(c => c.status === 'LEIDO').length;
      },
      error: () => {}
    });
  }

  createComm() {
    this.http.post<any>(`${API_URL}/communication/parent-comm`, { ...this.newComm, institutionId: this.auth.institutionId() || 1 }).subscribe({
      next: () => { this.showCreateModal = false; this.load(); },
      error: e => alert(e.error?.message || 'Error')
    });
  }

  openRespondModal(c: any) { this.selectedComm = c; this.responseText = ''; this.showRespondModal = true; }

  respond() {
    this.http.post<any>(`${API_URL}/communication/parent-comm/${this.selectedComm.id}/respond`, { response: this.responseText }).subscribe({
      next: () => { this.showRespondModal = false; this.load(); },
      error: e => alert(e.error?.message || 'Error')
    });
  }
}
