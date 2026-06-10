import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'gd-payment-cancel',
  standalone: true,
  imports: [RouterLink, CommonModule],
  template: `
    <div class="page">
      <div class="card">
        <div class="icon"><i class="fa-solid fa-circle-xmark"></i></div>
        <h2>Payment Cancelled</h2>
        <p>Your payment was cancelled. No charges were made.</p>
        @if (auth.isMember()) {
          <a routerLink="/subscribe" class="btn btn--primary">
            <i class="fa-solid fa-credit-card"></i> Choose a Plan
          </a>
        } @else {
          <a routerLink="/payments" class="btn btn--primary">Back to Payments</a>
        }
      </div>
    </div>
  `,
  styles: [`
    .page { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: var(--surface-bg); }
    .card { background: var(--surface-card); border-radius: 24px; padding: 56px 40px; text-align: center; max-width: 460px; width: 100%; box-shadow: 0 20px 60px rgba(0,0,0,0.1); }
    .icon { width: 80px; height: 80px; border-radius: 50%; background: #fee2e2; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px; i { font-size: 40px; color: #dc2626; } }
    h2 { font-size: 1.75rem; font-weight: 800; margin-bottom: 12px; }
    p { color: var(--text-muted); margin-bottom: 32px; font-size: 1rem; line-height: 1.6; }
    .btn {
      display: inline-flex; align-items: center; gap: 8px; padding: 13px 28px;
      border-radius: 12px; font-weight: 600; font-size: 0.9375rem;
      text-decoration: none; border: none; cursor: pointer; transition: all 0.2s;
      &--primary { background: linear-gradient(135deg, #0F766E, #14B8A6); color: white; &:hover { transform: translateY(-1px); } }
    }
  `]
})
export class PaymentCancelComponent {
  protected readonly auth = inject(AuthService);
}
