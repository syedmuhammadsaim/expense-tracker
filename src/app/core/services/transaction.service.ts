import { computed, Injectable } from '@angular/core';
import { ExpenseService } from './expense.service';
import { IncomeService } from './income.service';
import { Transaction } from '../models/transaction.model';

@Injectable({ providedIn: 'root' })
export class TransactionService {
  constructor(
    private expenseService: ExpenseService,
    private incomeService: IncomeService
  ) {}

  transactions = computed<Transaction[]>(() => {
    const expenses: Transaction[] = this.expenseService.expenses().map((e) => ({
      id: e.id,
      title: e.title,
      amount: e.amount,
      category: e.category,
      type: 'expense',
      date: e.date,
      paymentMethod: e.paymentMethod,
      description: e.description,
      createdAt: e.createdAt,
      updatedAt: e.updatedAt,
    }));
    const incomes: Transaction[] = this.incomeService.incomes().map((i) => ({
      id: i.id,
      title: i.source,
      amount: i.amount,
      category: i.category,
      type: 'income',
      date: i.date,
      paymentMethod: i.paymentMethod,
      description: i.description,
      createdAt: i.createdAt,
      updatedAt: i.updatedAt,
    }));
    return [...expenses, ...incomes].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  });

  totalIncome(): number {
    return this.incomeService.incomes().reduce((s, i) => s + i.amount, 0);
  }

  totalExpense(): number {
    return this.expenseService.expenses().reduce((s, e) => s + e.amount, 0);
  }

  totalBalance(): number {
    return this.totalIncome() - this.totalExpense();
  }

  monthlyIncome(month: number, year: number): number {
    return this.incomeService
      .incomes()
      .filter((i) => this.inMonth(i.date, month, year))
      .reduce((s, i) => s + i.amount, 0);
  }

  monthlyExpense(month: number, year: number): number {
    return this.expenseService
      .expenses()
      .filter((e) => this.inMonth(e.date, month, year))
      .reduce((s, e) => s + e.amount, 0);
  }

  private inMonth(dateStr: string, month: number, year: number): boolean {
    const d = new Date(dateStr);
    return d.getMonth() === month && d.getFullYear() === year;
  }
}