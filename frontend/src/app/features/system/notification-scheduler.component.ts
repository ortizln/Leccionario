import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../core/api.config';

@Component({
  templateUrl: './notification-scheduler.component.html',
  styleUrl: './notification-scheduler.component.css',
    selector: 'app-notification-scheduler',
  standalone: true,
  imports: [CommonModule],
})
export class NotificationSchedulerComponent implements OnInit {
  loading = false;
  status: any = null;
  statusEntries: { name: string; schedule: string }[] = [];
  message = '';
  messageType = 'ok';

  tasks = [
    { label: 'Recordatorios Asistencia', schedule: 'Lun-Vie 07:00', description: 'Envia recordatorios de asistencia a estudiantes', endpoint: 'attendance-reminders' },
    { label: 'Prestamos Vencidos', schedule: 'Lun 08:00', description: 'Alerta sobre libros prestados vencidos', endpoint: 'overdue-loans' },
    { label: 'Resumen Financiero', schedule: '1er dia mes 09:00', description: 'Resumen de facturas pendientes por institucion', endpoint: 'monthly-finance' },
    { label: 'Garantias por Vencer', schedule: 'Diario 10:00', description: 'Alerta de garantias de activos por vencer', endpoint: 'warranty-alerts' }
  ];

  constructor(private http: HttpClient) {}

  ngOnInit() { this.loadStatus(); }

  loadStatus() {
    this.loading = true;
    this.http.get<any>(`${API_URL}/notification-scheduler/status`).subscribe({
      next: (data) => {
        this.status = data;
        this.statusEntries = data.tasks ? Object.entries(data.tasks).map(([k, v]) => ({ name: k, schedule: v as string })) : [];
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  triggerTask(endpoint: string) {
    this.loading = true;
    this.message = '';
    this.http.post<any>(`${API_URL}/notification-scheduler/trigger/${endpoint}`, {}).subscribe({
      next: (data) => { this.message = `Tarea "${data.task}" ejecutada exitosamente`; this.messageType = 'ok'; this.loading = false; },
      error: () => { this.message = 'Error al ejecutar la tarea'; this.messageType = 'error'; this.loading = false; }
    });
  }

  triggerAll() {
    this.loading = true;
    this.message = '';
    this.http.post<any>(`${API_URL}/notification-scheduler/trigger/all`, {}).subscribe({
      next: (data) => { this.message = `Todas las tareas ejecutadas`; this.messageType = 'ok'; this.loading = false; },
      error: () => { this.message = 'Error al ejecutar tareas'; this.messageType = 'error'; this.loading = false; }
    });
  }
}
