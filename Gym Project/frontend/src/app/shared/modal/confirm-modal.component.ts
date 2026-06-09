import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalService } from './modal.service';

@Component({
  selector: 'gd-confirm-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (modal.isOpen()) {
      <div class="fixed inset-0 z-[9999] flex items-center justify-center p-4"
           (click)="modal.resolve(false)">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>

        <!-- Dialog -->
        <div class="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md p-6 animate-[slideUp_0.2s_ease-out]"
             (click)="$event.stopPropagation()">

          <!-- Icon -->
          <div class="flex items-center justify-center w-14 h-14 rounded-full mx-auto mb-4"
               [class]="iconBg">
            <i [class]="iconClass + ' text-2xl'"></i>
          </div>

          <!-- Content -->
          <h3 class="text-xl font-bold text-center text-gray-900 dark:text-white mb-2">
            {{ modal.config().title }}
          </h3>
          <p class="text-center text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-6">
            {{ modal.config().message }}
          </p>

          <!-- Actions -->
          <div class="flex gap-3">
            <button
              class="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              (click)="modal.resolve(false)">
              {{ modal.config().cancelText ?? 'Cancel' }}
            </button>
            <button
              class="flex-1 px-4 py-2.5 rounded-xl font-medium text-white transition-colors"
              [class]="confirmBtnClass"
              (click)="modal.resolve(true)">
              {{ modal.config().confirmText ?? 'Confirm' }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class ConfirmModalComponent {
  protected readonly modal = inject(ModalService);

  get iconBg(): string {
    const map: Record<string, string> = {
      danger:  'bg-red-100 dark:bg-red-900/30',
      warning: 'bg-amber-100 dark:bg-amber-900/30',
      info:    'bg-blue-100 dark:bg-blue-900/30',
      success: 'bg-green-100 dark:bg-green-900/30',
    };
    return map[this.modal.config().type ?? 'danger'];
  }

  get iconClass(): string {
    const map: Record<string, string> = {
      danger:  'fa-solid fa-triangle-exclamation text-red-500',
      warning: 'fa-solid fa-circle-exclamation text-amber-500',
      info:    'fa-solid fa-circle-info text-blue-500',
      success: 'fa-solid fa-circle-check text-green-500',
    };
    return map[this.modal.config().type ?? 'danger'];
  }

  get confirmBtnClass(): string {
    const map: Record<string, string> = {
      danger:  'bg-red-500 hover:bg-red-600',
      warning: 'bg-amber-500 hover:bg-amber-600',
      info:    'bg-blue-500 hover:bg-blue-600',
      success: 'bg-green-500 hover:bg-green-600',
    };
    return map[this.modal.config().type ?? 'danger'];
  }
}
