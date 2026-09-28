import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SettingsService } from '../../core/services/settings.service';
import { ToastService } from '../../core/services/toast.service';
import { DemoDataService } from '../../core/services/demo-data.service';
import { ExpenseService } from '../../core/services/expense.service';
import { IncomeService } from '../../core/services/income.service';
import { BudgetService } from '../../core/services/budget.service';
import { SavingsService } from '../../core/services/savings.service';
import { CategoryService } from '../../core/services/category.service';
import { Currency, Theme } from '../../core/models/settings.model';
import { ModalComponent } from '../../shared/components/modal/modal.component';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent],
  template: `
    <div class="page">
      <div class="page-head">
        <h1>Settings</h1>
        <p class="muted">Customize your experience</p>
      </div>

      <!-- ==================== APPEARANCE ==================== -->
      <div class="card">
        <h3>🎨 Appearance</h3>
        <div class="row">
          <label>Theme</label>
          <div class="segmented">
            <button
              [class.active]="settings.settings().theme === 'light'"
              (click)="setTheme('light')"
            >
              ☀️ Light
            </button>
            <button
              [class.active]="settings.settings().theme === 'dark'"
              (click)="setTheme('dark')"
            >
              🌙 Dark
            </button>
          </div>
        </div>
      </div>

      <!-- ==================== CURRENCY ==================== -->
      <div class="card">
        <h3>💱 Currency</h3>
        <div class="row">
          <label>Display currency</label>
          <select
            [ngModel]="settings.settings().currency"
            (ngModelChange)="setCurrency($event)"
          >
            <option value="USD">USD ($)</option>
            <option value="PKR">PKR (₨)</option>
            <option value="EUR">EUR (€)</option>
            <option value="GBP">GBP (£)</option>
          </select>
        </div>
      </div>

      <!-- ==================== NOTIFICATIONS ==================== -->
      <div class="card">
        <h3>🔔 Notifications</h3>
        <div class="row">
          <label>Budget alerts</label>
          <input
            type="checkbox"
            [ngModel]="settings.settings().notifications.budgetAlerts"
            (ngModelChange)="setNotif('budgetAlerts', $event)"
          />
        </div>
        <div class="row">
          <label>Expense alerts</label>
          <input
            type="checkbox"
            [ngModel]="settings.settings().notifications.expenseAlerts"
            (ngModelChange)="setNotif('expenseAlerts', $event)"
          />
        </div>
        <div class="row">
          <label>Monthly report alerts</label>
          <input
            type="checkbox"
            [ngModel]="settings.settings().notifications.monthlyReportAlerts"
            (ngModelChange)="setNotif('monthlyReportAlerts', $event)"
          />
        </div>
      </div>

      <!-- ==================== DEMO DATA ==================== -->
      <div class="card demo-card">
        <h3>🎲 Demo Data</h3>
        <p class="muted">
          Load sample data to see how the app looks with real content. Your data
          stays private to your account.
        </p>

        <div class="stats-row">
          <div class="stat-box">
            <span class="stat-num">{{ expenseCount() }}</span>
            <span class="stat-lbl">Expenses</span>
          </div>
          <div class="stat-box">
            <span class="stat-num">{{ incomeCount() }}</span>
            <span class="stat-lbl">Incomes</span>
          </div>
          <div class="stat-box">
            <span class="stat-num">{{ budgetCount() }}</span>
            <span class="stat-lbl">Budgets</span>
          </div>
          <div class="stat-box">
            <span class="stat-num">{{ savingsCount() }}</span>
            <span class="stat-lbl">Savings</span>
          </div>
        </div>

        <div class="demo-actions">
          <button
            class="btn btn-primary"
            (click)="loadDemo()"
            [disabled]="loading()"
          >
            {{ loading() ? '⏳ Loading…' : '🎲 Load 100+ Demo Items' }}
          </button>
          <button class="btn btn-danger" (click)="showClearModal.set(true)">
            🗑️ Clear My Data
          </button>
        </div>

        <p class="hint">
          💡 Tip: Load demo data to see charts, reports and transactions in
          action. Your data is private to your account — other users can't see
          it.
        </p>
      </div>
    </div>

    <!-- ==================== CLEAR DATA MODAL ==================== -->
    <app-modal
      *ngIf="showClearModal()"
      title="Clear My Data"
      confirmText="Delete All My Data"
      (close)="showClearModal.set(false)"
      (confirm)="clearAll()"
    >
      <p style="margin: 0; color: var(--text);">
        ⚠️ This will <strong>delete all your</strong> expenses, incomes, budgets,
        and savings goals.
      </p>
      <p style="margin: 12px 0 0; color: var(--text-muted); font-size: 0.88rem;">
        Categories will remain. This action cannot be undone. Your user account
        stays active.
      </p>
    </app-modal>
  `,
  styles: [
    `
      /* ============================================================
         PAGE — Full width
         ============================================================ */
      .page {
        display: flex;
        flex-direction: column;
        gap: 16px;
        width: 100%;
        max-width: 100%;
      }
      .page-head h1 {
        margin: 0;
        font-size: 1.4rem;
        color: var(--text);
      }
      .muted {
        color: var(--text-muted);
        margin: 4px 0 0;
        font-size: 0.88rem;
      }

      .card {
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: 16px;
        padding: 20px;
        width: 100%;
      }
      .card h3 {
        margin: 0 0 16px;
        font-size: 1rem;
        color: var(--text);
        display: flex;
        align-items: center;
        gap: 8px;
      }

      /* ============================================================
         ROW
         ============================================================ */
      .row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px 0;
        border-bottom: 1px solid var(--border);
      }
      .row:last-child {
        border-bottom: none;
      }
      .row label {
        color: var(--text);
        font-size: 0.9rem;
      }

      /* ============================================================
         SEGMENTED
         ============================================================ */
      .segmented {
        display: flex;
        gap: 4px;
        background: var(--bg);
        border-radius: 10px;
        padding: 4px;
      }
      .segmented button {
        padding: 8px 16px;
        border: none;
        background: transparent;
        border-radius: 8px;
        cursor: pointer;
        color: var(--text-muted);
        font-size: 0.85rem;
        font-family: inherit;
        transition: all 0.15s;
      }
      .segmented button.active {
        background: var(--surface);
        color: var(--text);
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
      }

      select {
        padding: 9px 12px;
        border: 1px solid var(--border);
        border-radius: 10px;
        background: var(--surface);
        color: var(--text);
        font-family: inherit;
        cursor: pointer;
        outline: none;
      }

      input[type='checkbox'] {
        width: 18px;
        height: 18px;
        accent-color: var(--primary);
        cursor: pointer;
      }

      /* ============================================================
         DEMO CARD
         ============================================================ */
      .demo-card {
        border: 2px dashed var(--border);
        background: linear-gradient(135deg, var(--surface), var(--primary-soft));
        text-align: center;
      }
      .demo-card h3 {
        margin-bottom: 6px;
        justify-content: center;
      }
      .demo-card > p {
        margin: 0 0 20px;
        font-size: 0.88rem;
      }

      /* Stats row */
      .stats-row {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 10px;
        margin-bottom: 24px;
        max-width: 800px;
        margin-left: auto;
        margin-right: auto;
      }
      .stat-box {
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: 12px;
        padding: 14px 8px;
        text-align: center;
      }
      .stat-num {
        display: block;
        font-size: 1.6rem;
        font-weight: 700;
        color: var(--primary);
      }
      .stat-lbl {
        display: block;
        font-size: 0.72rem;
        color: var(--text-muted);
        text-transform: uppercase;
        letter-spacing: 0.05em;
        margin-top: 4px;
      }

      /* ============================================================
         DEMO ACTIONS — CENTERED
         ============================================================ */
      .demo-actions {
        display: flex;
        gap: 12px;
        justify-content: center;
        flex-wrap: wrap;
        margin-bottom: 20px;
      }
      .demo-actions .btn {
        min-width: 220px;
        padding: 12px 24px;
        font-size: 0.92rem;
      }

      .hint {
        margin: 0;
        font-size: 0.82rem;
        color: var(--text-muted);
        padding: 12px 16px;
        background: var(--primary-soft);
        border-radius: 10px;
        max-width: 800px;
        margin-left: auto;
        margin-right: auto;
        text-align: left;
      }

      /* ============================================================
         MOBILE
         ============================================================ */
      @media (max-width: 600px) {
        .card {
          padding: 16px;
        }
        .stats-row {
          grid-template-columns: repeat(2, 1fr);
        }
        .demo-actions {
          flex-direction: column;
          align-items: stretch;
        }
        .demo-actions .btn {
          width: 100%;
          min-width: auto;
        }
      }
    `,
  ],
})
export class SettingsComponent {
  settings = inject(SettingsService);
  private toast = inject(ToastService);
  private demoService = inject(DemoDataService);

