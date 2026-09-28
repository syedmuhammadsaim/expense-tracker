import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, Validators } from '@angular/forms';
import { BudgetService } from '../../core/services/budget.service';
import { SettingsService } from '../../core/services/settings.service';
import { ToastService } from '../../core/services/toast.service';
import { NotificationService } from '../../core/services/notification.service';
import { EXPENSE_CATEGORIES } from '../../core/models/expense.model';
import { Budget } from '../../core/models/budget.model';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';

@Component({
  selector: 'app-budgets',
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
          <h1>Budgets</h1>
          <p class="muted">
            {{ filtered().length }} of {{ budgets().length }} budgets
          </p>
        </div>
        <button class="btn btn-primary" (click)="openForm()">+ New Budget</button>
      </div>

      <!-- FILTER BAR -->
      <div class="card filters">
        <div class="search-wrap">
          <span class="search-icon">🔍</span>
          <input
            class="search"
            type="text"
            placeholder="Search by name or category…"
            [ngModel]="search()"
            (ngModelChange)="onSearchChange($event)"
          />
          <button *ngIf="search()" class="clear-x" type="button" (click)="onSearchChange('')">✕</button>
        </div>

        <select [ngModel]="categoryFilter()" (ngModelChange)="onCategoryChange($event)">
          <option value="">All Categories</option>
          <option *ngFor="let c of categories" [value]="c">{{ c }}</option>
        </select>

        <select [ngModel]="statusFilter()" (ngModelChange)="onStatusChange($event)">
          <option value="">All Status</option>
          <option value="safe">On Track (&lt; 75%)</option>
          <option value="warn">Warning (75-99%)</option>
          <option value="over">Over Budget (100%+)</option>
        </select>

        <select [ngModel]="sort()" (ngModelChange)="onSortChange($event)">
          <option value="date-desc">Newest First</option>
          <option value="date-asc">Oldest First</option>
          <option value="amount-desc">Budget High → Low</option>
          <option value="amount-asc">Budget Low → High</option>
          <option value="progress-desc">Progress High → Low</option>
          <option value="progress-asc">Progress Low → High</option>
        </select>

        <button class="btn btn-ghost" (click)="clearFilters()" [disabled]="!hasActiveFilters()">
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
        <span class="chip" *ngIf="statusFilter()">
          Status: {{ statusLabel(statusFilter()) }}
          <button type="button" (click)="onStatusChange('')">✕</button>
        </span>
      </div>

      <!-- LIST -->
      <div *ngIf="filtered().length; else empty" class="grid">
        <div class="budget-card" *ngFor="let b of filtered()" [class.warn]="b.progress >= 75 && b.progress < 100" [class.over]="b.progress >= 100">
          <header>
            <h3>{{ b.name }}</h3>
            <span class="cat">{{ b.category }}</span>
          </header>
          <div class="amounts">
            <div><small>Budget</small><strong>{{ settings.formatAmount(b.amount) }}</strong></div>
            <div><small>Spent</small><strong class="expense">{{ settings.formatAmount(b.spent) }}</strong></div>
            <div><small>Remaining</small><strong class="income">{{ settings.formatAmount(b.remaining) }}</strong></div>
          </div>
          <div class="progress">
            <div class="bar" [style.width.%]="Math.min(b.progress, 100)"></div>
          </div>
          <p class="progress-text">{{ b.progress.toFixed(1) }}% used</p>
          <p class="dates">{{ b.startDate | date: 'mediumDate' }} → {{ b.endDate | date: 'mediumDate' }}</p>
          <div class="actions">
            <button class="btn btn-ghost" (click)="edit(b)">Edit</button>
            <button class="btn btn-danger" (click)="confirmDelete(b)">Delete</button>
          </div>
        </div>
      </div>

      <ng-template #empty>
        <div class="card">
          <app-empty-state
            [icon]="hasActiveFilters() ? '🔍' : '🎯'"
            [title]="hasActiveFilters() ? 'No matching budgets' : 'No budgets created'"
            [description]="hasActiveFilters()
              ? 'Try adjusting or clearing your filters.'
              : 'Set a budget to keep your spending on track.'"
            [actionLabel]="hasActiveFilters() ? 'Clear Filters' : 'Create Budget'"
            (action)="hasActiveFilters() ? clearFilters() : openForm()"
          ></app-empty-state>
        </div>
      </ng-template>
    </div>

    <app-modal
      *ngIf="showForm()"
      [title]="editingId() ? 'Edit Budget' : 'New Budget'"
      [showFooter]="false"
      (close)="closeForm()"
    >
      <form [formGroup]="form" (ngSubmit)="save()" class="form-grid">
        <div class="field">
          <label>Budget Name *</label>
          <input formControlName="name" placeholder="e.g., Monthly Food" />
          <small class="error" *ngIf="showError('name')">Name is required.</small>
        </div>
        <div class="field">
          <label>Category *</label>
          <select formControlName="category">
            <option *ngFor="let c of categories" [value]="c">{{ c }}</option>
          </select>
        </div>
        <div class="field">
          <label>Amount *</label>
          <input type="number" formControlName="amount" min="1" step="0.01" />
          <small class="error" *ngIf="showError('amount')">Amount must be > 0.</small>
        </div>
        <div class="field">
          <label>Start Date *</label>
          <input type="date" formControlName="startDate" />
        </div>
        <div class="field">
          <label>End Date *</label>
          <input type="date" formControlName="endDate" />
        </div>
        <div class="field full actions">
          <button type="button" class="btn btn-ghost" (click)="closeForm()">Cancel</button>
          <button type="submit" class="btn btn-primary">{{ editingId() ? 'Update' : 'Save' }}</button>
        </div>
      </form>
    </app-modal>

    <app-modal
      *ngIf="deleteTarget()"
      title="Delete Budget"
      (close)="deleteTarget.set(null)"
      (confirm)="doDelete()"
    >
      Are you sure you want to delete "{{ deleteTarget()?.name }}"?
    </app-modal>
  `,
  styles: [
    `
      .page { display: flex; flex-direction: column; gap: 16px; }
      .page-head { display: flex; justify-content: space-between; align-items: center; }
      .page-head h1 { margin: 0; font-size: 1.4rem; color: var(--text); }
      .muted { color: var(--text-muted); margin: 4px 0 0; font-size: 0.88rem; }
      .card { background: var(--surface); border: 1px solid var(--border); border-radius: 16px; padding: 16px; }
      .filters {
        display: grid;
        grid-template-columns: 2fr 1fr 1fr 1fr auto;
        gap: 10px;
        align-items: center;
      }
      @media (max-width: 900px) { .filters { grid-template-columns: 1fr; } }
      .search-wrap { position: relative; display: flex; align-items: center; }
      .search-icon { position: absolute; left: 12px; font-size: 0.9rem; opacity: 0.6; pointer-events: none; }
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
      .chip button { background: transparent; border: none; color: inherit; cursor: pointer; font-size: 0.75rem; padding: 0; }
      .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 14px; }
      .budget-card {
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: 16px;
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 12px;
        transition: transform 0.15s, box-shadow 0.15s;
      }
      .budget-card:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(0, 0, 0, 0.06); }
      .budget-card.warn { border-color: #f59e0b; }
      .budget-card.over { border-color: #dc2626; background: rgba(220, 38, 38, 0.04); }
      header { display: flex; justify-content: space-between; align-items: baseline; }
      header h3 { margin: 0; font-size: 1rem; color: var(--text); }
      .cat { font-size: 0.78rem; color: var(--text-muted); }
      .amounts { display: flex; justify-content: space-between; gap: 8px; }
      .amounts small { display: block; font-size: 0.72rem; color: var(--text-muted); }
      .amounts strong { font-size: 0.9rem; color: var(--text); }
      .amounts .expense { color: #dc2626; }
      .amounts .income { color: #16a34a; }
      .progress { height: 8px; background: var(--border); border-radius: 999px; overflow: hidden; }
      .bar { height: 100%; background: var(--primary); border-radius: 999px; transition: width 0.3s; }
      .budget-card.warn .bar { background: #f59e0b; }
      .budget-card.over .bar { background: #dc2626; }
      .progress-text { font-size: 0.78rem; color: var(--text-muted); margin: 0; }
      .dates { font-size: 0.78rem; color: var(--text-muted); margin: 0; }
      .actions { display: flex; gap: 8px; justify-content: flex-end; }
      .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
      .field { display: flex; flex-direction: column; gap: 6px; }
      .field.full { grid-column: 1 / -1; }
      .field label { font-size: 0.85rem; color: var(--text); }
      .field input, .field select {
        padding: 9px 12px;
        border: 1px solid var(--border);
        border-radius: 10px;
        background: var(--surface);
        color: var(--text);
        font-family: inherit;
      }
      .error { color: #dc2626; font-size: 0.78rem; }
      .form-grid .actions { grid-column: 1 / -1; flex-direction: row; justify-content: flex-end; }
    `,
  ],
})
export class BudgetsComponent {
  private budgetService = inject(BudgetService);
  private fb = inject(FormBuilder);
  private toast = inject(ToastService);
  private notif = inject(NotificationService);
  settings = inject(SettingsService);
  Math = Math;

  categories = EXPENSE_CATEGORIES;
  budgets = this.budgetService.view;

  search = signal('');
  categoryFilter = signal('');
  statusFilter = signal<'' | 'safe' | 'warn' | 'over'>('');
  sort = signal<
    'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc' | 'progress-desc' | 'progress-asc'
  >('date-desc');

  showForm = signal(false);
  editingId = signal<string | null>(null);
  deleteTarget = signal<Budget | null>(null);

  form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    category: ['Food', Validators.required],
    amount: [0, [Validators.required, Validators.min(1)]],
    startDate: [this.firstOfMonth(), Validators.required],
    endDate: [this.lastOfMonth(), Validators.required],
  });

  filtered = computed(() => {
    const q = this.search().trim().toLowerCase();
    const catF = this.categoryFilter();
    const statF = this.statusFilter();
    const sortBy = this.sort();

    let list = this.budgets().filter((b) => {
      if (catF && b.category !== catF) return false;
      if (statF) {
        if (statF === 'safe' && !(b.progress < 75)) return false;
        if (statF === 'warn' && !(b.progress >= 75 && b.progress < 100)) return false;
        if (statF === 'over' && !(b.progress >= 100)) return false;
      }
      if (q) {
        const hay = `${b.name} ${b.category}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    const sorted = [...list];
    switch (sortBy) {
      case 'date-asc':
        sorted.sort((a, b) => +new Date(a.startDate) - +new Date(b.startDate));
        break;
      case 'amount-desc':
        sorted.sort((a, b) => b.amount - a.amount);
        break;
      case 'amount-asc':
        sorted.sort((a, b) => a.amount - b.amount);
        break;
      case 'progress-desc':
        sorted.sort((a, b) => b.progress - a.progress);
        break;
      case 'progress-asc':
        sorted.sort((a, b) => a.progress - b.progress);
        break;
      default:
        sorted.sort((a, b) => +new Date(b.startDate) - +new Date(a.startDate));
    }
    return sorted;
  });

  hasActiveFilters(): boolean {
    return !!this.search().trim() || !!this.categoryFilter() || !!this.statusFilter();
  }

  statusLabel(s: string): string {
    if (s === 'safe') return 'On Track';
    if (s === 'warn') return 'Warning';
    if (s === 'over') return 'Over Budget';
    return s;
  }

  onSearchChange(v: string): void { this.search.set(v ?? ''); }
  onCategoryChange(v: string): void { this.categoryFilter.set(v ?? ''); }
  onStatusChange(v: string): void { this.statusFilter.set((v ?? '') as any); }
  onSortChange(v: string): void { this.sort.set((v ?? 'date-desc') as any); }

  clearFilters(): void {
    this.search.set('');
    this.categoryFilter.set('');
    this.statusFilter.set('');
    this.sort.set('date-desc');
  }

  private firstOfMonth(): string {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10);
  }
  private lastOfMonth(): string {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().slice(0, 10);
  }

  openForm(): void {
    this.editingId.set(null);
    this.form.reset({
      name: '',
      category: 'Food',
      amount: 0,
      startDate: this.firstOfMonth(),
      endDate: this.lastOfMonth(),
    });
    this.showForm.set(true);
  }

  edit(b: Budget): void {
    this.editingId.set(b.id);
    this.form.reset({
      name: b.name,
      category: b.category,
      amount: b.amount,
      startDate: b.startDate.slice(0, 10),
      endDate: b.endDate.slice(0, 10),
    });
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
    if (new Date(raw.endDate) < new Date(raw.startDate)) {
      this.toast.error('End date must be after start date.');
      return;
    }
    const id = this.editingId();
    if (id) {
      this.budgetService.update(id, raw);
      this.toast.success('Budget updated.');
    } else {
      this.budgetService.add(raw);
      this.toast.success('Budget created.');
      this.notif.push('Budget created', `${raw.name} (${raw.category})`, 'info');
    }
    this.closeForm();
  }

  confirmDelete(b: Budget): void {
    this.deleteTarget.set(b);
  }

  doDelete(): void {
    const b = this.deleteTarget();
    if (!b) return;
    this.budgetService.delete(b.id);
    this.toast.success('Budget deleted.');
    this.deleteTarget.set(null);
  }
}