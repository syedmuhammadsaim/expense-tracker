import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ToastContainerComponent } from './shared/components/toast-container/toast-container.component';
import { NotificationService } from './core/services/notification.service';
import { StorageService } from './core/services/storage.service';
import { IncomeService } from './core/services/income.service';
import { ExpenseService } from './core/services/expense.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, ToastContainerComponent],
  template: `
    <router-outlet></router-outlet>
    <app-toast-container></app-toast-container>
  `,
  styles: [
    `
      :host {
        display: block;
        width: 100%;
        min-height: 100vh;
      }
    `,
  ],
})
export class App implements OnInit {
  private notif = inject(NotificationService);
  private storage = inject(StorageService);
  private incomeService = inject(IncomeService);
  private expenseService = inject(ExpenseService);

  ngOnInit(): void {
    this.seedDemoData();
    this.notif.seedDemo();
  }

  private seedDemoData(): void {
    const seeded = this.storage.get<boolean>('demoSeeded');
    if (seeded) return;

    if (
      this.incomeService.incomes().length === 0 &&
      this.expenseService.expenses().length === 0
    ) {
      const today = new Date();
      const fmt = (d: Date) => d.toISOString().slice(0, 10);
      const y = today.getFullYear();
      const m = today.getMonth();

      // ===== INCOME =====
      this.incomeService.add({
        source: 'Monthly Salary',
        amount: 5200,
        category: 'Salary',
        date: fmt(new Date(y, m, 1)),
        paymentMethod: 'Bank Transfer',
        description: 'Demo data',
      });
      this.incomeService.add({
        source: 'Freelance Project',
        amount: 850,
        category: 'Freelancing',
        date: fmt(new Date(y, m, 12)),
        paymentMethod: 'Online Payment',
        description: 'Demo data',
      });

      // ===== EXPENSES =====
      const demoExpenses = [
        { title: 'Groceries', amount: 220, category: 'Groceries', day: 3 },
        { title: 'Rent', amount: 1400, category: 'Rent', day: 1 },
        { title: 'Bus Pass', amount: 60, category: 'Transport', day: 5 },
        { title: 'Electricity Bill', amount: 145, category: 'Bills', day: 8 },
        { title: 'Dinner out', amount: 78, category: 'Food', day: 10 },
        { title: 'Cinema', amount: 32, category: 'Entertainment', day: 14 },
        { title: 'Shoes', amount: 120, category: 'Shopping', day: 18 },
      ];

      demoExpenses.forEach((e) =>
        this.expenseService.add({
          title: e.title,
          amount: e.amount,
          category: e.category,
          date: fmt(new Date(y, m, e.day)),
          paymentMethod: 'Credit Card',
          description: 'Demo data',
        })
      );

      this.storage.save('demoSeeded', true);
    }
  }
}