  private expenseService = inject(ExpenseService);
  private incomeService = inject(IncomeService);
  private budgetService = inject(BudgetService);
  private savingsService = inject(SavingsService);
  private categoryService = inject(CategoryService);

  showClearModal = signal(false);
  loading = signal(false);

  // ============================================================
  // Live counts — automatically per user
  // ============================================================
  expenseCount = computed(() => this.expenseService.expenses().length);
  incomeCount = computed(() => this.incomeService.incomes().length);
  budgetCount = computed(() => this.budgetService.budgets().length);
  savingsCount = computed(() => this.savingsService.goals().length);

  // ============================================================
  // THEME
  // ============================================================
  setTheme(t: Theme): void {
    this.settings.update({ theme: t });
    this.toast.success(`Theme set to ${t}.`);
  }

  // ============================================================
  // CURRENCY
  // ============================================================
  setCurrency(c: Currency): void {
    this.settings.update({ currency: c });
    this.toast.success('Currency updated.');
  }

  // ============================================================
  // NOTIFICATIONS
  // ============================================================
  setNotif(
    key: keyof ReturnType<typeof this.settings.settings>['notifications'],
    val: boolean
  ): void {
    const current = this.settings.settings();
    this.settings.update({
      notifications: { ...current.notifications, [key]: val },
    });
  }

  // ============================================================
  // LOAD DEMO — adds to CURRENT USER's data only
  // ============================================================
  loadDemo(): void {
    this.loading.set(true);
    setTimeout(() => {
      const result = this.demoService.loadDemoData();
      this.loading.set(false);
      this.toast.success(
        `✅ Added ${result.expenses} expenses, ${result.incomes} incomes, ${result.budgets} budgets, ${result.savings} savings!`
      );
    }, 400);
  }

  // ============================================================
  // CLEAR — removes CURRENT USER's data only
  // ============================================================
  clearAll(): void {
    this.demoService.clearAllData();
    this.showClearModal.set(false);
    this.toast.success('All your data has been cleared.');
  }
}