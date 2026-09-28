import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IncomeService } from '../../core/services/income.service';
import { ExpenseService } from '../../core/services/expense.service';
import { SettingsService } from '../../core/services/settings.service';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page">
      <div class="page-head">
        <h1>Reports</h1>
        <p class="muted">Overview for {{ currentYear }}</p>
      </div>

      <div class="stats">
        <div class="stat">
          <small>Total Income</small>
          <strong class="income">{{ settings.formatAmount(income()) }}</strong>
        </div>
        <div class="stat">
          <small>Total Expenses</small>
          <strong class="expense">{{ settings.formatAmount(expense()) }}</strong>
        </div>
        <div class="stat">
          <small>Total Savings</small>
          <strong>{{ settings.formatAmount(income() - expense()) }}</strong>
        </div>
        <div class="stat">
          <small>Highest Expense</small>
          <strong>{{ settings.formatAmount(highestExpense().amount) }} ({{ highestExpense().title }})</strong>
        </div>
        <div class="stat">
          <small>Top Category</small>
          <strong>{{ topCategory().category || '-' }}</strong>
        </div>
      </div>

      <div class="card">
        <h3>Category Report</h3>
        <table>
          <thead>
            <tr><th>Category</th><th class="right">Amount</th><th class="right">%</th></tr>
          </thead>
          <tbody>
            <tr *ngFor="let c of categoryReport()">
              <td>{{ c.category }}</td>
              <td class="right">{{ settings.formatAmount(c.amount) }}</td>
              <td class="right">{{ c.pct.toFixed(1) }}%</td>
            </tr>
            <tr *ngIf="!categoryReport().length">
              <td colspan="3" class="muted">No expense data available.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="card">
        <h3>Annual Report</h3>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Month</th>
                <th class="right">Income</th>
                <th class="right">Expenses</th>
                <th class="right">Savings</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let m of annual()">
                <td>{{ m.month }}</td>
                <td class="right income">{{ settings.formatAmount(m.income) }}</td>
                <td class="right expense">{{ settings.formatAmount(m.expense) }}</td>
                <td class="right">{{ settings.formatAmount(m.savings) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .page { display: flex; flex-direction: column; gap: 16px; }
      .page-head h1 { margin: 0; font-size: 1.4rem; color: var(--text); }
      .muted { color: var(--text-muted); margin: 4px 0 0; font-size: 0.88rem; }
      .stats {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 14px;
      }
      .stat {
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: 14px;
        padding: 16px;
      }
      .stat small { display: block; font-size: 0.78rem; color: var(--text-muted); margin-bottom: 6px; }
      .stat strong { font-size: 1.05rem; color: var(--text); }
      .income { color: #16a34a; }
      .expense { color: #dc2626; }
      .card { background: var(--surface); border: 1px solid var(--border); border-radius: 16px; padding: 16px; }
      .card h3 { margin: 0 0 12px; font-size: 1rem; color: var(--text); }
      table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
      th, td { padding: 10px 8px; text-align: left; border-bottom: 1px solid var(--border); color: var(--text); }
      th { color: var(--text-muted); font-weight: 500; font-size: 0.82rem; }
      .right { text-align: right; }
      .table-wrap { overflow-x: auto; }
    `,
  ],
})
export class ReportsComponent {
  private incomeService = inject(IncomeService);
  private expenseService = inject(ExpenseService);
  settings = inject(SettingsService);

  currentYear = new Date().getFullYear();

  income = computed(() => this.incomeService.incomes().reduce((s, i) => s + i.amount, 0));
  expense = computed(() => this.expenseService.expenses().reduce((s, e) => s + e.amount, 0));

  highestExpense = computed(() => {
    const list = this.expenseService.expenses();
    if (!list.length) return { title: '-', amount: 0 };
    return list.reduce((max, e) => (e.amount > max.amount ? e : max), list[0]);
  });

  topCategory = computed(() => {
    const r = this.categoryReport();
    return r.length ? r[0] : { category: '', amount: 0, pct: 0 };
  });

  categoryReport = computed(() => {
    const map = new Map<string, number>();
    this.expenseService.expenses().forEach((e) =>
      map.set(e.category, (map.get(e.category) ?? 0) + e.amount)
    );
    const total = Array.from(map.values()).reduce((s, v) => s + v, 0);
    return Array.from(map.entries())
      .map(([category, amount]) => ({
        category,
        amount,
        pct: total > 0 ? (amount / total) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount);
  });

  annual = computed(() => {
    const year = this.currentYear;
    const months: { month: string; income: number; expense: number; savings: number }[] = [];
    for (let m = 0; m < 12; m++) {
      const income = this.incomeService
        .incomes()
        .filter((i) => this.inMonth(i.date, m, year))
        .reduce((s, i) => s + i.amount, 0);
      const expense = this.expenseService
        .expenses()
        .filter((e) => this.inMonth(e.date, m, year))
        .reduce((s, e) => s + e.amount, 0);
      months.push({
        month: new Date(year, m, 1).toLocaleString(undefined, { month: 'long' }),
        income,
        expense,
        savings: income - expense,
      });
    }
    return months;
  });

  private inMonth(dateStr: string, month: number, year: number): boolean {
    const d = new Date(dateStr);
    return d.getMonth() === month && d.getFullYear() === year;
  }
}