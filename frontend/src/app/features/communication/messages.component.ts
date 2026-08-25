import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../core/api.config';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h5 class="mb-0"><i class="bi bi-envelope me-2"></i>Mensajes Internos</h5>
      <div class="d-flex gap-2">
        <span class="badge bg-danger" *ngIf="unreadCount > 0">{{ unreadCount }} sin leer</span>
        <button class="btn btn-sm btn-outline-secondary" (click)="markAllRead()"><i class="bi bi-check-all me-1"></i>Marcar todo leido</button>
        <button class="btn btn-sm btn-primary" (click)="showComposeModal=true"><i class="bi bi-pencil me-1"></i>Nuevo</button>
      </div>
    </div>

    <ul class="nav nav-tabs mb-3">
      <li class="nav-item"><a class="nav-link" [class.active]="tab==='inbox'" (click)="tab='inbox'" role="button">Bandeja de Entrada</a></li>
      <li class="nav-item"><a class="nav-link" [class.active]="tab==='sent'" (click)="tab='sent'" role="button">Enviados</a></li>
    </ul>

    @if (tab === 'inbox') {
      <div class="card border-0 shadow-sm">
        <div class="card-body p-0">
          <div class="list-group list-group-flush">
            <div class="list-group-item list-group-item-action" [class.fw-bold]="!m.read" [class.bg-light]="!m.read" *ngFor="let m of inbox" (click)="m._expanded=!m._expanded">
              <div class="d-flex justify-content-between">
                <div>
                  <span class="badge me-2" [class.bg-danger]="m.priority==='URGENTE'" [class.bg-warning]="m.priority==='ALTA'" [class.bg-info]="m.priority==='NORMAL'">{{ m.priority }}</span>
                  <strong>{{ m.subject }}</strong>
                </div>
                <small class="text-muted">{{ m.createdAt | date:'dd/MM/yyyy HH:mm' }}</small>
              </div>
              <p class="mb-0 small text-muted mt-1" *ngIf="!m._expanded">{{ m.body | slice:0:80 }}...</p>
              @if (m._expanded) {
                <div class="mt-2">
                  <p class="small">{{ m.body }}</p>
                  <div class="d-flex gap-2">
                    <button class="btn btn-sm btn-outline-primary" (click)="reply(m)"><i class="bi bi-reply me-1"></i>Responder</button>
                    <button class="btn btn-sm btn-outline-success" *ngIf="!m.read" (click)="markRead(m)"><i class="bi bi-check me-1"></i>Marcar leido</button>
                  </div>
                </div>
              }
            </div>
            <div *ngIf="inbox.length===0" class="text-center text-muted py-4">
              <i class="bi bi-envelope-open fs-1"></i>
              <p class="mt-2">Bandeja de entrada vacia</p>
            </div>
          </div>
        </div>
      </div>
    }

    @if (tab === 'sent') {
      <div class="card border-0 shadow-sm">
        <div class="card-body p-0">
          <div class="list-group list-group-flush">
            <div class="list-group-item" *ngFor="let m of sent">
              <div class="d-flex justify-content-between">
                <div>
                  <span class="badge me-2" [class.bg-danger]="m.priority==='URGENTE'" [class.bg-warning]="m.priority==='ALTA'" [class.bg-info]="m.priority==='NORMAL'">{{ m.priority }}</span>
                  <strong>{{ m.subject }}</strong>
                </div>
                <small class="text-muted">{{ m.createdAt | date:'dd/MM/yyyy HH:mm' }}</small>
              </div>
              <p class="mb-1 small text-muted mt-1">{{ m.body | slice:0:100 }}...</p>
              <div class="d-flex gap-2">
                <span class="small text-muted"><i class="bi bi-people me-1"></i>{{ m.recipientCount }} destinatarios</span>
                <span class="small text-success" *ngIf="m.readCount > 0"><i class="bi bi-eye me-1"></i>{{ m.readCount }} leidos</span>
              </div>
            </div>
            <div *ngIf="sent.length===0" class="text-center text-muted py-4">
              <i class="bi bi-send fs-1"></i>
              <p class="mt-2">Sin mensajes enviados</p>
            </div>
          </div>
        </div>
      </div>
    }

    @if (showComposeModal) {
      <div class="modal d-block" tabindex="-1" style="background:rgba(0,0,0,0.5)">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header"><h6 class="modal-title">Nuevo Mensaje</h6></div>
            <div class="modal-body">
              <div class="mb-3">
                <label class="form-label small">Asunto *</label>
                <input type="text" class="form-control form-control-sm" [(ngModel)]="compose.subject" placeholder="Asunto del mensaje">
              </div>
              <div class="mb-3">
                <label class="form-label small">Prioridad</label>
                <select class="form-select form-select-sm" [(ngModel)]="compose.priority">
                  <option value="NORMAL">Normal</option>
                  <option value="ALTA">Alta</option>
                  <option value="URGENTE">Urgente</option>
                </select>
              </div>
              <div class="mb-3">
                <label class="form-label small">Destinatarios (IDs separados por coma) *</label>
                <input type="text" class="form-control form-control-sm" [(ngModel)]="compose.recipientIds" placeholder="Ej: 1,2,3">
              </div>
              <div class="mb-3">
                <label class="form-label small">Mensaje *</label>
                <textarea class="form-control form-control-sm" rows="5" [(ngModel)]="compose.body" placeholder="Escribe tu mensaje..."></textarea>
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn btn-sm btn-secondary" (click)="showComposeModal=false">Cancelar</button>
              <button class="btn btn-sm btn-primary" (click)="send()" [disabled]="!compose.subject||!compose.body||!compose.recipientIds"><i class="bi bi-send me-1"></i>Enviar</button>
            </div>
          </div>
        </div>
      </div>
    }
  `
})
export class MessagesComponent implements OnInit {
  tab = 'inbox';
  inbox: any[] = [];
  sent: any[] = [];
  unreadCount = 0;
  showComposeModal = false;
  compose = { subject: '', body: '', priority: 'NORMAL', recipientIds: '' };

  constructor(private http: HttpClient, private auth: AuthService) {}
  ngOnInit() { this.load(); }

  private get uid(): number { return this.auth.userId() || 1; }
  private get instId(): number { return this.auth.institutionId() || 1; }

  load() {
    this.http.get<any[]>(`${API_URL}/communication/messages/inbox`).subscribe({ next: r => this.inbox = r, error: () => {} });
    this.http.get<any[]>(`${API_URL}/communication/messages/sent`).subscribe({ next: r => this.sent = r, error: () => {} });
  }

  send() {
    const ids = this.compose.recipientIds.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
    this.http.post<any>(`${API_URL}/communication/messages`, {
      institutionId: this.instId, senderId: this.uid, subject: this.compose.subject,
      body: this.compose.body, priority: this.compose.priority, recipientIds: ids
    }).subscribe({ next: () => { this.showComposeModal = false; this.compose = { subject: '', body: '', priority: 'NORMAL', recipientIds: '' }; this.load(); } });
  }

  markRead(m: any) {
    this.http.post(`${API_URL}/communication/messages/${m.id}/read`, {}).subscribe({ next: () => this.load() });
  }

  markAllRead() {
    this.http.post(`${API_URL}/communication/messages/read-all/${this.uid}`, {}).subscribe({ next: () => this.load() });
  }

  reply(m: any) {
    this.compose.subject = 'RE: ' + m.subject;
    this.compose.recipientIds = '' + m.senderId;
    this.showComposeModal = true;
  }
}
