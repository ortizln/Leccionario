import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../core/api.config';

@Component({
  templateUrl: './book-loans-management.component.html',
  styleUrl: './book-loans-management.component.css',
    selector: 'app-book-loans-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class BookLoansManagementComponent implements OnInit {
  tab = 'active';
  activeList: any[] = [];
  overdueList: any[] = [];
  returnedList: any[] = [];
  activeLoans = 0;
  overdueLoans = 0;
  returnedLoans = 0;
  pendingReservations = 0;

  constructor(private http: HttpClient) {}
  ngOnInit() { this.load(); }

  load() {
    this.http.get<any[]>(`${API_URL}/library/loans/active`).subscribe({
      next: r => { this.activeList = r; this.activeLoans = r.length; },
      error: () => {}
    });
    this.http.get<any[]>(`${API_URL}/library/loans/overdue`).subscribe({
      next: r => { this.overdueList = r; this.overdueLoans = r.length; },
      error: () => {}
    });
    this.http.get<any[]>(`${API_URL}/library/reservations/pending`).subscribe({
      next: r => this.pendingReservations = r.length,
      error: () => {}
    });
  }

  getDaysLeft(dueDate: string): number {
    const due = new Date(dueDate);
    const now = new Date();
    return Math.ceil((due.getTime() - now.getTime()) / 86400000);
  }

  getDaysOverdue(dueDate: string): number {
    const due = new Date(dueDate);
    const now = new Date();
    return Math.floor((now.getTime() - due.getTime()) / 86400000);
  }

  returnBook(id: number) {
    if (!confirm('Confirmar devolucion?')) return;
    this.http.post(`${API_URL}/library/loans/${id}/return`, {}).subscribe({ next: () => this.load() });
  }

  exportCSV() {
    let csv = 'ID,Libro,Estudiante,Prestamo,Vence,Estado\n';
    [...this.activeList, ...this.overdueList, ...this.returnedList].forEach(l => {
      csv += `${l.id},${l.bookId},${l.studentId},${l.loanDate},${l.dueDate},${l.status}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'prestamos.csv'; a.click();
  }
}
