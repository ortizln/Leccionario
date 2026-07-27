import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../core/api.config';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-school-calendar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h4 class="mb-0 fw-bold">Calendario Escolar</h4>
    </div>

    <div class="row g-2 mb-3">
      <div class="col-md-3">
        <label class="form-label form-label-sm">Mes</label>
        <select class="form-select form-select-sm" [(ngModel)]="filterMonth" (change)="load()">
          <option value="">Todos</option>
          <option *ngFor="let m of months" [value]="m.value">{{m.label}}</option>
        </select>
      </div>
      <div class="col-md-3">
        <label class="form-label form-label-sm">Tipo</label>
        <select class="form-select form-select-sm" [(ngModel)]="filterType" (change)="load()">
          <option value="">Todos</option>
          <option value="INSTITUCIONAL">Institucional</option>
          <option value="ACADEMICO">Academico</option>
          <option value="FERIADO">Feriado</option>
          <option value="VACACIONES">Vacaciones</option>
          <option value="EVALUACION">Evaluacion</option>
          <option value="CAPACITACION">Capacitacion</option>
          <option value="OTRO">Otro</option>
        </select>
      </div>
    </div>

    <div class="d-flex justify-content-end mb-2">
      <button class="btn btn-sm btn-primary" (click)="showForm=!showForm; resetForm()">+ Nuevo Evento</button>
    </div>

    <div *ngIf="showForm" class="card mb-3">
      <div class="card-body">
        <div class="row g-2">
          <div class="col-md-4"><label class="form-label form-label-sm">Nombre</label><input class="form-control form-control-sm" [(ngModel)]="formName"></div>
          <div class="col-md-2"><label class="form-label form-label-sm">Tipo</label>
            <select class="form-select form-select-sm" [(ngModel)]="formType">
              <option value="INSTITUCIONAL">Institucional</option><option value="ACADEMICO">Academico</option><option value="FERIADO">Feriado</option><option value="VACACIONES">Vacaciones</option><option value="EVALUACION">Evaluacion</option><option value="EXCURSION">Excursion</option><option value="CAPACITACION">Capacitacion</option><option value="OTRO">Otro</option>
            </select>
          </div>
          <div class="col-md-2"><label class="form-label form-label-sm">Inicio</label><input type="date" class="form-control form-control-sm" [(ngModel)]="formStart"></div>
          <div class="col-md-2"><label class="form-label form-label-sm">Fin</label><input type="date" class="form-control form-control-sm" [(ngModel)]="formEnd"></div>
          <div class="col-md-2"><label class="form-label form-label-sm">Color</label><input type="color" class="form-control form-control-sm form-control-color" [(ngModel)]="formColor"></div>
        </div>
        <div class="row g-2 mt-1">
          <div class="col-md-6"><label class="form-label form-label-sm">Descripcion</label><textarea class="form-control form-control-sm" rows="2" [(ngModel)]="formDescription"></textarea></div>
          <div class="col-md-2 d-flex align-items-end"><button class="btn btn-sm btn-primary" (click)="save()">Guardar</button></div>
        </div>
      </div>
    </div>

    <div class="table-responsive">
      <table class="table table-xs table-hover">
        <thead><tr><th style="width:40px"></th><th>Evento</th><th>Tipo</th><th>Inicio</th><th>Fin</th><th>Descripcion</th><th></th></tr></thead>
        <tbody>
          <tr *ngFor="let e of events">
            <td><div [style.background]="e.color || '#3B4436'" style="width:12px;height:12px;border-radius:3px"></div></td>
            <td class="fw-semibold">{{e.eventName}}</td>
            <td><span class="badge text-bg-secondary">{{typeLabel(e.eventType)}}</span></td>
            <td>{{e.startDate}}</td><td>{{e.endDate}}</td>
            <td class="cell-truncate small">{{e.description || '-'}}</td>
            <td><button class="btn btn-sm btn-outline-primary" (click)="edit(e)">Editar</button> <button class="btn btn-sm btn-outline-danger" (click)="delete(e.id)">X</button></td>
          </tr>
          <tr *ngIf="events.length===0"><td colspan="7" class="text-muted text-center">No hay eventos</td></tr>
        </tbody>
      </table>
    </div>

    <div *ngIf="message" class="position-fixed bottom-0 end-0 p-3" style="z-index:1050">
      <div class="toast show" [class.bg-success]="!isError" [class.bg-danger]="isError"><div class="toast-body text-white">{{message}}</div></div>
    </div>
  `
})
export class SchoolCalendarComponent implements OnInit {
  events: any[] = [];
  showForm = false;
  editId: number | null = null;
  formName = ''; formType = 'INSTITUCIONAL'; formStart = ''; formEnd = ''; formDescription = ''; formColor = '#3B4436';
  filterMonth = ''; filterType = '';
  message = ''; isError = false;
  instId = 1;

  months = [
    { value: '01', label: 'Enero' }, { value: '02', label: 'Febrero' }, { value: '03', label: 'Marzo' },
    { value: '04', label: 'Abril' }, { value: '05', label: 'Mayo' }, { value: '06', label: 'Junio' },
    { value: '07', label: 'Julio' }, { value: '08', label: 'Agosto' }, { value: '09', label: 'Septiembre' },
    { value: '10', label: 'Octubre' }, { value: '11', label: 'Noviembre' }, { value: '12', label: 'Diciembre' }
  ];

  constructor(private http: HttpClient, private auth: AuthService) {}
  ngOnInit() { this.instId = this.auth.institutionId() || 1; this.load(); }

  private showMsg(m: string, e = false) { this.message = m; this.isError = e; setTimeout(() => this.message = '', 4000); }

  load() {
    const doFilter = (data: any[]) => {
      let filtered = data;
      if (this.filterMonth) {
        filtered = filtered.filter(e => {
          const startMonth = e.startDate ? e.startDate.substring(5, 7) : '';
          const endMonth = e.endDate ? e.endDate.substring(5, 7) : '';
          return startMonth === this.filterMonth || endMonth === this.filterMonth;
        });
      }
      this.events = filtered;
    };
    if (this.filterType) {
      this.http.get<any[]>(`${API_URL}/institution/calendar/institution/${this.instId}/type/${this.filterType}`).subscribe({ next: doFilter });
    } else {
      this.http.get<any[]>(`${API_URL}/institution/calendar/institution/${this.instId}`).subscribe({ next: doFilter });
    }
  }

  save() {
    const body: any = { institutionId: this.instId, eventName: this.formName, eventType: this.formType, startDate: this.formStart, endDate: this.formEnd, description: this.formDescription, color: this.formColor };
    const obs = this.editId ? this.http.put(`${API_URL}/institution/calendar/${this.editId}`, body) : this.http.post(`${API_URL}/institution/calendar`, body);
    obs.subscribe({ next: () => { this.showMsg('Guardado'); this.showForm = false; this.load(); this.resetForm(); }, error: () => this.showMsg('Error', true) });
  }

  edit(e: any) { this.editId = e.id; this.formName = e.eventName; this.formType = e.eventType; this.formStart = e.startDate; this.formEnd = e.endDate; this.formDescription = e.description || ''; this.formColor = e.color || '#3B4436'; this.showForm = true; }

  delete(id: number) { if (!confirm('Eliminar evento?')) return; this.http.delete(`${API_URL}/institution/calendar/${id}`).subscribe({ next: () => { this.load(); this.showMsg('Eliminado'); }, error: () => this.showMsg('Error', true) }); }

  resetForm() { this.editId = null; this.formName = ''; this.formType = 'INSTITUCIONAL'; this.formStart = ''; this.formEnd = ''; this.formDescription = ''; this.formColor = '#3B4436'; }

  typeLabel(t: string): string { const m: Record<string, string> = { INSTITUCIONAL: 'Institucional', ACADEMICO: 'Academico', FERIADO: 'Feriado', VACACIONES: 'Vacaciones', EVALUACION: 'Evaluacion', EXCURSION: 'Excursion', CAPACITACION: 'Capacitacion', OTRO: 'Otro' }; return m[t] || t; }
}
