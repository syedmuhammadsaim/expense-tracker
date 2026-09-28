import { Injectable, inject } from '@angular/core';
import { ExpenseService } from './expense.service';
import { IncomeService } from './income.service';
import { BudgetService } from './budget.service';
import { SavingsService } from './savings.service';
import { CategoryService } from './category.service';
import { PaymentMethod } from '../models/transaction.model';
import { EXPENSE_CATEGORIES } from '../models/expense.model';
import { INCOME_CATEGORIES } from '../models/income.model';

@Injectable({ providedIn: 'root' })
export class DemoDataService {
  private expenseService = inject(ExpenseService);
  private incomeService = inject(IncomeService);
  private budgetService = inject(BudgetService);
  private savingsService = inject(SavingsService);
  private categoryService = inject(CategoryService);

  private expenseTitles: Record<string, string[]> = {
    Food: ['Burger King', 'Pizza Hut', 'KFC Family Meal', 'Lunch with client', 'Breakfast', 'Dinner out', 'Coffee', 'Biryani', 'BBQ Night', 'Sushi'],
    Transport: ['Uber Ride', 'Careem', 'Petrol', 'Bus Ticket', 'Train Ticket', 'Taxi', 'Rickshaw', 'Metro Card', 'Car Service', 'Toll Tax'],
    Shopping: ['T-Shirt', 'Shoes', 'Watch', 'Headphones', 'Mobile Cover', 'Perfume', 'Bag', 'Jacket', 'Jeans', 'Sunglasses'],
    Bills: ['Electricity Bill', 'Water Bill', 'Gas Bill', 'Internet Bill', 'Mobile Bill', 'Cable TV', 'DTH Recharge', 'Wifi Bill', 'Phone Bill', 'Utility Bill'],
    Rent: ['House Rent', 'Office Rent', 'Shop Rent', 'Apartment Rent', 'Storage Rent'],
    Education: ['Tuition Fee', 'Books', 'Online Course', 'Stationery', 'Exam Fee', 'Library Fee', 'Coaching', 'Notes', 'Software Course', 'Workshop'],
    Health: ['Doctor Visit', 'Medicine', 'Lab Test', 'Dental', 'Eye Checkup', 'Gym', 'Vitamins', 'Hospital', 'X-Ray', 'Physiotherapy'],
    Entertainment: ['Netflix', 'Spotify', 'Cinema', 'Gaming', 'Concert', 'Park Ticket', 'Museum', 'Zoo', 'PlayStation', 'Party'],
    Travel: ['Flight Ticket', 'Hotel Booking', 'Tour Package', 'Visa Fee', 'Travel Insurance', 'Airport Taxi', 'Train Ticket', 'Bus Tour', 'Souvenirs', 'Guide Fee'],
    Groceries: ['Weekly Groceries', 'Vegetables', 'Fruits', 'Milk & Bread', 'Rice Bag', 'Cooking Oil', 'Spices', 'Meat', 'Eggs', 'Flour'],
    Other: ['Gift', 'Donation', 'Charity', 'Misc Expense', 'Repair', 'Service Charge', 'Late Fee', 'Fine', 'Subscription', 'Misc'],
  };

  private incomeSources: Record<string, string[]> = {
    Salary: ['Monthly Salary', 'Salary Bonus', 'Overtime Pay', 'Annual Increment', 'Performance Bonus'],
    Freelancing: ['Fiverr Order', 'Upwork Project', 'Client Payment', 'Consultation Fee', 'Design Work'],
    Business: ['Shop Sales', 'Online Store', 'Wholesale Deal', 'Retail Profit', 'Service Income'],
    Investment: ['Stock Dividend', 'Mutual Fund', 'Crypto Profit', 'Real Estate Rent', 'Interest Income'],
    Bonus: ['Eid Bonus', 'Yearly Bonus', 'Festival Bonus', 'Referral Bonus', 'Performance Bonus'],
    Other: ['Gift Money', 'Inheritance', 'Lottery', 'Refund', 'Cashback'],
  };

