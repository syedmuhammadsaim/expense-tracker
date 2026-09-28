import {
  Component,
  inject,
  computed,
  AfterViewInit,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { StatCardComponent } from '../../shared/components/stat-card/stat-card.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { DashboardService } from '../../core/services/dashboard.service';
import { TransactionService } from '../../core/services/transaction.service';
import { SettingsService } from '../../core/services/settings.service';

declare const Chart: any;

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, StatCardComponent, EmptyStateComponent],
  template: `
    <div class="dashboard">
      <!-- ===== Page head ===== -->
      <div class="page-head">
        <div>
          <h1>Dashboard</h1>
          <p class="muted">Overview of your finances</p>
        </div>
      </div>

      <!-- ===== Stat Cards ===== -->
      <div class="stats-grid">
        <app-stat-card
          icon="💼"
          label="Total Balance"
          [value]="dash.totalBalance()"
          [prefix]="settings.currencySymbol()"
          variant="balance"
        ></app-stat-card>

        <app-stat-card
          icon="💵"
          label="Total Income"
          [value]="dash.totalIncome()"
          [prefix]="settings.currencySymbol()"
          variant="income"
        ></app-stat-card>

        <app-stat-card
          icon="💳"
          label="Total Expenses"
          [value]="dash.totalExpense()"
          [prefix]="settings.currencySymbol()"
          variant="expense"
        ></app-stat-card>

        <app-stat-card
          icon="🏦"
          label="Total Savings"
          [value]="dash.totalSavings()"
          [prefix]="settings.currencySymbol()"
          variant="savings"
        ></app-stat-card>

        <app-stat-card
          icon="📅"
          label="Monthly Income"
          [value]="dash.monthlyIncome()"
          [prefix]="settings.currencySymbol()"
          variant="income"
        ></app-stat-card>

        <app-stat-card
          icon="📉"
          label="Monthly Expenses"
          [value]="dash.monthlyExpense()"
          [prefix]="settings.currencySymbol()"
          variant="expense"
        ></app-stat-card>
      </div>

      <!-- ===== Charts ===== -->
      <div class="charts-grid">
        <div class="card">
          <h3>Income vs Expense (6 months)</h3>
          <div class="chart-wrap">
            <canvas id="barChart"></canvas>
          </div>
        </div>

        <div class="card">
          <h3>Monthly Expenses</h3>
          <div class="chart-wrap">
            <canvas id="lineChart"></canvas>
          </div>
        </div>

        <div class="card">
          <h3>Expenses by Category</h3>
          <div class="chart-wrap">
            <canvas id="doughnutChart"></canvas>
          </div>
        </div>

        <div class="card">
          <h3>Monthly Savings</h3>
          <div class="chart-wrap">
            <canvas id="areaChart"></canvas>
          </div>
        </div>
      </div>

      <!-- ===== Recent Transactions ===== -->
      <div class="card">
        <div class="card-head">
          <h3>Recent Transactions</h3>
          <button class="btn btn-ghost" (click)="goAll()">View All</button>
        </div>

        <div class="table-wrap" *ngIf="recent().length; else empty">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Title</th>
                <th>Category</th>
                <th>Type</th>
                <th class="right">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let t of recent()">
                <td>{{ t.date | date: 'mediumDate' }}</td>
                <td>{{ t.title }}</td>
                <td>{{ t.category }}</td>
                <td>
                  <span class="pill" [ngClass]="t.type">{{ t.type }}</span>
                </td>
                <td
                  class="right"
                  [ngClass]="t.type === 'income' ? 'income-text' : 'expense-text'"
                >
                  {{ t.type === 'income' ? '+' : '-' }}{{ settings.formatAmount(t.amount) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <ng-template #empty>
          <app-empty-state
            icon="🧾"
            title="No transactions yet"
            description="Start by adding your first income or expense."
            actionLabel="Add Transaction"
            (action)="goAll()"
          ></app-empty-state>
        </ng-template>
      </div>
    </div>
  `,
  styles: [
    `
      /* ============================================================
         DASHBOARD CONTAINER
         ============================================================ */
      .dashboard {
        display: flex;
        flex-direction: column;
        gap: 20px;
        width: 100%;
        min-width: 0;
      }

      /* ============================================================
         PAGE HEAD
         ============================================================ */
      .page-head {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 12px;
        flex-wrap: wrap;
      }
      .page-head h1 {
        margin: 0;
        font-size: 1.4rem;
        color: var(--text);
        font-weight: 700;
      }
      .muted {
        color: var(--text-muted);
        margin: 4px 0 0;
        font-size: 0.88rem;
      }

      /* ============================================================
         STAT CARDS GRID
         ============================================================ */
      .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        gap: 16px;
        width: 100%;
      }

      /* ============================================================
         CHARTS GRID
         ============================================================ */
      .charts-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
        gap: 16px;
        width: 100%;
      }

      /* ============================================================
         CARD
         ============================================================ */
      .card {
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: 16px;
        padding: 18px;
        width: 100%;
        min-width: 0;
        overflow: hidden;
      }
      .card h3 {
        margin: 0 0 12px;
        font-size: 1rem;
        color: var(--text);
        font-weight: 600;
      }

      .card-head {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
        flex-wrap: wrap;
        gap: 10px;
      }
      .card-head h3 {
        margin: 0;
      }

      /* ============================================================
         CHART WRAPPER (prevents canvas overflow)
         ============================================================ */
      .chart-wrap {
        position: relative;
        width: 100%;
        height: 240px;
        overflow: hidden;
      }
      .chart-wrap canvas {
        display: block;
        max-width: 100%;
        max-height: 100%;
      }

      /* ============================================================
         TABLE
         ============================================================ */
      .table-wrap {
        width: 100%;
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        font-size: 0.9rem;
      }
      th,
      td {
        padding: 10px 8px;
        text-align: left;
        border-bottom: 1px solid var(--border);
        color: var(--text);
        white-space: nowrap;
      }
      th {
        color: var(--text-muted);
        font-weight: 500;
        font-size: 0.82rem;
        text-transform: uppercase;
        letter-spacing: 0.03em;
      }
      .right {
        text-align: right;
      }

      /* ============================================================
         PILLS & COLORS
         ============================================================ */
      .pill {
        display: inline-block;
        padding: 3px 10px;
        border-radius: 999px;
        font-size: 0.75rem;
        text-transform: capitalize;
        font-weight: 500;
      }
      .pill.income {
        background: #dcfce7;
        color: #166534;
      }
      .pill.expense {
        background: #fee2e2;
        color: #991b1b;
      }
      .income-text {
        color: #16a34a;
        font-weight: 600;
      }
      .expense-text {
        color: #dc2626;
        font-weight: 600;
      }

      /* ============================================================
         RESPONSIVE — TABLET (<= 900px)
         ============================================================ */
      @media (max-width: 900px) {
        .dashboard {
          gap: 16px;
        }
        .stats-grid {
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 12px;
        }
        .charts-grid {
          grid-template-columns: 1fr;
          gap: 12px;
        }
        .chart-wrap {
          height: 220px;
        }
        .card {
          padding: 14px;
        }
      }

      /* ============================================================
         RESPONSIVE — MOBILE (<= 600px)
         ============================================================ */
      @media (max-width: 600px) {
        .dashboard {
          gap: 14px;
        }
        .page-head {
          flex-direction: column;
          align-items: flex-start;
        }
        .page-head h1 {
          font-size: 1.2rem;
        }
        .stats-grid {
          grid-template-columns: 1fr;
          gap: 10px;
        }
        .charts-grid {
          grid-template-columns: 1fr;
          gap: 10px;
        }
        .chart-wrap {
          height: 200px;
        }
        .card {
          padding: 12px;
          border-radius: 12px;
        }
        .card h3 {
          font-size: 0.92rem;
        }
        table {
          min-width: 640px;
        }
        th,
        td {
          padding: 8px 6px;
          font-size: 0.82rem;
        }
      }

      /* ============================================================
         RESPONSIVE — SMALL MOBILE (<= 380px)
         ============================================================ */
      @media (max-width: 380px) {
        .chart-wrap {
          height: 180px;
        }
        .card {
          padding: 10px;
        }
      }
    `,
  ],
})
export class DashboardComponent implements AfterViewInit, OnDestroy {
  dash = inject(DashboardService);
  txService = inject(TransactionService);
  settings = inject(SettingsService);
  private router = inject(Router);

