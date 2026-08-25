import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../core/api.config';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-communication-stats',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h5 class="mb-0"><i class="bi bi-bar-chart-line me-2"></i>Estadisticas de Comunicacion</h5>
      <button class="btn btn-sm btn-outline-primary" (click)="load()"><i class="bi bi-arrow-clockwise me-1"></i>Actualizar</button>
    </div>

    <div class="row g-3 mb-4">
      <div class="col-md-3">
        <div class="card border-0 shadow-sm bg-info text-white text-center">
          <div class="card-body py-3"><div class="fs-3 fw-bold">{{ stats.totalNotifications || 0 }}</div><div class="small">Notificaciones</div></div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card border-0 shadow-sm bg-primary text-white text-center">
          <div class="card-body py-3"><div class="fs-3 fw-bold">{{ stats.totalMessages || 0 }}</div><div class="small">Mensajes</div></div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card border-0 shadow-sm bg-success text-white text-center">
          <div class="card-body py-3"><div class="fs-3 fw-bold">{{ stats.totalParentComms || 0 }}</div><div class="small">Comunic. Padres</div></div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card border-0 shadow-sm bg-warning text-dark text-center">
          <div class="card-body py-3"><div class="fs-3 fw-bold">{{ stats.activeGroups || 0 }}</div><div class="small">Grupos Activos</div></div>
        </div>
      </div>
    </div>

    <div class="row g-3">
      <div class="col-md-6">
        <div class="card border-0 shadow-sm">
          <div class="card-header bg-white"><h6 class="mb-0"><i class="bi bi-bell me-2"></i>Notificaciones Recientes</h6></div>
          <div class="card-body p-0">
            <div class="list-group list-group-flush">
              <div class="list-group-item" *ngFor="let n of recentNotifications">
                <div class="d-flex justify-content-between">
                  <span>{{ n.title || n.message }}</span>
                  <small class="text-muted">{{ n.createdAt | date:'dd/MM HH:mm' }}</small>
                </div>
                <span class="badge bg-secondary small">{{ n.channel || n.type }}</span>
              </div>
              <div *ngIf="recentNotifications.length===0" class="text-center text-muted py-3 small">Sin notificaciones</div>
            </div>
          </div>
        </div>
      </div>

      <div class="col-md-6">
        <div class="card border-0 shadow-sm">
          <div class="card-header bg-white"><h6 class="mb-0"><i class="bi bi-people me-2"></i>Grupos de Comunicacion</h6></div>
          <div class="card-body p-0">
            <div class="list-group list-group-flush">
              <div class="list-group-item" *ngFor="let g of groups">
                <div class="d-flex justify-content-between">
                  <span>{{ g.name }}</span>
                  <span class="badge bg-info">{{ g.memberCount || '?' }} miembros</span>
                </div>
                <small class="text-muted">{{ g.groupType }}</small>
              </div>
              <div *ngIf="groups.length===0" class="text-center text-muted py-3 small">Sin grupos</div>
            </div>
          </div>
        </div>
      </div>

      <div class="col-md-6">
        <div class="card border-0 shadow-sm">
          <div class="card-header bg-white"><h6 class="mb-0"><i class="bi bi-chat-left-text me-2"></i>Mensajes Recientes</h6></div>
          <div class="card-body p-0">
            <div class="list-group list-group-flush">
              <div class="list-group-item" *ngFor="let m of recentMessages">
                <div class="d-flex justify-content-between">
                  <strong class="small">{{ m.subject }}</strong>
                  <small class="text-muted">{{ m.createdAt | date:'dd/MM HH:mm' }}</small>
                </div>
                <p class="mb-0 small text-muted">{{ m.body | slice:0:60 }}...</p>
              </div>
              <div *ngIf="recentMessages.length===0" class="text-center text-muted py-3 small">Sin mensajes</div>
            </div>
          </div>
        </div>
      </div>

      <div class="col-md-6">
        <div class="card border-0 shadow-sm">
          <div class="card-header bg-white"><h6 class="mb-0"><i class="bi bi-people-fill me-2"></i>Comunicacion con Padres</h6></div>
          <div class="card-body p-0">
            <div class="table-responsive">
              <table class="table table-sm mb-0">
                <thead class="table-light"><tr><th>Tipo</th><th>Canal</th><th>Estado</th><th>Fecha</th></tr></thead>
                <tbody>
                  <tr *ngFor="let c of parentComms">
                    <td><span class="badge bg-info">{{ c.communicationType }}</span></td>
                    <td>{{ c.channel }}</td>
                    <td><span class="badge" [class.bg-success]="c.status==='COMPLETADO'" [class.bg-warning]="c.status==='PENDIENTE'">{{ c.status }}</span></td>
                    <td class="small">{{ c.createdAt | date:'dd/MM/yyyy' }}</td>
                  </tr>
                  <tr *ngIf="parentComms.length===0"><td colspan="4" class="text-center text-muted py-3">Sin comunicaciones</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class CommunicationStatsComponent implements OnInit {
  stats: any = {};
  recentNotifications: any[] = [];
  recentMessages: any[] = [];
  groups: any[] = [];
  parentComms: any[] = [];

  constructor(private http: HttpClient, private auth: AuthService) {}
  ngOnInit() { this.load(); }
  private get instId(): number { return this.auth.institutionId() || 1; }
  private get uid(): number { return this.auth.userId() || 1; }

  load() {
    this.http.get<any>(`${API_URL}/bi/communication-stats?institutionId=${this.instId}`).subscribe({ next: r => this.stats = r, error: () => {} });
    this.http.get<any[]>(`${API_URL}/communication/notifications`).subscribe({ next: r => this.recentNotifications = r.slice(0, 5), error: () => {} });
    this.http.get<any[]>(`${API_URL}/communication/messages/sent`).subscribe({ next: r => this.recentMessages = r.slice(0, 5), error: () => {} });
    this.http.get<any[]>(`${API_URL}/communication/groups?institutionId=${this.instId}`).subscribe({ next: r => this.groups = r.slice(0, 5), error: () => {} });
    this.http.get<any[]>(`${API_URL}/communication/parent-comm/student/${this.uid}`).subscribe({ next: r => this.parentComms = r.slice(0, 5), error: () => {} });
  }
}