  private paymentMethods: PaymentMethod[] = [
    'Cash',
    'Debit Card',
    'Credit Card',
    'Bank Transfer',
    'Online Payment',
    'Other',
  ];

  private random<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  private randomAmount(min: number, max: number): number {
    return Math.round((Math.random() * (max - min) + min) * 100) / 100;
  }

  private randomDate(daysAgo: number): string {
    const d = new Date();
    d.setDate(d.getDate() - Math.floor(Math.random() * daysAgo));
    return d.toISOString().slice(0, 10);
  }

  // ============================================================
  // MAIN METHOD — Load all demo data
  // ============================================================
  loadDemoData(): { expenses: number; incomes: number; budgets: number; savings: number } {
    // Categories first
    this.seedCategories();

    // Now seed everything else
    const expenses = this.seedExpenses(60);
    const incomes = this.seedIncomes(25);
    const budgets = this.seedBudgets(8);
    const savings = this.seedSavings(6);

    return {
      expenses: expenses,
      incomes: incomes,
      budgets: budgets,
      savings: savings,
    };
  }

  // ============================================================
  // CATEGORIES
  // ============================================================
  private seedCategories(): void {
    const existing = this.categoryService.categories();
    const existingNames = new Set(existing.map((c) => c.name));

    const defaultCats = [
      { name: 'Food', type: 'expense' as const, icon: '🍔' },
      { name: 'Transport', type: 'expense' as const, icon: '🚗' },
      { name: 'Shopping', type: 'expense' as const, icon: '🛍️' },
      { name: 'Bills', type: 'expense' as const, icon: '📄' },
      { name: 'Rent', type: 'expense' as const, icon: '🏠' },
      { name: 'Education', type: 'expense' as const, icon: '📚' },
      { name: 'Health', type: 'expense' as const, icon: '💊' },
      { name: 'Entertainment', type: 'expense' as const, icon: '🎬' },
      { name: 'Travel', type: 'expense' as const, icon: '✈️' },
      { name: 'Groceries', type: 'expense' as const, icon: '🛒' },
      { name: 'Salary', type: 'income' as const, icon: '💰' },
      { name: 'Freelancing', type: 'income' as const, icon: '💻' },
      { name: 'Business', type: 'income' as const, icon: '📈' },
      { name: 'Investment', type: 'income' as const, icon: '🏦' },
    ];

    defaultCats.forEach((cat) => {
      if (!existingNames.has(cat.name)) {
        this.categoryService.add({
          name: cat.name,
          type: cat.type,
          icon: cat.icon,
          description: `${cat.name} category`,
        });
      }
    });
  }

  // ============================================================
  // EXPENSES — 60 items
  // ============================================================
  private seedExpenses(count: number): number {
    let added = 0;
    for (let i = 0; i < count; i++) {
      const category = EXPENSE_CATEGORIES[i % EXPENSE_CATEGORIES.length];
      const titles = this.expenseTitles[category] ?? ['Expense'];
      const title = this.random(titles);

      let amount = 100;
      if (category === 'Rent') amount = this.randomAmount(8000, 25000);
      else if (category === 'Travel') amount = this.randomAmount(5000, 50000);
      else if (category === 'Bills') amount = this.randomAmount(500, 5000);
      else if (category === 'Shopping') amount = this.randomAmount(500, 8000);
      else if (category === 'Health') amount = this.randomAmount(300, 5000);
      else if (category === 'Education') amount = this.randomAmount(1000, 15000);
      else if (category === 'Groceries') amount = this.randomAmount(500, 4000);
      else if (category === 'Entertainment') amount = this.randomAmount(200, 3000);
      else if (category === 'Transport') amount = this.randomAmount(100, 2000);
      else if (category === 'Food') amount = this.randomAmount(150, 2500);
      else amount = this.randomAmount(200, 5000);

      this.expenseService.add({
        title,
        amount,
        category,
        date: this.randomDate(180),
        paymentMethod: this.random(this.paymentMethods),
        description: `Sample ${category.toLowerCase()} expense`,
      });
      added++;
    }
    return added;
  }

