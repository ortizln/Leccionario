import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../core/api.config';

@Component({
  selector: 'app-book-reservations',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h5 class="mb-0"><i class="bi bi-bookmark me-2"></i>Reservas de Libros</h5>
      <div class="d-flex gap-2">
        <input type="text" class="form-control form-control-sm" [(ngModel)]="search" placeholder="Buscar..." style="width:180px">
        <button class="btn btn-sm btn-primary" (click)="showFormModal=true; resetForm()"><i class="bi bi-plus me-1"></i>Nueva</button>
      </div>
    </div>

    <div class="row g-3 mb-3">
      <div class="col-md-3">
        <div class="card border-0 shadow-sm bg-primary text-white text-center">
          <div class="card-body py-2"><div class="fs-4 fw-bold">{{ list.length }}</div><div class="small">Total</div></div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card border-0 shadow-sm bg-warning text-dark text-center">
          <div class="card-body py-2"><div class="fs-4 fw-bold">{{ pendingCount }}</div><div class="small">Pendientes</div></div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card border-0 shadow-sm bg-success text-white text-center">
          <div class="card-body py-2"><div class="fs-4 fw-bold">{{ completedCount }}</div><div class="small">Completadas</div></div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card border-0 shadow-sm bg-danger text-white text-center">
          <div class="card-body py-2"><div class="fs-4 fw-bold">{{ cancelledCount }}</div><div class="small">Canceladas</div></div>
        </div>
      </div>
    </div>

    <ul class="nav nav-tabs mb-3">
      <li class="nav-item"><a class="nav-link" [class.active]="tab==='all'" (click)="tab='all'" role="button">Todas</a></li>
      <li class="nav-item"><a class="nav-link" [class.active]="tab==='pending'" (click)="tab='pending'" role="button">Pendientes</a></li>
    </ul>

    <div class="card border-0 shadow-sm">
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-sm mb-0">
            <thead class="table-light">
              <tr><th>ID</th><th>Libro</th><th>Estudiante</th><th>Fecha Reserva</th><th>Vence</th><th>Estado</th><th></th></tr>
            </thead>
            <tbody>
              <tr *ngFor="let r of filteredList()">
                <td>{{ r.id }}</td>
                <td>Libro #{{ r.bookId }}</td>
                <td>{{ r.studentId ? 'Estudiante #'+r.studentId : '-' }}</td>
                <td>{{ r.reservationDate | date:'dd/MM/yyyy' }}</td>
                <td>{{ r.expiryDate | date:'dd/MM/yyyy' }}</td>
                <td>
                  <span class="badge" [class.bg-warning]="r.status==='PENDIENTE'" [class.bg-success]="r.status==='COMPLETADA'" [class.bg-danger]="r.status==='CANCELADA'">{{ r.status }}</span>
                </td>
                <td>
                  <div class="d-flex gap-1">
                    <button class="btn btn-sm btn-outline-success" *ngIf="r.status==='PENDIENTE'" (click)="completeReservation(r.id)" title="Completar"><i class="bi bi-check-lg"></i></button>
                    <button class="btn btn-sm btn-outline-danger" *ngIf="r.status==='PENDIENTE'" (click)="cancelReservation(r.id)" title="Cancelar"><i class="bi bi-x-lg"></i></button>
                  </div>
                </td>
              </tr>
              <tr *ngIf="filteredList().length===0"><td colspan="7" class="text-center text-muted py-3">Sin reservas</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    @if (showFormModal) {
      <div class="modal d-block" tabindex="-1" style="background:rgba(0,0,0,0.5)">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header"><h6 class="modal-title">Nueva Reserva</h6></div>
            <div class="modal-body">
              <div class="mb-3">
                <label class="form-label small">ID Libro *</label>
                <input type="number" class="form-control form-control-sm" [(ngModel)]="form.bookId">
              </div>
              <div class="mb-3">
                <label class="form-label small">ID Estudiante</label>
                <input type="number" class="form-control form-control-sm" [(ngModel)]="form.studentId">
              </div>
              <div class="mb-3">
                <label class="form-label small">ID Usuario</label>
                <input type="number" class="form-control form-control-sm" [(ngModel)]="form.userId">
              </div>
              <div class="mb-3">
                <label class="form-label small">Fecha Vencimiento *</label>
                <input type="date" class="form-control form-control-sm" [(ngModel)]="form.expiryDate">
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn btn-sm btn-secondary" (click)="showFormModal=false">Cancelar</button>
              <button class="btn btn-sm btn-primary" (click)="create()" [disabled]="!form.bookId||!form.expiryDate">Reservar</button>
            </div>
          </div>
        </div>
      </div>
    }
  `
})
export class BookReservationsComponent implements OnInit {
  list: any[] = [];
  search = '';
  tab = 'all';
  showFormModal = false;
  form: any = {};

  get pendingCount() { return this.list.filter(r => r.status === 'PENDIENTE').length; }
  get completedCount() { return this.list.filter(r => r.status === 'COMPLETADA').length; }
  get cancelledCount() { return this.list.filter(r => r.status === 'CANCELADA').length; }

  constructor(private http: HttpClient) {}
  ngOnInit() { this.load(); }

  load() {
    this.http.get<any[]>(`${API_URL}/library/reservations`).subscribe({ next: r => this.list = r, error: () => {} });
  }

  filteredList() {
    let items = this.list;
    if (this.tab === 'pending') items = items.filter(r => r.status === 'PENDIENTE');
    if (this.search) {
      const s = this.search.toLowerCase();
      items = items.filter(r => String(r.bookId).includes(s) || String(r.studentId).includes(s));
    }
    return items;
  }

  resetForm() { this.form = { bookId: null, studentId: null, userId: null, expiryDate: '' }; }

  create() {
    this.http.post<any>(`${API_URL}/library/reservations`, {
      bookId: this.form.bookId, studentId: this.form.studentId, userId: this.form.userId, expiryDate: this.form.expiryDate
    }).subscribe({ next: () => { this.showFormModal = false; this.load(); }, error: e => alert(e.error?.message || 'Error') });
  }

  completeReservation(id: number) {
    this.http.post<any>(`${API_URL}/library/reservations/${id}/complete`, {}).subscribe({ next: () => this.load() });
  }

  cancelReservation(id: number) {
    if (!confirm('Cancelar reserva?')) return;
    this.http.post<any>(`${API_URL}/library/reservations/${id}/cancel`, {}).subscribe({ next: () => this.load() });
  }
}
