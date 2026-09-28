import { Component, Input, OnChanges, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="stat-card" [ngClass]="variant">
      <div class="stat-icon">{{ icon }}</div>
      <div class="stat-info">
        <span class="stat-label">{{ label }}</span>
        <span class="stat-value">{{ displayValue() }}</span>
      </div>
    </div>
  `,
  styles: [
    `
      .stat-card {
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: 16px;
        padding: 20px;
        display: flex;
        align-items: center;
        gap: 16px;
        transition: transform 0.18s ease, box-shadow 0.18s ease;
        min-width: 0;
      }
      .stat-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
      }
      .stat-icon {
        width: 48px;
        height: 48px;
        display: grid;
        place-items: center;
        font-size: 1.5rem;
        border-radius: 12px;
        background: var(--primary-soft);
        flex-shrink: 0;
      }
      .stat-info {
        display: flex;
        flex-direction: column;
        gap: 4px;
        min-width: 0;
        flex: 1;
      }
      .stat-label {
        font-size: 0.85rem;
        color: var(--text-muted);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .stat-value {
        font-size: 1.35rem;
        font-weight: 700;
        color: var(--text);
        word-break: break-word;
        line-height: 1.2;
      }
      .stat-card.income .stat-icon { background: #dcfce7; }
      .stat-card.expense .stat-icon { background: #fee2e2; }
      .stat-card.savings .stat-icon { background: #e0e7ff; }
      .stat-card.balance .stat-icon { background: #fef3c7; }

      /* ===== Tablet ===== */
      @media (max-width: 900px) {
        .stat-card { padding: 16px; gap: 14px; }
        .stat-icon { width: 44px; height: 44px; font-size: 1.3rem; }
        .stat-value { font-size: 1.2rem; }
      }

      /* ===== Mobile ===== */
      @media (max-width: 640px) {
        .stat-card {
          padding: 14px;
          gap: 12px;
          border-radius: 12px;
        }
        .stat-icon {
          width: 40px;
          height: 40px;
          font-size: 1.15rem;
          border-radius: 10px;
        }
        .stat-label { font-size: 0.78rem; }
        .stat-value { font-size: 1.05rem; }
      }

      /* ===== Small mobile ===== */
      @media (max-width: 380px) {
        .stat-card { padding: 12px; gap: 10px; }
        .stat-icon { width: 36px; height: 36px; font-size: 1rem; }
        .stat-value { font-size: 0.95rem; }
      }
    `,
  ],
})
export class StatCardComponent implements OnChanges {
  @Input() icon = '💰';
  @Input() label = '';
  @Input() value = 0;
  @Input() prefix = '$';
  @Input() variant: 'default' | 'income' | 'expense' | 'savings' | 'balance' = 'default';

  displayValue = signal('0');
  private animId: number | null = null;

  ngOnChanges(): void {
    this.animate();
  }

  private animate(): void {
    const target = this.value || 0;
    const duration = 600;
    const start = performance.now();
    const startValue = 0;

    if (this.animId) cancelAnimationFrame(this.animId);

    const step = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      const current = startValue + (target - startValue) * eased;

      this.displayValue.set(
        `${this.prefix}${current.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`
      );

      if (t < 1) this.animId = requestAnimationFrame(step);
    };

    this.animId = requestAnimationFrame(step);
  }
}