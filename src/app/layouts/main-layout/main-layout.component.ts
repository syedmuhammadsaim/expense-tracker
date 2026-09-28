import { Component, signal, HostListener, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';

const MOBILE_BREAKPOINT = 600;

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, NavbarComponent, CommonModule],
  template: `
    <div
      class="layout"
      [class.mobile-mode]="isMobile()"
      [class.sidebar-collapsed]="!isMobile() && collapsed()"
    >
      <!-- Overlay (mobile) -->
      <div
        class="overlay"
        *ngIf="isMobile() && mobileOpen()"
        (click)="closeMobileSidebar()"
      ></div>

      <app-sidebar
        [collapsed]="!isMobile() && collapsed()"
        [class.mobile-hidden]="isMobile() && !mobileOpen()"
        [class.desktop-collapsed]="!isMobile() && collapsed()"
        (toggle)="toggleSidebar()"
        (closeMobile)="closeMobileSidebar()"
      ></app-sidebar>

      <div class="main">
        <app-navbar (toggleSidebar)="toggleSidebar()"></app-navbar>

        <main class="content">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        width: 100%;
        min-height: 100vh;
      }

      /* ============================================================
         DESKTOP LAYOUT
         - Sidebar: fixed (left, 240px)
         - Navbar: sticky (top, fixed while scroll)
         - Content: scrolls on right
         ============================================================ */
      .layout {
        display: block;
        width: 100%;
        min-height: 100vh;
        background: var(--bg);
      }

      .main {
        margin-left: 240px;
        min-height: 100vh;
        display: flex;
        flex-direction: column;
        width: calc(100% - 240px);
        transition: margin-left 0.2s ease, width 0.2s ease;
      }

      .layout.sidebar-collapsed .main {
        margin-left: 68px;
        width: calc(100% - 68px);
      }

      /* ============================================================
         NAVBAR — STICKY, always at top
         ============================================================ */
      .main > app-navbar {
        display: block;
        position: sticky;
        top: 0;
        z-index: 50;
        width: 100%;
        flex-shrink: 0;
      }

      .content {
        flex: 1;
        padding: 20px;
        overflow-x: hidden;
        max-width: 100%;
      }

      .overlay {
        display: none;
      }

      /* ============================================================
         TABLET (601-900px)
         ============================================================ */
      @media (max-width: 900px) and (min-width: 601px) {
        .content {
          padding: 16px;
        }
      }

      /* ============================================================
         MOBILE (<= 600px)
         ============================================================ */
      @media (max-width: 600px) {
        .main {
          margin-left: 0 !important;
          width: 100% !important;
        }

        .content {
          padding: 12px;
        }

        .overlay {
          display: block;
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 150;
          animation: fadeIn 0.2s ease;
          backdrop-filter: blur(2px);
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      }
    `,
  ],
})
export class MainLayoutComponent implements OnInit {
  private platformId = inject(PLATFORM_ID);

  collapsed = signal(false);
  mobileOpen = signal(false);
  private _isMobile = signal(false);

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      const mobile = window.innerWidth <= MOBILE_BREAKPOINT;
      this._isMobile.set(mobile);
      if (mobile) {
        this.mobileOpen.set(false);
        this.collapsed.set(false);
      }
    }
  }

  isMobile(): boolean {
    return this._isMobile();
  }

  toggleSidebar(): void {
    if (this.isMobile()) {
      this.mobileOpen.update((v) => !v);
    } else {
      this.collapsed.update((v) => !v);
    }
  }

  closeMobileSidebar(): void {
    this.mobileOpen.set(false);
  }

  @HostListener('window:resize')
  onResize(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const mobile = window.innerWidth <= MOBILE_BREAKPOINT;
    this._isMobile.set(mobile);
    if (mobile) {
      this.mobileOpen.set(false);
      this.collapsed.set(false);
    } else {
      this.mobileOpen.set(false);
    }
  }
}