import { Injectable, signal } from '@angular/core';
import { StorageService } from './storage.service';
import { Category } from '../models/category.model';

const KEY = 'categories';

const DEFAULT_CATEGORIES: Omit<Category, 'id' | 'createdAt'>[] = [
  {
    name: 'Food',
    type: 'expense',
    icon: '🍔',
    imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=200&h=200&fit=crop',
    description: 'Food & dining expenses',
  },
  {
    name: 'Transport',
    type: 'expense',
    icon: '🚗',
    imageUrl: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=200&h=200&fit=crop',
    description: 'Travel & commuting',
  },
  {
    name: 'Shopping',
    type: 'expense',
    icon: '🛍️',
    imageUrl: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=200&h=200&fit=crop',
    description: 'Shopping & retail',
  },
  {
    name: 'Bills',
    type: 'expense',
    icon: '📄',
    imageUrl: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=200&h=200&fit=crop',
    description: 'Utility bills',
  },
  {
    name: 'Rent',
    type: 'expense',
    icon: '🏠',
    imageUrl: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=200&h=200&fit=crop',
    description: 'House & office rent',
  },
  {
    name: 'Health',
    type: 'expense',
    icon: '💊',
    imageUrl: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=200&h=200&fit=crop',
    description: 'Medical & health',
  },
  {
    name: 'Entertainment',
    type: 'expense',
    icon: '🎬',
    imageUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=200&h=200&fit=crop',
    description: 'Movies & fun',
  },
  {
    name: 'Travel',
    type: 'expense',
    icon: '✈️',
    imageUrl: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=200&h=200&fit=crop',
    description: 'Trips & tours',
  },
  {
    name: 'Groceries',
    type: 'expense',
    icon: '🛒',
    imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&h=200&fit=crop',
    description: 'Daily groceries',
  },
  {
    name: 'Education',
    type: 'expense',
    icon: '📚',
    imageUrl: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=200&h=200&fit=crop',
    description: 'Courses & books',
  },
  {
    name: 'Other',
    type: 'expense',
    icon: '📦',
    imageUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=200&h=200&fit=crop',
    description: 'Misc expenses',
  },
  {
    name: 'Salary',
    type: 'income',
    icon: '💰',
    imageUrl: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=200&h=200&fit=crop',
    description: 'Monthly salary',
  },
  {
    name: 'Freelancing',
    type: 'income',
    icon: '💻',
    imageUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=200&h=200&fit=crop',
    description: 'Freelance income',
  },
  {
    name: 'Business',
    type: 'income',
    icon: '📈',
    imageUrl: 'https://images.unsplash.com/photo-1554260570-9140fd3b7614?w=200&h=200&fit=crop',
    description: 'Business revenue',
  },
  {
    name: 'Investment',
    type: 'income',
    icon: '🏦',
    imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=200&h=200&fit=crop',
    description: 'Investment returns',
  },
];

@Injectable({ providedIn: 'root' })
export class CategoryService {
  categories = signal<Category[]>([]);

  constructor(private storage: StorageService) {
    const saved = this.storage.get<Category[]>(KEY);
    if (saved && saved.length) {
      this.categories.set(saved);
    } else {
      const seeded = DEFAULT_CATEGORIES.map((c) => ({
        ...c,
        id: 'c_' + Math.random().toString(36).slice(2, 10),
        createdAt: new Date().toISOString(),
      }));
      this.categories.set(seeded);
      this.persist();
    }
  }

  private persist(): void {
    this.storage.save(KEY, this.categories());
  }

  add(data: Omit<Category, 'id' | 'createdAt'>): Category {
    const item: Category = {
      ...data,
      id: 'c_' + Math.random().toString(36).slice(2, 10) + Date.now(),
      createdAt: new Date().toISOString(),
    };
    this.categories.update((list) => [item, ...list]);
    this.persist();
    return item;
  }

  update(id: string, updates: Partial<Category>): void {
    this.categories.update((list) =>
      list.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
    this.persist();
  }

  delete(id: string): void {
    this.categories.update((list) => list.filter((c) => c.id !== id));
    this.persist();
  }

  byType(type: 'income' | 'expense'): Category[] {
    return this.categories().filter((c) => c.type === type);
  }
}