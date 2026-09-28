import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TransactionService } from '../../core/services/transaction.service';
import { SettingsService } from '../../core/services/settings.service';
import { ExpenseService } from '../../core/services/expense.service';
import { IncomeService } from '../../core/services/income.service';
import { ToastService } from '../../core/services/toast.service';
import { Transaction } from '../../core/models/transaction.model';
import { ModalComponent } from '../../shared/components/modal/modal.component';

const PAGE_SIZE = 8;

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent],
  template: `
    <div class="page">
      <div class="page-head">
        <div>
          <h1>Transactions</h1>
          <p class="muted">
            {{ filtered().length }} of {{ all().length }} records
          </p>
        </div>
        <button class="btn btn-primary" (click)="goToAdd()">
          + Add Transaction
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

        <select [ngModel]="typeFilter()" (ngModelChange)="onTypeChange($event)">
          <option value="all">All Types</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>

        <select
          [ngModel]="categoryFilter()"
          (ngModelChange)="onCategoryChange($event)"
        >
          <option value="">All Categories</option>
          <option *ngFor="let c of categories()" [value]="c">{{ c }}</option>
        </select>

        <input
          type="date"
          [ngModel]="dateFilter()"
          (ngModelChange)="onDateChange($event)"
        />

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
        <span class="chip" *ngIf="typeFilter() !== 'all'">
          Type: {{ typeFilter() }}
          <button type="button" (click)="onTypeChange('all')">✕</button>
        </span>
        <span class="chip" *ngIf="categoryFilter()">
          Category: {{ categoryFilter() }}
          <button type="button" (click)="onCategoryChange('')">✕</button>
        </span>
        <span class="chip" *ngIf="dateFilter()">
          Date: {{ dateFilter() }}
          <button type="button" (click)="onDateChange('')">✕</button>
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
                <th>Type</th>
                <th>Payment</th>
                <th class="right">Amount</th>
                <th class="right">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let t of paged()">
                <td>{{ t.date | date: 'mediumDate' }}</td>
                <td>{{ t.title }}</td>
                <td>{{ t.category }}</td>
                <td>
                  <span class="pill" [ngClass]="t.type">{{ t.type }}</span>
                </td>
                <td>{{ t.paymentMethod }}</td>
                <td
                  class="right"
                  [ngClass]="t.type === 'income' ? 'income-text' : 'expense-text'"
                >
                  {{ t.type === 'income' ? '+' : '-' }}{{ settings.formatAmount(t.amount) }}
                </td>
                <td class="right">
                  <button class="icon-btn" (click)="view(t)" title="View">👁️</button>
                  <button class="icon-btn" (click)="edit(t)" title="Edit">✏️</button>
                  <button
                    class="icon-btn"
                    (click)="confirmDelete(t)"
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

      <!-- ==================== EMPTY STATE (same as Expenses) ==================== -->
      <ng-template #empty>
        <div class="card">
          <div class="empty-content">
            <div class="empty-icon">{{ hasActiveFilters() ? '🔍' : '🔁' }}</div>
            <h3>
              {{
                hasActiveFilters()
                  ? 'No matching transactions'
                  : 'No transactions found'
              }}
            </h3>
            <p>
              {{
                hasActiveFilters()
                  ? 'Try adjusting or clearing your filters.'
                  : 'Track your money flow by adding a transaction.'
              }}
            </p>
            <button
              class="btn btn-primary"
              (click)="hasActiveFilters() ? clearFilters() : goToAdd()"
            >
              {{ hasActiveFilters() ? 'Clear Filters' : 'Add Transaction' }}
            </button>
          </div>
        </div>
      </ng-template>
    </div>

    <!-- DELETE MODAL -->
    <app-modal
      *ngIf="deleteTarget()"
      title="Delete Transaction"
      confirmText="Delete"
      (close)="deleteTarget.set(null)"
      (confirm)="doDelete()"
    >
      Are you sure you want to delete this transaction?
    </app-modal>

    <!-- VIEW MODAL -->
    <app-modal
      *ngIf="viewTarget()"
      title="Transaction Details"
      [showFooter]="false"
      (close)="viewTarget.set(null)"
    >
      <div class="details">
        <p><strong>Title:</strong> {{ viewTarget()!.title }}</p>
        <p><strong>Type:</strong> {{ viewTarget()!.type }}</p>
        <p><strong>Category:</strong> {{ viewTarget()!.category }}</p>
        <p>
          <strong>Amount:</strong>
          {{ settings.formatAmount(viewTarget()!.amount) }}
        </p>
        <p><strong>Date:</strong> {{ viewTarget()!.date | date: 'medium' }}</p>
        <p><strong>Payment:</strong> {{ viewTarget()!.paymentMethod }}</p>
        <p *ngIf="viewTarget()!.description">
          <strong>Notes:</strong> {{ viewTarget()!.description }}
        </p>
      </div>
    </app-modal>
  `,
  styles: [
    `
      .page {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }
      .page-head {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 12px;
        flex-wrap: wrap;
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
        padding: 16px;
      }

      /* ==================== FILTERS ==================== */
      .filters {
        display: grid;
        grid-template-columns: 2fr 1fr 1fr 1fr 1fr auto;
        gap: 10px;
        align-items: center;
      }
      @media (max-width: 1000px) {
        .filters {
          grid-template-columns: 1fr 1fr;
        }
      }
      @media (max-width: 600px) {
        .filters {
          grid-template-columns: 1fr;
        }
      }
      .search-wrap {
        position: relative;
        display: flex;
        align-items: center;
      }
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
      .search:focus {
        border-color: var(--primary);
      }
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
      .filters input[type='date'],
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
      .filters select:focus,
      .filters input:focus {
        border-color: var(--primary);
      }
      .filters .btn:disabled {
        opacity: 0.4;
        cursor: not-allowed;
      }

      /* ==================== CHIPS ==================== */
      .chips {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 8px;
        padding: 0 4px;
      }
      .chips-label {
        font-size: 0.8rem;
        color: var(--text-muted);
      }
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

      /* ==================== TABLE ==================== */
      .table-wrap {
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        font-size: 0.9rem;
      }
      th,
      td {
        padding: 10px 8px;
        text-align: left;
        border-bottom: 1px solid var(--border);
        color: var(--text);
        white-space: nowrap;
      }
      th {
        color: var(--text-muted);
        font-weight: 500;
        font-size: 0.82rem;
      }
      .right {
        text-align: right;
      }
      .pill {
        padding: 3px 10px;
        border-radius: 999px;
        font-size: 0.75rem;
        text-transform: capitalize;
        font-weight: 500;
      }
      .pill.income {
        background: #dcfce7;
        color: #166534;
      }
      .pill.expense {
        background: #fee2e2;
        color: #991b1b;
      }
      .income-text {
        color: #16a34a;
        font-weight: 600;
      }
      .expense-text {
        color: #dc2626;
        font-weight: 600;
      }

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

      /* ============================================================
         EMPTY STATE — EXACT SAME AS EXPENSES PAGE
         ============================================================ */
      .empty-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        padding: 60px 20px;
      }
      .empty-icon {
        font-size: 3rem;
        margin-bottom: 12px;
      }
      .empty-content h3 {
        margin: 0 0 6px;
        color: var(--text);
        font-size: 1rem;
        font-weight: 600;
      }
      .empty-content p {
        margin: 0 0 20px;
        color: var(--text-muted);
        font-size: 0.88rem;
        max-width: 360px;
      }

      /* ==================== MODAL DETAILS ==================== */
      .details p {
        margin: 6px 0;
        color: var(--text);
      }

      /* ==================== MOBILE ==================== */
      @media (max-width: 600px) {
        .empty-content {
          padding: 40px 16px;
        }
      }
    `,
  ],
})
export class TransactionsComponent {
  private txService = inject(TransactionService);
  private expenseService = inject(ExpenseService);
  private incomeService = inject(IncomeService);
  private toast = inject(ToastService);
  private router = inject(Router);
  settings = inject(SettingsService);

