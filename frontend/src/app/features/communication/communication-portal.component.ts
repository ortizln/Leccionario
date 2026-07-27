import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../core/api.config';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-communication-portal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h5 class="mb-0"><i class="bi bi-compass me-2"></i>Portal de Comunicacion</h5>
      <span class="badge bg-info">{{ portalData.unreadNotifications || 0 }} sin leer</span>
    </div>

    <div class="row g-3 mb-4">
      <div class="col-md-3">
        <div class="card border-0 shadow-sm bg-warning text-dark text-center">
          <div class="card-body py-3">
            <div class="fs-3 fw-bold">{{ portalData.unreadNotifications || 0 }}</div>
            <div class="small">Notificaciones Sin Leer</div>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card border-0 shadow-sm bg-primary text-white text-center">
          <div class="card-body py-3">
            <div class="fs-3 fw-bold">{{ portalData.activeGroups || 0 }}</div>
            <div class="small">Grupos Activos</div>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card border-0 shadow-sm bg-success text-white text-center">
          <div class="card-body py-3">
            <div class="fs-3 fw-bold">{{ portalData.upcomingEvents?.length || 0 }}</div>
            <div class="small">Proximos Eventos</div>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card border-0 shadow-sm bg-info text-white text-center">
          <div class="card-body py-3">
            <div class="fs-3 fw-bold">{{ portalData.totalCirculars || 0 }}</div>
            <div class="small">Circulares</div>
          </div>
        </div>
      </div>
    </div>

    <div class="row g-3">
      <div class="col-md-6">
        <div class="card border-0 shadow-sm h-100">
          <div class="card-body">
            <h6><i class="bi bi-bell me-2"></i>Notificaciones Recientes</h6>
            <div *ngIf="portalData.recentNotifications?.length; else noNotifs">
              <div *ngFor="let n of portalData.recentNotifications" class="d-flex align-items-start border-bottom py-2">
                <div class="me-2">
                  <span *ngIf="n.read" class="badge bg-success">Leido</span>
                  <span *ngIf="!n.read" class="badge bg-warning text-dark">Nuevo</span>
                </div>
                <div>
                  <div class="fw-semibold small">{{ n.title }}</div>
                  <div class="text-muted small">{{ n.message | slice:0:80 }}{{ n.message.length > 80 ? '...' : '' }}</div>
                  <div class="text-muted" style="font-size:0.75rem">{{ n.channel }} | {{ n.sentAt | date:'dd/MM HH:mm' }}</div>
                </div>
              </div>
            </div>
            <ng-template #noNotifs><p class="text-muted">Sin notificaciones recientes</p></ng-template>
          </div>
        </div>
      </div>
      <div class="col-md-6">
        <div class="card border-0 shadow-sm h-100">
          <div class="card-body">
            <h6><i class="bi bi-calendar-event me-2"></i>Proximos Eventos</h6>
            <div *ngIf="portalData.upcomingEvents?.length; else noEvents">
              <div *ngFor="let e of portalData.upcomingEvents" class="d-flex align-items-start border-bottom py-2">
                <div class="me-3 text-center bg-primary text-white rounded p-2" style="min-width:50px">
                  <div class="fw-bold">{{ e.eventDate | date:'dd' }}</div>
                  <div style="font-size:0.7rem">{{ e.eventDate | date:'MMM' }}</div>
                </div>
                <div>
                  <div class="fw-semibold small">{{ e.title }}</div>
                  <div class="text-muted small">{{ e.eventType }} | {{ e.location }}</div>
                </div>
              </div>
            </div>
            <ng-template #noEvents><p class="text-muted">Sin eventos proximos</p></ng-template>
          </div>
        </div>
      </div>
    </div>
  `
})
export class CommunicationPortalComponent implements OnInit {
  portalData: any = {};

  constructor(private http: HttpClient, private auth: AuthService) {}
  ngOnInit() { this.load(); }
  private get instId(): number { return this.auth.institutionId() || 1; }

  load() {
    this.http.get<any>(`${API_URL}/communication/portal?institutionId=${this.instId}`).subscribe({
      next: r => this.portalData = r,
      error: () => {}
    });
  }
}
