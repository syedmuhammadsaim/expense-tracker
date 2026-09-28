# 💸 Expense Tracker

A **complete, professional and fully responsive Expense Tracker Web Application** built with **Angular 18+** and **TypeScript**. Track your income, expenses, budgets, savings, and financial reports — all in one place with a modern SaaS-style dashboard.

![Angular](https://img.shields.io/badge/Angular-18+-DD0031?style=for-the-badge&logo=angular)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?style=for-the-badge&logo=typescript)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)
![Netlify](https://img.shields.io/badge/Deployed-Netlify-00C7B7?style=for-the-badge&logo=netlify)

---

## 🌐 Live Demo

🔗 **Live Website:** **[https://luminous-beignet-e301ea.netlify.app](https://luminous-beignet-e301ea.netlify.app/login)**

**Try it now:**
1. Click the link above
2. **Register** a new account
3. **Login** with your credentials
4. Go to **Settings** → **"🎲 Load 100+ Demo Items"**
5. Explore the **Dashboard** with charts!

> **Note:** Each user gets their own private data (stored in browser LocalStorage). No backend required.

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Folder Structure](#-folder-structure)
- [Prerequisites](#-prerequisites)
- [Installation & Setup](#-installation--setup)
- [Building the Application](#-building-the-application)
- [Deploying to Netlify](#-deploying-to-netlify)
- [Demo Data](#-demo-data)
- [Data Storage](#-data-storage)
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
| **Netlify** | Hosting |

**No backend required** — Everything runs in the browser with LocalStorage persistence.

---

## 📁 Folder Structure

```
expense-tracker/
├── src/
│   ├── app/
│   │   ├── core/
│   │   │   ├── guards/               # Auth & Guest guards
│   │   │   ├── models/               # TypeScript interfaces
│   │   │   └── services/             # Business logic services
│   │   ├── shared/
│   │   │   └── components/           # Reusable components
│   │   ├── layouts/
│   │   │   ├── auth-layout/
│   │   │   └── main-layout/
│   │   ├── pages/
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   ├── dashboard/
│   │   │   ├── transactions/
│   │   │   ├── expenses/
│   │   │   ├── income/
│   │   │   ├── categories/
│   │   │   ├── budgets/
│   │   │   ├── savings/
│   │   │   ├── reports/
│   │   │   ├── profile/
│   │   │   └── settings/
│   │   ├── app.ts
│   │   ├── app.config.ts
│   │   └── app.routes.ts
│   ├── styles.css
│   ├── index.html
│   └── main.ts
├── public/
├── angular.json
├── package.json
├── tsconfig.json
├── LICENSE
└── README.md
```

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

### Production Build

```bash
ng build --configuration production
```

**Output:** `dist/expense-tracker/browser/`

### Add `.htaccess` (for Apache hosting)

`browser` folder mein **`.htaccess`** file banayein:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

---

## 🌐 Deploying to Netlify

### Method A: Drag & Drop (Easiest)

1. Build: `ng build --configuration production`
2. Open: [https://app.netlify.com/drop](https://app.netlify.com/drop)
3. Drag the `dist/expense-tracker/browser` folder
4. Netlify generates a live URL instantly

### Method B: Netlify Account (Recommended)

1. Sign up at [netlify.com](https://netlify.com)
2. **Add new site** → **Deploy manually**
3. Drag `browser` folder
4. Site settings → **Change site name**
5. Live URL: `https://your-name.netlify.app`

### ⚠️ Fix 404 on Refresh

`public` folder mein **`_redirects`** file banayein (no extension):

```
/*    /index.html   200
```

Phir rebuild aur redeploy karein.

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

## 📱 Browser Support

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Mobile browsers

---

## 📄 License

MIT License — see [LICENSE](LICENSE) file.

---

## 👨‍💻 Author

**Syed Muhammad Saim**

- 📧 Email: [codewithsaim2025@gmail.com](mailto:codewithsaim2025@gmail.com)
- 🌐 Live Demo: [luminous-beignet-e301ea.netlify.app](https://luminous-beignet-e301ea.netlify.app/login)
- 💼 GitHub: [@syedmuhammadsaim](https://github.com/syedmuhammadsaim)

---

## 🙏 Acknowledgements

- [Angular Team](https://angular.io/)
- [Chart.js](https://www.chartjs.org/)
- [Google Fonts — Inter](https://fonts.google.com/specimen/Inter)
- [Netlify](https://www.netlify.com/) — Hosting
- [Picsum Photos](https://picsum.photos/) — Placeholder images

---

## ⭐ Show Your Support

If you liked this project, please give it a ⭐ on GitHub!

---

**Built with ❤️ using Angular + TypeScript**
