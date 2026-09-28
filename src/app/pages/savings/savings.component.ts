import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormsModule,
  FormBuilder,
  Validators,
} from '@angular/forms';
import { SavingsService } from '../../core/services/savings.service';
import { SettingsService } from '../../core/services/settings.service';
import { ToastService } from '../../core/services/toast.service';
import { NotificationService } from '../../core/services/notification.service';
import { SavingsGoal } from '../../core/models/savings-goal.model';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';

@Component({
  selector: 'app-savings',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    EmptyStateComponent,
    ModalComponent,
  ],
  template: `
    <div class="page">
      <div class="page-head">
        <div>
          <h1>Savings Goals</h1>
          <p class="muted">{{ goals().length }} goals</p>
        </div>
        <button class="btn btn-primary" (click)="openForm()">+ New Goal</button>
      </div>

      <div *ngIf="goals().length; else empty" class="grid">
        <div class="goal-card" *ngFor="let g of goals()">
          <header>
            <h3>{{ g.name }}</h3>
            <span class="pct">{{ percent(g).toFixed(0) }}%</span>
          </header>
          <p class="desc" *ngIf="g.description">{{ g.description }}</p>

          <div class="amounts">
            <div class="amt-box">
              <small>Target</small>
              <strong>{{ settings.formatAmount(g.targetAmount) }}</strong>
            </div>
            <div class="amt-box">
              <small>Saved</small>
              <strong class="income">{{ settings.formatAmount(g.currentAmount) }}</strong>
            </div>
            <div class="amt-box">
              <small>Remaining</small>
              <strong>{{ settings.formatAmount(remaining(g)) }}</strong>
            </div>
          </div>

          <div class="progress">
            <div class="bar" [style.width.%]="Math.min(percent(g), 100)"></div>
          </div>
          <p class="target-date">Target: {{ g.targetDate | date: 'mediumDate' }}</p>

          <div class="actions">
            <button class="btn btn-primary" (click)="openAddSavings(g)">
              + Add Savings
            </button>
            <button class="btn btn-ghost" (click)="edit(g)">Edit</button>
            <button class="btn btn-danger" (click)="confirmDelete(g)">Delete</button>
          </div>
        </div>
      </div>

      <ng-template #empty>
        <div class="card">
          <app-empty-state
            icon="🏦"
            title="No savings goals created"
            description="Set a goal and start saving."
            actionLabel="Create Goal"
            (action)="openForm()"
          ></app-empty-state>
        </div>
      </ng-template>
    </div>

    <!-- FORM MODAL -->
    <app-modal
      *ngIf="showForm()"
      [title]="editingId() ? 'Edit Goal' : 'New Savings Goal'"
      [showFooter]="false"
      (close)="closeForm()"
    >
      <form [formGroup]="form" (ngSubmit)="save()" class="form-grid">
        <div class="field">
          <label>Goal Name *</label>
          <input formControlName="name" placeholder="e.g., Gaming Laptop" />
          <small class="error" *ngIf="showError('name')">Name is required.</small>
        </div>
        <div class="field">
          <label>Target Amount *</label>
          <input type="number" formControlName="targetAmount" min="1" />
          <small class="error" *ngIf="showError('targetAmount')">Must be > 0.</small>
        </div>
        <div class="field">
          <label>Current Amount</label>
          <input type="number" formControlName="currentAmount" min="0" />
        </div>
        <div class="field">
          <label>Target Date *</label>
          <input type="date" formControlName="targetDate" />
        </div>
        <div class="field full">
          <label>Description</label>
          <textarea formControlName="description" rows="2"></textarea>
        </div>
        <div class="field full actions">
          <button type="button" class="btn btn-ghost" (click)="closeForm()">
            Cancel
          </button>
          <button type="submit" class="btn btn-primary">
            {{ editingId() ? 'Update' : 'Save' }}
          </button>
        </div>
      </form>
    </app-modal>

    <!-- ADD SAVINGS MODAL -->
    <app-modal
      *ngIf="addSavingsTarget()"
      title="Add Savings"
      [showFooter]="false"
      (close)="addSavingsTarget.set(null)"
    >
      <div class="field">
        <label>Amount to add</label>
        <input type="number" [(ngModel)]="addAmount" min="0.01" />
      </div>
      <div class="actions-row">
        <button class="btn btn-ghost" (click)="addSavingsTarget.set(null)">
          Cancel
        </button>
        <button class="btn btn-primary" (click)="doAddSavings()">Add</button>
      </div>
    </app-modal>

    <!-- DELETE MODAL -->
    <app-modal
      *ngIf="deleteTarget()"
      title="Delete Goal"
      (close)="deleteTarget.set(null)"
      (confirm)="doDelete()"
    >
      Are you sure you want to delete "{{ deleteTarget()?.name }}"?
    </app-modal>
  `,
  styles: [
    `
      .page { display: flex; flex-direction: column; gap: 16px; }
      .page-head { display: flex; justify-content: space-between; align-items: center; }
      .page-head h1 { margin: 0; font-size: 1.4rem; color: var(--text); }
      .muted { color: var(--text-muted); margin: 4px 0 0; font-size: 0.88rem; }
      .card {
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: 16px;
        padding: 16px;
      }
      .grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
        gap: 14px;
      }
      .goal-card {
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: 16px;
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 10px;
        min-width: 0;
      }
      header { display: flex; justify-content: space-between; align-items: baseline; gap: 8px; }
      header h3 {
        margin: 0;
        font-size: 1rem;
        color: var(--text);
        word-break: break-word;
        min-width: 0;
      }
      .pct { font-weight: 700; color: var(--primary); flex-shrink: 0; }
      .desc {
        font-size: 0.82rem;
        color: var(--text-muted);
        margin: 0;
        word-break: break-word;
      }

      /* ============ AMOUNTS — fixed layout ============ */
      .amounts {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 8px;
        width: 100%;
      }
      .amt-box {
        background: var(--bg);
        border-radius: 10px;
        padding: 8px;
        min-width: 0;
        overflow: hidden;
      }
      .amt-box small {
        display: block;
        font-size: 0.68rem;
        color: var(--text-muted);
        text-transform: uppercase;
        letter-spacing: 0.03em;
        margin-bottom: 3px;
      }
      .amt-box strong {
        display: block;
        font-size: 0.82rem;
        color: var(--text);
        font-variant-numeric: tabular-nums;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .amt-box .income { color: #16a34a; }

      .progress {
        height: 8px;
        background: var(--border);
        border-radius: 999px;
        overflow: hidden;
      }
      .bar {
        height: 100%;
        background: var(--primary);
        border-radius: 999px;
        transition: width 0.3s;
      }
      .target-date {
        font-size: 0.78rem;
        color: var(--text-muted);
        margin: 0;
      }
      .actions {
        display: flex;
        gap: 6px;
        flex-wrap: wrap;
        justify-content: flex-end;
        margin-top: 4px;
      }
      .actions .btn {
        padding: 7px 12px;
        font-size: 0.82rem;
      }

      /* ============ FORM ============ */
      .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
      .field { display: flex; flex-direction: column; gap: 6px; }
      .field.full { grid-column: 1 / -1; }
      .field label { font-size: 0.85rem; color: var(--text); }
      .field input, .field textarea {
        padding: 9px 12px;
        border: 1px solid var(--border);
        border-radius: 10px;
        background: var(--surface);
        color: var(--text);
        font-family: inherit;
      }
      .error { color: #dc2626; font-size: 0.78rem; }
      .form-grid .actions {
        grid-column: 1 / -1;
        flex-direction: row;
        justify-content: flex-end;
      }
      .actions-row {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
        margin-top: 16px;
      }

      /* ============ MOBILE ============ */
      @media (max-width: 600px) {
        .grid { grid-template-columns: 1fr; }
        .form-grid { grid-template-columns: 1fr; }
        .amounts { grid-template-columns: 1fr 1fr 1fr; gap: 6px; }
        .amt-box { padding: 6px; }
        .amt-box strong { font-size: 0.75rem; }
        .actions .btn {
          flex: 1;
          justify-content: center;
        }
      }
    `,
  ],
})
export class SavingsComponent {
  private savingsService = inject(SavingsService);
  private fb = inject(FormBuilder);
  private toast = inject(ToastService);
  private notif = inject(NotificationService);
  settings = inject(SettingsService);
  Math = Math;

