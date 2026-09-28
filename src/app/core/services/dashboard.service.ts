import { computed, Injectable } from '@angular/core';
import { IncomeService } from './income.service';
import { ExpenseService } from './expense.service';
import { SavingsService } from './savings.service';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  constructor(
    private incomeService: IncomeService,
    private expenseService: ExpenseService,
    private savingsService: SavingsService
  ) {}

  totalIncome = computed(() =>
    this.incomeService.incomes().reduce((s, i) => s + i.amount, 0)
  );

  totalExpense = computed(() =>
    this.expenseService.expenses().reduce((s, e) => s + e.amount, 0)
  );

  totalBalance = computed(() => this.totalIncome() - this.totalExpense());

  totalSavings = computed(() =>
    this.savingsService.goals().reduce((s, g) => s + g.currentAmount, 0)
  );

  monthlyIncome = computed(() => {
    const now = new Date();
    return this.incomeService
      .incomes()
      .filter((i) => this.sameMonth(i.date, now))
      .reduce((s, i) => s + i.amount, 0);
  });

  monthlyExpense = computed(() => {
    const now = new Date();
    return this.expenseService
      .expenses()
      .filter((e) => this.sameMonth(e.date, now))
      .reduce((s, e) => s + e.amount, 0);
  });

  expenseByCategory = computed(() => {
    const map = new Map<string, number>();
    this.expenseService.expenses().forEach((e) => {
      map.set(e.category, (map.get(e.category) ?? 0) + e.amount);
    });
    return Array.from(map.entries()).map(([category, amount]) => ({ category, amount }));
  });

  monthlyTrend = computed(() => {
    const now = new Date();
    const result: { month: string; income: number; expense: number; savings: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const m = d.getMonth();
      const y = d.getFullYear();
      const income = this.incomeService
        .incomes()
        .filter((x) => this.sameMonth(x.date, d))
        .reduce((s, x) => s + x.amount, 0);
      const expense = this.expenseService
        .expenses()
        .filter((x) => this.sameMonth(x.date, d))
        .reduce((s, x) => s + x.amount, 0);
      result.push({
        month: d.toLocaleString(undefined, { month: 'short' }),
        income,
        expense,
        savings: income - expense,
      });
    }
    return result;
  });

  private sameMonth(dateStr: string, ref: Date): boolean {
    const d = new Date(dateStr);
    return d.getMonth() === ref.getMonth() && d.getFullYear() === ref.getFullYear();
  }
}