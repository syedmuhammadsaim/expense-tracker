import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormsModule,
  FormBuilder,
  Validators,
} from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ExpenseService } from '../../core/services/expense.service';
import { SettingsService } from '../../core/services/settings.service';
import { ToastService } from '../../core/services/toast.service';
import { NotificationService } from '../../core/services/notification.service';
import { EXPENSE_CATEGORIES } from '../../core/models/expense.model';
import { PaymentMethod } from '../../core/models/transaction.model';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';

const PAYMENT_METHODS: PaymentMethod[] = [
  'Cash',
  'Debit Card',
  'Credit Card',
  'Bank Transfer',
  'Online Payment',
  'Other',
];

const PAGE_SIZE = 8;

@Component({
  selector: 'app-expenses',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    EmptyStateComponent,
    ModalComponent,
  ],
  template: `
    <div class="page">
      <div class="page-head">
        <div>
          <h1>Expenses</h1>
          <p class="muted">
            {{ filtered().length }} of {{ expenses().length }} records
          </p>
        </div>
        <button class="btn btn-primary" (click)="openForm()">
          + Add Expense
        </button>
      </div>

      <!-- FILTER BAR -->
      <div class="card filters">
        <div class="search-wrap">
          <span class="search-icon">🔍</span>
          <input
            class="search"
            type="text"
            placeholder="Search title, category, amount…"
            [ngModel]="search()"
            (ngModelChange)="onSearchChange($event)"
          />
          <button
            *ngIf="search()"
            class="clear-x"
            type="button"
            (click)="onSearchChange('')"
          >
            ✕
          </button>
        </div>

        <select
          [ngModel]="categoryFilter()"
          (ngModelChange)="onCategoryChange($event)"
        >
          <option value="">All Categories</option>
          <option *ngFor="let c of expenseCategories" [value]="c">{{ c }}</option>
        </select>

        <select
          [ngModel]="paymentFilter()"
          (ngModelChange)="onPaymentChange($event)"
        >
          <option value="">All Payments</option>
          <option *ngFor="let p of paymentMethods" [value]="p">{{ p }}</option>
        </select>

        <select [ngModel]="sort()" (ngModelChange)="onSortChange($event)">
          <option value="date-desc">Newest First</option>
          <option value="date-asc">Oldest First</option>
          <option value="amount-desc">Amount High → Low</option>
          <option value="amount-asc">Amount Low → High</option>
        </select>

        <button
          class="btn btn-ghost"
          (click)="clearFilters()"
          [disabled]="!hasActiveFilters()"
        >
          Clear
        </button>
      </div>

      <!-- CHIPS -->
      <div class="chips" *ngIf="hasActiveFilters()">
        <span class="chips-label">Active filters:</span>
        <span class="chip" *ngIf="search()">
          Search: "{{ search() }}"
          <button type="button" (click)="onSearchChange('')">✕</button>
        </span>
        <span class="chip" *ngIf="categoryFilter()">
          Category: {{ categoryFilter() }}
          <button type="button" (click)="onCategoryChange('')">✕</button>
        </span>
        <span class="chip" *ngIf="paymentFilter()">
          Payment: {{ paymentFilter() }}
          <button type="button" (click)="onPaymentChange('')">✕</button>
        </span>
      </div>

      <!-- LIST -->
      <div class="card" *ngIf="paged().length; else empty">
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Title</th>
                <th>Category</th>
                <th>Payment</th>
                <th class="right">Amount</th>
                <th class="right">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let e of paged()">
                <td>{{ e.date | date: 'mediumDate' }}</td>
                <td>{{ e.title }}</td>
                <td>{{ e.category }}</td>
                <td>{{ e.paymentMethod }}</td>
                <td class="right expense-text">
                  -{{ settings.formatAmount(e.amount) }}
                </td>
                <td class="right">
                  <button class="icon-btn" (click)="edit(e)" title="Edit">✏️</button>
                  <button
                    class="icon-btn"
                    (click)="confirmDelete(e)"
                    title="Delete"
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- PAGINATION -->
        <div class="pager" *ngIf="totalPages() > 1">
          <button
            class="btn btn-ghost"
            [disabled]="page() === 1"
            (click)="prevPage()"
          >
            ← Prev
          </button>
          <span class="pager-info">
            Page {{ page() }} of {{ totalPages() }}
          </span>
          <button
            class="btn btn-ghost"
            [disabled]="page() === totalPages()"
            (click)="nextPage()"
          >
            Next →
          </button>
        </div>
      </div>

      <ng-template #empty>
        <div class="card">
          <app-empty-state
            [icon]="hasActiveFilters() ? '🔍' : '💳'"
            [title]="
              hasActiveFilters() ? 'No matching expenses' : 'No expenses found'
            "
            [description]="
              hasActiveFilters()
                ? 'Try adjusting or clearing your filters.'
                : 'Track your spending by adding an expense.'
            "
            [actionLabel]="hasActiveFilters() ? 'Clear Filters' : 'Add Expense'"
            (action)="hasActiveFilters() ? clearFilters() : openForm()"
          ></app-empty-state>
        </div>
      </ng-template>
    </div>

    <!-- FORM MODAL -->
    <app-modal
      *ngIf="showForm()"
      [title]="editingId() ? 'Edit Expense' : 'Add Expense'"
      [showFooter]="false"
      (close)="closeForm()"
    >
      <form [formGroup]="form" (ngSubmit)="save()" class="form-grid">
        <div class="field">
          <label>Title *</label>
          <input formControlName="title" placeholder="e.g., Groceries" />
          <small class="error" *ngIf="showError('title')">
            Title must be at least 2 chars.
          </small>
        </div>
        <div class="field">
          <label>Amount *</label>
          <input type="number" formControlName="amount" min="0.01" step="0.01" />
          <small class="error" *ngIf="showError('amount')">
            Amount must be greater than 0.
          </small>
        </div>
        <div class="field">
          <label>Category *</label>
          <select formControlName="category">
            <option *ngFor="let c of expenseCategories" [value]="c">
              {{ c }}
            </option>
          </select>
        </div>
        <div class="field">
          <label>Date *</label>
          <input type="date" formControlName="date" />
          <small class="error" *ngIf="showError('date')">Date is required.</small>
        </div>
        <div class="field">
          <label>Payment Method *</label>
          <select formControlName="paymentMethod">
            <option *ngFor="let p of paymentMethods" [value]="p">{{ p }}</option>
          </select>
        </div>
        <div class="field full">
          <label>Description</label>
          <textarea formControlName="description" rows="3"></textarea>
        </div>
        <div class="field full actions">
          <button type="button" class="btn btn-ghost" (click)="closeForm()">
            Cancel
          </button>
          <button type="submit" class="btn btn-primary">
            {{ editingId() ? 'Update' : 'Save' }}
          </button>
        </div>
      </form>
    </app-modal>

    <app-modal
      *ngIf="deleteTarget()"
      title="Delete Expense"
      (close)="deleteTarget.set(null)"
      (confirm)="doDelete()"
    >
      Are you sure you want to delete this expense?
    </app-modal>
  `,
  styles: [
    `
      .page { display: flex; flex-direction: column; gap: 16px; }
      .page-head { display: flex; justify-content: space-between; align-items: center; }
      .page-head h1 { margin: 0; font-size: 1.4rem; color: var(--text); }
      .muted { color: var(--text-muted); margin: 4px 0 0; font-size: 0.88rem; }
      .card {
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: 16px;
        padding: 16px;
      }
      .filters {
        display: grid;
        grid-template-columns: 2fr 1fr 1fr 1fr auto;
        gap: 10px;
        align-items: center;
      }
      @media (max-width: 900px) { .filters { grid-template-columns: 1fr; } }
      .search-wrap { position: relative; display: flex; align-items: center; }
      .search-icon {
        position: absolute;
        left: 12px;
        font-size: 0.9rem;
        opacity: 0.6;
        pointer-events: none;
      }
      .search {
        width: 100%;
        padding: 9px 34px 9px 36px;
        border: 1px solid var(--border);
        border-radius: 10px;
        background: var(--surface);
        color: var(--text);
        font-size: 0.9rem;
        outline: none;
      }
      .search:focus { border-color: var(--primary); }
      .clear-x {
        position: absolute;
        right: 10px;
        background: transparent;
        border: none;
        cursor: pointer;
        color: var(--text-muted);
        font-size: 0.85rem;
        padding: 4px;
      }
      .filters select {
        padding: 9px 12px;
        border: 1px solid var(--border);
        border-radius: 10px;
        background: var(--surface);
        color: var(--text);
        font-size: 0.9rem;
        cursor: pointer;
        outline: none;
      }
      .filters select:focus { border-color: var(--primary); }
      .filters .btn:disabled { opacity: 0.4; cursor: not-allowed; }

      .chips { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; padding: 0 4px; }
      .chips-label { font-size: 0.8rem; color: var(--text-muted); }
      .chip {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 4px 10px;
        background: var(--primary-soft);
        color: var(--primary);
        border-radius: 999px;
        font-size: 0.8rem;
        font-weight: 500;
      }
      .chip button {
        background: transparent;
        border: none;
        color: inherit;
        cursor: pointer;
        font-size: 0.75rem;
        padding: 0;
      }

      .table-wrap { overflow-x: auto; -webkit-overflow-scrolling: touch; }
      table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
      th, td {
        padding: 10px 8px;
        text-align: left;
        border-bottom: 1px solid var(--border);
        color: var(--text);
        white-space: nowrap;
      }
      th { color: var(--text-muted); font-weight: 500; font-size: 0.82rem; }
      .right { text-align: right; }
      .expense-text { color: #dc2626; font-weight: 600; }

      /* ==================== PAGINATION ==================== */
      .pager {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 12px;
        margin-top: 16px;
        padding-top: 16px;
        border-top: 1px solid var(--border);
      }
      .pager-info {
        font-size: 0.85rem;
        color: var(--text-muted);
      }

      /* ==================== FORM ==================== */
      .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
      .field { display: flex; flex-direction: column; gap: 6px; }
      .field.full { grid-column: 1 / -1; }
      .field label { font-size: 0.85rem; color: var(--text); }
      .field input, .field select, .field textarea {
        padding: 9px 12px;
        border: 1px solid var(--border);
        border-radius: 10px;
        background: var(--surface);
        color: var(--text);
        font-family: inherit;
        font-size: 0.9rem;
      }
      .error { color: #dc2626; font-size: 0.78rem; }
      .actions { flex-direction: row; justify-content: flex-end; gap: 8px; }

      @media (max-width: 600px) {
        .form-grid { grid-template-columns: 1fr; }
      }
    `,
  ],
})
export class ExpensesComponent {
  private expenseService = inject(ExpenseService);
  private fb = inject(FormBuilder);
  private toast = inject(ToastService);
  private notif = inject(NotificationService);
  private route = inject(ActivatedRoute);
  settings = inject(SettingsService);

