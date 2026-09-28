import { PaymentMethod } from './transaction.model';

export const INCOME_CATEGORIES = [
  'Salary',
  'Freelancing',
  'Business',
  'Investment',
  'Bonus',
  'Other',
] as const;

export type IncomeCategory = (typeof INCOME_CATEGORIES)[number];

export interface Income {
  id: string;
  source: string;
  amount: number;
  category: string;
  date: string;
  paymentMethod: PaymentMethod;
  description?: string;
  createdAt: string;
  updatedAt: string;
}