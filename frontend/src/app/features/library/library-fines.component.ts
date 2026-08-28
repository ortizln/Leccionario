import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../core/api.config';
import { AuthService } from '../../core/auth.service';

@Component({
  templateUrl: './library-fines.component.html',
  styleUrl: './library-fines.component.css',
    selector: 'app-library-fines',
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class LibraryFinesComponent implements OnInit {
  fines: any[] = [];
  showCalcModal = false;
  loanId: number | null = null;

  constructor(private http: HttpClient, private auth: AuthService) {}
  ngOnInit() { this.load(); }
  private get instId(): number { return this.auth.institutionId() || 1; }

  get pendingCount(): number { return this.fines.filter(f => f.status === 'PENDIENTE').length; }
  get paidCount(): number { return this.fines.filter(f => f.status === 'PAGADA').length; }
  get totalAmount(): number { return this.fines.reduce((s, f) => s + (f.fineAmount || 0), 0); }

  load() {
    this.http.get<any[]>(`${API_URL}/library/fines?institutionId=${this.instId}`).subscribe({ next: r => this.fines = r, error: () => {} });
  }
  calculate() {
    this.http.post<any>(`${API_URL}/library/fines/calculate/${this.loanId}`, {}).subscribe({
      next: () => { this.showCalcModal = false; this.loanId = null; this.load(); },
      error: e => alert(e.error?.message || 'Error al calcular multa')
    });
  }
  pay(id: number) {
    this.http.post<any>(`${API_URL}/library/fines/${id}/pay`, {}).subscribe({ next: () => this.load() });
  }
  forgive(id: number) {
    if (!confirm('Condonar esta multa?')) return;
    this.http.post<any>(`${API_URL}/library/fines/${id}/forgive`, {}).subscribe({ next: () => this.load() });
  }
}
