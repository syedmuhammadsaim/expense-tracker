import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-logo',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="logo-wrap" [class.collapsed]="collapsed">
      <svg
        class="logo-icon"
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient
            id="logoGrad"
            x1="0"
            y1="0"
            x2="48"
            y2="48"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stop-color="#6366f1" />
            <stop offset="100%" stop-color="#8b5cf6" />
          </linearGradient>
        </defs>

        <!-- Wallet body -->
        <rect x="4" y="12" width="40" height="28" rx="4" fill="url(#logoGrad)" />
        <rect
          x="4"
          y="12"
          width="40"
          height="28"
          rx="4"
          fill="rgba(255,255,255,0.06)"
        />

        <!-- Wallet flap -->
        <path
          d="M8 12 L14 6 L30 6 L36 12"
          stroke="url(#logoGrad)"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
          fill="none"
        />

        <!-- Card/note inside -->
        <rect x="8" y="18" width="22" height="14" rx="2" fill="#ffffff" opacity="0.9" />
        <rect x="11" y="22" width="10" height="2" rx="1" fill="#6366f1" />
        <rect x="11" y="26" width="14" height="1.5" rx="0.75" fill="#c7d2fe" />

        <!-- Coin -->
        <circle cx="38" cy="26" r="6" fill="#fbbf24" />
        <circle cx="38" cy="26" r="6" fill="rgba(255,255,255,0.15)" />
        <text
          x="38"
          y="29"
          text-anchor="middle"
          font-size="8"
          font-weight="700"
          fill="#92400e"
          font-family="Arial, sans-serif"
        >
          $
        </text>
      </svg>

      <span class="logo-text" *ngIf="!collapsed">
        Expense<span class="logo-accent">Tracker</span>
      </span>
    </div>
  `,
  styles: [
    `
      .logo-wrap {
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .logo-wrap.collapsed {
        justify-content: center;
      }
      .logo-icon {
        width: 36px;
        height: 36px;
        flex-shrink: 0;
        transition: transform 0.25s ease;
      }
      .logo-wrap:hover .logo-icon {
        transform: rotate(-6deg) scale(1.05);
      }
      .logo-text {
        font-size: 1.05rem;
        font-weight: 700;
        color: var(--sidebar-text, #fff);
        white-space: nowrap;
        letter-spacing: -0.01em;
      }
      .logo-accent {
        color: #a5b4fc;
        margin-left: 2px;
      }
      @media (max-width: 900px) {
        .logo-text {
          font-size: 0.95rem;
        }
      }
    `,
  ],
})
export class LogoComponent {
  @Input() collapsed = false;
}