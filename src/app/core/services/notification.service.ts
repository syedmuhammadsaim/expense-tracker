import { Injectable, signal } from '@angular/core';
import { StorageService } from './storage.service';
import { AppNotification } from '../models/notification.model';

const KEY = 'notifications';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  notifications = signal<AppNotification[]>([]);

  constructor(private storage: StorageService) {
    this.notifications.set(this.storage.get<AppNotification[]>(KEY) ?? []);
  }

  private persist(): void {
    this.storage.save(KEY, this.notifications());
  }

  push(
    title: string,
    message: string,
    type: AppNotification['type'] = 'info'
  ): void {
    const item: AppNotification = {
      id: 'n_' + Math.random().toString(36).slice(2, 10),
      title,
      message,
      type,
      read: false,
      createdAt: new Date().toISOString(),
    };
    this.notifications.update((l) => [item, ...l].slice(0, 50));
    this.persist();
  }

  markRead(id: string): void {
    this.notifications.update((l) => l.map((n) => (n.id === id ? { ...n, read: true } : n)));
    this.persist();
  }

  markAllRead(): void {
    this.notifications.update((l) => l.map((n) => ({ ...n, read: true })));
    this.persist();
  }

  delete(id: string): void {
    this.notifications.update((l) => l.filter((n) => n.id !== id));
    this.persist();
  }

  unreadCount(): number {
    return this.notifications().filter((n) => !n.read).length;
  }

  seedDemo(): void {
    if (this.notifications().length) return;
    this.push('Welcome!', 'Start tracking your expenses today.', 'info');
  }
}