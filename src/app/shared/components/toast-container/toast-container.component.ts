import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-wrap">
      <div
        *ngFor="let t of toastService.toasts()"
        class="toast"
        [ngClass]="t.type"
        (click)="toastService.dismiss(t.id)"
      >
        {{ t.message }}
      </div>
    </div>
  `,
  styles: [
    `
      .toast-wrap {
        position: fixed;
        top: 20px;
        right: 20px;
        display: flex;
        flex-direction: column;
        gap: 8px;
        z-index: 2000;
        max-width: 340px;
      }
      .toast {
        padding: 12px 16px;
        border-radius: 10px;
        color: #fff;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
        cursor: pointer;
        animation: slide 0.2s ease-out;
        font-size: 0.9rem;
      }
      .toast.success { background: #16a34a; }
      .toast.error { background: #dc2626; }
      .toast.warning { background: #f59e0b; }
      .toast.info { background: #2563eb; }
      @keyframes slide {
        from { transform: translateX(30px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
    `,
  ],
})
export class ToastContainerComponent {
  toastService = inject(ToastService);
}