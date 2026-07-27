import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-notification-templates',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h5 class="mb-0"><i class="bi bi-file-earmark-text me-2"></i>Plantillas de Notificaciones</h5>
      <button class="btn btn-sm btn-primary" (click)="showCreateModal=true; resetForm()"><i class="bi bi-plus-circle me-1"></i>Nueva Plantilla</button>
    </div>

    <div class="row g-2 mb-3">
      <div class="col-md-3">
        <div class="card border-0 shadow-sm bg-primary text-white text-center">
          <div class="card-body py-3"><div class="fs-3 fw-bold">{{ templates.length }}</div><div class="small">Total Plantillas</div></div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card border-0 shadow-sm bg-success text-white text-center">
          <div class="card-body py-3"><div class="fs-3 fw-bold">{{ activeCount }}</div><div class="small">Activas</div></div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card border-0 shadow-sm bg-info text-white text-center">
          <div class="card-body py-3"><div class="fs-3 fw-bold">{{ emailCount }}</div><div class="small">Email</div></div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card border-0 shadow-sm bg-warning text-dark text-center">
          <div class="card-body py-3"><div class="fs-3 fw-bold">{{ smsCount }}</div><div class="small">SMS</div></div>
        </div>
      </div>
    </div>

    <div class="card border-0 shadow-sm">
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-sm mb-0">
            <thead class="table-light">
              <tr><th>Nombre</th><th>Asunto</th><th>Canal</th><th>Evento</th><th>Estado</th><th></th></tr>
            </thead>
            <tbody>
              <tr *ngFor="let t of templates; let i = index">
                <td class="fw-semibold">{{ t.name }}</td>
                <td>{{ t.subject }}</td>
                <td><span class="badge" [class.bg-info]="t.channel==='IN_APP'" [class.bg-primary]="t.channel==='EMAIL'" [class.bg-success]="t.channel==='SMS'" [class.bg-warning]="t.channel==='PUSH'">{{ channelLabel(t.channel) }}</span></td>
                <td>{{ t.eventType || '-' }}</td>
                <td><span class="badge" [class.bg-success]="t.active" [class.bg-secondary]="!t.active">{{ t.active ? 'Activa' : 'Inactiva' }}</span></td>
                <td>
                  <button class="btn btn-sm btn-outline-primary me-1" (click)="edit(t, i)"><i class="bi bi-pencil"></i></button>
                  <button class="btn btn-sm btn-outline-danger" (click)="deleteTemplate(i)"><i class="bi bi-trash"></i></button>
                </td>
              </tr>
              <tr *ngIf="templates.length===0"><td colspan="6" class="text-center text-muted py-3">No hay plantillas configuradas</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div class="modal d-block" *ngIf="showCreateModal" tabindex="-1" style="background:rgba(0,0,0,0.5)">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header py-2"><h6 class="modal-title">{{ editIndex !== null ? 'Editar' : 'Nueva' }} Plantilla</h6></div>
          <div class="modal-body">
            <div class="row g-3">
              <div class="col-md-6"><label class="form-label small">Nombre *</label><input class="form-control form-control-sm" [(ngModel)]="formData.name"></div>
              <div class="col-md-6"><label class="form-label small">Canal *</label>
                <select class="form-select form-select-sm" [(ngModel)]="formData.channel"><option value="IN_APP">In-App</option><option value="EMAIL">Email</option><option value="SMS">SMS</option><option value="PUSH">Push</option></select>
              </div>
              <div class="col-md-6"><label class="form-label small">Asunto *</label><input class="form-control form-control-sm" [(ngModel)]="formData.subject"></div>
              <div class="col-md-6"><label class="form-label small">Tipo Evento</label>
                <select class="form-select form-select-sm" [(ngModel)]="formData.eventType">
                  <option value="">Seleccionar...</option>
                  <option value="ACADEMICO">Academico</option><option value="CONDUCTA">Conducta</option><option value="FINANCIERO">Financiero</option>
                  <option value="ASISTENCIA">Asistencia</option><option value="SALUD">Salud</option><option value="GENERAL">General</option>
                </select>
              </div>
              <div class="col-12"><label class="form-label small">Cuerpo del Mensaje *</label><textarea class="form-control form-control-sm" [(ngModel)]="formData.bodyTemplate" rows="4" placeholder="Use {{nombre}}, {{curso}}, {{periodo}} para campos dinamicos"></textarea></div>
              <div class="col-12"><label class="form-check-label"><input type="checkbox" class="form-check-input" [(ngModel)]="formData.active"> Plantilla activa</label></div>
            </div>
          </div>
          <div class="modal-footer py-2">
            <button class="btn btn-sm btn-secondary" (click)="showCreateModal=false">Cancelar</button>
            <button class="btn btn-sm btn-primary" (click)="save()" [disabled]="!formData.name || !formData.subject || !formData.bodyTemplate">{{ editIndex !== null ? 'Actualizar' : 'Crear' }}</button>
          </div>
        </div>
      </div>
    </div>

    <div *ngIf="message" class="position-fixed bottom-0 end-0 p-3" style="z-index:1050">
      <div class="toast show bg-success"><div class="toast-body text-white">{{ message }}</div></div>
    </div>
  `
})
export class NotificationTemplatesComponent implements OnInit {
  templates: any[] = [];
  showCreateModal = false;
  editIndex: number | null = null;
  formData: any = { name: '', subject: '', bodyTemplate: '', channel: 'IN_APP', eventType: '', active: true };
  message = '';

  get activeCount(): number { return this.templates.filter(t => t.active).length; }
  get emailCount(): number { return this.templates.filter(t => t.channel === 'EMAIL').length; }
  get smsCount(): number { return this.templates.filter(t => t.channel === 'SMS').length; }

  ngOnInit() { this.load(); }

  load() {
    const stored = localStorage.getItem('notification_templates');
    this.templates = stored ? JSON.parse(stored) : this.getDefaultTemplates();
  }

  private saveToStorage() {
    localStorage.setItem('notification_templates', JSON.stringify(this.templates));
  }

  getDefaultTemplates(): any[] {
    return [
      { name: 'Aviso Academico', subject: 'Aviso importante - {{curso}}', bodyTemplate: 'Estimado/a padre/madre de {{nombre}}: Le informamos sobre novedades academicas en el periodo {{periodo}}.', channel: 'EMAIL', eventType: 'ACADEMICO', active: true },
      { name: 'Notificacion de Nota', subject: 'Calificacion registrada', bodyTemplate: 'Su representado {{nombre}} ha obtenido una calificacion de {{nota}} en {{materia}}.', channel: 'IN_APP', eventType: 'ACADEMICO', active: true },
      { name: 'Alerta de Asistencia', subject: 'Inasistencia registrada', bodyTemplate: 'Se ha registrado una inasistencia de {{nombre}} el dia {{fecha}}. Justificacion: {{justificacion}}', channel: 'SMS', eventType: 'ASISTENCIA', active: true },
      { name: 'Recordatorio de Pago', subject: 'Pension pendiente - {{curso}}', bodyTemplate: 'Estimado/a padre/madre: Se recuerda que la pension de {{monto}} esta pendiente de pago. Fecha limite: {{fecha_limite}}', channel: 'EMAIL', eventType: 'FINANCIERO', active: true },
      { name: 'Conducta - Merito', subject: 'Merito registrado', bodyTemplate: 'Felicitaciones! {{nombre}} ha sido reconocido(a) por: {{descripcion}}. Puntos: {{puntos}}', channel: 'IN_APP', eventType: 'CONDUCTA', active: true },
    ];
  }

  save() {
    if (this.editIndex !== null) {
      this.templates[this.editIndex] = { ...this.formData };
    } else {
      this.templates.push({ ...this.formData });
    }
    this.saveToStorage();
    this.showEditModal = false;
    this.showCreateModal = false;
    this.editIndex = null;
    this.message = this.editIndex !== null ? 'Plantilla actualizada' : 'Plantilla creada';
    this.resetForm();
    setTimeout(() => this.message = '', 3000);
  }

  edit(t: any, i: number) {
    this.editIndex = i;
    this.formData = { ...t };
    this.showCreateModal = true;
  }

  deleteTemplate(i: number) {
    if (!confirm('Eliminar plantilla?')) return;
    this.templates.splice(i, 1);
    this.saveToStorage();
    this.message = 'Plantilla eliminada';
    setTimeout(() => this.message = '', 3000);
  }

  resetForm() {
    this.formData = { name: '', subject: '', bodyTemplate: '', channel: 'IN_APP', eventType: '', active: true };
  }

  channelLabel(c: string): string {
    const m: Record<string, string> = { IN_APP: 'In-App', EMAIL: 'Email', SMS: 'SMS', PUSH: 'Push' };
    return m[c] || c;
  }

  private showEditModal = false;
}