  goals = this.savingsService.goals;

  showForm = signal(false);
  editingId = signal<string | null>(null);
  deleteTarget = signal<SavingsGoal | null>(null);
  addSavingsTarget = signal<SavingsGoal | null>(null);
  addAmount = 0;

  form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    targetAmount: [0, [Validators.required, Validators.min(1)]],
    currentAmount: [0, [Validators.min(0)]],
    targetDate: ['', Validators.required],
    description: [''],
  });

  percent(g: SavingsGoal): number {
    return g.targetAmount > 0 ? (g.currentAmount / g.targetAmount) * 100 : 0;
  }

  remaining(g: SavingsGoal): number {
    return Math.max(g.targetAmount - g.currentAmount, 0);
  }

  openForm(): void {
    this.editingId.set(null);
    this.form.reset({
      name: '',
      targetAmount: 0,
      currentAmount: 0,
      targetDate: '',
      description: '',
    });
    this.showForm.set(true);
  }

  edit(g: SavingsGoal): void {
    this.editingId.set(g.id);
    this.form.reset({
      name: g.name,
      targetAmount: g.targetAmount,
      currentAmount: g.currentAmount,
      targetDate: g.targetDate.slice(0, 10),
      description: g.description ?? '',
    });
    this.showForm.set(true);
  }

  closeForm(): void {
    this.showForm.set(false);
    this.editingId.set(null);
  }

  showError(name: string): boolean {
    const c = this.form.get(name);
    return !!c && c.touched && c.invalid;
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const raw = this.form.getRawValue();
    const id = this.editingId();
    if (id) {
      this.savingsService.update(id, raw);
      this.toast.success('Goal updated.');
    } else {
      this.savingsService.add(raw);
      this.toast.success('Goal created.');
      this.notif.push('Savings goal created', `${raw.name}`, 'info');
    }
    this.closeForm();
  }

  openAddSavings(g: SavingsGoal): void {
    this.addAmount = 0;
    this.addSavingsTarget.set(g);
  }

  doAddSavings(): void {
    const g = this.addSavingsTarget();
    if (!g) return;
    if (!this.addAmount || this.addAmount <= 0) {
      this.toast.error('Enter a valid amount.');
      return;
    }
    this.savingsService.addSavings(g.id, this.addAmount);
    const updated = this.savingsService.goals().find((x) => x.id === g.id);
    if (updated && this.percent(updated) >= 60 && this.percent(updated) < 61) {
      this.notif.push('Savings progress!', `${updated.name} reached 60%.`, 'success');
    }
    this.toast.success('Savings added.');
    this.addSavingsTarget.set(null);
  }

  confirmDelete(g: SavingsGoal): void {
    this.deleteTarget.set(g);
  }

  doDelete(): void {
    const g = this.deleteTarget();
    if (!g) return;
    this.savingsService.delete(g.id);
    this.toast.success('Goal deleted.');
    this.deleteTarget.set(null);
  }
}