import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../core/api.config';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-contracts',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h4 class="mb-0 fw-bold">Contratos Laborales</h4>
    </div>

    <ul class="nav nav-tabs nav-tabs-sm mb-3">
      <li><a class="nav-link" [class.active]="tab==='list'" (click)="tab='list'; loadActive()">Contratos Activos</a></li>
      <li><a class="nav-link" [class.active]="tab==='new'" (click)="tab='new'; resetForm()">Nuevo Contrato</a></li>
    </ul>

    <div *ngIf="tab==='list'">
      <div class="table-responsive">
        <table class="table table-xs table-hover">
          <thead><tr><th># Contrato</th><th>Empleado</th><th>Cargo</th><th>Tipo</th><th>Salario</th><th>Desde</th><th>Hasta</th><th>Estado</th><th></th></tr></thead>
          <tbody>
            <tr *ngFor="let c of contracts">
              <td>{{c.contractNumber}}</td><td>Emp#{{c.employeeId}}</td><td>{{c.position}}</td>
              <td><span class="badge text-bg-secondary">{{c.contractType}}</span></td>
              <td>{{c.salary | number:'1.2-2'}}</td><td>{{c.startDate}}</td><td>{{c.endDate || 'Indefinido'}}</td>
              <td><span class="badge" [class.text-bg-success]="c.status==='ACTIVO'" [class.text-bg-warning]="c.status==='VENCIDO'" [class.text-bg-danger]="c.status==='TERMINADO'">{{c.status}}</span></td>
              <td><button class="btn btn-sm btn-outline-primary" (click)="edit(c)">Editar</button> <button class="btn btn-sm btn-outline-danger" (click)="deleteContract(c.id)">X</button></td>
            </tr>
            <tr *ngIf="contracts.length===0"><td colspan="9" class="text-muted text-center">No hay contratos</td></tr>
          </tbody>
        </table>
      </div>
    </div>

    <div *ngIf="tab==='new'">
      <div class="card">
        <div class="card-body">
          <div class="row g-2">
            <div class="col-md-2"><label class="form-label form-label-sm">Empleado ID</label><input type="number" class="form-control form-control-sm" [(ngModel)]="f.employeeId"></div>
            <div class="col-md-2"><label class="form-label form-label-sm"># Contrato</label><input class="form-control form-control-sm" [(ngModel)]="f.contractNumber"></div>
            <div class="col-md-2"><label class="form-label form-label-sm">Tipo</label>
              <select class="form-select form-select-sm" [(ngModel)]="f.contractType"><option value="INDEFINIDO">Indefinido</option><option value="FIJO">Fijo</option><option value="OBRA_SERVICIO">Obra/Servicio</option><option value="PRESTACION_SERVICIOS">P. Servicios</option><option value="PASANTE">Pasante</option></select>
            </div>
            <div class="col-md-3"><label class="form-label form-label-sm">Cargo</label><input class="form-control form-control-sm" [(ngModel)]="f.position"></div>
            <div class="col-md-3"><label class="form-label form-label-sm">Depto</label><input class="form-control form-control-sm" [(ngModel)]="f.department"></div>
          </div>
          <div class="row g-2 mt-1">
            <div class="col-md-2"><label class="form-label form-label-sm">Salario</label><input type="number" class="form-control form-control-sm" [(ngModel)]="f.salary"></div>
            <div class="col-md-2"><label class="form-label form-label-sm">Tipo Salario</label>
              <select class="form-select form-select-sm" [(ngModel)]="f.salaryType"><option value="MENSUAL">Mensual</option><option value="QUINCENAL">Quincenal</option><option value="SEMANAL">Semanal</option><option value="POR_HORA">Por Hora</option></select>
            </div>
            <div class="col-md-2"><label class="form-label form-label-sm">Inicio</label><input type="date" class="form-control form-control-sm" [(ngModel)]="f.startDate"></div>
            <div class="col-md-2"><label class="form-label form-label-sm">Fin</label><input type="date" class="form-control form-control-sm" [(ngModel)]="f.endDate"></div>
            <div class="col-md-2"><label class="form-label form-label-sm">Periodo Prueba</label><input type="number" class="form-control form-control-sm" [(ngModel)]="f.trialPeriodDays" value="90"></div>
            <div class="col-md-2"><label class="form-label form-label-sm">Estado</label>
              <select class="form-select form-select-sm" [(ngModel)]="f.status"><option value="ACTIVO">Activo</option><option value="VENCIDO">Vencido</option><option value="TERMINADO">Terminado</option></select>
            </div>
          </div>
          <div class="mt-3"><button class="btn btn-sm btn-primary" (click)="save()">{{editId?'Actualizar':'Crear'}} Contrato</button></div>
        </div>
      </div>
    </div>

    <div *ngIf="message" class="position-fixed bottom-0 end-0 p-3" style="z-index:1050">
      <div class="toast show" [class.bg-success]="!isError" [class.bg-danger]="isError"><div class="toast-body text-white">{{message}}</div></div>
    </div>
  `
})
export class ContractsComponent implements OnInit {
  tab = 'list';
  contracts: any[] = [];
  editId: number | null = null;
  f: any = { contractType: 'INDEFINIDO', salaryType: 'MENSUAL', status: 'ACTIVO', trialPeriodDays: 90 };
  message = ''; isError = false;

  constructor(private http: HttpClient, private auth: AuthService) {}
  ngOnInit() { this.loadActive(); }

  private showMsg(m: string, e = false) { this.message = m; this.isError = e; setTimeout(() => this.message = '', 4000); }
  loadActive() { this.http.get<any[]>(`${API_URL}/hr/contracts/active`).subscribe({ next: d => this.contracts = d }); }

  save() {
    const obs = this.editId ? this.http.put(`${API_URL}/hr/contracts/${this.editId}`, this.f) : this.http.post(`${API_URL}/hr/contracts`, this.f);
    obs.subscribe({ next: () => { this.showMsg('Guardado'); this.tab = 'list'; this.loadActive(); this.resetForm(); }, error: () => this.showMsg('Error', true) });
  }

  edit(c: any) { this.editId = c.id; this.f = { ...c }; this.tab = 'new'; }

  deleteContract(id: number) {
    if (!confirm('Eliminar contrato?')) return;
    this.http.delete(`${API_URL}/hr/contracts/${id}`).subscribe({
      next: () => { this.loadActive(); this.showMsg('Contrato eliminado'); },
      error: () => this.showMsg('Error al eliminar', true)
    });
  }

  resetForm() { this.editId = null; this.f = { contractType: 'INDEFINIDO', salaryType: 'MENSUAL', status: 'ACTIVO', trialPeriodDays: 90 }; }
}
