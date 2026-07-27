import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../core/api.config';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-agenda',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h5 class="mb-0"><i class="bi bi-calendar4-week me-2"></i>Agenda Institucional</h5>
    </div>

    <div class="row g-3 mb-3">
      <div class="col-md-3">
        <div class="card border-0 shadow-sm bg-primary text-white text-center">
          <div class="card-body py-3"><div class="fs-4 fw-bold">{{ events.length }}</div><div class="small">Eventos</div></div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card border-0 shadow-sm bg-success text-white text-center">
          <div class="card-body py-3"><div class="fs-4 fw-bold">{{ upcoming.length }}</div><div class="small">Proximos</div></div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card border-0 shadow-sm bg-info text-white text-center">
          <div class="card-body py-3"><div class="fs-4 fw-bold">{{ calendarEvents.length }}</div><div class="small">Calendario</div></div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card border-0 shadow-sm bg-warning text-dark text-center">
          <div class="card-body py-3"><div class="fs-4 fw-bold">{{ circulars.length }}</div><div class="small">Circulares</div></div>
        </div>
      </div>
    </div>

    <div class="row g-3">
      <div class="col-md-8">
        <div class="card border-0 shadow-sm">
          <div class="card-header bg-white py-2"><h6 class="mb-0"><i class="bi bi-calendar-event me-2"></i>Proximos Eventos</h6></div>
          <div class="card-body p-0">
            @if (upcoming.length === 0) {
              <div class="text-center text-muted py-4"><i class="bi bi-calendar-x fs-1 d-block mb-2"></i><small>No hay eventos proximos</small></div>
            }
            @for (e of upcoming; track e.id) {
              <div class="d-flex align-items-start gap-3 p-3 border-bottom">
                <div class="text-center" style="min-width:50px">
                  <div class="bg-primary text-white rounded py-1 px-2"><small class="fw-bold">{{ e.eventDate | date:'dd' }}</small></div>
                  <small class="text-muted">{{ e.eventDate | date:'MMM' }}</small>
                </div>
                <div class="flex-grow-1">
                  <div class="fw-semibold">{{ e.title }}</div>
                  <small class="text-muted">{{ e.description }}</small>
                  <div><span class="badge bg-secondary mt-1">{{ e.eventType }}</span></div>
                </div>
              </div>
            }
          </div>
        </div>
      </div>

      <div class="col-md-4">
        <div class="card border-0 shadow-sm mb-3">
          <div class="card-header bg-white py-2"><h6 class="mb-0"><i class="bi bi-megaphone me-2"></i>Circulares Recientes</h6></div>
          <div class="card-body p-0">
            @for (c of circulars; track c.id) {
              <div class="p-3 border-bottom">
                <div class="fw-semibold small">{{ c.title }}</div>
                <small class="text-muted">{{ c.createdAt | date:'dd/MM/yyyy' }}</small>
              </div>
            }
            @if (circulars.length === 0) {
              <div class="text-center text-muted py-3"><small>Sin circulares</small></div>
            }
          </div>
        </div>

        <div class="card border-0 shadow-sm">
          <div class="card-header bg-white py-2"><h6 class="mb-0"><i class="bi bi-calendar3 me-2"></i>Periodo Academico</h6></div>
          <div class="card-body">
            @if (activePeriod) {
              <div class="fw-semibold">{{ activePeriod.name }}</div>
              <small class="text-muted">{{ activePeriod.startDate | date:'dd/MM/yyyy' }} - {{ activePeriod.endDate | date:'dd/MM/yyyy' }}</small>
            } @else {
              <small class="text-muted">No hay periodo activo</small>
            }
          </div>
        </div>
      </div>
    </div>
  `
})
export class AgendaComponent implements OnInit {
  events: any[] = [];
  upcoming: any[] = [];
  calendarEvents: any[] = [];
  circulars: any[] = [];
  activePeriod: any = null;
  private get instId(): number { return this.auth.institutionId() || 1; }

  constructor(private http: HttpClient, private auth: AuthService) {}

  ngOnInit() {
    this.http.get<any[]>(`${API_URL}/api/communication/events?institutionId=${this.instId}`).subscribe(d => this.events = d);
    this.http.get<any[]>(`${API_URL}/api/communication/events/upcoming?institutionId=${this.instId}`).subscribe(d => this.upcoming = d);
    this.http.get<any[]>(`${API_URL}/api/institution/calendar/institution/${this.instId}`).subscribe({
      next: d => this.calendarEvents = d,
      error: () => this.calendarEvents = []
    });
    this.http.get<any[]>(`${API_URL}/api/communication/circulars?institutionId=${this.instId}`).subscribe({
      next: d => this.circulars = d.slice(0, 5),
      error: () => this.circulars = []
    });
    this.http.get<any[]>(`${API_URL}/api/institution/periods/active?institutionId=${this.instId}`).subscribe({
      next: (d: any[]) => this.activePeriod = d.length > 0 ? d[0] : null,
      error: () => this.activePeriod = null
    });
  }
}
