import { Injectable, signal } from '@angular/core';
import { StorageService } from './storage.service';
import { Income } from '../models/income.model';

const KEY = 'incomes';

@Injectable({ providedIn: 'root' })
export class IncomeService {
  incomes = signal<Income[]>([]);

  constructor(private storage: StorageService) {
    this.incomes.set(this.storage.get<Income[]>(KEY) ?? []);
  }

  private persist(): void {
    this.storage.save(KEY, this.incomes());
  }

  add(data: Omit<Income, 'id' | 'createdAt' | 'updatedAt'>): Income {
    const now = new Date().toISOString();
    const item: Income = { ...data, id: this.uid(), createdAt: now, updatedAt: now };
    this.incomes.update((list) => [item, ...list]);
    this.persist();
    return item;
  }

  update(id: string, updates: Partial<Income>): void {
    this.incomes.update((list) =>
      list.map((e) =>
        e.id === id ? { ...e, ...updates, updatedAt: new Date().toISOString() } : e
      )
    );
    this.persist();
  }

  delete(id: string): void {
    this.incomes.update((list) => list.filter((e) => e.id !== id));
    this.persist();
  }

  getById(id: string): Income | undefined {
    return this.incomes().find((e) => e.id === id);
  }

  private uid(): string {
    return 'i_' + Math.random().toString(36).slice(2, 10) + Date.now();
  }
}