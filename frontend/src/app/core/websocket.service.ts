import { Injectable, OnDestroy, inject } from '@angular/core';
import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import { Subject, Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { ToastService } from './toast.service';
import { API_URL } from './api.config';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class WebSocketService implements OnDestroy {
  private client: Client | null = null;
  private globalSubject = new Subject<any>();
  private personalSubject = new Subject<any>();
  private subscriptions: StompSubscription[] = [];
  private connected = false;
  private toast = inject(ToastService);
  private unreadCount = new Subject<number>();
  unreadCount$ = this.unreadCount.asObservable();
  private notifications: AppNotification[] = [];

  get globalNotifications$(): Observable<any> {
    return this.globalSubject.asObservable();
  }

  get personalNotifications$(): Observable<any> {
    return this.personalSubject.asObservable();
  }

  get isConnected(): boolean {
    return this.connected;
  }

  connect(auth: AuthService): void {
    if (this.connected) return;

    const wsUrl = this.buildWsUrl();
    if (!wsUrl) return;

    const username = auth.username();
    if (!username) return;

    this.client = new Client({
      brokerURL: wsUrl,
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        this.connected = true;
        this.subscriptions.push(
          this.client!.subscribe('/topic/notifications', (msg: IMessage) => {
            try {
              const payload = JSON.parse(msg.body);
              this.globalSubject.next(payload);
              this.showToast(payload);
            } catch (_) {}
          })
        );
        this.subscriptions.push(
          this.client!.subscribe(`/user/${username}/queue/personal`, (msg: IMessage) => {
            try {
              const payload = JSON.parse(msg.body);
              this.personalSubject.next(payload);
              this.showToast(payload);
              this.addToNotifications(payload);
            } catch (_) {}
          })
        );
      },
      onDisconnect: () => {
        this.connected = false;
      },
      onStompError: () => {
        this.connected = false;
      }
    });

    this.client.activate();
  }

  disconnect(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
    this.subscriptions = [];
    this.client?.deactivate();
    this.client = null;
    this.connected = false;
  }

  onAnnouncement(): Observable<{ action: string; data: any }> {
    return this.globalSubject.pipe(
      filter(msg => msg?.type === 'ANNOUNCEMENT'),
      map(msg => ({ action: msg.action, data: msg }))
    );
  }

  onPersonalAnnouncement(): Observable<{ action: string; data: any }> {
    return this.personalSubject.pipe(
      filter(msg => msg?.type === 'ANNOUNCEMENT'),
      map(msg => ({ action: msg.action, data: msg }))
    );
  }

  onScheduleChange(): Observable<any> {
    return this.globalSubject.pipe(
      filter(msg => msg?.type === 'SCHEDULE'),
      map(msg => msg)
    );
  }

  getNotifications(): AppNotification[] {
    return this.notifications;
  }

  markAllRead(): void {
    this.notifications.forEach(n => n.read = true);
    this.unreadCount.next(0);
  }

  markRead(id: string): void {
    const n = this.notifications.find(x => x.id === id);
    if (n) n.read = true;
    this.unreadCount.next(this.notifications.filter(x => !x.read).length);
  }

  private showToast(payload: any): void {
    const title = payload?.title || 'Notificación';
    const msg = payload?.message || payload?.messageBody || '';
    if (payload?.type === 'ERROR' || payload?.severity === 'ERROR') {
      this.toast.error(`${title}: ${msg}`);
    } else if (payload?.type === 'WARNING' || payload?.severity === 'WARNING') {
      this.toast.warning(`${title}: ${msg}`);
    } else {
      this.toast.info(`${title}: ${msg}`);
    }
  }

  private addToNotifications(payload: any): void {
    const notif: AppNotification = {
      id: String(Date.now()),
      title: payload?.title || 'Notificación',
      message: payload?.message || payload?.messageBody || '',
      type: payload?.type || 'INFO',
      read: false,
      createdAt: payload?.createdAt || new Date().toISOString()
    };
    this.notifications.unshift(notif);
    if (this.notifications.length > 50) this.notifications = this.notifications.slice(0, 50);
    this.unreadCount.next(this.notifications.filter(x => !x.read).length);
  }

  private buildWsUrl(): string | null {
    if (!API_URL) return null;
    const base = API_URL.replace(/\/api\/?$/, '');
    if (base.startsWith('http://') || base.startsWith('https://')) {
      return base.replace(/^http:/, 'ws:').replace(/^https:/, 'wss:') + '/ws';
    }
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${protocol}//${window.location.host}${base}/ws`;
  }

  ngOnDestroy(): void {
    this.disconnect();
  }
}
