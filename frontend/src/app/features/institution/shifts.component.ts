import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../core/api.config';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-shifts',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h4 class="mb-0 fw-bold">Jornadas</h4>
    </div>

    <div class="d-flex justify-content-end mb-2">
      <button class="btn btn-sm btn-primary" (click)="showForm=!showForm; resetForm()">+ Nueva Jornada</button>
    </div>

    <div *ngIf="showForm" class="card mb-3">
      <div class="card-body">
        <div class="row g-2">
          <div class="col-md-3"><label class="form-label form-label-sm">Nombre</label><input class="form-control form-control-sm" [(ngModel)]="formName"></div>
          <div class="col-md-2"><label class="form-label form-label-sm">Codigo</label><input class="form-control form-control-sm" [(ngModel)]="formCode"></div>
          <div class="col-md-2"><label class="form-label form-label-sm">Hora Inicio</label><input type="time" class="form-control form-control-sm" [(ngModel)]="formStart"></div>
          <div class="col-md-2"><label class="form-label form-label-sm">Hora Fin</label><input type="time" class="form-control form-control-sm" [(ngModel)]="formEnd"></div>
          <div class="col-md-3"><label class="form-label form-label-sm">Tipo</label>
            <select class="form-select form-select-sm" [(ngModel)]="formType">
              <option value="REGULAR">Regular</option>
              <option value="COMPLEMENTARIA">Complementaria</option>
              <option value="ESPECIAL">Especial</option>
            </select>
          </div>
        </div>
        <div class="mt-2"><button class="btn btn-sm btn-primary" (click)="save()">Guardar</button></div>
      </div>
    </div>

    <div class="table-responsive">
      <table class="table table-xs table-hover">
        <thead><tr><th>Codigo</th><th>Nombre</th><th>Inicio</th><th>Fin</th><th>Tipo</th><th></th></tr></thead>
        <tbody>
          <tr *ngFor="let s of shifts">
            <td>{{s.code}}</td><td>{{s.name}}</td><td>{{s.startTime}}</td><td>{{s.endTime}}</td>
            <td><span class="badge text-bg-secondary">{{s.shiftType}}</span></td>
            <td><button class="btn btn-sm btn-outline-primary" (click)="edit(s)">Editar</button> <button class="btn btn-sm btn-outline-danger" (click)="delete(s.id)">Eliminar</button></td>
          </tr>
          <tr *ngIf="shifts.length===0"><td colspan="6" class="text-muted text-center">No hay jornadas</td></tr>
        </tbody>
      </table>
    </div>

    <div *ngIf="message" class="position-fixed bottom-0 end-0 p-3" style="z-index:1050">
      <div class="toast show" [class.bg-success]="!isError" [class.bg-danger]="isError"><div class="toast-body text-white">{{message}}</div></div>
    </div>
  `
})
export class ShiftsComponent implements OnInit {
  shifts: any[] = [];
  showForm = false;
  editId: number | null = null;
  formName = ''; formCode = ''; formStart = '07:00'; formEnd = '12:30'; formType = 'REGULAR';
  message = ''; isError = false;
  instId = 1;

  constructor(private http: HttpClient, private auth: AuthService) {}
  ngOnInit() { this.instId = this.auth.institutionId() || 1; this.load(); }

  private showMsg(m: string, e = false) { this.message = m; this.isError = e; setTimeout(() => this.message = '', 4000); }

  load() { this.http.get<any[]>(`${API_URL}/institution/shifts/institution/${this.instId}`).subscribe({ next: d => this.shifts = d }); }

  save() {
    const body: any = { institutionId: this.instId, name: this.formName, code: this.formCode, startTime: this.formStart, endTime: this.formEnd, shiftType: this.formType };
    const obs = this.editId ? this.http.put(`${API_URL}/institution/shifts/${this.editId}`, body) : this.http.post(`${API_URL}/institution/shifts`, body);
    obs.subscribe({ next: () => { this.showMsg('Guardado'); this.showForm = false; this.load(); this.resetForm(); }, error: () => this.showMsg('Error', true) });
  }

  edit(s: any) { this.editId = s.id; this.formName = s.name; this.formCode = s.code; this.formStart = s.startTime; this.formEnd = s.endTime; this.formType = s.shiftType; this.showForm = true; }

  delete(id: number) { if (!confirm('Eliminar jornada?')) return; this.http.delete(`${API_URL}/institution/shifts/${id}`).subscribe({ next: () => { this.load(); this.showMsg('Eliminada'); }, error: () => this.showMsg('Error', true) }); }

  resetForm() { this.editId = null; this.formName = ''; this.formCode = ''; this.formStart = '07:00'; this.formEnd = '12:30'; this.formType = 'REGULAR'; }
}
