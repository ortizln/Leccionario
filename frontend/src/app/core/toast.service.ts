import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private toasts = new BehaviorSubject<Toast[]>([]);
  private nextId = 0;
  toasts$ = this.toasts.asObservable();

  show(message: string, type: Toast['type'] = 'info', duration = 4000) {
    const toast: Toast = { id: this.nextId++, message, type, duration };
    this.toasts.next([...this.toasts.value, toast]);
    if (duration > 0) {
      setTimeout(() => this.dismiss(toast.id), duration);
    }
  }

  success(message: string) { this.show(message, 'success'); }
  error(message: string) { this.show(message, 'error', 6000); }
  warning(message: string) { this.show(message, 'warning', 5000); }
  info(message: string) { this.show(message, 'info'); }

  dismiss(id: number) {
    this.toasts.next(this.toasts.value.filter(t => t.id !== id));
  }
}