  // ============================================================
  // INCOME — 25 items
  // ============================================================
  private seedIncomes(count: number): number {
    let added = 0;
    for (let i = 0; i < count; i++) {
      const category = INCOME_CATEGORIES[i % INCOME_CATEGORIES.length];
      const sources = this.incomeSources[category] ?? ['Income'];
      const source = this.random(sources);

      let amount = 1000;
      if (category === 'Salary') amount = this.randomAmount(40000, 150000);
      else if (category === 'Business') amount = this.randomAmount(10000, 80000);
      else if (category === 'Freelancing') amount = this.randomAmount(5000, 50000);
      else if (category === 'Investment') amount = this.randomAmount(2000, 30000);
      else if (category === 'Bonus') amount = this.randomAmount(5000, 25000);
      else amount = this.randomAmount(500, 10000);

      this.incomeService.add({
        source,
        amount,
        category,
        date: this.randomDate(180),
        paymentMethod: 'Bank Transfer',
        description: `Sample ${category.toLowerCase()} income`,
      });
      added++;
    }
    return added;
  }

  // ============================================================
  // BUDGETS — 8 items
  // ============================================================
  private seedBudgets(count: number): number {
    const budgetData = [
      { name: 'Monthly Food', category: 'Food', amount: 15000 },
      { name: 'Transport Budget', category: 'Transport', amount: 8000 },
      { name: 'Shopping Budget', category: 'Shopping', amount: 10000 },
      { name: 'Utility Bills', category: 'Bills', amount: 6000 },
      { name: 'House Rent', category: 'Rent', amount: 25000 },
      { name: 'Health & Gym', category: 'Health', amount: 5000 },
      { name: 'Entertainment', category: 'Entertainment', amount: 4000 },
      { name: 'Groceries', category: 'Groceries', amount: 12000 },
    ];

    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
      .toISOString()
      .slice(0, 10);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0)
      .toISOString()
      .slice(0, 10);

    budgetData.slice(0, count).forEach((b) => {
      this.budgetService.add({
        name: b.name,
        category: b.category,
        amount: b.amount,
        startDate: firstDay,
        endDate: lastDay,
      });
    });
    return Math.min(count, budgetData.length);
  }

  // ============================================================
  // SAVINGS GOALS — 6 items
  // ============================================================
  private seedSavings(count: number): number {
    const savingsData = [
      { name: 'Gaming Laptop', targetAmount: 150000, currentAmount: 90000, months: 6 },
      { name: 'New Mobile', targetAmount: 80000, currentAmount: 35000, months: 4 },
      { name: 'Emergency Fund', targetAmount: 300000, currentAmount: 180000, months: 12 },
      { name: 'Umrah Trip', targetAmount: 500000, currentAmount: 250000, months: 18 },
      { name: 'Car Down Payment', targetAmount: 800000, currentAmount: 400000, months: 24 },
      { name: 'Wedding Fund', targetAmount: 1000000, currentAmount: 300000, months: 36 },
    ];

    savingsData.slice(0, count).forEach((s) => {
      const targetDate = new Date();
      targetDate.setMonth(targetDate.getMonth() + s.months);

      this.savingsService.add({
        name: s.name,
        targetAmount: s.targetAmount,
        currentAmount: s.currentAmount,
        targetDate: targetDate.toISOString().slice(0, 10),
        description: `Saving for ${s.name.toLowerCase()}`,
      });
    });
    return Math.min(count, savingsData.length);
  }

  // ============================================================
  // CLEAR ALL DATA
  // ============================================================
  clearAllData(): void {
    // Clear each service's data
    this.expenseService.expenses().forEach((e) => this.expenseService.delete(e.id));
    this.incomeService.incomes().forEach((i) => this.incomeService.delete(i.id));
    this.budgetService.budgets().forEach((b) => this.budgetService.delete(b.id));
    this.savingsService.goals().forEach((s) => this.savingsService.delete(s.id));
  }
}