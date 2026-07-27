import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../core/api.config';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-campus',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h4 class="mb-0 fw-bold">Sedes / Campus</h4>
    </div>

    <div class="d-flex justify-content-end mb-2">
      <button class="btn btn-sm btn-primary" (click)="showForm=!showForm; resetForm()">+ Nueva Sede</button>
    </div>

    <div *ngIf="showForm" class="card mb-3">
      <div class="card-body">
        <div class="row g-2">
          <div class="col-md-3"><label class="form-label form-label-sm">Nombre</label><input class="form-control form-control-sm" [(ngModel)]="formName"></div>
          <div class="col-md-2"><label class="form-label form-label-sm">Codigo</label><input class="form-control form-control-sm" [(ngModel)]="formCode"></div>
          <div class="col-md-3"><label class="form-label form-label-sm">Direccion</label><input class="form-control form-control-sm" [(ngModel)]="formAddress"></div>
          <div class="col-md-2"><label class="form-label form-label-sm">Tipo</label>
            <select class="form-select form-select-sm" [(ngModel)]="formType">
              <option value="PRINCIPAL">Principal</option>
              <option value="SEDE">Sede</option>
              <option value="ANEXO">Anexo</option>
            </select>
          </div>
          <div class="col-md-2"><label class="form-label form-label-sm">Telefono</label><input class="form-control form-control-sm" [(ngModel)]="formPhone"></div>
        </div>
        <div class="row g-2 mt-1">
          <div class="col-md-4"><label class="form-label form-label-sm">Email</label><input class="form-control form-control-sm" [(ngModel)]="formEmail"></div>
          <div class="col-md-2 d-flex align-items-end">
            <button class="btn btn-sm btn-primary" (click)="save()">Guardar</button>
          </div>
        </div>
      </div>
    </div>

    <div class="table-responsive">
      <table class="table table-xs table-hover">
        <thead><tr><th>Codigo</th><th>Nombre</th><th>Direccion</th><th>Tipo</th><th>Telefono</th><th>Email</th><th></th></tr></thead>
        <tbody>
          <tr *ngFor="let c of campus">
            <td>{{c.code}}</td><td>{{c.name}}</td><td>{{c.address}}</td>
            <td><span class="badge text-bg-secondary">{{c.campusType}}</span></td>
            <td>{{c.phone || '-'}}</td><td>{{c.email || '-'}}</td>
            <td><button class="btn btn-sm btn-outline-primary" (click)="edit(c)">Editar</button> <button class="btn btn-sm btn-outline-danger" (click)="delete(c.id)">Eliminar</button></td>
          </tr>
          <tr *ngIf="campus.length===0"><td colspan="7" class="text-muted text-center">No hay sedes</td></tr>
        </tbody>
      </table>
    </div>

    <div *ngIf="message" class="position-fixed bottom-0 end-0 p-3" style="z-index:1050">
      <div class="toast show" [class.bg-success]="!isError" [class.bg-danger]="isError"><div class="toast-body text-white">{{message}}</div></div>
    </div>
  `
})
export class CampusComponent implements OnInit {
  campus: any[] = [];
  showForm = false;
  editId: number | null = null;
  formName = ''; formCode = ''; formAddress = ''; formType = 'PRINCIPAL'; formPhone = ''; formEmail = '';
  message = ''; isError = false;
  instId = 1;

  constructor(private http: HttpClient, private auth: AuthService) {}
  ngOnInit() { this.instId = this.auth.institutionId() || 1; this.load(); }

  private showMsg(m: string, e = false) { this.message = m; this.isError = e; setTimeout(() => this.message = '', 4000); }

  load() { this.http.get<any[]>(`${API_URL}/institution/campus/institution/${this.instId}`).subscribe({ next: d => this.campus = d }); }

  save() {
    const body: any = { institutionId: this.instId, name: this.formName, code: this.formCode, address: this.formAddress, campusType: this.formType, phone: this.formPhone, email: this.formEmail };
    const obs = this.editId ? this.http.put(`${API_URL}/institution/campus/${this.editId}`, body) : this.http.post(`${API_URL}/institution/campus`, body);
    obs.subscribe({ next: () => { this.showMsg('Guardado'); this.showForm = false; this.load(); this.resetForm(); }, error: () => this.showMsg('Error', true) });
  }

  edit(c: any) { this.editId = c.id; this.formName = c.name; this.formCode = c.code; this.formAddress = c.address; this.formType = c.campusType; this.formPhone = c.phone || ''; this.formEmail = c.email || ''; this.showForm = true; }

  delete(id: number) { if (!confirm('Eliminar sede?')) return; this.http.delete(`${API_URL}/institution/campus/${id}`).subscribe({ next: () => { this.load(); this.showMsg('Eliminada'); }, error: () => this.showMsg('Error', true) }); }

  resetForm() { this.editId = null; this.formName = ''; this.formCode = ''; this.formAddress = ''; this.formType = 'PRINCIPAL'; this.formPhone = ''; this.formEmail = ''; }
}
