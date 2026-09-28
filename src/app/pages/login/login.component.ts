import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <form [formGroup]="form" (ngSubmit)="submit()" class="auth-form" novalidate>
      <h2>Welcome back</h2>
      <p class="subtitle">Sign in to your account</p>

      <!-- Email -->
      <div class="field">
        <label>Email</label>
        <input
          type="email"
          formControlName="email"
          placeholder="you@example.com"
          autocomplete="email"
        />
        <small class="error" *ngIf="showError('email')">
          Please enter a valid email.
        </small>
      </div>

      <!-- Password -->
      <div class="field">
        <label>Password</label>
        <div class="pw-wrap">
          <input
            [type]="showPw() ? 'text' : 'password'"
            formControlName="password"
            placeholder="••••••••"
            autocomplete="current-password"
          />
          <button
            type="button"
            class="pw-toggle"
            (click)="showPw.set(!showPw())"
            tabindex="-1"
            aria-label="Toggle password"
          >
            {{ showPw() ? '🙈' : '👁️' }}
          </button>
        </div>
        <small class="error" *ngIf="showError('password')">
          Password must be at least 6 characters.
        </small>
      </div>

      <!-- Remember / Forgot -->
      <div class="row">
        <label class="checkbox">
          <input type="checkbox" formControlName="remember" />
          Remember me
        </label>
        <a class="link" href="javascript:void(0)" (click)="forgot()">
          Forgot password?
        </a>
      </div>

      <!-- Error banner (invalid credentials) -->
      <div class="error-banner" *ngIf="errorMsg()">{{ errorMsg() }}</div>

      <!-- Submit -->
      <button
        type="submit"
        class="btn btn-primary full"
        [disabled]="loading()"
      >
        {{ loading() ? 'Signing in…' : 'Login' }}
      </button>

      <!-- Footer -->
      <p class="foot">
        Don't have an account?
        <a routerLink="/register">Create account</a>
      </p>
    </form>
  `,
  styles: [
    `
      .auth-form {
        width: 100%;
        max-width: 380px;
      }
      h2 {
        margin: 0 0 4px;
        color: var(--text);
        font-size: 1.5rem;
      }
      .subtitle {
        margin: 0 0 24px;
        color: var(--text-muted);
        font-size: 0.9rem;
      }
      .field {
        margin-bottom: 16px;
      }
      .field label {
        display: block;
        margin-bottom: 6px;
        font-size: 0.85rem;
        color: var(--text);
        font-weight: 500;
      }
      .field input {
        width: 100%;
        padding: 10px 12px;
        border: 1px solid var(--border);
        border-radius: 10px;
        background: var(--surface);
        color: var(--text);
        font-size: 0.95rem;
        outline: none;
        transition: border-color 0.15s;
        font-family: inherit;
      }
      .field input:focus {
        border-color: var(--primary);
      }
      .field input.ng-invalid.ng-touched {
        border-color: #dc2626;
      }

      .pw-wrap {
        position: relative;
      }
      .pw-toggle {
        position: absolute;
        right: 8px;
        top: 50%;
        transform: translateY(-50%);
        background: none;
        border: none;
        cursor: pointer;
        font-size: 1rem;
        padding: 4px 6px;
        color: var(--text-muted);
      }

      .row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
      }
      .checkbox {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 0.85rem;
        color: var(--text);
        cursor: pointer;
      }
      .checkbox input {
        width: 16px;
        height: 16px;
        accent-color: var(--primary);
        cursor: pointer;
      }
      .link {
        font-size: 0.85rem;
        color: var(--primary);
        text-decoration: none;
        cursor: pointer;
      }
      .link:hover {
        text-decoration: underline;
      }

      .error {
        display: block;
        color: #dc2626;
        font-size: 0.78rem;
        margin-top: 4px;
      }
      .error-banner {
        background: #fee2e2;
        color: #b91c1c;
        padding: 10px 12px;
        border-radius: 8px;
        font-size: 0.85rem;
        margin-bottom: 12px;
        border: 1px solid #fecaca;
      }
      .full {
        width: 100%;
      }
      .foot {
        text-align: center;
        margin-top: 18px;
        font-size: 0.85rem;
        color: var(--text-muted);
      }
      .foot a {
        color: var(--primary);
        text-decoration: none;
        font-weight: 500;
      }
      .foot a:hover {
        text-decoration: underline;
      }
    `,
  ],
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private toast = inject(ToastService);
  private router = inject(Router);

  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    remember: [true],
  });

  showPw = signal(false);
  loading = signal(false);
  errorMsg = signal('');

  /**
   * Show error ONLY if:
   * - The field has been touched (blurred or value changed)
   * - AND the field is invalid
   */
  showError(name: string): boolean {
    const c = this.form.get(name);
    return !!c && c.touched && c.invalid;
  }

  submit(): void {
    this.errorMsg.set('');

    // Mark all fields as touched to show validation errors
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    const { email, password, remember } = this.form.getRawValue();

    setTimeout(() => {
      const res = this.auth.login(email, password, remember);
      this.loading.set(false);

      if (!res.success) {
        this.errorMsg.set(res.message);
        return;
      }

      // ✅ Dynamic welcome message
      const user = this.auth.currentUser();
      let firstName = 'User';
      if (user?.fullName) {
        const parts = user.fullName.trim().split(/\s+/);
        firstName = parts[0];
      }

      this.toast.success(`Welcome back, ${firstName}! 👋`);
      this.router.navigate(['/dashboard']);
    }, 400);
  }

  forgot(): void {
    this.toast.info('Password reset is not available in demo mode.');
  }
}