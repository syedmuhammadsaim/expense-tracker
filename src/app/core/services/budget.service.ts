import { computed, Injectable, signal } from '@angular/core';
import { StorageService } from './storage.service';
import { Budget, BudgetView } from '../models/budget.model';
import { ExpenseService } from './expense.service';

const KEY = 'budgets';

@Injectable({ providedIn: 'root' })
export class BudgetService {
  budgets = signal<Budget[]>([]);

  constructor(private storage: StorageService, private expenseService: ExpenseService) {
    this.budgets.set(this.storage.get<Budget[]>(KEY) ?? []);
  }

  private persist(): void {
    this.storage.save(KEY, this.budgets());
  }

  add(data: Omit<Budget, 'id' | 'createdAt'>): Budget {
    const item: Budget = {
      ...data,
      id: 'b_' + Math.random().toString(36).slice(2, 10) + Date.now(),
      createdAt: new Date().toISOString(),
    };
    this.budgets.update((l) => [item, ...l]);
    this.persist();
    return item;
  }

  update(id: string, updates: Partial<Budget>): void {
    this.budgets.update((l) => l.map((b) => (b.id === id ? { ...b, ...updates } : b)));
    this.persist();
  }

  delete(id: string): void {
    this.budgets.update((l) => l.filter((b) => b.id !== id));
    this.persist();
  }

  view = computed<BudgetView[]>(() => {
    const expenses = this.expenseService.expenses();
    return this.budgets().map((b) => {
      const spent = expenses
        .filter(
          (e) =>
            e.category === b.category &&
            new Date(e.date) >= new Date(b.startDate) &&
            new Date(e.date) <= new Date(b.endDate)
        )
        .reduce((s, e) => s + e.amount, 0);
      const remaining = Math.max(b.amount - spent, 0);
      const progress = b.amount > 0 ? Math.min((spent / b.amount) * 100, 150) : 0;
      return { ...b, spent, remaining, progress };
    });
  });
}