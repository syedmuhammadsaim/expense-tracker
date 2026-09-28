import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="empty">
      <div class="empty-icon">{{ icon }}</div>
      <h3>{{ title }}</h3>
      <p>{{ description }}</p>
      <button *ngIf="actionLabel" class="btn btn-primary" (click)="action.emit()">
        {{ actionLabel }}
      </button>
    </div>
  `,
  styles: [
    `
      .empty {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        padding: 60px 20px;
        color: var(--text-muted);
      }
      .empty-icon { font-size: 3rem; margin-bottom: 12px; }
      h3 { color: var(--text); margin: 0 0 6px; }
      p { margin: 0 0 20px; max-width: 360px; }
    `,
  ],
})
export class EmptyStateComponent {
  @Input() icon = '📭';
  @Input() title = 'Nothing here yet';
  @Input() description = 'Get started by adding your first item.';
  @Input() actionLabel = '';
  @Output() action = new EventEmitter<void>();
}