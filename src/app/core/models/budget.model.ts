export interface Budget {
  id: string;
  name: string;
  category: string;
  amount: number;
  startDate: string;
  endDate: string;
  createdAt: string;
}

export interface BudgetView extends Budget {
  spent: number;
  remaining: number;
  progress: number; // 0-100
}