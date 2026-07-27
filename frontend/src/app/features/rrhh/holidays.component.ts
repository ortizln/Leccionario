import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../core/api.config';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-holidays',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h5 class="mb-0"><i class="bi bi-calendar-event me-2"></i>Feriados</h5>
      <button class="btn btn-sm btn-primary" (click)="showFormModal=true; resetForm()"><i class="bi bi-plus me-1"></i>Nuevo</button>
    </div>

    <div class="row g-3 mb-3">
      <div class="col-md-3">
        <div class="card border-0 shadow-sm bg-primary text-white text-center">
          <div class="card-body py-2"><div class="fs-4 fw-bold">{{ list.length }}</div><div class="small">Total</div></div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card border-0 shadow-sm bg-success text-white text-center">
          <div class="card-body py-2"><div class="fs-4 fw-bold">{{ activeCount() }}</div><div class="small">Activos</div></div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card border-0 shadow-sm bg-info text-white text-center">
          <div class="card-body py-2"><div class="fs-4 fw-bold">{{ upcomingCount }}</div><div class="small">Proximos</div></div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card border-0 shadow-sm bg-secondary text-white text-center">
          <div class="card-body py-2"><div class="fs-4 fw-bold">{{ nationalCount }}</div><div class="small">Nacionales</div></div>
        </div>
      </div>
    </div>

    <div class="card border-0 shadow-sm">
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-sm mb-0">
            <thead class="table-light">
              <tr><th>Nombre</th><th>Fecha</th><th>Categoria</th><th>Descripcion</th><th>Estado</th><th></th></tr>
            </thead>
            <tbody>
              <tr *ngFor="let h of list">
                <td class="fw-semibold">{{ h.name }}</td>
                <td>{{ h.holidayDate | date:'dd/MM/yyyy' }}</td>
                <td><span class="badge" [class.bg-primary]="h.category==='NACIONAL'" [class.bg-info]="h.category==='REGIONAL'" [class.bg-secondary]="h.category==='INSTITUCIONAL'">{{ h.category }}</span></td>
                <td class="small">{{ h.description || '-' }}</td>
                <td><span class="badge" [class.bg-success]="h.active" [class.bg-secondary]="!h.active">{{ h.active ? 'Activo' : 'Inactivo' }}</span></td>
                <td>
                  <div class="d-flex gap-1">
                    <button class="btn btn-sm btn-outline-primary" (click)="edit(h)"><i class="bi bi-pencil"></i></button>
                    <button class="btn btn-sm btn-outline-danger" (click)="deleteHoliday(h.id)"><i class="bi bi-trash"></i></button>
                  </div>
                </td>
              </tr>
              <tr *ngIf="list.length===0"><td colspan="6" class="text-center text-muted py-3">Sin feriados registrados</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    @if (showFormModal) {
      <div class="modal d-block" tabindex="-1" style="background:rgba(0,0,0,0.5)">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header"><h6 class="modal-title">{{ editId ? 'Editar' : 'Nuevo' }} Feriado</h6></div>
            <div class="modal-body">
              <div class="mb-3">
                <label class="form-label small">Nombre *</label>
                <input type="text" class="form-control form-control-sm" [(ngModel)]="form.name" placeholder="Nombre del feriado">
              </div>
              <div class="row g-2">
                <div class="col-md-6 mb-3">
                  <label class="form-label small">Fecha *</label>
                  <input type="date" class="form-control form-control-sm" [(ngModel)]="form.holidayDate">
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label small">Categoria</label>
                  <select class="form-select form-select-sm" [(ngModel)]="form.category">
                    <option value="NACIONAL">Nacional</option>
                    <option value="REGIONAL">Regional</option>
                    <option value="INSTITUCIONAL">Institucional</option>
                  </select>
                </div>
              </div>
              <div class="mb-3">
                <label class="form-label small">Descripcion</label>
                <textarea class="form-control form-control-sm" rows="2" [(ngModel)]="form.description"></textarea>
              </div>
              <div class="form-check">
                <input class="form-check-input" type="checkbox" [(ngModel)]="form.active" id="activeCheck">
                <label class="form-check-label small" for="activeCheck">Activo</label>
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn btn-sm btn-secondary" (click)="showFormModal=false">Cancelar</button>
              <button class="btn btn-sm btn-primary" (click)="save()" [disabled]="!form.name||!form.holidayDate">{{ editId ? 'Actualizar' : 'Crear' }}</button>
            </div>
          </div>
        </div>
      </div>
    }
  `
})
export class HolidaysComponent implements OnInit {
  list: any[] = [];
  showFormModal = false;
  editId: number | null = null;
  form: any = {};

  activeCount() { return this.list.filter(h => h.active).length; }
  get upcomingCount() {
    const today = new Date().toISOString().split('T')[0];
    return this.list.filter(h => h.holidayDate >= today && h.active).length;
  }
  get nationalCount() { return this.list.filter(h => h.category === 'NACIONAL').length; }

  constructor(private http: HttpClient, private auth: AuthService) {}
  ngOnInit() { this.load(); }
  private get instId(): number { return this.auth.institutionId() || 1; }

  load() {
    this.http.get<any[]>(`${API_URL}/hr/holidays?institutionId=${this.instId}`).subscribe({ next: r => this.list = r, error: () => {} });
  }

  resetForm() { this.form = { name: '', holidayDate: '', category: 'NACIONAL', description: '', active: true }; this.editId = null; }

  edit(h: any) {
    this.editId = h.id;
    this.form = { name: h.name, holidayDate: h.holidayDate, category: h.category, description: h.description, active: h.active };
    this.showFormModal = true;
  }

  save() {
    const body = { ...this.form, institutionId: this.instId };
    const req = this.editId
      ? this.http.put(`${API_URL}/hr/holidays/${this.editId}`, body)
      : this.http.post(`${API_URL}/hr/holidays`, body);
    req.subscribe({ next: () => { this.showFormModal = false; this.load(); }, error: e => alert(e.error?.message || 'Error') });
  }

  deleteHoliday(id: number) {
    if (!confirm('Eliminar feriado?')) return;
    this.http.delete(`${API_URL}/hr/holidays/${id}`).subscribe({ next: () => this.load() });
  }
}
