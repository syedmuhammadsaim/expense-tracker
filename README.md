# 💸 Expense Tracker

A **complete, professional and fully responsive Expense Tracker Web Application** built with **Angular 18+** and **TypeScript**. Track your income, expenses, budgets, savings, and financial reports — all in one place with a modern SaaS-style dashboard.

![Angular](https://img.shields.io/badge/Angular-18+-DD0031?style=for-the-badge&logo=angular)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?style=for-the-badge&logo=typescript)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Complete Project Structure](#-complete-project-structure)
- [Files Explanation](#-files-explanation)
- [Prerequisites](#-prerequisites)
- [Installation & Setup](#-installation--setup)
- [Building the Application](#-building-the-application)
- [Demo Data](#-demo-data)
- [Data Storage](#-data-storage)
- [Theme Customization](#-theme-customization)
- [Browser Support](#-browser-support)
- [License](#-license)
- [Author](#-author)

---

## ✨ Features

### 🔐 Authentication
- User registration with validation
- Secure login with "Remember Me"
- Password show/hide toggle
- Route guards (Auth + Guest)
- User-specific data isolation
- Change password from profile

### 📊 Dashboard
- Total Balance, Income, Expenses, Savings cards
- Monthly Income & Expenses overview
- **4 Interactive Charts:**
  - Income vs Expense (Bar chart)
  - Monthly Expenses (Line chart)
  - Expenses by Category (Doughnut chart)
  - Monthly Savings (Area chart)
- Animated counters on cards
- Recent transactions preview

### 💳 Transactions Management
- Unified transactions list (Income + Expenses)
- **Advanced filters:** Search, Type, Category, Date
- **Sort options:** Newest, Oldest, Amount High→Low, Amount Low→High
- **Pagination** (8 records per page)
- Active filter chips
- View, Edit, Delete actions

### 💰 Expenses Management
- Full CRUD operations
- 11 categories: Food, Transport, Shopping, Bills, Rent, Education, Health, Entertainment, Travel, Groceries, Other
- 6 payment methods: Cash, Debit Card, Credit Card, Bank Transfer, Online Payment, Other
- Search, filter, sort, pagination

### 💵 Income Management
- Full CRUD operations
- Categories: Salary, Freelancing, Business, Investment, Bonus, Other
- Payment methods support
- Search, filter, sort, pagination
- Auto-notification on new income

### 🎯 Budgets
- Create monthly budgets per category
- Progress bars with spent/remaining amounts
- **Smart status:** On Track / Warning / Over Budget
- Filter by status
- Auto-warning when close to limit

### 🏦 Savings Goals
- Track savings for goals (Laptop, Trip, Car, etc.)
- Target date & description
- Progress tracking with percentages
- "Add Savings" quick action
- Milestone notifications

### 🏷️ Categories
- Custom categories with **image upload** (JPG/PNG)
- Emoji icons support
- Emoji fallback for missing images
- Filter by type, search, sort

### 📈 Reports
- **Monthly Report:** Total Income, Expenses, Savings, Highest Expense, Top Category
- **Category Report:** Spending breakdown by category
- **Annual Report:** Month-by-month income/expenses/savings

### 👤 Profile
- Edit personal information
- **Profile picture upload** from computer
- Live preview of selected image
- 8 sample avatars
- Change password

### ⚙️ Settings
- **Appearance:** Light / Dark mode
- **Currency:** USD, PKR, EUR, GBP
- **Notifications:** Budget, Expense, Monthly report alerts
- **Demo Data:** Load 100+ sample items / Clear all data

### 🔔 Notifications
- Bell icon with unread counter
- Mark as read / Mark all read
- Delete notifications
- Auto-notifications for events

### 📱 Responsive Design
- **Desktop:** Fixed sidebar, side-by-side layout
- **Tablet:** Adjusted layout
- **Mobile:** Slide-in sidebar with overlay, stacked cards, horizontal scroll tables
- Dark + Light mode with CSS variables

---

## 🛠 Tech Stack

| Technology | Purpose |
|-----------|---------|
| **Angular 18+** | Standalone Components, Signals |
| **TypeScript 5.5** | Type-safe code |
| **Angular Signals** | Reactive state management |
| **Reactive Forms** | Form validation |
| **Chart.js 4.4** | Dashboard charts |
| **CSS Variables** | Theme switching |
| **LocalStorage** | Data persistence |
| **RxJS** | Reactive programming |

**No backend required** — Everything runs in the browser with LocalStorage persistence.

---

## 📁 Complete Project Structure

```
expense-tracker/
│
├── public/                                    # Static assets served at root
│   ├── _redirects                             # SPA routing fallback
│   └── favicon.ico                            # Browser tab icon
│
├── src/                                       # Source code
│   │
│   ├── app/                                   # Application code
│   │   │
│   │   ├── core/                              # Core (singleton services, models, guards)
│   │   │   │
│   │   │   ├── guards/                        # Route guards
│   │   │   │   ├── auth.guard.ts              # Protects logged-in routes
│   │   │   │   └── guest.guard.ts             # Blocks logged-in users from auth pages
│   │   │   │
│   │   │   ├── models/                        # TypeScript interfaces
│   │   │   │   ├── user.model.ts              # User, AuthSession
│   │   │   │   ├── transaction.model.ts       # Transaction, PaymentMethod
│   │   │   │   ├── expense.model.ts           # Expense, EXPENSE_CATEGORIES
│   │   │   │   ├── income.model.ts            # Income, INCOME_CATEGORIES
│   │   │   │   ├── category.model.ts          # Category
│   │   │   │   ├── budget.model.ts            # Budget, BudgetView
│   │   │   │   ├── savings-goal.model.ts      # SavingsGoal
│   │   │   │   ├── notification.model.ts      # AppNotification
│   │   │   │   └── settings.model.ts          # AppSettings, Currency, Theme
│   │   │   │
│   │   │   └── services/                      # Business logic
│   │   │       ├── storage.service.ts         # LocalStorage wrapper (user-scoped)
│   │   │       ├── auth.service.ts            # Login/Register/Logout
│   │   │       ├── expense.service.ts         # Expense CRUD
│   │   │       ├── income.service.ts          # Income CRUD
│   │   │       ├── transaction.service.ts     # Combined transactions
│   │   │       ├── category.service.ts        # Category CRUD
│   │   │       ├── budget.service.ts          # Budget CRUD + progress
│   │   │       ├── savings.service.ts         # Savings goals CRUD
│   │   │       ├── notification.service.ts    # Notifications
│   │   │       ├── dashboard.service.ts       # Dashboard stats
│   │   │       ├── settings.service.ts        # Theme, currency
│   │   │       ├── demo-data.service.ts       # Demo data loader
│   │   │       └── toast.service.ts           # Toast notifications
│   │   │
│   │   ├── shared/                            # Reusable components & pipes
│   │   │   │
│   │   │   ├── components/                    # Reusable UI components
│   │   │   │   ├── empty-state/
│   │   │   │   │   └── empty-state.component.ts
│   │   │   │   ├── loading/
│   │   │   │   │   └── loading.component.ts
│   │   │   │   ├── logo/
│   │   │   │   │   ├── logo.component.ts
│   │   │   │   │   ├── logo.component.html
│   │   │   │   │   └── logo.component.css
│   │   │   │   ├── modal/
│   │   │   │   │   └── modal.component.ts
│   │   │   │   ├── navbar/
│   │   │   │   │   └── navbar.component.ts
│   │   │   │   ├── notification-dropdown/
│   │   │   │   │   └── notification-dropdown.component.ts
│   │   │   │   ├── sidebar/
│   │   │   │   │   └── sidebar.component.ts
│   │   │   │   ├── stat-card/
│   │   │   │   │   └── stat-card.component.ts
│   │   │   │   └── toast-container/
│   │   │   │       └── toast-container.component.ts
│   │   │   │
│   │   │   └── pipes/                         # Custom Angular pipes
│   │   │       └── currency-format.pipe.ts    # Currency formatting pipe
│   │   │
│   │   ├── layouts/                           # Page layouts
│   │   │   ├── auth-layout/                   # Login/Register layout
│   │   │   │   └── auth-layout.component.ts
│   │   │   └── main-layout/                   # Main app layout
│   │   │       └── main-layout.component.ts
│   │   │
│   │   ├── pages/                             # Route pages
│   │   │   ├── login/
│   │   │   │   └── login.component.ts
│   │   │   ├── register/
│   │   │   │   └── register.component.ts
│   │   │   ├── dashboard/
│   │   │   │   └── dashboard.component.ts
│   │   │   ├── transactions/
│   │   │   │   └── transactions.component.ts
│   │   │   ├── expenses/
│   │   │   │   └── expenses.component.ts
│   │   │   ├── income/
│   │   │   │   └── income.component.ts
│   │   │   ├── categories/
│   │   │   │   └── categories.component.ts
│   │   │   ├── budgets/
│   │   │   │   └── budgets.component.ts
│   │   │   ├── savings/
│   │   │   │   └── savings.component.ts
│   │   │   ├── reports/
│   │   │   │   └── reports.component.ts
│   │   │   ├── profile/
│   │   │   │   └── profile.component.ts
│   │   │   └── settings/
│   │   │       └── settings.component.ts
│   │   │
│   │   ├── app.ts                             # Root component
│   │   ├── app.config.ts                      # App configuration
│   │   └── app.routes.ts                      # Route definitions
│   │
│   ├── styles.css                             # Global styles
│   ├── index.html                             # HTML entry point
│   └── main.ts                                # Bootstrap file
│
├── .editorconfig                              # Editor config
├── .gitignore                                 # Git ignore rules
├── .prettierrc                                # Prettier config
├── angular.json                               # Angular CLI config
├── package.json                               # npm dependencies
├── package-lock.json                          # Exact versions lock
├── tsconfig.json                              # TypeScript base config
├── tsconfig.app.json                          # TypeScript app config
├── tsconfig.spec.json                         # TypeScript test config
├── LICENSE                                    # MIT License
└── README.md                                  # This file
```

---

## 📂 Files Explanation

### 🔹 Core Services

| File | Purpose |
|------|---------|
| `storage.service.ts` | LocalStorage wrapper with **user-scoped keys** for data isolation |
| `auth.service.ts` | Register, login, logout, session management |
| `expense.service.ts` | Expense CRUD operations with signals |
| `income.service.ts` | Income CRUD operations with signals |
| `transaction.service.ts` | Combines expenses + incomes using `computed()` |
| `category.service.ts` | Category CRUD with default categories |
| `budget.service.ts` | Budget tracking with progress calculation |
| `savings.service.ts` | Savings goals with add-savings action |
| `notification.service.ts` | In-app notifications |
| `dashboard.service.ts` | Aggregated stats (balance, monthly, category-wise) |
| `settings.service.ts` | Theme, currency, notification preferences |
| `demo-data.service.ts` | Loads 100+ sample records for testing |
| `toast.service.ts` | Success/error/info toast messages |

### 🔹 Models

| File | Contains |
|------|----------|
| `user.model.ts` | `User`, `AuthSession` |
| `transaction.model.ts` | `Transaction`, `PaymentMethod`, `TransactionType` |
| `expense.model.ts` | `Expense`, `EXPENSE_CATEGORIES` |
| `income.model.ts` | `Income`, `INCOME_CATEGORIES` |
| `category.model.ts` | `Category` |
| `budget.model.ts` | `Budget`, `BudgetView` |
| `savings-goal.model.ts` | `SavingsGoal` |
| `notification.model.ts` | `AppNotification` |
| `settings.model.ts` | `AppSettings`, `Currency`, `Theme`, `CURRENCY_SYMBOLS` |

### 🔹 Shared Folder — Components

| Component | Purpose |
|-----------|---------|
| `empty-state` | Professional "no data" UI |
| `loading` | Spinner component |
| `logo` | SVG wallet logo (in navbar & sidebar) |
| `modal` | Confirmation dialogs (delete, etc.) |
| `navbar` | Top navigation with user menu |
| `notification-dropdown` | Bell icon with unread counter |
| `sidebar` | Left navigation with sections |
| `stat-card` | Dashboard metrics with animation |
| `toast-container` | Global toast notifications |

### 🔹 Shared Folder — Pipes

| Pipe | Purpose |
|------|---------|
| `currency-format.pipe.ts` | Formats numbers as currency (e.g., `Rs 1,000.00`) based on user's currency setting |

### 🔹 Guards

| Guard | Purpose |
|-------|---------|
| `auth.guard.ts` | Redirects unauthenticated users to `/login` |
| `guest.guard.ts` | Redirects authenticated users to `/dashboard` |

### 🔹 Layouts

| Layout | Purpose |
|--------|---------|
| `auth-layout` | Split-screen layout for Login/Register with branding |
| `main-layout` | Main app shell with fixed sidebar + sticky navbar |

### 🔹 Pages

| Page | Route | Description |
|------|-------|-------------|
| Login | `/login` | User login form |
| Register | `/register` | New user registration |
| Dashboard | `/dashboard` | Stats + 4 charts + recent transactions |
| Transactions | `/transactions` | Unified income/expense list with filters |
| Expenses | `/expenses` | Expense CRUD |
| Income | `/income` | Income CRUD |
| Categories | `/categories` | Category management with images |
| Budgets | `/budgets` | Budget tracking with progress bars |
| Savings | `/savings` | Savings goals management |
| Reports | `/reports` | Monthly/Annual/Category reports |
| Profile | `/profile` | User profile + picture upload |
| Settings | `/settings` | App settings + demo data |

---

## 📦 Prerequisites

- **Node.js** (v18+) — [Download](https://nodejs.org/)
- **Angular CLI** (v18+):
  ```bash
  npm install -g @angular/cli
  ```
- **Git** — [Download](https://git-scm.com/)

### Verify

```bash
node --version     # v18.x or higher
npm --version      # 9.x or higher
ng version         # Angular CLI 18+
```

---

## 🚀 Installation & Setup

### Step 1: Clone the Repository

```bash
git clone https://github.com/syedmuhammadsaim/expense-tracker.git
cd expense-tracker
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Run Development Server

```bash
ng serve
```

Open **http://localhost:4200** in your browser.

### Step 4: First Time Use

1. **Register** → Name, Email, Password (min 6 chars)
2. **Login**
3. **Settings** → **"🎲 Load 100+ Demo Items"** (optional)
4. **Dashboard** shows charts and stats!

---

## 🏗 Building the Application

### Development Build

```bash
ng build
```

### Production Build

```bash
ng build --configuration production
```

**Output:** `dist/expense-tracker/browser/`

---

## 🎲 Demo Data

App includes a **demo data generator**:

| Type | Count | Description |
|------|-------|-------------|
| **Expenses** | 60 | Random categories, amounts |
| **Incomes** | 25 | Salary, Freelancing, Business |
| **Budgets** | 8 | Monthly budgets |
| **Savings Goals** | 6 | Realistic goals |
| **Categories** | 14 | Auto-created with emojis |

**Load via:** Settings → **"🎲 Load 100+ Demo Items"**

---

## 💾 Data Storage

All data stored in **browser LocalStorage** with user-scoped keys:

```
et_users_u_<userId>          → User profile
et_expenses_u_<userId>       → Expenses
et_incomes_u_<userId>        → Income records
et_budgets_u_<userId>        → Budgets
et_savings_u_<userId>        → Savings goals
et_categories_u_<userId>     → Categories
et_settings_u_<userId>       → Settings
et_notifications_u_<userId>  → Notifications
```

**Benefits:**
- 🔒 Complete privacy per user
- 💾 Data survives browser refresh
- 🌐 Works offline
- 🚀 No backend needed

---

## 🎨 Theme Customization

App uses **CSS variables** in `src/styles.css`:

```css
:root {
  --bg: #f5f7fb;
  --surface: #ffffff;
  --text: #0f172a;
  --text-muted: #64748b;
  --border: #e2e8f0;
  --primary: #4f46e5;
  --primary-soft: #eef2ff;
  --sidebar-bg: #111827;
  --sidebar-text: #e5e7eb;
}

[data-theme='dark'] {
  --bg: #0b1220;
  --surface: #131c2e;
  --text: #f1f5f9;
  --primary: #818cf8;
  /* ... */
}
```

Change any variable to customize the entire app's look instantly.

---

## 📱 Browser Support

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

---

## 📄 License

MIT License — see [LICENSE](LICENSE) file.

---

## 👨‍💻 Author

**Syed Muhammad Saim**

- 📧 Email: [codewithsaim2025@gmail.com](mailto:codewithsaim2025@gmail.com)
- 💼 GitHub: [@syedmuhammadsaim](https://github.com/syedmuhammadsaim)

---

## 🙏 Acknowledgements

- [Angular Team](https://angular.io/)
- [Chart.js](https://www.chartjs.org/)
- [Google Fonts — Inter](https://fonts.google.com/specimen/Inter)
- [Picsum Photos](https://picsum.photos/) — Placeholder images

---

## ⭐ Show Your Support

If you liked this project, please give it a ⭐ on GitHub!

---

**Built with ❤️ using Angular + TypeScript**
