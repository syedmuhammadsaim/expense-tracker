import { TransactionType } from './transaction.model';

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  icon: string;
  imageUrl?: string;
  description?: string;
  createdAt: string;
}