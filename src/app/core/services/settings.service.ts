import { Injectable, signal, effect } from '@angular/core';
import { StorageService } from './storage.service';
import { AppSettings, CURRENCY_SYMBOLS, DEFAULT_SETTINGS } from '../models/settings.model';

const KEY = 'settings';

@Injectable({ providedIn: 'root' })
export class SettingsService {
  settings = signal<AppSettings>(DEFAULT_SETTINGS);

  constructor(private storage: StorageService) {
    const saved = this.storage.get<AppSettings>(KEY);
    if (saved) {
      this.settings.set({ ...DEFAULT_SETTINGS, ...saved });
    }
    effect(() => {
      const s = this.settings();
      this.storage.save(KEY, s);
      document.documentElement.setAttribute('data-theme', s.theme);
    });
    document.documentElement.setAttribute('data-theme', this.settings().theme);
  }

  update(updates: Partial<AppSettings>): void {
    this.settings.update((s) => ({ ...s, ...updates }));
  }

  toggleTheme(): void {
    this.settings.update((s) => ({ ...s, theme: s.theme === 'light' ? 'dark' : 'light' }));
  }

  currencySymbol(): string {
    return CURRENCY_SYMBOLS[this.settings().currency];
  }

  formatAmount(amount: number): string {
    return `${this.currencySymbol()}${amount.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }
}