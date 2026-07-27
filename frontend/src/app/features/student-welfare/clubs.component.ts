import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../core/api.config';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-clubs',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h5 class="mb-0"><i class="bi bi-people me-2"></i>Clubes y Actividades</h5>
      <div class="d-flex gap-2">
        <select class="form-select form-select-sm" [(ngModel)]="tab" style="width:auto">
          <option value="list">Clubes</option>
          <option value="new">Nuevo Club</option>
          <option value="members" *ngIf="selectedClub">Miembros</option>
        </select>
      </div>
    </div>

    <div class="row g-3 mb-4">
      <div class="col-md-3">
        <div class="card border-0 shadow-sm bg-primary text-white text-center"><div class="card-body py-3"><div class="fs-4 fw-bold">{{ totalClubs }}</div><div class="small">Total Clubes</div></div></div>
      </div>
      <div class="col-md-3">
        <div class="card border-0 shadow-sm bg-success text-white text-center"><div class="card-body py-3"><div class="fs-4 fw-bold">{{ activeClubs }}</div><div class="small">Activos</div></div></div>
      </div>
      <div class="col-md-3">
        <div class="card border-0 shadow-sm bg-info text-white text-center"><div class="card-body py-3"><div class="fs-4 fw-bold">{{ totalMembers }}</div><div class="small">Total Miembros</div></div></div>
      </div>
      <div class="col-md-3">
        <div class="card border-0 shadow-sm bg-warning text-dark text-center"><div class="card-body py-3"><div class="fs-4 fw-bold">{{ uniqueStudents }}</div><div class="small">Estudiantes Unicos</div></div></div>
      </div>
    </div>

    @if (tab === 'list') {
      <div class="row g-3">
        <div class="col-md-4" *ngFor="let c of clubs">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-start">
                <div>
                  <h6 class="fw-bold mb-1">{{ c.name }}</h6>
                  <span class="badge" [class.bg-success]="c.clubType==='DEPORTIVO'" [class.bg-info]="c.clubType==='CULTURAL'" [class.bg-primary]="c.clubType==='ACADEMICO'" [class.bg-secondary]="c.clubType==='SOCIAL'">{{ c.clubType }}</span>
                </div>
                <div class="dropdown">
                  <button class="btn btn-sm btn-outline-secondary dropdown-toggle" data-bs-toggle="dropdown">...</button>
                  <ul class="dropdown-menu dropdown-menu-end">
                    <li><a class="dropdown-item" (click)="edit(c)"><i class="bi bi-pencil me-1"></i>Editar</a></li>
                    <li><a class="dropdown-item" (click)="viewMembers(c)"><i class="bi bi-people me-1"></i>Miembros</a></li>
                    <li><hr class="dropdown-divider"></li>
                    <li><a class="dropdown-item text-danger" (click)="deleteClub(c.id)"><i class="bi bi-trash me-1"></i>Eliminar</a></li>
                  </ul>
                </div>
              </div>
              <p class="small text-muted mt-2 mb-1">{{ c.description || 'Sin descripcion' }}</p>
              <div class="small"><i class="bi bi-person me-1"></i>{{ c.coordinator || 'Sin coordinador' }}</div>
              <div class="small"><i class="bi bi-clock me-1"></i>{{ c.scheduleInfo || 'Por definir' }}</div>
              <div *ngIf="c.maxMembers" class="small text-muted">Max: {{ c.maxMembers }} miembros</div>
            </div>
          </div>
        </div>
        <div *ngIf="clubs.length===0" class="col-12 text-center py-5"><i class="bi bi-people fs-1 text-muted"></i><p class="text-muted mt-2">No hay clubes</p></div>
      </div>
    }

    @if (tab === 'new') {
      <div class="card border-0 shadow-sm"><div class="card-body">
        <h6>{{ editId ? 'Editar' : 'Nuevo' }} Club</h6>
        <div class="row g-3">
          <div class="col-md-4"><label class="form-label small">Nombre *</label><input class="form-control form-control-sm" [(ngModel)]="f.name"></div>
          <div class="col-md-3"><label class="form-label small">Tipo *</label>
            <select class="form-select form-select-sm" [(ngModel)]="f.clubType"><option value="DEPORTIVO">Deportivo</option><option value="CULTURAL">Cultural</option><option value="ACADEMICO">Academico</option><option value="SOCIAL">Social</option><option value="OTRO">Otro</option></select>
          </div>
          <div class="col-md-3"><label class="form-label small">Coordinador</label><input class="form-control form-control-sm" [(ngModel)]="f.coordinator"></div>
          <div class="col-md-2"><label class="form-label small">Max Miembros</label><input type="number" class="form-control form-control-sm" [(ngModel)]="f.maxMembers"></div>
          <div class="col-md-6"><label class="form-label small">Descripcion</label><textarea class="form-control form-control-sm" rows="2" [(ngModel)]="f.description"></textarea></div>
          <div class="col-md-4"><label class="form-label small">Horario</label><input class="form-control form-control-sm" [(ngModel)]="f.scheduleInfo"></div>
        </div>
        <div class="mt-3"><button class="btn btn-sm btn-primary" (click)="save()">{{ editId ? 'Actualizar' : 'Crear' }}</button></div>
      </div></div>
    }

    @if (tab === 'members' && selectedClub) {
      <div class="card border-0 shadow-sm">
        <div class="card-header bg-white d-flex justify-content-between">
          <h6 class="mb-0">Miembros: {{ selectedClub.name }}</h6>
          <button class="btn btn-sm btn-primary" (click)="showAddMember=true"><i class="bi bi-plus me-1"></i>Agregar</button>
        </div>
        <div class="card-body p-0">
          <table class="table table-sm mb-0">
            <thead class="table-light"><tr><th>Estudiante</th><th>Fecha Ingreso</th><th>Estado</th><th></th></tr></thead>
            <tbody>
              <tr *ngFor="let m of members">
                <td>{{ m.studentId }}</td>
                <td>{{ m.enrollmentDate | date:'dd/MM/yyyy' }}</td>
                <td><span class="badge" [class.bg-success]="m.status==='ACTIVO'" [class.bg-secondary]="m.status==='INACTIVO'">{{ m.status }}</span></td>
                <td><button class="btn btn-sm btn-outline-danger" (click)="removeMember(m.id)"><i class="bi bi-trash"></i></button></td>
              </tr>
              <tr *ngIf="members.length===0"><td colspan="4" class="text-center text-muted py-3">Sin miembros</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    }

    <div class="modal d-block" *ngIf="showAddMember" tabindex="-1" style="background:rgba(0,0,0,0.5)">
      <div class="modal-dialog modal-sm">
        <div class="modal-content">
          <div class="modal-header"><h6 class="modal-title">Agregar Miembro</h6></div>
          <div class="modal-body">
            <label class="form-label small">ID Estudiante *</label>
            <input type="number" class="form-control form-control-sm" [(ngModel)]="newMemberStudentId">
          </div>
          <div class="modal-footer">
            <button class="btn btn-sm btn-secondary" (click)="showAddMember=false">Cancelar</button>
            <button class="btn btn-sm btn-primary" (click)="addMember()">Agregar</button>
          </div>
        </div>
      </div>
    </div>

    <div *ngIf="message" class="position-fixed bottom-0 end-0 p-3" style="z-index:1050">
      <div class="toast show" [class.bg-success]="!isError" [class.bg-danger]="isError"><div class="toast-body text-white">{{ message }}</div></div>
    </div>
  `
})
export class ClubsComponent implements OnInit {
  tab = 'list';
  clubs: any[] = [];
  members: any[] = [];
  selectedClub: any = null;
  editId: number | null = null;
  f: any = { clubType: 'DEPORTIVO' };
  message = ''; isError = false;
  instId = 1;
  totalClubs = 0;
  activeClubs = 0;
  totalMembers = 0;
  uniqueStudents = 0;
  showAddMember = false;
  newMemberStudentId: number | null = null;

  constructor(private http: HttpClient, private auth: AuthService) {}
  ngOnInit() { this.instId = this.auth.institutionId() || 1; this.load(); }

  private showMsg(m: string, e = false) { this.message = m; this.isError = e; setTimeout(() => this.message = '', 4000); }

  load() {
    this.http.get<any[]>(`${API_URL}/clubs/institution/${this.instId}/all`).subscribe({
      next: d => {
        this.clubs = d;
        this.totalClubs = d.length;
        this.activeClubs = d.filter(c => c.active).length;
      }
    });
    this.http.get<any>(`${API_URL}/clubs/institution/${this.instId}`).subscribe({
      next: (d: any[]) => {
        this.totalMembers = d.reduce((s: number, c: any) => s + (c.memberCount || 0), 0);
        this.uniqueStudents = d.length;
      },
      error: () => {}
    });
  }

  save() {
    const body = { ...this.f, institutionId: this.instId };
    const obs = this.editId ? this.http.put(`${API_URL}/clubs/${this.editId}`, body) : this.http.post(`${API_URL}/clubs`, body);
    obs.subscribe({ next: () => { this.showMsg('Guardado'); this.tab = 'list'; this.load(); this.resetForm(); }, error: () => this.showMsg('Error', true) });
  }

  edit(c: any) { this.editId = c.id; this.f = { ...c }; this.tab = 'new'; }
  deleteClub(id: number) { if (!confirm('Eliminar?')) return; this.http.delete(`${API_URL}/clubs/${id}`).subscribe({ next: () => { this.load(); this.showMsg('Eliminado'); } }); }
  resetForm() { this.editId = null; this.f = { clubType: 'DEPORTIVO' }; }

  viewMembers(c: any) {
    this.selectedClub = c;
    this.tab = 'members';
    this.http.get<any[]>(`${API_URL}/clubs/${c.id}/members`).subscribe({ next: r => this.members = r, error: () => this.members = [] });
  }

  addMember() {
    if (!this.newMemberStudentId) { alert('Ingrese ID del estudiante'); return; }
    this.http.post(`${API_URL}/clubs/${this.selectedClub.id}/enroll`, { studentId: this.newMemberStudentId, status: 'ACTIVO' }).subscribe({
      next: () => { this.showAddMember = false; this.newMemberStudentId = null; this.viewMembers(this.selectedClub); },
      error: e => alert(e.error?.message || 'Error')
    });
  }

  removeMember(id: number) {
    if (!confirm('Remover miembro?')) return;
    this.http.delete(`${API_URL}/clubs/memberships/${id}`).subscribe({ next: () => this.viewMembers(this.selectedClub) });
  }
}
