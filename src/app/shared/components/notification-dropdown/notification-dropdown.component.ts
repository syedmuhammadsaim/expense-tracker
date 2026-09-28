import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-notification-dropdown',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="notif-wrap">
      <button class="icon-btn" (click)="toggle()">
        🔔
        <span class="badge" *ngIf="notif.unreadCount() > 0">
          {{ notif.unreadCount() }}
        </span>
      </button>
      <div class="dropdown" *ngIf="open()">
        <header>
          <strong>Notifications</strong>
          <button class="link" (click)="notif.markAllRead()">Mark all read</button>
        </header>
        <div class="list" *ngIf="notif.notifications().length; else empty">
          <div
            *ngFor="let n of notif.notifications()"
            class="item"
            [class.unread]="!n.read"
          >
            <div class="item-body">
              <strong>{{ n.title }}</strong>
              <p>{{ n.message }}</p>
              <small>{{ n.createdAt | date: 'short' }}</small>
            </div>
            <div class="item-actions">
              <button class="icon-btn small" (click)="notif.markRead(n.id)" title="Mark read">
                ✓
              </button>
              <button class="icon-btn small" (click)="notif.delete(n.id)" title="Delete">
                ✕
              </button>
            </div>
          </div>
        </div>
        <ng-template #empty>
          <p class="empty-text">No notifications.</p>
        </ng-template>
      </div>
    </div>
  `,
  styles: [
    `
      .notif-wrap { position: relative; }
      .badge {
        position: absolute;
        top: -4px;
        right: -4px;
        background: #dc2626;
        color: #fff;
        font-size: 0.7rem;
        border-radius: 999px;
        padding: 2px 6px;
        min-width: 18px;
        text-align: center;
      }
      .dropdown {
        position: absolute;
        right: 0;
        top: 44px;
        width: 320px;
        max-height: 400px;
        overflow-y: auto;
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: 12px;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.12);
        z-index: 50;
      }
      header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 16px;
        border-bottom: 1px solid var(--border);
      }
      .link {
        background: none;
        border: none;
        color: var(--primary);
        cursor: pointer;
        font-size: 0.85rem;
      }
      .item {
        display: flex;
        justify-content: space-between;
        gap: 8px;
        padding: 12px 16px;
        border-bottom: 1px solid var(--border);
      }
      .item.unread { background: var(--primary-soft); }
      .item-body strong { font-size: 0.9rem; color: var(--text); }
      .item-body p { margin: 2px 0; font-size: 0.82rem; color: var(--text-muted); }
      .item-body small { color: var(--text-muted); font-size: 0.7rem; }
      .item-actions { display: flex; flex-direction: column; gap: 4px; }
      .icon-btn.small { font-size: 0.7rem; padding: 2px 6px; }
      .empty-text { padding: 24px; text-align: center; color: var(--text-muted); }
    `,
  ],
})
export class NotificationDropdownComponent {
  notif = inject(NotificationService);
  open = signal(false);

  toggle(): void {
    this.open.update((v) => !v);
  }
}