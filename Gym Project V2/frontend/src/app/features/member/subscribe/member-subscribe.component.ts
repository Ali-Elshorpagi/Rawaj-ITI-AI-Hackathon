import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { SubscriptionsService } from '../../../services/subscriptions.service';
import { PaymentsService } from '../../../services/payments.service';
import { AuthService } from '../../../core/auth.service';
import { SubscriptionPlan } from '../../../models/interfaces';

@Component({
  selector: 'gd-member-subscribe',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="subscribe-page">

      <!-- Header -->
      <div class="page-header">
        <a routerLink="/dashboard" class="back-link">
          <i class="fa-solid fa-arrow-left"></i> Back to Dashboard
        </a>
        <div class="page-header__text">
          <h1>Choose a Plan</h1>
          <p>Select a subscription that fits your fitness goals</p>
        </div>
      </div>

      @if (loading()) {
        <div class="plans-grid">
          @for (_ of [1,2,3]; track $index) {
            <div class="plan-card">
              <div class="skeleton" style="height:280px;border-radius:16px"></div>
            </div>
          }
        </div>
      } @else if (plans().length === 0) {
        <div class="empty-state">
          <i class="fa-solid fa-id-card fa-3x"></i>
          <h3>No Plans Available</h3>
          <p>There are no subscription plans at the moment. Please check back later or contact reception.</p>
          <a routerLink="/dashboard" class="btn btn--outline">
            <i class="fa-solid fa-arrow-left"></i> Back to Dashboard
          </a>
        </div>
      } @else {
        <div class="plans-grid">
          @for (plan of plans(); track plan._id) {
            <div class="plan-card" [class.plan-card--popular]="plan.isPopular" [class.plan-card--selected]="selectedPlan()?._id === plan._id">

              @if (plan.isPopular) {
                <div class="popular-badge">
                  <i class="fa-solid fa-star"></i> Most Popular
                </div>
              }

              <div class="plan-card__header" [style.background]="plan.color || '#0D9488'">
                <div class="plan-card__icon">
                  <i class="fa-solid fa-dumbbell"></i>
                </div>
                <h2 class="plan-card__name">{{ plan.name }}</h2>
                @if (plan.type) {
                  <span class="plan-card__type">{{ plan.type | titlecase }}</span>
                }
              </div>

              <div class="plan-card__body">
                <div class="plan-card__price">
                  <span class="plan-card__amount">{{ plan.price | currency:(plan.currency ?? 'USD') }}</span>
                  <span class="plan-card__period">/ {{ plan.durationMonths ?? Math.ceil((plan.durationDays ?? 30) / 30) }} month{{ (plan.durationMonths ?? 1) > 1 ? 's' : '' }}</span>
                </div>

                <div class="plan-card__duration">
                  <i class="fa-regular fa-calendar"></i>
                  {{ plan.durationDays ?? (plan.durationMonths ?? 1) * 30 }} days access
                </div>

                @if (plan.description) {
                  <p class="plan-card__desc">{{ plan.description }}</p>
                }

                @if (plan.features?.length) {
                  <ul class="plan-card__features">
                    @for (feature of plan.features; track $index) {
                      <li>
                        <i class="fa-solid fa-circle-check"></i>
                        {{ feature }}
                      </li>
                    }
                  </ul>
                }
              </div>

              <div class="plan-card__footer">
                <button class="btn btn--select"
                        [class.btn--selected]="selectedPlan()?._id === plan._id"
                        (click)="selectPlan(plan)">
                  @if (selectedPlan()?._id === plan._id) {
                    <i class="fa-solid fa-circle-check"></i> Selected
                  } @else {
                    <i class="fa-regular fa-circle"></i> Select Plan
                  }
                </button>
              </div>
            </div>
          }
        </div>

        <!-- Checkout Bar -->
        @if (selectedPlan()) {
          <div class="checkout-bar">
            <div class="checkout-bar__info">
              <div class="checkout-bar__plan">
                <i class="fa-solid fa-id-card"></i>
                <strong>{{ selectedPlan()!.name }}</strong>
              </div>
              <div class="checkout-bar__price">
                {{ selectedPlan()!.price | currency:(selectedPlan()!.currency ?? 'USD') }}
                <span>/ {{ selectedPlan()!.durationMonths ?? 1 }} month{{ (selectedPlan()!.durationMonths ?? 1) > 1 ? 's' : '' }}</span>
              </div>
            </div>
            <button class="btn btn--checkout" (click)="checkout()" [disabled]="checkingOut()">
              @if (checkingOut()) {
                <i class="fa-solid fa-rotate fa-spin"></i> Redirecting to Stripe...
              } @else {
                <i class="fa-brands fa-stripe"></i> Pay with Stripe
                <i class="fa-solid fa-arrow-right"></i>
              }
            </button>
          </div>
        }
      }
    </div>
  `,
  styles: [`
    .subscribe-page { max-width: 1100px; padding-bottom: 120px; }

    .page-header {
      margin-bottom: 32px;
      .back-link { display: inline-flex; align-items: center; gap: 6px; color: var(--text-muted); font-size: 0.875rem; text-decoration: none; margin-bottom: 16px; &:hover { color: var(--text-primary); } }
      h1 { font-size: 1.75rem; font-weight: 800; color: var(--text-primary); margin-bottom: 4px; }
      p { color: var(--text-muted); font-size: 0.9375rem; }
    }

    .plans-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 24px; }

    .plan-card {
      background: var(--surface-card); border-radius: 20px;
      border: 2px solid var(--surface-border); overflow: hidden;
      transition: all 0.25s ease; position: relative;
      &:hover { transform: translateY(-4px); box-shadow: 0 12px 40px rgba(0,0,0,0.1); }
      &--popular { border-color: #0D9488; box-shadow: 0 0 0 1px #0D9488; }
      &--selected { border-color: #0D9488; box-shadow: 0 0 0 3px rgba(13,148,136,0.2); transform: translateY(-4px); }
    }

    .popular-badge {
      position: absolute; top: 12px; right: 12px; z-index: 10;
      background: white; color: #0D9488; font-size: 0.75rem; font-weight: 700;
      padding: 4px 12px; border-radius: 20px;
      display: flex; align-items: center; gap: 4px;
    }

    .plan-card__header {
      padding: 28px 24px 20px; display: flex; flex-direction: column; align-items: flex-start; gap: 8px;
    }
    .plan-card__icon {
      width: 44px; height: 44px; background: rgba(255,255,255,0.2); border-radius: 12px;
      display: flex; align-items: center; justify-content: center;
      i { color: white; font-size: 1.25rem; }
    }
    .plan-card__name { font-size: 1.25rem; font-weight: 800; color: white; margin: 0; }
    .plan-card__type { font-size: 0.75rem; color: rgba(255,255,255,0.8); text-transform: uppercase; letter-spacing: 0.08em; font-weight: 600; }

    .plan-card__body { padding: 20px 24px; display: flex; flex-direction: column; gap: 12px; }

    .plan-card__price { display: flex; align-items: baseline; gap: 4px; }
    .plan-card__amount { font-size: 2rem; font-weight: 800; color: var(--text-primary); }
    .plan-card__period { font-size: 0.875rem; color: var(--text-muted); }

    .plan-card__duration {
      display: flex; align-items: center; gap: 6px;
      font-size: 0.875rem; color: var(--text-muted);
      i { color: #0D9488; width: 14px; text-align: center; }
    }

    .plan-card__desc { font-size: 0.875rem; color: var(--text-secondary); line-height: 1.5; margin: 0; }

    .plan-card__features {
      list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 8px;
      li {
        display: flex; align-items: center; gap: 8px; font-size: 0.875rem; color: var(--text-secondary);
        i { color: #0D9488; flex-shrink: 0; }
      }
    }

    .plan-card__footer { padding: 0 24px 24px; }

    /* Buttons */
    .btn {
      display: inline-flex; align-items: center; gap: 8px; padding: 11px 20px;
      border-radius: 12px; font-weight: 600; font-size: 0.9rem; border: none; cursor: pointer;
      transition: all 0.2s ease; text-decoration: none; justify-content: center;

      &--select {
        width: 100%; background: var(--surface-bg); color: var(--text-secondary);
        border: 2px solid var(--surface-border);
        &:hover { border-color: #0D9488; color: #0D9488; }
      }
      &--selected {
        background: rgba(13,148,136,0.08); color: #0D9488; border-color: #0D9488;
      }
      &--outline {
        background: transparent; color: var(--text-primary); border: 2px solid var(--surface-border);
        &:hover { border-color: var(--text-primary); }
      }
      &--checkout {
        background: linear-gradient(135deg, #0F766E, #14B8A6); color: white;
        padding: 13px 28px; font-size: 1rem; border-radius: 14px;
        &:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(13,148,136,0.4); }
        &:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
      }
    }

    /* Checkout Bar */
    .checkout-bar {
      position: fixed; bottom: 0; left: 0; right: 0; z-index: 200;
      background: var(--surface-card); border-top: 1px solid var(--surface-border);
      padding: 16px 24px; display: flex; align-items: center; justify-content: space-between;
      gap: 20px; box-shadow: 0 -4px 24px rgba(0,0,0,0.08);
      animation: slideUp 0.3s ease;
    }
    .checkout-bar__info { display: flex; align-items: center; gap: 24px; flex-wrap: wrap; }
    .checkout-bar__plan {
      display: flex; align-items: center; gap: 8px; font-size: 0.9375rem; color: var(--text-primary);
      i { color: #0D9488; }
    }
    .checkout-bar__price {
      font-size: 1.5rem; font-weight: 800; color: var(--text-primary);
      span { font-size: 0.875rem; font-weight: 400; color: var(--text-muted); margin-left: 2px; }
    }

    .empty-state {
      text-align: center; padding: 60px 24px; display: flex; flex-direction: column; align-items: center; gap: 12px;
      color: var(--text-muted);
      h3 { font-size: 1.25rem; font-weight: 700; color: var(--text-primary); margin: 8px 0 0; }
      p { font-size: 0.9375rem; max-width: 400px; line-height: 1.5; }
    }

    .skeleton { background: linear-gradient(90deg, var(--surface-bg) 25%, var(--surface-hover) 50%, var(--surface-bg) 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; }
    @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
    @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
  `],
})
export class MemberSubscribeComponent implements OnInit {
  protected readonly Math = Math;
  private readonly subscriptionsService = inject(SubscriptionsService);
  private readonly paymentsService = inject(PaymentsService);
  private readonly auth = inject(AuthService);
  private readonly toastr = inject(ToastrService);

  readonly loading = signal(true);
  readonly plans = signal<SubscriptionPlan[]>([]);
  readonly selectedPlan = signal<SubscriptionPlan | null>(null);
  readonly checkingOut = signal(false);

  ngOnInit(): void {
    this.subscriptionsService.getPlans().subscribe({
      next: (res) => {
        const active = (res.data ?? []).filter(p => p.isActive);
        this.plans.set(active);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.toastr.error('Failed to load subscription plans', 'Error');
      },
    });
  }

  selectPlan(plan: SubscriptionPlan): void {
    const current = this.selectedPlan();
    this.selectedPlan.set(current?._id === plan._id ? null : plan);
  }

  checkout(): void {
    const plan = this.selectedPlan();
    if (!plan) return;

    this.checkingOut.set(true);
    const planId = plan._id ?? plan.id ?? '';

    this.paymentsService.createCheckout(planId).subscribe({
      next: (res) => {
        if (res.data?.sessionUrl) {
          window.location.href = res.data.sessionUrl;
        } else {
          this.checkingOut.set(false);
          this.toastr.error('No payment URL returned. Please try again.', 'Error');
        }
      },
      error: (err) => {
        this.checkingOut.set(false);
        this.toastr.error(err.error?.message ?? 'Failed to start checkout. Please try again.', 'Payment Error');
      },
    });
  }
}
