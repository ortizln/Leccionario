import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../core/api.config';
import { AuthService } from '../../core/auth.service';

@Component({
  templateUrl: './school-events.component.html',
  styleUrl: './school-events.component.css',
    selector: 'app-school-events',
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class SchoolEventsComponent implements OnInit {
  events: any[] = [];
  showCreateModal = false;
  form: any = { title: '', description: '', eventDate: '', location: '', eventType: 'ACADEMICO' };
  constructor(private http: HttpClient, private auth: AuthService) {}
  ngOnInit() { this.load(); }
  private get instId(): number { return this.auth.institutionId() || 1; }
  get upcomingCount(): number { return this.events.filter(e => e.status === 'PROGRAMADO').length; }
  load() { this.http.get<any[]>(`${API_URL}/communication/events?institutionId=${this.instId}`).subscribe({ next: r => this.events = r, error: () => {} }); }
  save() {
    this.http.post<any>(`${API_URL}/communication/events`, { ...this.form, institutionId: this.instId, organizerUserId: 1 }).subscribe({
      next: () => { this.showCreateModal = false; this.load(); this.form = { title: '', description: '', eventDate: '', location: '', eventType: 'ACADEMICO' }; },
      error: e => alert(e.error?.message || 'Error')
    });
  }
  deleteEvent(id: number) { if (!confirm('Eliminar?')) return; this.http.delete(`${API_URL}/communication/events/${id}`).subscribe({ next: () => this.load() }); }
}
