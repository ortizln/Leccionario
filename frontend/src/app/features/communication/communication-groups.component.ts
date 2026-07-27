import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../core/api.config';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-communication-groups',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h5 class="mb-0"><i class="bi bi-people me-2"></i>Grupos de Comunicacion</h5>
      <button class="btn btn-sm btn-primary" (click)="openForm()"><i class="bi bi-plus me-1"></i>Nuevo Grupo</button>
    </div>

    <div class="row g-3">
      <div class="col-md-6 col-lg-4" *ngFor="let g of groups">
        <div class="card border-0 shadow-sm h-100">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start mb-2">
              <h6 class="mb-0">{{ g.name }}</h6>
              <span class="badge" [class.bg-primary]="g.type==='COURSE'" [class.bg-success]="g.type==='GRADE'" [class.bg-warning text-dark]="g.type==='CUSTOM'" [class.bg-info]="g.type==='PARENT'">
                {{ g.type }}
              </span>
            </div>
            <p class="small text-muted mb-2">{{ g.description || 'Sin descripcion' }}</p>
            <div class="d-flex justify-content-between align-items-center">
              <span class="small"><i class="bi bi-person me-1"></i>{{ g.memberCount || 0 }} miembros</span>
              <div class="btn-group">
                <button class="btn btn-sm btn-outline-primary" (click)="sendBulk(g)" title="Enviar mensaje masivo"><i class="bi bi-send"></i></button>
                <button class="btn btn-sm btn-outline-secondary" (click)="editGroup(g)" title="Editar"><i class="bi bi-pencil"></i></button>
                <button class="btn btn-sm btn-outline-danger" (click)="deleteGroup(g)" title="Eliminar"><i class="bi bi-trash"></i></button>
              </div>
            </div>
          </div>
          <div class="card-footer bg-white border-top-0 pt-0">
            <div class="small text-muted">
              <span *ngIf="g.courseName"><i class="bi bi-book me-1"></i>{{ g.courseName }}</span>
              <span *ngIf="g.gradeName"><i class="bi bi-mortarboard me-1"></i>{{ g.gradeName }}</span>
            </div>
          </div>
        </div>
      </div>

      <div *ngIf="groups.length===0" class="col-12 text-center py-5">
        <i class="bi bi-people fs-1 text-muted"></i>
        <p class="text-muted mt-2">No hay grupos creados</p>
      </div>
    </div>

    @if (showForm) {
      <div class="modal d-block" tabindex="-1" style="background:rgba(0,0,0,0.5)">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header"><h6 class="modal-title">{{ editMode ? 'Editar' : 'Nuevo' }} Grupo</h6></div>
            <div class="modal-body">
              <div class="mb-3">
                <label class="form-label small">Nombre *</label>
                <input type="text" class="form-control form-control-sm" [(ngModel)]="form.name" placeholder="Ej: Padres 6to A">
              </div>
              <div class="mb-3">
                <label class="form-label small">Tipo *</label>
                <select class="form-select form-select-sm" [(ngModel)]="form.type">
                  <option value="COURSE">Curso</option>
                  <option value="GRADE">Grado</option>
                  <option value="PARENT">Padres</option>
                  <option value="CUSTOM">Personalizado</option>
                </select>
              </div>
              <div class="mb-3">
                <label class="form-label small">Descripcion</label>
                <textarea class="form-control form-control-sm" rows="2" [(ngModel)]="form.description"></textarea>
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn btn-sm btn-secondary" (click)="showForm=false">Cancelar</button>
              <button class="btn btn-sm btn-primary" (click)="save()">Guardar</button>
            </div>
          </div>
        </div>
      </div>
    }

    @if (showBulkForm) {
      <div class="modal d-block" tabindex="-1" style="background:rgba(0,0,0,0.5)">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header"><h6 class="modal-title">Enviar Mensaje - {{ selectedGroup?.name }}</h6></div>
            <div class="modal-body">
              <div class="mb-3">
                <label class="form-label small">Asunto *</label>
                <input type="text" class="form-control form-control-sm" [(ngModel)]="bulkForm.subject" placeholder="Asunto del mensaje">
              </div>
              <div class="mb-3">
                <label class="form-label small">Mensaje *</label>
                <textarea class="form-control form-control-sm" rows="4" [(ngModel)]="bulkForm.message" placeholder="Escriba su mensaje..."></textarea>
              </div>
              <div class="form-check form-switch mb-3">
                <input class="form-check-input" type="checkbox" [(ngModel)]="bulkForm.sendNotification" id="notifCheck">
                <label class="form-check-label small" for="notifCheck">Enviar notificacion push</label>
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn btn-sm btn-secondary" (click)="showBulkForm=false">Cancelar</button>
              <button class="btn btn-sm btn-primary" (click)="sendBulkMessage()">Enviar</button>
            </div>
          </div>
        </div>
      </div>
    }
  `
})
export class CommunicationGroupsComponent implements OnInit {
  groups: any[] = [];
  showForm = false;
  showBulkForm = false;
  editMode = false;
  form = { name: '', type: 'CUSTOM', description: '' };
  bulkForm = { subject: '', message: '', sendNotification: true };
  selectedGroup: any = null;
  editId: number | null = null;

  constructor(private http: HttpClient, private auth: AuthService) {}
  ngOnInit() { this.load(); }
  private get instId(): number { return this.auth.institutionId() || 1; }

  load() {
    this.http.get<any[]>(`${API_URL}/communication/groups?institutionId=${this.instId}`).subscribe({
      next: r => this.groups = r,
      error: () => {}
    });
  }

  openForm() {
    this.editMode = false;
    this.form = { name: '', type: 'CUSTOM', description: '' };
    this.showForm = true;
  }

  editGroup(g: any) {
    this.editMode = true;
    this.editId = g.id;
    this.form = { name: g.name, type: g.type, description: g.description || '' };
    this.showForm = true;
  }

  save() {
    if (!this.form.name) { alert('Ingrese el nombre del grupo'); return; }
    const body = { ...this.form, institutionId: this.instId };
    if (this.editMode && this.editId) {
      this.http.put(`${API_URL}/communication/groups/${this.editId}`, body).subscribe({ next: () => { this.showForm = false; this.load(); }, error: e => alert(e.error?.message || 'Error') });
    } else {
      this.http.post(`${API_URL}/communication/groups?institutionId=${this.instId}`, body).subscribe({ next: () => { this.showForm = false; this.load(); }, error: e => alert(e.error?.message || 'Error') });
    }
  }

  sendBulk(g: any) {
    this.selectedGroup = g;
    this.bulkForm = { subject: '', message: '', sendNotification: true };
    this.showBulkForm = true;
  }

  sendBulkMessage() {
    if (!this.bulkForm.subject || !this.bulkForm.message) { alert('Complete asunto y mensaje'); return; }
    this.http.post(`${API_URL}/communication/groups/${this.selectedGroup.id}/send`, {
      subject: this.bulkForm.subject,
      message: this.bulkForm.message,
      sendNotification: this.bulkForm.sendNotification
    }).subscribe({ next: () => { this.showBulkForm = false; alert('Mensaje enviado'); }, error: e => alert(e.error?.message || 'Error') });
  }

  deleteGroup(g: any) {
    if (!confirm(`Eliminar grupo "${g.name}"?`)) return;
    this.http.delete(`${API_URL}/communication/groups/${g.id}`).subscribe({ next: () => this.load(), error: e => alert(e.error?.message || 'Error') });
  }
}
