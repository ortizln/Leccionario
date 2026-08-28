import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../core/api.config';
import { AuthService } from '../../core/auth.service';

@Component({
  templateUrl: './messages.component.html',
  styleUrl: './messages.component.css',
    selector: 'app-messages',
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class MessagesComponent implements OnInit {
  tab = 'inbox';
  inbox: any[] = [];
  sent: any[] = [];
  unreadCount = 0;
  showComposeModal = false;
  compose = { subject: '', body: '', priority: 'NORMAL', recipientIds: '' };

  constructor(private http: HttpClient, private auth: AuthService) {}
  ngOnInit() { this.load(); }

  private get uid(): number { return this.auth.userId() || 1; }
  private get instId(): number { return this.auth.institutionId() || 1; }

  load() {
    this.http.get<any[]>(`${API_URL}/communication/messages/inbox`).subscribe({ next: r => this.inbox = r, error: () => {} });
    this.http.get<any[]>(`${API_URL}/communication/messages/sent`).subscribe({ next: r => this.sent = r, error: () => {} });
  }

  send() {
    const ids = this.compose.recipientIds.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
    this.http.post<any>(`${API_URL}/communication/messages`, {
      institutionId: this.instId, senderId: this.uid, subject: this.compose.subject,
      body: this.compose.body, priority: this.compose.priority, recipientIds: ids
    }).subscribe({ next: () => { this.showComposeModal = false; this.compose = { subject: '', body: '', priority: 'NORMAL', recipientIds: '' }; this.load(); } });
  }

  markRead(m: any) {
    this.http.post(`${API_URL}/communication/messages/${m.id}/read`, {}).subscribe({ next: () => this.load() });
  }

  markAllRead() {
    this.http.post(`${API_URL}/communication/messages/read-all/${this.uid}`, {}).subscribe({ next: () => this.load() });
  }

  reply(m: any) {
    this.compose.subject = 'RE: ' + m.subject;
    this.compose.recipientIds = '' + m.senderId;
    this.showComposeModal = true;
  }
}
