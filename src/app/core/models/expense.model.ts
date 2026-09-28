import { PaymentMethod } from './transaction.model';

export const EXPENSE_CATEGORIES = [
  'Food',
  'Transport',
  'Shopping',
  'Bills',
  'Rent',
  'Education',
  'Health',
  'Entertainment',
  'Travel',
  'Groceries',
  'Other',
] as const;

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];

export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: string;
  date: string;
  paymentMethod: PaymentMethod;
  description?: string;
  createdAt: string;
  updatedAt: string;
}