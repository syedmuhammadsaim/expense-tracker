import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <form [formGroup]="form" (ngSubmit)="submit()" class="auth-form" novalidate>
      <h2>Create account</h2>
      <p class="subtitle">Join Expense Tracker</p>

      <!-- Full Name -->
      <div class="field">
        <label>Full Name</label>
        <input
          type="text"
          formControlName="fullName"
          placeholder="e.g., Syed Muhammad Saim"
          autocomplete="name"
        />
        <small class="error" *ngIf="showError('fullName')">
          <ng-container *ngIf="form.get('fullName')?.hasError('required')">
            Full name is required.
          </ng-container>
          <ng-container *ngIf="form.get('fullName')?.hasError('minlength')">
            Name must be at least 2 characters.
          </ng-container>
        </small>
      </div>

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
          <ng-container *ngIf="form.get('email')?.hasError('required')">
            Email is required.
          </ng-container>
          <ng-container *ngIf="form.get('email')?.hasError('email')">
            Please enter a valid email.
          </ng-container>
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
            autocomplete="new-password"
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
          <ng-container *ngIf="form.get('password')?.hasError('required')">
            Password is required.
          </ng-container>
          <ng-container *ngIf="form.get('password')?.hasError('minlength')">
            Password must be at least 6 characters.
          </ng-container>
        </small>
      </div>

      <!-- Confirm Password -->
      <div class="field">
        <label>Confirm Password</label>
        <input
          type="password"
          formControlName="confirm"
          placeholder="••••••••"
          autocomplete="new-password"
        />
        <small class="error" *ngIf="showError('confirm')">
          <ng-container *ngIf="form.get('confirm')?.hasError('required')">
            Please confirm your password.
          </ng-container>
          <ng-container *ngIf="form.errors?.['mismatch']">
            Passwords do not match.
          </ng-container>
        </small>
      </div>

      <!-- Error banner -->
      <div class="error-banner" *ngIf="errorMsg()">{{ errorMsg() }}</div>

      <!-- Submit -->
      <button
        type="submit"
        class="btn btn-primary full"
        [disabled]="loading()"
      >
        {{ loading() ? 'Creating…' : 'Create Account' }}
      </button>

      <!-- Footer -->
      <p class="foot">
        Already have an account?
        <a routerLink="/login">Login</a>
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
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private toast = inject(ToastService);
  private router = inject(Router);

  form = this.fb.nonNullable.group(
    {
      fullName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirm: ['', [Validators.required]],
    },
    {
      validators: (group) => {
        const pw = group.get('password')?.value;
        const cf = group.get('confirm')?.value;
        return pw === cf ? null : { mismatch: true };
      },
    }
  );

  showPw = signal(false);
  loading = signal(false);
  errorMsg = signal('');

  showError(name: string): boolean {
    const c = this.form.get(name);
    if (!c) return false;

    // Confirm field also shows error if passwords mismatch
    if (name === 'confirm' && this.form.errors?.['mismatch'] && c.touched) {
      return true;
    }

    return c.touched && c.invalid;
  }

  submit(): void {
    this.errorMsg.set('');

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    const { fullName, email, password } = this.form.getRawValue();

    setTimeout(() => {
      const res = this.auth.register({ fullName, email, password });
      this.loading.set(false);

      if (!res.success) {
        this.errorMsg.set(res.message);
        return;
      }

      this.toast.success('Account created! Please log in. 🎉');
      this.router.navigate(['/login']);
    }, 400);
  }
}