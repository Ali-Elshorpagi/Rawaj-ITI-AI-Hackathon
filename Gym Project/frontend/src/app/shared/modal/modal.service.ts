import { Injectable, signal } from '@angular/core';

export interface ModalConfig {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info' | 'success';
}

@Injectable({ providedIn: 'root' })
export class ModalService {
  readonly isOpen = signal(false);
  readonly config = signal<ModalConfig>({ title: '', message: '' });

  private resolveRef: ((value: boolean) => void) | null = null;

  confirm(cfg: ModalConfig): Promise<boolean> {
    this.config.set(cfg);
    this.isOpen.set(true);
    return new Promise<boolean>(resolve => {
      this.resolveRef = resolve;
    });
  }

  resolve(result: boolean): void {
    this.isOpen.set(false);
    this.resolveRef?.(result);
    this.resolveRef = null;
  }
}
