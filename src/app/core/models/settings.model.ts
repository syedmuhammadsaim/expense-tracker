export type Currency = 'USD' | 'PKR' | 'EUR' | 'GBP';
export type Theme = 'light' | 'dark';

export interface AppSettings {
  theme: Theme;
  currency: Currency;
  notifications: {
    budgetAlerts: boolean;
    expenseAlerts: boolean;
    monthlyReportAlerts: boolean;
  };
}

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'light',
  currency: 'USD',
  notifications: {
    budgetAlerts: true,
    expenseAlerts: true,
    monthlyReportAlerts: true,
  },
};

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  USD: '$',
  PKR: '₨',
  EUR: '€',
  GBP: '£',
};