import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';

export const routes: Routes = [
  // ============ AUTH LAYOUT (Login / Register) ============
  {
    path: '',
    canActivate: [guestGuard],
    component: AuthLayoutComponent,
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('./pages/login/login.component').then((m) => m.LoginComponent),
      },
      {
        path: 'register',
        loadComponent: () =>
          import('./pages/register/register.component').then((m) => m.RegisterComponent),
      },
      { path: '', pathMatch: 'full', redirectTo: 'login' },
    ],
  },

  // ============ MAIN LAYOUT (Authenticated) ============
  {
    path: '',
    canActivate: [authGuard],
    component: MainLayoutComponent,
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/dashboard/dashboard.component').then((m) => m.DashboardComponent),
      },
      {
        path: 'transactions',
        loadComponent: () =>
          import('./pages/transactions/transactions.component').then(
            (m) => m.TransactionsComponent
          ),
      },
      {
        path: 'expenses',
        loadComponent: () =>
          import('./pages/expenses/expenses.component').then((m) => m.ExpensesComponent),
      },
      {
        path: 'income',
        loadComponent: () =>
          import('./pages/income/income.component').then((m) => m.IncomeComponent),
      },
      {
        path: 'categories',
        loadComponent: () =>
          import('./pages/categories/categories.component').then(
            (m) => m.CategoriesComponent
          ),
      },
      {
        path: 'budgets',
        loadComponent: () =>
          import('./pages/budgets/budgets.component').then((m) => m.BudgetsComponent),
      },
      {
        path: 'savings',
        loadComponent: () =>
          import('./pages/savings/savings.component').then((m) => m.SavingsComponent),
      },
      {
        path: 'reports',
        loadComponent: () =>
          import('./pages/reports/reports.component').then((m) => m.ReportsComponent),
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./pages/profile/profile.component').then((m) => m.ProfileComponent),
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('./pages/settings/settings.component').then((m) => m.SettingsComponent),
      },
    ],
  },

  // ============ FALLBACK ============
  { path: '**', redirectTo: 'dashboard' },
];