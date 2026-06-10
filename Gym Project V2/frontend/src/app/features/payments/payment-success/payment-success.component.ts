import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/auth.service';
import { PaymentsService } from '../../../services/payments.service';

@Component({
  selector: 'gd-payment-success',
  standalone: true,
  imports: [RouterLink, CommonModule],
  template: `
    <div class="success-page">
      <div class="success-card">

        @if (verifying()) {
          <div class="verifying">
            <div class="spinner"></div>
            <h2>Activating your subscription...</h2>
            <p>Please wait while we confirm your payment.</p>
          </div>
        } @else if (error()) {
          <div class="success-icon error-icon">
            <i class="fa-solid fa-circle-exclamation"></i>
          </div>
          <h2>Verification Failed</h2>
          <p class="success-message">{{ error() }}</p>
          <a routerLink="/subscribe" class="btn btn--primary">
            <i class="fa-solid fa-arrow-left"></i> Back to Plans
          </a>
        } @else {
          <div class="success-icon">
            <i class="fa-solid fa-circle-check"></i>
          </div>
          <h2>Payment Successful!</h2>
          <p class="success-message">
            Your subscription is now <strong>active</strong>.<br>
            Welcome to the gym — let's get moving!
          </p>

          @if (isMember()) {
            <div class="countdown-bar">
              <div class="countdown-fill" [style.width.%]="countdownPercent()"></div>
            </div>
            <p class="redirect-hint">Redirecting to your dashboard in {{ countdown() }}s...</p>
            <a routerLink="/dashboard" class="btn btn--primary" (click)="clearTimer()">
              <i class="fa-solid fa-gauge"></i> Go to My Dashboard Now
            </a>
          } @else {
            <div class="actions">
              <a routerLink="/members" class="btn btn--outline">
                <i class="fa-solid fa-users"></i> Members
              </a>
              <a routerLink="/payments" class="btn btn--primary">
                <i class="fa-solid fa-money-bill-wave"></i> View Payments
              </a>
            </div>
          }
        }
      </div>
    </div>
  `,
  styles: [`
    .success-page {
      min-height: 100vh; display: flex; align-items: center; justify-content: center;
      background: var(--surface-bg, #f0fdf4); padding: 24px;
    }
    .success-card {
      background: var(--surface-card, white); border-radius: 24px; padding: 56px 40px;
      text-align: center; max-width: 460px; width: 100%;
      box-shadow: 0 20px 60px rgba(0,0,0,0.1);
    }
    .verifying {
      display: flex; flex-direction: column; align-items: center; gap: 16px;
      h2 { font-size: 1.25rem; font-weight: 700; color: var(--text-primary, #111); }
      p { color: var(--text-muted, #888); font-size: 0.9rem; }
    }
    .spinner {
      width: 56px; height: 56px; border: 4px solid var(--surface-border, #e5e7eb);
      border-top-color: #0D9488; border-radius: 50%; animation: spin 0.8s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .success-icon {
      width: 100px; height: 100px; border-radius: 50%;
      background: linear-gradient(135deg, #d1fae5, #a7f3d0);
      display: flex; align-items: center; justify-content: center;
      margin: 0 auto 28px;
      i { font-size: 56px; color: #059669; }
    }
    .error-icon {
      background: linear-gradient(135deg, #fee2e2, #fecaca);
      i { color: #dc2626; }
    }
    h2 { font-size: 1.875rem; font-weight: 800; margin-bottom: 16px; color: var(--text-primary, #111); }
    .success-message {
      color: var(--text-secondary, #555); font-size: 1rem; line-height: 1.6; margin-bottom: 28px;
      strong { color: #059669; }
    }
    .countdown-bar {
      height: 4px; background: var(--surface-border, #e5e7eb); border-radius: 4px;
      margin-bottom: 10px; overflow: hidden;
    }
    .countdown-fill {
      height: 100%; background: #0D9488; transition: width 1s linear; border-radius: 4px;
    }
    .redirect-hint { font-size: 0.8125rem; color: var(--text-muted, #888); margin-bottom: 24px; }
    .btn {
      display: inline-flex; align-items: center; gap: 8px; padding: 13px 28px;
      border-radius: 12px; font-weight: 600; font-size: 0.9375rem;
      text-decoration: none; border: none; cursor: pointer; transition: all 0.2s;
      &--primary {
        background: linear-gradient(135deg, #0F766E, #14B8A6); color: white;
        &:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(13,148,136,0.4); }
      }
      &--outline {
        background: transparent; color: var(--text-primary, #111);
        border: 2px solid var(--surface-border, #e5e7eb);
        &:hover { border-color: var(--text-primary, #111); }
      }
    }
    .actions { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
  `]
})
export class PaymentSuccessComponent implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly auth = inject(AuthService);
  private readonly paymentsService = inject(PaymentsService);

  readonly isMember = this.auth.isMember;
  readonly verifying = signal(false);
  readonly error = signal<string | null>(null);
  readonly countdown = signal(5);
  readonly countdownPercent = signal(100);

  private timer?: ReturnType<typeof setInterval>;

  ngOnInit(): void {
    const sessionId = this.route.snapshot.queryParamMap.get('session_id');

    if (sessionId && this.auth.isMember()) {
      this.verifying.set(true);
      this.paymentsService.verifySession(sessionId).subscribe({
        next: () => {
          this.verifying.set(false);
          this.startCountdown();
        },
        error: (err) => {
          this.verifying.set(false);
          // Non-fatal — session might already be fulfilled by webhook
          // Still show success and redirect
          console.warn('Session verify error (non-fatal):', err.error?.message);
          this.startCountdown();
        },
      });
    } else {
      this.startCountdown();
    }
  }

  private startCountdown(): void {
    if (!this.auth.isMember()) return;
    this.timer = setInterval(() => {
      const next = this.countdown() - 1;
      this.countdown.set(next);
      this.countdownPercent.set((next / 5) * 100);
      if (next <= 0) {
        clearInterval(this.timer);
        this.router.navigate(['/dashboard']);
      }
    }, 1000);
  }

  clearTimer(): void {
    if (this.timer) clearInterval(this.timer);
  }

  ngOnDestroy(): void {
    if (this.timer) clearInterval(this.timer);
  }
}
