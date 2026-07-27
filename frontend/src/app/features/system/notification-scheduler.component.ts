import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../core/api.config';

@Component({
  selector: 'app-notification-scheduler',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container-fluid py-3">
      <h5 class="mb-3"><i class="bi bi-clock-history me-2"></i>Programador de Notificaciones</h5>

      <div class="row g-3 mb-4">
        <div class="col-md-3" *ngFor="let task of tasks">
          <div class="card h-100">
            <div class="card-body text-center">
              <h6 class="card-title">{{ task.label }}</h6>
              <p class="card-text text-muted small mb-2">{{ task.schedule }}</p>
              <p class="card-text text-muted small mb-2">{{ task.description }}</p>
              <button class="btn btn-sm btn-outline-primary" (click)="triggerTask(task.endpoint)" [disabled]="loading">
                <i class="bi bi-play-fill me-1"></i>Ejecutar
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="mb-3">
        <button class="btn btn-sm btn-primary me-2" (click)="triggerAll()" [disabled]="loading">
          <i class="bi bi-play-circle me-1"></i>Ejecutar Todas
        </button>
        <button class="btn btn-sm btn-outline-secondary" (click)="loadStatus()" [disabled]="loading">
          <i class="bi bi-arrow-clockwise me-1"></i>Actualizar Estado
        </button>
      </div>

      <div *ngIf="status" class="card">
        <div class="card-header"><i class="bi bi-info-circle me-1"></i>Estado del Programador</div>
        <div class="card-body">
          <p><strong>Estado:</strong> <span class="badge bg-success">{{ status.status }}</span></p>
          <table class="table table-sm table-bordered mb-0">
            <thead><tr><th>Tarea</th><th>Horario</th></tr></thead>
            <tbody>
              <tr *ngFor="let entry of statusEntries"><td>{{ entry.name }}</td><td><code>{{ entry.schedule }}</code></td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <div *ngIf="message" class="alert" [class.alert-success]="messageType==='ok'" [class.alert-danger]="messageType==='error'" class="mt-3">
        {{ message }}
      </div>
    </div>
  `
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
