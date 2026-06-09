import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { PaymentsService } from '../../../services/payments.service';

@Component({
  selector: 'gd-payment-success',
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatIconModule, CommonModule],
  template: `
    <div class="success-page">
      <div class="success-card">
        @if (loading()) {
          <div class="gd-skeleton" style="height:240px;border-radius:12px"></div>
        } @else {
          <div class="success-icon">
            <mat-icon>check_circle</mat-icon>
          </div>
          <h2>Payment Successful!</h2>
          @if (invoiceNumber()) {
            <div class="invoice-info">
              <div class="invoice-row">
                <span class="invoice-label">Invoice</span>
                <code>{{ invoiceNumber() }}</code>
              </div>
            </div>
          }
          <p class="success-message">
            Your membership payment has been processed successfully.<br>
            A confirmation email has been sent to you.
          </p>
          <div class="actions">
            <a routerLink="/members" mat-stroked-button>
              <mat-icon>people</mat-icon> Members
            </a>
            <a routerLink="/payments" mat-flat-button color="primary">
              <mat-icon>payments</mat-icon> View Payments
            </a>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .success-page {
      min-height: 100vh;
      display: flex; align-items: center; justify-content: center;
      background: var(--surface-bg); padding: 24px;
    }
    .success-card {
      background: var(--surface-card);
      border-radius: var(--radius-xl);
      padding: 48px 40px;
      text-align: center;
      max-width: 480px;
      width: 100%;
      box-shadow: var(--shadow-xl);
    }
    .success-icon {
      width: 96px; height: 96px;
      border-radius: 50%;
      background: #dcfce7;
      display: flex; align-items: center; justify-content: center;
      margin: 0 auto 24px;
      mat-icon { font-size: 52px; width: 52px; height: 52px; color: #16a34a; }
    }
    h2 { font-size: 1.75rem; font-weight: 700; margin-bottom: 16px; color: var(--text-primary); }
    .invoice-info {
      background: var(--surface-bg); border-radius: var(--radius-md);
      padding: 12px 20px; margin-bottom: 20px; display: inline-block;
    }
    .invoice-row { display: flex; align-items: center; gap: 12px; }
    .invoice-label { font-size: 0.8125rem; color: var(--text-muted); font-weight: 500; }
    code { font-family: monospace; font-size: 0.875rem; font-weight: 600; background: var(--surface-border); padding: 3px 8px; border-radius: 4px; }
    .success-message { color: var(--text-secondary); font-size: 0.9375rem; line-height: 1.6; margin-bottom: 32px; }
    .actions { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
  `]
})
export class PaymentSuccessComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly paymentsService = inject(PaymentsService);

  readonly loading = signal(false);
  readonly invoiceNumber = signal<string | null>(null);

  ngOnInit(): void {
    const sessionId = this.route.snapshot.queryParamMap.get('session_id');
    if (sessionId) {
      this.loading.set(true);
      this.paymentsService.getBySessionId(sessionId).subscribe({
        next: (res) => {
          this.invoiceNumber.set(res.data?.invoiceNumber ?? null);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
    }
  }
}