  recent = computed(() => this.txService.transactions().slice(0, 6));

  private charts: any[] = [];
  private resizeTimer: any;

  ngAfterViewInit(): void {
    // Wait for canvas to be available in DOM
    setTimeout(() => this.renderCharts(), 150);
    window.addEventListener('resize', this.handleResize);
  }

  ngOnDestroy(): void {
    window.removeEventListener('resize', this.handleResize);
    if (this.resizeTimer) clearTimeout(this.resizeTimer);
    this.destroyCharts();
  }

  private handleResize = (): void => {
    if (this.resizeTimer) clearTimeout(this.resizeTimer);
    this.resizeTimer = setTimeout(() => {
      this.charts.forEach((c) => {
        try {
          c?.resize?.();
        } catch {}
      });
    }, 200);
  };

  private renderCharts(): void {
    if (typeof Chart === 'undefined') {
      console.warn('Chart.js not loaded — skipping charts.');
      return;
    }

    const c1 = document.getElementById('barChart') as HTMLCanvasElement | null;
    const c2 = document.getElementById('lineChart') as HTMLCanvasElement | null;
    const c3 = document.getElementById('doughnutChart') as HTMLCanvasElement | null;
    const c4 = document.getElementById('areaChart') as HTMLCanvasElement | null;

    if (!c1 || !c2 || !c3 || !c4) {
      console.warn('Chart canvases not found');
      return;
    }

    const textColor = this.getCssVar('--text') || '#0f172a';
    const gridColor = 'rgba(148, 163, 184, 0.15)';

    const trend = this.dash.monthlyTrend();
    const labels = trend.map((t) => t.month);

    this.destroyCharts();

    try {
      // ===== BAR CHART =====
      this.charts.push(
        new Chart(c1, {
          type: 'bar',
          data: {
            labels,
            datasets: [
              {
                label: 'Income',
                data: trend.map((t) => t.income),
                backgroundColor: '#22c55e',
                borderRadius: 6,
                maxBarThickness: 32,
              },
              {
                label: 'Expense',
                data: trend.map((t) => t.expense),
                backgroundColor: '#ef4444',
                borderRadius: 6,
                maxBarThickness: 32,
              },
            ],
          },
          options: this.baseOptions(textColor, gridColor),
        })
      );

      // ===== LINE CHART =====
      this.charts.push(
        new Chart(c2, {
          type: 'line',
          data: {
            labels,
            datasets: [
              {
                label: 'Expenses',
                data: trend.map((t) => t.expense),
                borderColor: '#6366f1',
                backgroundColor: 'rgba(99, 102, 241, 0.15)',
                tension: 0.35,
                fill: true,
                pointRadius: 4,
                pointBackgroundColor: '#6366f1',
              },
            ],
          },
          options: this.baseOptions(textColor, gridColor),
        })
      );

      // ===== DOUGHNUT CHART =====
      const cat = this.dash.expenseByCategory();
      const palette = [
        '#6366f1', '#22c55e', '#ef4444', '#f59e0b',
        '#06b6d4', '#a855f7', '#ec4899', '#14b8a6',
      ];

      this.charts.push(
        new Chart(c3, {
          type: 'doughnut',
          data: {
            labels: cat.length ? cat.map((c) => c.category) : ['No data'],
            datasets: [
              {
                data: cat.length ? cat.map((c) => c.amount) : [1],
                backgroundColor: cat.length
                  ? cat.map((_, i) => palette[i % palette.length])
                  : ['#334155'],
                borderWidth: 0,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '65%',
            plugins: {
              legend: {
                position: 'bottom',
                labels: {
                  color: textColor,
                  padding: 12,
                  font: { size: 11 },
                  boxWidth: 12,
                },
              },
            },
          },
        })
      );

      // ===== AREA CHART =====
      this.charts.push(
        new Chart(c4, {
          type: 'line',
          data: {
            labels,
            datasets: [
              {
                label: 'Savings',
                data: trend.map((t) => t.savings),
                borderColor: '#f59e0b',
                backgroundColor: 'rgba(245, 158, 11, 0.2)',
                tension: 0.35,
                fill: true,
                pointRadius: 4,
                pointBackgroundColor: '#f59e0b',
              },
            ],
          },
          options: this.baseOptions(textColor, gridColor),
        })
      );
    } catch (e) {
      console.warn('Chart render error:', e);
    }
  }

  private baseOptions(textColor: string, gridColor: string): any {
    return {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        intersect: false,
        mode: 'index',
      },
      plugins: {
        legend: {
          labels: {
            color: textColor,
            padding: 12,
            font: { size: 11 },
            boxWidth: 12,
          },
        },
        tooltip: {
          backgroundColor: 'rgba(15, 23, 42, 0.9)',
          titleColor: '#fff',
          bodyColor: '#e2e8f0',
          padding: 10,
          cornerRadius: 8,
        },
      },
      scales: {
        x: {
          ticks: { color: textColor, font: { size: 11 } },
          grid: { color: gridColor, drawBorder: false },
        },
        y: {
          beginAtZero: true,
          ticks: { color: textColor, font: { size: 11 } },
          grid: { color: gridColor, drawBorder: false },
        },
      },
    };
  }

  private getCssVar(name: string): string {
    return getComputedStyle(document.documentElement)
      .getPropertyValue(name)
      .trim();
  }

  private destroyCharts(): void {
    this.charts.forEach((c) => {
      try {
        c?.destroy?.();
      } catch {}
    });
    this.charts = [];
  }

  goAll(): void {
    this.router.navigate(['/transactions']);
  }
}