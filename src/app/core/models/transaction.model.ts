export type TransactionType = 'income' | 'expense';

export type PaymentMethod =
  | 'Cash'
  | 'Debit Card'
  | 'Credit Card'
  | 'Bank Transfer'
  | 'Online Payment'
  | 'Other';

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  category: string;
  type: TransactionType;
  date: string; // ISO string
  paymentMethod: PaymentMethod;
  description?: string;
  createdAt: string;
  updatedAt: string;
}