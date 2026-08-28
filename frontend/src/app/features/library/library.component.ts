import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../core/api.config';
import { AuthService } from '../../core/auth.service';

@Component({
  templateUrl: './library.component.html',
  styleUrl: './library.component.css',
    selector: 'app-library',
  standalone: true,
  imports: [CommonModule, FormsModule],
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
