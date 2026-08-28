import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../core/api.config';

@Component({
  templateUrl: './book-reservations.component.html',
  styleUrl: './book-reservations.component.css',
    selector: 'app-book-reservations',
  standalone: true,
  imports: [CommonModule, FormsModule],
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
