import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../core/api.config';
import { AuthService } from '../../core/auth.service';

@Component({
  templateUrl: './communication-stats.component.html',
  styleUrl: './communication-stats.component.css',
    selector: 'app-communication-stats',
  standalone: true,
  imports: [CommonModule],
})
export class CommunicationStatsComponent implements OnInit {
  stats: any = {};
  recentNotifications: any[] = [];
  recentMessages: any[] = [];
  groups: any[] = [];
  parentComms: any[] = [];

  constructor(private http: HttpClient, private auth: AuthService) {}
  ngOnInit() { this.load(); }
  private get instId(): number { return this.auth.institutionId() || 1; }
  private get uid(): number { return this.auth.userId() || 1; }

  load() {
    this.http.get<any>(`${API_URL}/bi/communication-stats?institutionId=${this.instId}`).subscribe({ next: r => this.stats = r, error: () => {} });
    this.http.get<any[]>(`${API_URL}/communication/notifications`).subscribe({ next: r => this.recentNotifications = r.slice(0, 5), error: () => {} });
    this.http.get<any[]>(`${API_URL}/communication/messages/sent`).subscribe({ next: r => this.recentMessages = r.slice(0, 5), error: () => {} });
    this.http.get<any[]>(`${API_URL}/communication/groups?institutionId=${this.instId}`).subscribe({ next: r => this.groups = r.slice(0, 5), error: () => {} });
    this.http.get<any[]>(`${API_URL}/communication/parent-comm/student/${this.uid}`).subscribe({ next: r => this.parentComms = r.slice(0, 5), error: () => {} });
  }
}
