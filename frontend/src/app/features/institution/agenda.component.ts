import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../core/api.config';
import { AuthService } from '../../core/auth.service';

@Component({
  templateUrl: './agenda.component.html',
  styleUrl: './agenda.component.css',
    selector: 'app-agenda',
  standalone: true,
  imports: [CommonModule],
})
export class AgendaComponent implements OnInit {
  events: any[] = [];
  upcoming: any[] = [];
  calendarEvents: any[] = [];
  circulars: any[] = [];
  activePeriod: any = null;
  private get instId(): number { return this.auth.institutionId() || 1; }

  constructor(private http: HttpClient, private auth: AuthService) {}

  ngOnInit() {
    this.http.get<any[]>(`${API_URL}/communication/events?institutionId=${this.instId}`).subscribe(d => this.events = d);
    this.http.get<any[]>(`${API_URL}/communication/events/upcoming?institutionId=${this.instId}`).subscribe(d => this.upcoming = d);
    this.http.get<any[]>(`${API_URL}/institution/calendar/institution/${this.instId}`).subscribe({
      next: d => this.calendarEvents = d,
      error: () => this.calendarEvents = []
    });
    this.http.get<any[]>(`${API_URL}/communication/circulars?institutionId=${this.instId}`).subscribe({
      next: d => this.circulars = d.slice(0, 5),
      error: () => this.circulars = []
    });
    this.http.get<any[]>(`${API_URL}/institution/periods/active?institutionId=${this.instId}`).subscribe({
      next: (d: any[]) => this.activePeriod = d.length > 0 ? d[0] : null,
      error: () => this.activePeriod = null
    });
  }
}
