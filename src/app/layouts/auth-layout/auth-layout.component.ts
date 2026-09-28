import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LogoComponent } from '../../shared/components/logo/logo.component';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [RouterOutlet, LogoComponent],
  template: `
    <div class="auth-shell">
      <div class="auth-brand">
        <app-logo></app-logo>
        <h1>Welcome to Expense Tracker</h1>
        <p>
          Take control of your finances — track income, expenses, budgets, and
          savings in one place.
        </p>
        <ul class="features">
          <li>✨ Beautiful dashboard with charts</li>
          <li>🎯 Smart budget tracking</li>
          <li>🏦 Savings goal planner</li>
          <li>📊 Monthly &amp; annual reports</li>
        </ul>
      </div>
      <div class="auth-card">
        <router-outlet></router-outlet>
      </div>
    </div>
  `,
  styles: [
    `
      .auth-shell {
        min-height: 100vh;
        display: grid;
        grid-template-columns: 1fr 1fr;
        background: var(--bg);
      }
      .auth-brand {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: flex-start;
        gap: 16px;
        background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #a855f7 100%);
        color: #fff;
        padding: 60px 48px;
        position: relative;
        overflow: hidden;
      }
      .auth-brand::before {
        content: '';
        position: absolute;
        width: 400px;
        height: 400px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.06);
        top: -100px;
        right: -100px;
      }
      .auth-brand::after {
        content: '';
        position: absolute;
        width: 300px;
        height: 300px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.04);
        bottom: -80px;
        left: -80px;
      }
      .auth-brand > * {
        position: relative;
        z-index: 1;
      }
      .auth-brand h1 {
        margin: 0;
        font-size: 1.8rem;
        line-height: 1.3;
        font-weight: 700;
      }
      .auth-brand p {
        margin: 0;
        font-size: 1rem;
        opacity: 0.9;
        line-height: 1.6;
        max-width: 420px;
      }
      .features {
        list-style: none;
        padding: 0;
        margin: 12px 0 0;
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .features li {
        font-size: 0.92rem;
        opacity: 0.92;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .auth-card {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 40px 24px;
      }
      @media (max-width: 900px) {
        .auth-shell {
          grid-template-columns: 1fr;
        }
        .auth-brand {
          padding: 40px 24px;
          align-items: center;
          text-align: center;
        }
        .auth-brand h1 {
          font-size: 1.5rem;
        }
        .features {
          display: none;
        }
      }
    `,
  ],
})
export class AuthLayoutComponent {}