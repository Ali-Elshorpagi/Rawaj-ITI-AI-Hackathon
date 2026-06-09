import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'gd-payment-cancel',
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatIconModule],
  template: `
    <div class="page">
      <div class="card">
        <div class="icon"><mat-icon>cancel</mat-icon></div>
        <h2>Payment Cancelled</h2>
        <p>Your payment was cancelled. No charges were made.</p>
        <a routerLink="/payments" mat-flat-button color="primary">Back to Payments</a>
      </div>
    </div>
  `,
  styles: [`.page { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: var(--surface-bg); } .card { background: var(--surface-card); border-radius: var(--radius-xl); padding: 48px; text-align: center; max-width: 480px; box-shadow: var(--shadow-xl); } .icon { width: 80px; height: 80px; border-radius: 50%; background: #fee2e2; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px; mat-icon { font-size: 40px; width: 40px; height: 40px; color: #dc2626; } } h2 { margin-bottom: 12px; } p { color: var(--text-muted); margin-bottom: 32px; }`]
})
export class PaymentCancelComponent {}
