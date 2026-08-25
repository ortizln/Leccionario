import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../core/api.config';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h5 class="mb-0"><i class="bi bi-bell me-2"></i>Notificaciones</h5>
      <span class="badge bg-danger" *ngIf="unreadCount>0">{{ unreadCount }} sin leer</span>
    </div>

    <div class="row g-3 mb-4">
      <div class="col-md-3">
        <div class="card border-0 shadow-sm bg-primary text-white text-center">
          <div class="card-body py-3"><div class="fs-3 fw-bold">{{ unreadCount }}</div><div class="small">Sin Leer</div></div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card border-0 shadow-sm bg-success text-white text-center">
          <div class="card-body py-3"><div class="fs-3 fw-bold">{{ readCount }}</div><div class="small">Leidas</div></div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card border-0 shadow-sm bg-warning text-dark text-center">
          <div class="card-body py-3"><div class="fs-3 fw-bold">{{ urgentCount }}</div><div class="small">Urgentes</div></div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card border-0 shadow-sm bg-info text-white text-center">
          <div class="card-body py-3"><div class="fs-3 fw-bold">{{ unreadMessages }}</div><div class="small">Mensajes</div></div>
        </div>
      </div>
    </div>

    <ul class="nav nav-tabs mb-3">
      <li class="nav-item"><a class="nav-link" [class.active]="tab==='notifications'" (click)="tab='notifications'" role="button">Notificaciones</a></li>
      <li class="nav-item"><a class="nav-link" [class.active]="tab==='messages'" (click)="tab='messages'" role="button">Mensajes</a></li>
      <li class="nav-item"><a class="nav-link" [class.active]="tab==='sent'" (click)="tab='sent'" role="button">Enviados</a></li>
    </ul>

    @if (tab === 'notifications') {
      <div class="list-group">
        <div class="list-group-item list-group-item-action d-flex gap-3" *ngFor="let n of notifications" [class.fw-bold]="!n.readStatus" (click)="markRead(n)">
          <div>
            <i class="bi" [class.bi-bell-fill]="n.priority==='NORMAL'" [class.text-warning]="n.priority==='ALTA'" [class.text-danger]="n.priority==='URGENTE'"></i>
          </div>
          <div class="flex-grow-1">
            <div class="d-flex justify-content-between">
              <h6 class="mb-0">{{ n.title }}</h6>
              <small class="text-muted">{{ n.sentAt | date:'dd/MM HH:mm' }}</small>
            </div>
            <p class="mb-0 small text-muted">{{ n.message }}</p>
          </div>
          <span class="badge" [class.bg-danger]="n.priority==='URGENTE'" [class.bg-warning]="n.priority==='ALTA'" [class.bg-secondary]="!n.readStatus">{{ n.readStatus ? '' : 'Nuevo' }}</span>
        </div>
        <div *ngIf="notifications.length===0" class="text-center text-muted py-4">Sin notificaciones</div>
      </div>
    }

    @if (tab === 'messages') {
      <div class="card border-0 shadow-sm mb-3">
        <div class="card-header bg-white d-flex justify-content-between">
          <h6 class="mb-0">Bandeja de Entrada</h6>
          <button class="btn btn-sm btn-primary" (click)="showComposeModal=true"><i class="bi bi-pencil me-1"></i>Nuevo</button>
        </div>
        <div class="card-body p-0">
          <div class="list-group list-group-flush">
            <div class="list-group-item list-group-item-action" *ngFor="let m of inboxMessages">
              <div class="d-flex justify-content-between">
                <h6 class="mb-0">{{ m.subject }}</h6>
                <small class="text-muted">{{ m.createdAt | date:'dd/MM HH:mm' }}</small>
              </div>
              <p class="mb-0 small text-muted">{{ m.body | slice:0:100 }}...</p>
            </div>
            <div *ngIf="inboxMessages.length===0" class="text-center text-muted py-3">Bandeja vacia</div>
          </div>
        </div>
      </div>
    }

    @if (tab === 'sent') {
      <div class="card border-0 shadow-sm">
        <div class="card-header bg-white"><h6 class="mb-0">Mensajes Enviados</h6></div>
        <div class="card-body p-0">
          <div class="list-group list-group-flush">
            <div class="list-group-item" *ngFor="let m of sentMessages">
              <div class="d-flex justify-content-between">
                <h6 class="mb-0">{{ m.subject }}</h6>
                <small class="text-muted">{{ m.createdAt | date:'dd/MM HH:mm' }}</small>
              </div>
              <p class="mb-0 small text-muted">{{ m.body | slice:0:100 }}...</p>
            </div>
            <div *ngIf="sentMessages.length===0" class="text-center text-muted py-3">Sin mensajes enviados</div>
          </div>
        </div>
      </div>
    }

    <div class="modal d-block" *ngIf="showComposeModal" tabindex="-1" style="background:rgba(0,0,0,0.5)">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header"><h6 class="modal-title">Nuevo Mensaje</h6></div>
          <div class="modal-body">
            <div class="row g-3">
              <div class="col-12"><label class="form-label small">Para (IDs separados por coma) *</label><input class="form-control form-control-sm" [(ngModel)]="newMsg.recipientIds"></div>
              <div class="col-12"><label class="form-label small">Asunto *</label><input class="form-control form-control-sm" [(ngModel)]="newMsg.subject"></div>
              <div class="col-12"><label class="form-label small">Mensaje *</label><textarea class="form-control form-control-sm" [(ngModel)]="newMsg.body" rows="4"></textarea></div>
              <div class="col-md-6"><label class="form-label small">Prioridad</label>
                <select class="form-select form-select-sm" [(ngModel)]="newMsg.priority"><option value="NORMAL">Normal</option><option value="ALTA">Alta</option><option value="BAJA">Baja</option></select>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-sm btn-secondary" (click)="showComposeModal=false">Cancelar</button>
            <button class="btn btn-sm btn-primary" (click)="sendMsg()">Enviar</button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class NotificationsComponent implements OnInit {
  tab = 'notifications';
  notifications: any[] = [];
  inboxMessages: any[] = [];
  sentMessages: any[] = [];
  unreadCount = 0;
  readCount = 0;
  urgentCount = 0;
  unreadMessages = 0;
  showComposeModal = false;
  newMsg: any = { recipientIds: '', subject: '', body: '', priority: 'NORMAL' };
  userId = 0;

  constructor(private http: HttpClient, private auth: AuthService) {}

  ngOnInit() {
    const token = this.auth.token();
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        this.userId = payload.userId || payload.sub || 1;
      } catch { this.userId = 1; }
    }
    this.load();
  }

  load() {
    this.http.get<any[]>(`${API_URL}/communication/notifications`).subscribe({
      next: r => {
        this.notifications = r;
        this.unreadCount = r.filter(n => !n.readStatus).length;
        this.readCount = r.filter(n => n.readStatus).length;
        this.urgentCount = r.filter(n => n.priority === 'URGENTE' && !n.readStatus).length;
      },
      error: () => {}
    });
    this.http.get<any[]>(`${API_URL}/communication/messages/inbox`).subscribe({
      next: r => { this.inboxMessages = r; this.unreadMessages = r.length; },
      error: () => {}
    });
    this.http.get<any[]>(`${API_URL}/communication/messages/sent`).subscribe({
      next: r => this.sentMessages = r,
      error: () => {}
    });
  }

  markRead(n: any) {
    if (!n.readStatus) {
      this.http.post(`${API_URL}/communication/notifications/${n.id}/read`, {}).subscribe({ next: () => this.load() });
    }
  }

  sendMsg() {
    const ids = this.newMsg.recipientIds.split(',').map((s: string) => parseInt(s.trim())).filter((n: number) => !isNaN(n));
    this.http.post(`${API_URL}/communication/messages`, {
      institutionId: this.auth.institutionId() || 1, senderId: this.userId, subject: this.newMsg.subject,
      body: this.newMsg.body, priority: this.newMsg.priority, recipientIds: ids
    }).subscribe({
      next: () => { this.showComposeModal = false; this.load(); },
      error: e => alert(e.error?.message || 'Error')
    });
  }
}
