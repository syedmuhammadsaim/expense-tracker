import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { LogoComponent } from '../logo/logo.component';

interface NavItem {
  label: string;
  icon: string;
  route: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, LogoComponent],
  template: `
    <aside class="sidebar" [class.collapsed]="collapsed">
      <div class="brand">
        <app-logo [collapsed]="collapsed"></app-logo>
      </div>

      <nav>
        <div class="section" *ngFor="let s of sections">
          <p class="section-title" *ngIf="!collapsed">{{ s.title }}</p>
          <a
            *ngFor="let item of s.items"
            [routerLink]="item.route"
            routerLinkActive="active"
            class="nav-link"
            [title]="item.label"
          >
            <span class="nav-icon">{{ item.icon }}</span>
            <span class="nav-label" *ngIf="!collapsed">{{ item.label }}</span>
          </a>
        </div>
      </nav>

      <button class="collapse-btn" (click)="toggle.emit()" type="button" [attr.aria-label]="collapsed ? 'Expand sidebar' : 'Collapse sidebar'">
        {{ collapsed ? '»' : '«' }}
      </button>
    </aside>
  `,
  styles: [
    `
      /* ============================================================
         HOST — FIXED sidebar (always visible on desktop)
         ============================================================ */
      :host {
        display: block;
        position: fixed;
        top: 0;
        left: 0;
        height: 100vh;
        width: 240px;
        z-index: 100;
        transition: width 0.2s ease;
      }

      :host(.mobile-hidden) {
        transform: translateX(-100%);
      }

      /* ============================================================
         SIDEBAR INNER
         ============================================================ */
      .sidebar {
        width: 100%;
        height: 100vh;
        background: var(--sidebar-bg);
        color: var(--sidebar-text);
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }

      /* ============================================================
         BRAND
         ============================================================ */
      .brand {
        display: flex;
        align-items: center;
        padding: 14px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        flex-shrink: 0;
        min-height: 68px;
      }

      /* ============================================================
         NAV
         ============================================================ */
      nav {
        flex: 1;
        overflow-y: auto;
        overflow-x: hidden;
        padding: 12px 8px;
        scrollbar-width: thin;
      }
      nav::-webkit-scrollbar {
        width: 6px;
      }
      nav::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.15);
        border-radius: 3px;
      }

      .section {
        margin-bottom: 14px;
      }

      .section-title {
        font-size: 0.68rem;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: rgba(255, 255, 255, 0.45);
        margin: 8px 10px 4px;
        white-space: nowrap;
      }

      .nav-link {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 10px 12px;
        border-radius: 10px;
        color: var(--sidebar-text);
        text-decoration: none;
        font-size: 0.88rem;
        transition: background 0.15s;
        white-space: nowrap;
      }
      .nav-link:hover {
        background: rgba(255, 255, 255, 0.06);
      }
      .nav-link.active {
        background: var(--primary);
        color: #fff;
      }

      .nav-icon {
        width: 20px;
        text-align: center;
        flex-shrink: 0;
        font-size: 1rem;
      }

      /* ============================================================
         COLLAPSE BUTTON — Clean, no focus outline
         ============================================================ */
      .collapse-btn {
        background: rgba(255, 255, 255, 0.05);
        color: var(--sidebar-text);
        border: none;
        padding: 12px;
        cursor: pointer;
        font-size: 1rem;
        flex-shrink: 0;
        outline: none;
        transition: background 0.15s;
        font-family: inherit;
      }
      .collapse-btn:hover {
        background: rgba(255, 255, 255, 0.1);
      }
      .collapse-btn:focus,
      .collapse-btn:focus-visible,
      .collapse-btn:active {
        outline: none;
        box-shadow: none;
      }

      /* ============================================================
         COLLAPSED STATE (Desktop) — 68px icon-only
         ============================================================ */
      :host(.desktop-collapsed) {
        width: 68px;
      }
      :host(.desktop-collapsed) .nav-label,
      :host(.desktop-collapsed) .section-title {
        display: none;
      }
      :host(.desktop-collapsed) .brand {
        justify-content: center;
        padding: 14px 0;
      }
      :host(.desktop-collapsed) .nav-link {
        justify-content: center;
        padding: 10px;
      }
      :host(.desktop-collapsed) .collapse-btn {
        font-size: 1.1rem;
      }

      /* :has() fallback for browsers that support it */
      @media (min-width: 601px) {
        :host:has(.sidebar.collapsed) {
          width: 68px;
        }
        :host:has(.sidebar.collapsed) .nav-label,
        :host:has(.sidebar.collapsed) .section-title {
          display: none;
        }
        :host:has(.sidebar.collapsed) .brand {
          justify-content: center;
          padding: 14px 0;
        }
        :host:has(.sidebar.collapsed) .nav-link {
          justify-content: center;
          padding: 10px;
        }
      }

      /* ============================================================
         MOBILE (<= 600px) — Overlay drawer
         ============================================================ */
      @media (max-width: 600px) {
        :host {
          width: 260px;
          z-index: 200;
          transition: transform 0.28s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 4px 0 24px rgba(0, 0, 0, 0.5);
        }

        :host(.mobile-hidden) {
          transform: translateX(-100%);
          box-shadow: none;
        }

        /* Ignore collapse on mobile */
        :host(.desktop-collapsed),
        :host:has(.sidebar.collapsed) {
          width: 260px;
        }
        :host(.desktop-collapsed) .nav-label,
        :host(.desktop-collapsed) .section-title,
        :host:has(.sidebar.collapsed) .nav-label,
        :host:has(.sidebar.collapsed) .section-title {
          display: block;
        }
        :host(.desktop-collapsed) .nav-link,
        :host:has(.sidebar.collapsed) .nav-link {
          justify-content: flex-start;
          padding: 10px 12px;
        }

        .collapse-btn {
          display: none;
        }
      }
    `,
  ],
})
export class SidebarComponent {
  @Input() collapsed = false;
  @Input() hiddenMobile = false;
  @Output() toggle = new EventEmitter<void>();
  @Output() closeMobile = new EventEmitter<void>();

  private router = inject(Router);

  constructor() {
    this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe(() => {
        if (window.innerWidth <= 600) {
          this.closeMobile.emit();
        }
      });
  }

  sections: NavSection[] = [
    {
      title: 'Main',
      items: [{ label: 'Dashboard', icon: '📊', route: '/dashboard' }],
    },
    {
      title: 'Transactions',
      items: [
        { label: 'Transactions', icon: '🔁', route: '/transactions' },
        { label: 'Expenses', icon: '💳', route: '/expenses' },
        { label: 'Income', icon: '💵', route: '/income' },
      ],
    },
    {
      title: 'Finance',
      items: [
        { label: 'Budgets', icon: '🎯', route: '/budgets' },
        { label: 'Savings', icon: '🏦', route: '/savings' },
        { label: 'Reports', icon: '📈', route: '/reports' },
      ],
    },
    {
      title: 'Management',
      items: [{ label: 'Categories', icon: '🏷️', route: '/categories' }],
    },
    {
      title: 'Account',
      items: [
        { label: 'Profile', icon: '👤', route: '/profile' },
        { label: 'Settings', icon: '⚙️', route: '/settings' },
      ],
    },
  ];
}