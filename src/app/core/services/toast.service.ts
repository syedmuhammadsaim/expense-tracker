import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  toasts = signal<Toast[]>([]);

  show(message: string, type: Toast['type'] = 'info', duration = 3000): void {
    const id = 't_' + Math.random().toString(36).slice(2, 8);
    this.toasts.update((l) => [...l, { id, message, type }]);
    setTimeout(() => this.dismiss(id), duration);
  }

  success(msg: string) { this.show(msg, 'success'); }
  error(msg: string) { this.show(msg, 'error'); }
  info(msg: string) { this.show(msg, 'info'); }
  warning(msg: string) { this.show(msg, 'warning'); }

  dismiss(id: string): void {
    this.toasts.update((l) => l.filter((t) => t.id !== id));
  }
}