  all = this.txService.transactions;

  // Filter state
  search = signal('');
  typeFilter = signal<'all' | 'income' | 'expense'>('all');
  categoryFilter = signal('');
  dateFilter = signal('');
  sort = signal<'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc'>(
    'date-desc'
  );

  // Pagination
  page = signal(1);
  pageSize = PAGE_SIZE;

  categories = computed(() => {
    const set = new Set<string>();
    this.all().forEach((t) => set.add(t.category));
    return Array.from(set).sort();
  });

  filtered = computed<Transaction[]>(() => {
    const q = this.search().trim().toLowerCase();
    const typeF = this.typeFilter();
    const catF = this.categoryFilter();
    const dateF = this.dateFilter();
    const sortBy = this.sort();

    const list = this.all().filter((t) => {
      if (typeF !== 'all' && t.type !== typeF) return false;
      if (catF && t.category !== catF) return false;
      if (dateF && !t.date.startsWith(dateF)) return false;
      if (q) {
        const hay =
          `${t.title} ${t.category} ${t.amount} ${t.paymentMethod}`.toLowerCase();
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

  totalPages = computed(() =>
    Math.max(1, Math.ceil(this.filtered().length / this.pageSize))
  );

  paged = computed(() => {
    const p = Math.min(this.page(), this.totalPages());
    const start = (p - 1) * this.pageSize;
    return this.filtered().slice(start, start + this.pageSize);
  });

  deleteTarget = signal<Transaction | null>(null);
  viewTarget = signal<Transaction | null>(null);

  hasActiveFilters(): boolean {
    return (
      !!this.search().trim() ||
      this.typeFilter() !== 'all' ||
      !!this.categoryFilter() ||
      !!this.dateFilter()
    );
  }

  onSearchChange(v: string): void {
    this.search.set(v ?? '');
    this.page.set(1);
  }
  onTypeChange(v: string): void {
    this.typeFilter.set((v ?? 'all') as any);
    this.page.set(1);
  }
  onCategoryChange(v: string): void {
    this.categoryFilter.set(v ?? '');
    this.page.set(1);
  }
  onDateChange(v: string): void {
    this.dateFilter.set(v ?? '');
    this.page.set(1);
  }
  onSortChange(v: string): void {
    this.sort.set((v ?? 'date-desc') as any);
    this.page.set(1);
  }

  clearFilters(): void {
    this.search.set('');
    this.typeFilter.set('all');
    this.categoryFilter.set('');
    this.dateFilter.set('');
    this.sort.set('date-desc');
    this.page.set(1);
  }

  prevPage(): void {
    this.page.set(Math.max(1, this.page() - 1));
  }
  nextPage(): void {
    this.page.set(Math.min(this.totalPages(), this.page() + 1));
  }

  view(t: Transaction): void {
    this.viewTarget.set(t);
  }

  edit(t: Transaction): void {
    if (t.type === 'expense')
      this.router.navigate(['/expenses'], { queryParams: { edit: t.id } });
    else this.router.navigate(['/income'], { queryParams: { edit: t.id } });
  }

  confirmDelete(t: Transaction): void {
    this.deleteTarget.set(t);
  }

  doDelete(): void {
    const t = this.deleteTarget();
    if (!t) return;
    if (t.type === 'expense') this.expenseService.delete(t.id);
    else this.incomeService.delete(t.id);
    this.toast.success('Transaction deleted.');
    this.deleteTarget.set(null);
  }

  goToAdd(): void {
    this.router.navigate(['/expenses']);
  }
}