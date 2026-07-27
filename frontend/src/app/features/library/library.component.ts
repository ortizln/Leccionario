import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../core/api.config';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-library',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h5 class="mb-0"><i class="bi bi-book me-2"></i>Biblioteca</h5>
      <div class="d-flex gap-2">
        <select class="form-select form-select-sm" [(ngModel)]="tab" style="width:auto">
          <option value="books">Libros</option>
          <option value="loans">Prestamos</option>
          <option value="overdue">Vencidos</option>
          <option value="reservations">Reservas</option>
        </select>
        <button class="btn btn-sm btn-outline-success" (click)="exportCSV()" title="Exportar"><i class="bi bi-download"></i></button>
        <button class="btn btn-sm btn-primary" (click)="showCreateModal=true"><i class="bi bi-plus-circle me-1"></i>Nuevo Libro</button>
      </div>
    </div>

    <div class="row g-3 mb-4">
      <div class="col-md-3">
        <div class="card border-0 shadow-sm bg-primary text-white"><div class="card-body text-center"><div class="fs-4 fw-bold">{{ totalBooks }}</div><div class="small">Total Libros</div></div></div>
      </div>
      <div class="col-md-3">
        <div class="card border-0 shadow-sm bg-success text-white"><div class="card-body text-center"><div class="fs-4 fw-bold">{{ totalCopies }}</div><div class="small">Copias Totales</div></div></div>
      </div>
      <div class="col-md-3">
        <div class="card border-0 shadow-sm bg-warning text-dark"><div class="card-body text-center"><div class="fs-4 fw-bold">{{ activeLoans }}</div><div class="small">Prestamos Activos</div></div></div>
      </div>
      <div class="col-md-3">
        <div class="card border-0 shadow-sm" [class.bg-danger]="overdueLoans>0" [class.bg-info]="overdueLoans===0" [class.text-white]="true">
          <div class="card-body text-center"><div class="fs-4 fw-bold">{{ overdueLoans }}</div><div class="small">Vencidos</div></div>
        </div>
      </div>
    </div>

    @if (tab === 'books') {
      <div class="card border-0 shadow-sm mb-3">
        <div class="card-body py-2">
          <div class="row g-2 align-items-center">
            <div class="col-md-6">
              <input class="form-control form-control-sm" placeholder="Buscar por titulo o autor..." [(ngModel)]="searchQuery" (input)="onSearch()">
            </div>
          </div>
        </div>
      </div>
      <div class="card border-0 shadow-sm">
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table table-sm mb-0">
              <thead class="table-light">
                <tr><th>Titulo</th><th>Autor</th><th>ISBN</th><th>Editorial</th><th>Disponibles</th><th>Ubicacion</th><th></th></tr>
              </thead>
              <tbody>
                <tr *ngFor="let b of books">
                  <td class="fw-semibold">{{ b.title }}</td>
                  <td>{{ b.author }}</td>
                  <td>{{ b.isbn }}</td>
                  <td>{{ b.publisher }}</td>
                  <td><span class="badge" [class.bg-success]="b.availableCopies>0" [class.bg-danger]="b.availableCopies===0">{{ b.availableCopies }}/{{ b.totalCopies }}</span></td>
                  <td>{{ b.location }}</td>
                  <td>
                    <button class="btn btn-sm btn-outline-primary" *ngIf="b.availableCopies>0" (click)="openLoanModal(b)" title="Prestar"><i class="bi bi-bookmark-plus"></i></button>
                    <button class="btn btn-sm btn-outline-info" (click)="openResModal(b)" title="Reservar"><i class="bi bi-calendar-plus"></i></button>
                  </td>
                </tr>
                <tr *ngIf="books.length===0"><td colspan="7" class="text-center text-muted py-3">Sin libros</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    }

    @if (tab === 'loans') {
      <div class="card border-0 shadow-sm mb-3">
        <div class="card-body">
          <div class="row g-2 align-items-end">
            <div class="col-md-3"><label class="form-label small">Historial por Estudiante ID</label><input type="number" class="form-control form-control-sm" [(ngModel)]="loanHistoryStudentId"></div>
            <div class="col-md-2"><button class="btn btn-sm btn-outline-primary" (click)="downloadLoanHistory()" [disabled]="!loanHistoryStudentId"><i class="bi bi-file-earmark-pdf me-1"></i>Historial PDF</button></div>
          </div>
        </div>
      </div>
      <div class="card border-0 shadow-sm">
        <div class="card-header bg-white"><h6 class="mb-0">Prestamos Activos</h6></div>
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table table-sm mb-0">
              <thead class="table-light"><tr><th>Libro</th><th>Estudiante</th><th>Fecha Prestamo</th><th>Vence</th><th>Estado</th><th></th></tr></thead>
              <tbody>
                <tr *ngFor="let l of loans">
                  <td>{{ l.bookId }}</td>
                  <td>{{ l.studentId }}</td>
                  <td>{{ l.loanDate | date:'dd/MM/yyyy' }}</td>
                  <td>{{ l.dueDate | date:'dd/MM/yyyy' }}</td>
                  <td><span class="badge" [class.bg-warning]="l.status==='ACTIVO'" [class.bg-success]="l.status==='DEVUELTO'" [class.bg-danger]="l.status==='VENCIDO'">{{ l.status }}</span></td>
                  <td><button class="btn btn-sm btn-outline-success" *ngIf="l.status==='ACTIVO'" (click)="returnBook(l.id)"><i class="bi bi-arrow-return-left"></i></button></td>
                </tr>
                <tr *ngIf="loans.length===0"><td colspan="6" class="text-center text-muted py-3">Sin prestamos activos</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    }

    @if (tab === 'overdue') {
      <div class="card border-0 shadow-sm">
        <div class="card-header bg-white"><h6 class="mb-0">Prestamos Vencidos</h6></div>
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table table-sm mb-0">
              <thead class="table-light"><tr><th>Libro</th><th>Estudiante</th><th>Fecha Prestamo</th><th>Vence</th><th>Dias Vencido</th><th></th></tr></thead>
              <tbody>
                <tr *ngFor="let l of overdueList">
                  <td>{{ l.bookId }}</td>
                  <td>{{ l.studentId }}</td>
                  <td>{{ l.loanDate | date:'dd/MM/yyyy' }}</td>
                  <td class="text-danger">{{ l.dueDate | date:'dd/MM/yyyy' }}</td>
                  <td><span class="badge bg-danger">{{ getDaysOverdue(l.dueDate) }} dias</span></td>
                  <td><button class="btn btn-sm btn-outline-success" (click)="returnBook(l.id)"><i class="bi bi-arrow-return-left"></i> Devolver</button></td>
                </tr>
                <tr *ngIf="overdueList.length===0"><td colspan="6" class="text-center text-muted py-3">No hay prestamos vencidos</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    }

    @if (tab === 'reservations') {
      <div class="card border-0 shadow-sm">
        <div class="card-header bg-white"><h6 class="mb-0">Reservas Pendientes</h6></div>
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table table-sm mb-0">
              <thead class="table-light"><tr><th>Libro</th><th>Estudiante</th><th>Reserva</th><th>Expira</th><th>Estado</th><th></th></tr></thead>
              <tbody>
                <tr *ngFor="let r of reservations">
                  <td>{{ r.bookId }}</td>
                  <td>{{ r.studentId }}</td>
                  <td>{{ r.reservationDate | date:'dd/MM/yyyy' }}</td>
                  <td>{{ r.expiryDate | date:'dd/MM/yyyy' }}</td>
                  <td><span class="badge" [class.bg-warning]="r.status==='PENDIENTE'" [class.bg-success]="r.status==='COMPLETADA'">{{ r.status }}</span></td>
                  <td><button class="btn btn-sm btn-outline-success" *ngIf="r.status==='PENDIENTE'" (click)="completeReservation(r.id)"><i class="bi bi-check-circle"></i></button></td>
                </tr>
                <tr *ngIf="reservations.length===0"><td colspan="6" class="text-center text-muted py-3">Sin reservas pendientes</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    }

    <div class="modal d-block" *ngIf="showCreateModal" tabindex="-1" style="background:rgba(0,0,0,0.5)">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header"><h6 class="modal-title">Nuevo Libro</h6></div>
          <div class="modal-body">
            <div class="row g-3">
              <div class="col-md-12"><label class="form-label small">Titulo *</label><input class="form-control form-control-sm" [(ngModel)]="newBook.title"></div>
              <div class="col-md-6"><label class="form-label small">Autor</label><input class="form-control form-control-sm" [(ngModel)]="newBook.author"></div>
              <div class="col-md-6"><label class="form-label small">ISBN</label><input class="form-control form-control-sm" [(ngModel)]="newBook.isbn"></div>
              <div class="col-md-6"><label class="form-label small">Editorial</label><input class="form-control form-control-sm" [(ngModel)]="newBook.publisher"></div>
              <div class="col-md-6"><label class="form-label small">Ano Publicacion</label><input type="number" class="form-control form-control-sm" [(ngModel)]="newBook.publicationYear"></div>
              <div class="col-md-4"><label class="form-label small">Copias</label><input type="number" class="form-control form-control-sm" [(ngModel)]="newBook.totalCopies"></div>
              <div class="col-md-4"><label class="form-label small">Disponibles</label><input type="number" class="form-control form-control-sm" [(ngModel)]="newBook.availableCopies"></div>
              <div class="col-md-4"><label class="form-label small">Ubicacion</label><input class="form-control form-control-sm" [(ngModel)]="newBook.location"></div>
              <div class="col-12"><label class="form-label small">Descripcion</label><textarea class="form-control form-control-sm" [(ngModel)]="newBook.description" rows="2"></textarea></div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-sm btn-secondary" (click)="showCreateModal=false">Cancelar</button>
            <button class="btn btn-sm btn-primary" (click)="createBook()">Crear</button>
          </div>
        </div>
      </div>
    </div>

    <div class="modal d-block" *ngIf="showLoanModal" tabindex="-1" style="background:rgba(0,0,0,0.5)">
      <div class="modal-dialog modal-sm">
        <div class="modal-content">
          <div class="modal-header"><h6 class="modal-title">Prestar Libro</h6></div>
          <div class="modal-body">
            <label class="form-label small">Estudiante ID *</label>
            <input type="number" class="form-control form-control-sm" [(ngModel)]="loanStudentId">
            <label class="form-label small mt-2">Dias de prestamo</label>
            <input type="number" class="form-control form-control-sm" [(ngModel)]="loanDays" value="14">
          </div>
          <div class="modal-footer">
            <button class="btn btn-sm btn-secondary" (click)="showLoanModal=false">Cancelar</button>
            <button class="btn btn-sm btn-primary" (click)="confirmLoan()">Prestar</button>
          </div>
        </div>
      </div>
    </div>

    <div class="modal d-block" *ngIf="showResModal" tabindex="-1" style="background:rgba(0,0,0,0.5)">
      <div class="modal-dialog modal-sm">
        <div class="modal-content">
          <div class="modal-header"><h6 class="modal-title">Reservar Libro</h6></div>
          <div class="modal-body">
            <label class="form-label small">Estudiante ID *</label>
            <input type="number" class="form-control form-control-sm" [(ngModel)]="resStudentId">
          </div>
          <div class="modal-footer">
            <button class="btn btn-sm btn-secondary" (click)="showResModal=false">Cancelar</button>
            <button class="btn btn-sm btn-primary" (click)="confirmReservation()">Reservar</button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class LibraryComponent implements OnInit {
  tab = 'books';
  books: any[] = [];
  loans: any[] = [];
  overdueList: any[] = [];
  reservations: any[] = [];
  totalBooks = 0;
  totalCopies = 0;
  activeLoans = 0;
  overdueLoans = 0;
  pendingRes = 0;
  searchQuery = '';
  showCreateModal = false;
  showLoanModal = false;
  showResModal = false;
  newBook: any = { title: '', author: '', isbn: '', publisher: '', publicationYear: null, totalCopies: 1, availableCopies: 1, location: '', description: '' };
  selectedBook: any = null;
  loanStudentId: number | null = null;
  loanHistoryStudentId: number | null = null;
  loanDays = 14;
  resStudentId: number | null = null;

  constructor(private http: HttpClient, private auth: AuthService) {}

  ngOnInit() { this.load(); }

  private get instId(): number { return this.auth.institutionId() || 1; }

  load() {
    this.http.get<any[]>(`${API_URL}/library/books?institutionId=${this.instId}`).subscribe({
      next: r => { this.books = r; this.totalBooks = r.length; this.totalCopies = r.reduce((s, b) => s + (b.totalCopies || 0), 0); },
      error: () => {}
    });
    this.http.get<any[]>(`${API_URL}/library/loans/active`).subscribe({ next: r => { this.loans = r; this.activeLoans = r.length; }, error: () => {} });
    this.http.get<any[]>(`${API_URL}/library/loans/overdue`).subscribe({ next: r => { this.overdueList = r; this.overdueLoans = r.length; }, error: () => {} });
    this.http.get<any[]>(`${API_URL}/library/reservations/pending`).subscribe({ next: r => { this.reservations = r; this.pendingRes = r.length; }, error: () => {} });
  }

  onSearch() {
    if (this.searchQuery.length > 1) {
      this.http.get<any[]>(`${API_URL}/library/books/search?institutionId=${this.instId}&q=${this.searchQuery}`).subscribe({
        next: r => this.books = r, error: () => {}
      });
    } else if (this.searchQuery.length === 0) {
      this.load();
    }
  }

  exportCSV() { window.open(`${API_URL}/library/books/export?institutionId=${this.instId}`, '_blank'); }

  getDaysOverdue(dueDate: string): number {
    const due = new Date(dueDate);
    const now = new Date();
    return Math.floor((now.getTime() - due.getTime()) / 86400000);
  }

  createBook() {
    this.http.post<any>(`${API_URL}/library/books`, { ...this.newBook, institutionId: this.instId }).subscribe({
      next: () => { this.showCreateModal = false; this.load(); },
      error: e => alert(e.error?.message || 'Error')
    });
  }

  openLoanModal(b: any) { this.selectedBook = b; this.loanStudentId = null; this.showLoanModal = true; }

  confirmLoan() {
    const due = new Date(); due.setDate(due.getDate() + this.loanDays);
    this.http.post<any>(`${API_URL}/library/loans`, { bookId: this.selectedBook.id, studentId: this.loanStudentId, dueDate: due.toISOString().split('T')[0] }).subscribe({
      next: () => { this.showLoanModal = false; this.load(); },
      error: e => alert(e.error?.message || 'Error')
    });
  }

  returnBook(id: number) {
    this.http.post<any>(`${API_URL}/library/loans/${id}/return`, {}).subscribe({ next: () => this.load() });
  }

  openResModal(b: any) { this.selectedBook = b; this.resStudentId = null; this.showResModal = true; }

  confirmReservation() {
    const exp = new Date(); exp.setDate(exp.getDate() + 7);
    this.http.post<any>(`${API_URL}/library/reservations`, { bookId: this.selectedBook.id, studentId: this.resStudentId, expiryDate: exp.toISOString().split('T')[0] }).subscribe({
      next: () => { this.showResModal = false; this.load(); },
      error: e => alert(e.error?.message || 'Error')
    });
  }

  completeReservation(id: number) {
    this.http.post<any>(`${API_URL}/library/reservations/${id}/complete`, {}).subscribe({ next: () => this.load() });
  }

  downloadLoanHistory() {
    window.open(`${API_URL}/library/loans/student/${this.loanHistoryStudentId}/pdf`, '_blank');
  }
}
