import { Injectable, OnDestroy } from '@angular/core';
import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import { Subject, Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { API_URL } from './api.config';

@Injectable({ providedIn: 'root' })
export class WebSocketService implements OnDestroy {
  private client: Client | null = null;
  private globalSubject = new Subject<any>();
  private personalSubject = new Subject<any>();
  private subscriptions: StompSubscription[] = [];
  private connected = false;

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
            } catch (_) {}
          })
        );
        this.subscriptions.push(
          this.client!.subscribe(`/user/${username}/queue/personal`, (msg: IMessage) => {
            try {
              const payload = JSON.parse(msg.body);
              this.personalSubject.next(payload);
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
