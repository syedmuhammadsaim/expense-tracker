import { Injectable, signal } from '@angular/core';
import { StorageService } from './storage.service';
import { Expense } from '../models/expense.model';

const KEY = 'expenses';

@Injectable({ providedIn: 'root' })
export class ExpenseService {
  expenses = signal<Expense[]>([]);

  constructor(private storage: StorageService) {
    this.expenses.set(this.storage.get<Expense[]>(KEY) ?? []);
  }

  private persist(): void {
    this.storage.save(KEY, this.expenses());
  }

  add(data: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>): Expense {
    const now = new Date().toISOString();
    const item: Expense = { ...data, id: this.uid(), createdAt: now, updatedAt: now };
    this.expenses.update((list) => [item, ...list]);
    this.persist();
    return item;
  }

  update(id: string, updates: Partial<Expense>): void {
    this.expenses.update((list) =>
      list.map((e) =>
        e.id === id ? { ...e, ...updates, updatedAt: new Date().toISOString() } : e
      )
    );
    this.persist();
  }

  delete(id: string): void {
    this.expenses.update((list) => list.filter((e) => e.id !== id));
    this.persist();
  }

  getById(id: string): Expense | undefined {
    return this.expenses().find((e) => e.id === id);
  }

  private uid(): string {
    return 'e_' + Math.random().toString(36).slice(2, 10) + Date.now();
  }
}