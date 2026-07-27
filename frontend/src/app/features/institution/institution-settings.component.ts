import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../core/api.config';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-institution-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h4 class="mb-0 fw-bold">Configuracion Institucional</h4>
    </div>

    <ul class="nav nav-tabs nav-tabs-sm mb-3">
      <li><a class="nav-link" [class.active]="tab==='general'" (click)="tab='general'; loadGeneral()">General</a></li>
      <li><a class="nav-link" [class.active]="tab==='academic'" (click)="tab='academic'; loadAcademic()">Academico</a></li>
      <li><a class="nav-link" [class.active]="tab==='notification'" (click)="tab='notification'; loadNotifications()">Notificaciones</a></li>
      <li><a class="nav-link" [class.active]="tab==='new'" (click)="tab='new'; resetForm()">Nueva Config</a></li>
    </ul>

    <div *ngIf="tab==='new'">
      <div class="card">
        <div class="card-body">
          <div class="row g-2">
            <div class="col-md-3"><label class="form-label form-label-sm">Clave</label><input class="form-control form-control-sm" [(ngModel)]="formKey"></div>
            <div class="col-md-2"><label class="form-label form-label-sm">Tipo</label>
              <select class="form-select form-select-sm" [(ngModel)]="formType">
                <option value="STRING">Texto</option><option value="NUMBER">Numero</option><option value="BOOLEAN">Booleano</option><option value="JSON">JSON</option>
              </select>
            </div>
            <div class="col-md-3"><label class="form-label form-label-sm">Categoria</label><input class="form-control form-control-sm" [(ngModel)]="formCategory"></div>
            <div class="col-md-4"><label class="form-label form-label-sm">Valor</label><input class="form-control form-control-sm" [(ngModel)]="formValue"></div>
          </div>
          <div class="row g-2 mt-1">
            <div class="col-md-6"><label class="form-label form-label-sm">Descripcion</label><input class="form-control form-control-sm" [(ngModel)]="formDescription"></div>
            <div class="col-md-2 d-flex align-items-end"><button class="btn btn-sm btn-primary" (click)="save()">Guardar</button></div>
          </div>
        </div>
      </div>
    </div>

    <div *ngIf="tab!=='new'">
      <div class="table-responsive">
        <table class="table table-xs table-hover">
          <thead><tr><th>Clave</th><th>Valor</th><th>Tipo</th><th>Categoria</th><th>Descripcion</th><th></th></tr></thead>
          <tbody>
            <tr *ngFor="let s of settings">
              <td class="fw-semibold">{{s.settingKey}}</td>
              <td class="cell-truncate">{{s.settingValue || '-'}}</td>
              <td><span class="badge text-bg-secondary">{{s.settingType}}</span></td>
              <td>{{s.category || '-'}}</td>
              <td class="small text-muted">{{s.description || '-'}}</td>
              <td><button class="btn btn-sm btn-outline-primary" (click)="edit(s)">Editar</button> <button class="btn btn-sm btn-outline-danger" (click)="delete(s.id)">X</button></td>
            </tr>
            <tr *ngIf="settings.length===0"><td colspan="6" class="text-muted text-center">No hay configuraciones</td></tr>
          </tbody>
        </table>
      </div>
    </div>

    <div *ngIf="message" class="position-fixed bottom-0 end-0 p-3" style="z-index:1050">
      <div class="toast show" [class.bg-success]="!isError" [class.bg-danger]="isError"><div class="toast-body text-white">{{message}}</div></div>
    </div>
  `
})
export class InstitutionSettingsComponent implements OnInit {
  tab = 'general';
  settings: any[] = [];
  editId: number | null = null;
  formKey = ''; formValue = ''; formType = 'STRING'; formCategory = 'GENERAL'; formDescription = '';
  message = ''; isError = false;
  instId = 1;

  constructor(private http: HttpClient, private auth: AuthService) {}
  ngOnInit() { this.instId = this.auth.institutionId() || 1; this.loadGeneral(); }

  private showMsg(m: string, e = false) { this.message = m; this.isError = e; setTimeout(() => this.message = '', 4000); }

  loadGeneral() { this.loadByCategory('GENERAL'); }
  loadAcademic() { this.loadByCategory('ACADEMICO'); }
  loadNotifications() { this.loadByCategory('NOTIFICACIONES'); }

  loadByCategory(cat: string) {
    this.http.get<any[]>(`${API_URL}/institution/settings/institution/${this.instId}/category/${cat}`)
      .subscribe({ next: d => this.settings = d, error: () => this.settings = [] });
  }

  save() {
    const body: any = { institutionId: this.instId, settingKey: this.formKey, settingValue: this.formValue, settingType: this.formType, category: this.formCategory, description: this.formDescription };
    const obs = this.editId ? this.http.put(`${API_URL}/institution/settings/${this.editId}`, body) : this.http.post(`${API_URL}/institution/settings`, body);
    obs.subscribe({ next: () => { this.showMsg('Guardado'); this.tab = 'general'; this.loadGeneral(); this.resetForm(); }, error: () => this.showMsg('Error', true) });
  }

  edit(s: any) { this.editId = s.id; this.formKey = s.settingKey; this.formValue = s.settingValue || ''; this.formType = s.settingType; this.formCategory = s.category || ''; this.formDescription = s.description || ''; this.tab = 'new'; }

  delete(id: number) { if (!confirm('Eliminar?')) return; this.http.delete(`${API_URL}/institution/settings/${id}`).subscribe({ next: () => { this.loadGeneral(); this.showMsg('Eliminado'); }, error: () => this.showMsg('Error', true) }); }

  resetForm() { this.editId = null; this.formKey = ''; this.formValue = ''; this.formType = 'STRING'; this.formCategory = 'GENERAL'; this.formDescription = ''; }
}
