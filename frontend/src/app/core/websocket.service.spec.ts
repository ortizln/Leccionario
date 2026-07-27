import { TestBed } from '@angular/core/testing';
import { WebSocketService, AppNotification } from './websocket.service';
import { ToastService } from './toast.service';

describe('WebSocketService', () => {
  let service: WebSocketService;
  let toast: ToastService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [WebSocketService, ToastService],
    });
    service = TestBed.inject(WebSocketService);
    toast = TestBed.inject(ToastService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('isConnected should default to false', () => {
    expect(service.isConnected).toBe(false);
  });

  it('getNotifications should return empty array initially', () => {
    expect(service.getNotifications()).toEqual([]);
  });

  it('markRead should set notification as read and update unreadCount', () => {
    (service as any).addToNotifications({
      title: 'Test',
      message: 'Body',
      type: 'INFO',
    });

    let unread = -1;
    service.unreadCount$.subscribe((c: number) => unread = c);

    service.markRead((service as any).notifications[0].id);
    expect((service as any).notifications[0].read).toBe(true);
    expect(unread).toBe(0);
  });

  it('markAllRead should set all notifications as read', () => {
    (service as any).addToNotifications({ title: 'A', message: '', type: 'INFO' });
    (service as any).addToNotifications({ title: 'B', message: '', type: 'WARNING' });

    let unread = -1;
    service.unreadCount$.subscribe((c: number) => unread = c);

    service.markAllRead();
    expect((service as any).notifications.every((n: AppNotification) => n.read)).toBe(true);
    expect(unread).toBe(0);
  });

  it('should cap notifications at 50', () => {
    for (let i = 0; i < 55; i++) {
      (service as any).addToNotifications({ title: `N${i}`, message: '', type: 'INFO' });
    }
    expect(service.getNotifications().length).toBe(50);
  });

  it('disconnect should clear client and subscriptions', () => {
    service.disconnect();
    expect(service.isConnected).toBe(false);
    expect((service as any).client).toBeNull();
    expect((service as any).subscriptions).toEqual([]);
  });
});