  expenseCategories = EXPENSE_CATEGORIES;
  paymentMethods = PAYMENT_METHODS;
  expenses = this.expenseService.expenses;

  // ============ Filter state ============
  search = signal('');
  categoryFilter = signal('');
  paymentFilter = signal('');
  sort = signal<'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc'>(
    'date-desc'
  );

  // ============ Pagination ============
  page = signal(1);
  pageSize = PAGE_SIZE;

  // ============ Modal state ============
  showForm = signal(false);
  editingId = signal<string | null>(null);
  deleteTarget = signal<string | null>(null);

  form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(2)]],
    amount: [0, [Validators.required, Validators.min(0.01)]],
    category: ['Food', Validators.required],
    date: [this.todayIso(), Validators.required],
    paymentMethod: ['Cash' as PaymentMethod, Validators.required],
    description: [''],
  });

  // ============ Filtered list ============
  filtered = computed(() => {
    const q = this.search().trim().toLowerCase();
    const catF = this.categoryFilter();
    const payF = this.paymentFilter();
    const sortBy = this.sort();

    const list = this.expenses().filter((e) => {
      if (catF && e.category !== catF) return false;
      if (payF && e.paymentMethod !== payF) return false;
      if (q) {
        const hay = `${e.title} ${e.category} ${e.amount} ${e.paymentMethod}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    const sorted = [...list];
    switch (sortBy) {
      case 'date-asc':
        sorted.sort((a, b) => +new Date(a.date) - +new Date(b.date));
        break;
      case 'amount-desc':
        sorted.sort((a, b) => b.amount - a.amount);
        break;
      case 'amount-asc':
        sorted.sort((a, b) => a.amount - b.amount);
        break;
      default:
        sorted.sort((a, b) => +new Date(b.date) - +new Date(a.date));
    }
    return sorted;
  });

  // ============ Pagination computed ============
  totalPages = computed(() =>
    Math.max(1, Math.ceil(this.filtered().length / this.pageSize))
  );

  paged = computed(() => {
    const p = Math.min(this.page(), this.totalPages());
    const start = (p - 1) * this.pageSize;
    return this.filtered().slice(start, start + this.pageSize);
  });

  prevPage(): void {
    this.page.set(Math.max(1, this.page() - 1));
  }

  nextPage(): void {
    this.page.set(Math.min(this.totalPages(), this.page() + 1));
  }

  // ============ Filter state check ============
  hasActiveFilters(): boolean {
    return (
      !!this.search().trim() ||
      !!this.categoryFilter() ||
      !!this.paymentFilter()
    );
  }

  // ============ Filter handlers ============
  onSearchChange(v: string): void {
    this.search.set(v ?? '');
    this.page.set(1);
  }
  onCategoryChange(v: string): void {
    this.categoryFilter.set(v ?? '');
    this.page.set(1);
  }
  onPaymentChange(v: string): void {
    this.paymentFilter.set(v ?? '');
    this.page.set(1);
  }
  onSortChange(v: string): void {
    this.sort.set((v ?? 'date-desc') as any);
    this.page.set(1);
  }

  clearFilters(): void {
    this.search.set('');
    this.categoryFilter.set('');
    this.paymentFilter.set('');
    this.sort.set('date-desc');
    this.page.set(1);
  }

  constructor() {
    const editId = this.route.snapshot.queryParamMap.get('edit');
    if (editId) {
      const exp = this.expenseService.getById(editId);
      if (exp) this.openForm(exp.id);
    }
  }

  private todayIso(): string {
    return new Date().toISOString().slice(0, 10);
  }

  // ============ CRUD ============
  openForm(id?: string): void {
    if (id) {
      const e = this.expenseService.getById(id);
      if (!e) return;
      this.editingId.set(id);
      this.form.reset({
        title: e.title,
        amount: e.amount,
        category: e.category,
        date: e.date.slice(0, 10),
        paymentMethod: e.paymentMethod,
        description: e.description ?? '',
      });
    } else {
      this.editingId.set(null);
      this.form.reset({
        title: '',
        amount: 0,
        category: 'Food',
        date: this.todayIso(),
        paymentMethod: 'Cash',
        description: '',
      });
    }
    this.showForm.set(true);
  }

  closeForm(): void {
    this.showForm.set(false);
    this.editingId.set(null);
  }

  showError(name: string): boolean {
    const c = this.form.get(name);
    return !!c && c.touched && c.invalid;
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const raw = this.form.getRawValue();
    const id = this.editingId();
    if (id) {
      this.expenseService.update(id, raw);
      this.toast.success('Expense updated.');
    } else {
      this.expenseService.add(raw);
      this.toast.success('Expense added.');
      this.notif.push(
        'Expense added',
        `${raw.title} • ${this.settings.formatAmount(raw.amount)}`,
        'info'
      );
    }
    this.closeForm();
  }

  edit(e: { id: string }): void {
    this.openForm(e.id);
  }

  confirmDelete(e: { id: string }): void {
    this.deleteTarget.set(e.id);
  }

  doDelete(): void {
    const id = this.deleteTarget();
    if (!id) return;
    this.expenseService.delete(id);
    this.toast.success('Expense deleted.');
    this.deleteTarget.set(null);
  }
}