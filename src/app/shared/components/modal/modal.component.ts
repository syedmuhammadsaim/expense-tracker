import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-backdrop" (click)="close.emit()">
      <div class="modal" (click)="$event.stopPropagation()">
        <header>
          <h3>{{ title }}</h3>
          <button class="icon-btn" (click)="close.emit()" aria-label="Close">✕</button>
        </header>
        <div class="modal-body">
          <ng-content></ng-content>
        </div>
        <footer *ngIf="showFooter">
          <button class="btn btn-ghost" (click)="close.emit()">Cancel</button>
          <button class="btn btn-danger" (click)="confirm.emit()">{{ confirmText }}</button>
        </footer>
      </div>
    </div>
  `,
  styles: [
    `
      .modal-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(15, 23, 42, 0.55);
        display: grid;
        place-items: center;
        z-index: 1000;
        padding: 16px;
      }
      .modal {
        background: var(--surface);
        color: var(--text);
        border-radius: 16px;
        width: 100%;
        max-width: 480px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        overflow: hidden;
        animation: pop 0.18s ease-out;
      }
      @keyframes pop {
        from { transform: scale(0.95); opacity: 0; }
        to { transform: scale(1); opacity: 1; }
      }
      header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px 20px;
        border-bottom: 1px solid var(--border);
      }
      header h3 { margin: 0; font-size: 1.05rem; }
      .modal-body { padding: 20px; }
      footer {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
        padding: 16px 20px;
        border-top: 1px solid var(--border);
      }
    `,
  ],
})
export class ModalComponent {
  @Input() title = '';
  @Input() confirmText = 'Delete';
  @Input() showFooter = true;
  @Output() close = new EventEmitter<void>();
  @Output() confirm = new EventEmitter<void>();
}