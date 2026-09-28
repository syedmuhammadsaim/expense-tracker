import { Injectable, signal } from '@angular/core';
import { StorageService } from './storage.service';
import { SavingsGoal } from '../models/savings-goal.model';

const KEY = 'savings';

@Injectable({ providedIn: 'root' })
export class SavingsService {
  goals = signal<SavingsGoal[]>([]);

  constructor(private storage: StorageService) {
    this.goals.set(this.storage.get<SavingsGoal[]>(KEY) ?? []);
  }

  private persist(): void {
    this.storage.save(KEY, this.goals());
  }

  add(data: Omit<SavingsGoal, 'id' | 'createdAt'>): SavingsGoal {
    const item: SavingsGoal = {
      ...data,
      id: 's_' + Math.random().toString(36).slice(2, 10) + Date.now(),
      createdAt: new Date().toISOString(),
    };
    this.goals.update((l) => [item, ...l]);
    this.persist();
    return item;
  }

  update(id: string, updates: Partial<SavingsGoal>): void {
    this.goals.update((l) => l.map((g) => (g.id === id ? { ...g, ...updates } : g)));
    this.persist();
  }

  delete(id: string): void {
    this.goals.update((l) => l.filter((g) => g.id !== id));
    this.persist();
  }

  addSavings(id: string, amount: number): void {
    this.goals.update((l) =>
      l.map((g) =>
        g.id === id ? { ...g, currentAmount: g.currentAmount + amount } : g
      )
    );
    this.persist();
  }
}