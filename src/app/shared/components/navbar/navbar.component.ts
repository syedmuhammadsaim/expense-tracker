import { Component, EventEmitter, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { SettingsService } from '../../../core/services/settings.service';
import { NotificationDropdownComponent } from '../notification-dropdown/notification-dropdown.component';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, NotificationDropdownComponent],
  template: `
    <header class="navbar">
      <button
        class="icon-btn menu-btn"
        (click)="onMenuClick()"
        aria-label="Menu"
        type="button"
      >
        ☰
      </button>
      <div class="title">Expense Tracker</div>
      <div class="actions">
        <button class="icon-btn" (click)="toggleTheme()" title="Toggle theme">
          {{ settings.settings().theme === 'light' ? '🌙' : '☀️' }}
        </button>
        <app-notification-dropdown></app-notification-dropdown>
        <div class="user" (click)="goProfile()">
          <div class="avatar">
            <img
              *ngIf="auth.currentUser()?.profileImage && !imgError()"
              [src]="auth.currentUser()!.profileImage!"
              alt="avatar"
              (error)="imgError.set(true)"
            />
            <span *ngIf="!auth.currentUser()?.profileImage || imgError()">
              {{ initials() }}
            </span>
          </div>
          <span class="user-name">{{ auth.currentUser()?.fullName }}</span>
        </div>
        <button class="btn btn-ghost logout-btn" (click)="logout()">Logout</button>
      </div>
    </header>
  `,
  styles: [
    `
      /* ============================================================
         NAVBAR — Sticky top, always visible
         ============================================================ */
      .navbar {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 10px 20px;
        background: var(--surface);
        border-bottom: 1px solid var(--border);
        position: sticky;
        top: 0;
        z-index: 50;
        min-height: 56px;
        width: 100%;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
        backdrop-filter: blur(8px);
      }

      .menu-btn {
        display: none;
        font-size: 1.2rem;
        padding: 6px 12px;
        cursor: pointer;
      }

      .title {
        font-weight: 700;
        font-size: 1rem;
        color: var(--text);
        white-space: nowrap;
      }

      .actions {
        margin-left: auto;
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .user {
        display: flex;
        align-items: center;
        gap: 8px;
        cursor: pointer;
        padding: 4px 8px 4px 4px;
        border-radius: 999px;
        transition: background 0.15s;
      }
      .user:hover {
        background: var(--bg);
      }

      .avatar {
        width: 34px;
        height: 34px;
        border-radius: 50%;
        background: var(--primary);
        color: #fff;
        display: grid;
        place-items: center;
        font-weight: 600;
        font-size: 0.78rem;
        flex-shrink: 0;
        overflow: hidden;
        border: 2px solid var(--border);
      }
      .avatar img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }

      .user-name {
        font-size: 0.85rem;
        color: var(--text);
        max-width: 140px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .logout-btn {
        padding: 6px 12px;
        font-size: 0.82rem;
      }

      /* ============================================================
         RESPONSIVE
         ============================================================ */
      @media (max-width: 900px) {
        .navbar {
          padding: 10px 14px;
        }
      }
      @media (max-width: 600px) {
        .navbar {
          padding: 8px 12px;
          gap: 8px;
        }
        .menu-btn {
          display: inline-flex;
        }
        .title {
          display: none;
        }
        .user-name {
          display: none;
        }
        .logout-btn {
          padding: 6px 10px;
          font-size: 0.78rem;
        }
      }
      @media (max-width: 400px) {
        .navbar {
          padding: 8px 8px;
          gap: 4px;
        }
        .icon-btn {
          padding: 5px 7px;
          font-size: 0.85rem;
        }
        .logout-btn {
          padding: 5px 8px;
          font-size: 0.72rem;
        }
      }
    `,
  ],
})
export class NavbarComponent {
  @Output() toggleSidebar = new EventEmitter<void>();

  auth = inject(AuthService);
  settings = inject(SettingsService);
  private router = inject(Router);

  imgError = signal(false);

  onMenuClick(): void {
    this.toggleSidebar.emit();
  }

  initials(): string {
    const name = this.auth.currentUser()?.fullName ?? '';
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((n) => n[0].toUpperCase())
      .join('');
  }

  toggleTheme(): void {
    this.settings.toggleTheme();
  }

  goProfile(): void {
    this.router.navigate(['/profile']);
  }

  logout(): void {
    this.auth.logout();
  }
}