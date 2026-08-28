import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  templateUrl: './notification-templates.component.html',
  styleUrl: './notification-templates.component.css',
    selector: 'app-notification-templates',
  standalone: true,
  imports: [CommonModule, FormsModule],
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
