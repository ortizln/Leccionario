import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../core/api.config';
import { AuthService } from '../../core/auth.service';

@Component({
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.css',
    selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class NotificationsComponent implements OnInit {
  tab = 'notifications';
  notifications: any[] = [];
  inboxMessages: any[] = [];
  sentMessages: any[] = [];
  unreadCount = 0;
  readCount = 0;
  urgentCount = 0;
  unreadMessages = 0;
  showComposeModal = false;
  newMsg: any = { recipientIds: '', subject: '', body: '', priority: 'NORMAL' };
  userId = 0;

  constructor(private http: HttpClient, private auth: AuthService) {}

  ngOnInit() {
    const token = this.auth.token();
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        this.userId = payload.userId || payload.sub || 1;
      } catch { this.userId = 1; }
    }
    this.load();
  }

  load() {
    this.http.get<any[]>(`${API_URL}/communication/notifications`).subscribe({
      next: r => {
        this.notifications = r;
        this.unreadCount = r.filter(n => !n.readStatus).length;
        this.readCount = r.filter(n => n.readStatus).length;
        this.urgentCount = r.filter(n => n.priority === 'URGENTE' && !n.readStatus).length;
      },
      error: () => {}
    });
    this.http.get<any[]>(`${API_URL}/communication/messages/inbox`).subscribe({
      next: r => { this.inboxMessages = r; this.unreadMessages = r.length; },
      error: () => {}
    });
    this.http.get<any[]>(`${API_URL}/communication/messages/sent`).subscribe({
      next: r => this.sentMessages = r,
      error: () => {}
    });
  }

  markRead(n: any) {
    if (!n.readStatus) {
      this.http.post(`${API_URL}/communication/notifications/${n.id}/read`, {}).subscribe({ next: () => this.load() });
    }
  }

  sendMsg() {
    const ids = this.newMsg.recipientIds.split(',').map((s: string) => parseInt(s.trim())).filter((n: number) => !isNaN(n));
    this.http.post(`${API_URL}/communication/messages`, {
      institutionId: this.auth.institutionId() || 1, senderId: this.userId, subject: this.newMsg.subject,
      body: this.newMsg.body, priority: this.newMsg.priority, recipientIds: ids
    }).subscribe({
      next: () => { this.showComposeModal = false; this.load(); },
      error: e => alert(e.error?.message || 'Error')
    });
  }
}
