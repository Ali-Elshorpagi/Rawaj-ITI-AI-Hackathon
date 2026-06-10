import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { TranslateModule } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { MembersService } from '../../../services/members.service';
import { AttendanceService } from '../../../services/attendance.service';
import { PaymentsService } from '../../../services/payments.service';
import { SubscriptionsService } from '../../../services/subscriptions.service';
import { Member, SubscriptionPlan } from '../../../models/interfaces';
import { AuthService } from '../../../core/auth.service';

@Component({
  selector: 'gd-member-detail',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterLink,
    MatButtonModule, MatTabsModule,
    MatSelectModule, MatFormFieldModule, TranslateModule,
  ],
  template: `
    <div class="page">
      @if (loading()) {
        <div class="gd-skeleton" style="height:200px;border-radius:12px"></div>
      } @else if (member()) {
        <!-- Header Card -->
        <div class="gd-card member-header">
          <div class="member-header__left">
            <div class="gd-avatar gd-avatar--xl">
              @if (member()!.profilePhoto) {
                <img [src]="member()!.profilePhoto" [alt]="member()!.fullName">
              } @else {
                {{ getInitials(member()!) }}
              }
            </div>
            <div>
              <h2 class="member-header__name">{{ member()!.fullName }}</h2>
              <p class="text-muted">{{ member()!.email }}</p>
              <code>{{ member()!.memberId }}</code>
            </div>
          </div>
          <div class="member-header__right">
            <span class="badge" [ngClass]="'badge--' + member()!.membershipStatus">
              {{ 'members.status.' + member()!.membershipStatus | translate }}
            </span>
            @if (auth.isStaff()) {
              <button mat-flat-button color="accent" (click)="openPaymentDialog()" [disabled]="checkoutLoading()">
                <i class="fa-solid fa-money-bill-wave"></i>
                {{ checkoutLoading() ? 'Redirecting...' : 'New Payment' }}
              </button>
            }
            <a mat-stroked-button [routerLink]="'/members/' + member()!.id + '/edit'" *ngIf="auth.isStaff()">
              <i class="fa-solid fa-pen"></i> Edit
            </a>
            <a mat-stroked-button routerLink="/members">
              <i class="fa-solid fa-arrow-left"></i> Back
            </a>
          </div>
        </div>

        <!-- Tabs -->
        <mat-tab-group class="member-tabs">
          <mat-tab label="Overview">
            <div class="tab-content">
              <div class="gd-grid gd-grid--3">
                <div class="gd-card">
                  <div class="gd-card__title">Subscription</div>
                  <p class="info-item"><i class="fa-solid fa-id-card"></i> {{ member()!.subscriptionPlan?.name ?? 'No plan' }}</p>
                  <p class="info-item"><i class="fa-solid fa-calendar"></i> Expires: {{ member()!.subscriptionEndDate ? (member()!.subscriptionEndDate | date) : 'N/A' }}</p>
                  <p class="info-item"><i class="fa-solid fa-clipboard-check"></i> Attendance: {{ member()!.totalAttendance }}</p>
                </div>
                <div class="gd-card">
                  <div class="gd-card__title">Contact</div>
                  <p class="info-item"><i class="fa-solid fa-phone"></i> {{ member()!.phone ?? 'N/A' }}</p>
                  <p class="info-item"><i class="fa-solid fa-location-dot"></i> {{ member()!.address?.city ?? 'N/A' }}</p>
                </div>
                <div class="gd-card">
                  <div class="gd-card__title">Emergency Contact</div>
                  @if (member()!.emergencyContact) {
                    <p class="info-item"><i class="fa-solid fa-user"></i> {{ member()!.emergencyContact!.name }}</p>
                    <p class="info-item"><i class="fa-solid fa-phone"></i> {{ member()!.emergencyContact!.phone }}</p>
                    <p class="info-item"><i class="fa-solid fa-people-group"></i> {{ member()!.emergencyContact!.relationship }}</p>
                  } @else {
                    <p class="text-muted">Not provided</p>
                  }
                </div>
              </div>
              @if (member()!.qrCode) {
                <div class="gd-card qr-card">
                  <div class="gd-card__title">Member QR Code</div>
                  <img [src]="member()!.qrCode" alt="QR Code" class="qr-image">
                  <p class="text-muted">Scan to check in</p>
                </div>
              }
            </div>
          </mat-tab>
          <mat-tab label="Attendance History">
            <div class="tab-content">
              @if (attendanceLoading()) {
                <div class="gd-skeleton" style="height:200px"></div>
              } @else {
                <div class="gd-table-container">
                  <table class="gd-table">
                    <thead><tr><th>Date</th><th>Check-In</th><th>Check-Out</th><th>Method</th></tr></thead>
                    <tbody>
                      @for (record of attendance(); track record.id) {
                        <tr>
                          <td>{{ record.date | date:'mediumDate' }}</td>
                          <td>{{ record.checkInTime | date:'shortTime' }}</td>
                          <td>{{ record.checkOutTime ? (record.checkOutTime | date:'shortTime') : '—' }}</td>
                          <td><span class="badge badge--active">{{ record.method }}</span></td>
                        </tr>
                      } @empty {
                        <tr><td colspan="4" style="text-align:center;color:var(--text-muted)">No attendance records</td></tr>
                      }
                    </tbody>
                  </table>
                </div>
              }
            </div>
          </mat-tab>
          <mat-tab label="Payments">
            <div class="tab-content">
              @if (paymentsLoading()) {
                <div class="gd-skeleton" style="height:200px"></div>
              } @else {
                <div class="gd-table-container">
                  <table class="gd-table">
                    <thead><tr><th>Invoice</th><th>Plan</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead>
                    <tbody>
                      @for (payment of payments(); track payment.id) {
                        <tr>
                          <td><code>{{ payment.invoiceNumber }}</code></td>
                          <td>{{ payment.subscriptionPlan?.name ?? '—' }}</td>
                          <td>{{ payment.amount | currency:payment.currency }}</td>
                          <td><span class="badge" [ngClass]="'badge--' + payment.status">{{ payment.status }}</span></td>
                          <td>{{ payment.paymentDate | date:'mediumDate' }}</td>
                        </tr>
                      } @empty {
                        <tr><td colspan="5" style="text-align:center;color:var(--text-muted)">No payments</td></tr>
                      }
                    </tbody>
                  </table>
                </div>
              }
            </div>
          </mat-tab>
        </mat-tab-group>
      }
    </div>

    <!-- Payment Dialog -->
    @if (showPaymentDialog()) {
      <div class="dialog-overlay" (click)="closePaymentDialog()">
        <div class="dialog-panel" (click)="$event.stopPropagation()">
          <div class="dialog-header">
            <h3>New Payment</h3>
            <button class="dialog-close" (click)="closePaymentDialog()">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>
          <p class="dialog-subtitle">Select a subscription plan for <strong>{{ member()?.fullName }}</strong>.</p>

          @if (plansLoading()) {
            <div class="gd-skeleton" style="height:80px;border-radius:8px"></div>
          } @else {
            <div class="plans-list">
              @for (plan of availablePlans(); track plan.id) {
                <div class="plan-option"
                     [class.plan-option--selected]="selectedPlanId() === plan.id"
                     (click)="selectedPlanId.set(plan.id ?? plan._id ?? '')">
                  <div class="plan-option__check">
                    <i [class]="selectedPlanId() === plan.id ? 'fa-solid fa-circle-dot' : 'fa-regular fa-circle'"></i>
                  </div>
                  <div class="plan-option__info">
                    <div class="plan-option__name">{{ plan.name }}</div>
                    <div class="plan-option__meta">{{ plan.durationDays }} days · {{ plan.type }}</div>
                  </div>
                  <div class="plan-option__price">{{ plan.price | currency:plan.currency }}</div>
                </div>
              } @empty {
                <p class="text-muted" style="text-align:center;padding:24px">No active plans available.</p>
              }
            </div>

            <div class="dialog-actions">
              <button mat-stroked-button (click)="closePaymentDialog()">Cancel</button>
              <button mat-flat-button color="primary"
                      [disabled]="!selectedPlanId() || checkoutLoading()"
                      (click)="initiateCheckout()">
                <i [class]="checkoutLoading() ? 'fa-solid fa-rotate' : 'fa-solid fa-arrow-up-right-from-square'"></i>
                {{ checkoutLoading() ? 'Redirecting to Stripe...' : 'Pay with Stripe' }}
              </button>
            </div>
          }
        </div>
      </div>
    }
  `,
  styles: [`
    .page { max-width: 1200px; }
    .member-header { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px; margin-bottom: 24px; }
    .member-header__left { display: flex; align-items: center; gap: 20px; }
    .member-header__name { font-size: 1.5rem; font-weight: 700; margin-bottom: 4px; }
    .member-header__right { display: flex; align-items: center; gap: 10px; }
    code { font-family: monospace; font-size: 0.8125rem; background: var(--surface-bg); padding: 2px 8px; border-radius: 4px; }
    .member-tabs { margin-top: 24px; }
    .tab-content { padding: 24px 0; }
    .info-item { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; i { font-size: 18px; width: 18px; height: 18px; color: var(--text-muted); } }
    .qr-card { text-align: center; max-width: 250px; margin-top: 24px; }
    .qr-image { width: 200px; height: 200px; margin: 16px auto; display: block; }

    /* Payment dialog */
    .dialog-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 16px; }
    .dialog-panel { background: var(--surface-card); border-radius: var(--radius-xl); padding: 32px; width: 480px; max-width: 100%; box-shadow: var(--shadow-xl); }
    .dialog-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; h3 { font-size: 1.25rem; font-weight: 700; } }
    .dialog-close { background: none; border: none; cursor: pointer; color: var(--text-muted); display: flex; &:hover { color: var(--text-primary); } }
    .dialog-subtitle { color: var(--text-secondary); font-size: 0.875rem; margin-bottom: 24px; }
    .dialog-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 24px; }

    .plans-list { display: flex; flex-direction: column; gap: 10px; }
    .plan-option {
      display: flex; align-items: center; gap: 14px;
      padding: 14px 16px; border-radius: var(--radius-lg);
      border: 2px solid var(--surface-border); cursor: pointer;
      transition: all var(--transition-fast);
      &:hover { border-color: var(--color-primary-400); background: var(--surface-hover); }
      &--selected { border-color: var(--color-primary-500); background: rgba(91,119,188,0.06); }
    }
    .plan-option__check { color: var(--color-primary-500); i { font-size: 20px; width: 20px; height: 20px; } }
    .plan-option__info { flex: 1; }
    .plan-option__name { font-weight: 600; font-size: 0.9375rem; color: var(--text-primary); }
    .plan-option__meta { font-size: 0.8125rem; color: var(--text-muted); margin-top: 2px; text-transform: capitalize; }
    .plan-option__price { font-weight: 700; font-size: 1rem; color: var(--color-primary-600); white-space: nowrap; }

    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    .spin { display: inline-block; animation: spin 1s linear infinite; }
  `]
})
export class MemberDetailComponent implements OnInit {
  protected readonly auth = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly membersService = inject(MembersService);
  private readonly attendanceService = inject(AttendanceService);
  private readonly paymentsService = inject(PaymentsService);
  private readonly subscriptionsService = inject(SubscriptionsService);
  private readonly toastr = inject(ToastrService);

  readonly member = signal<Member | null>(null);
  readonly attendance = signal<any[]>([]);
  readonly payments = signal<any[]>([]);
  readonly loading = signal(true);
  readonly attendanceLoading = signal(true);
  readonly paymentsLoading = signal(true);

  readonly showPaymentDialog = signal(false);
  readonly availablePlans = signal<SubscriptionPlan[]>([]);
  readonly plansLoading = signal(false);
  readonly selectedPlanId = signal<string>('');
  readonly checkoutLoading = signal(false);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.membersService.getById(id).subscribe({
      next: (res) => { this.member.set(res.data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
    this.attendanceService.getMemberHistory(id).subscribe({
      next: (res) => { this.attendance.set(res.data.items); this.attendanceLoading.set(false); },
      error: () => this.attendanceLoading.set(false),
    });
    this.paymentsService.getMemberPayments(id).subscribe({
      next: (res) => { this.payments.set(res.data.items); this.paymentsLoading.set(false); },
      error: () => this.paymentsLoading.set(false),
    });
  }

  openPaymentDialog(): void {
    this.selectedPlanId.set('');
    this.showPaymentDialog.set(true);
    this.plansLoading.set(true);
    this.subscriptionsService.getPlans().subscribe({
      next: (res) => {
        this.availablePlans.set(res.data.filter((p: SubscriptionPlan) => p.isActive));
        this.plansLoading.set(false);
      },
      error: () => {
        this.plansLoading.set(false);
        this.toastr.error('Failed to load plans', 'Error');
      },
    });
  }

  closePaymentDialog(): void {
    this.showPaymentDialog.set(false);
  }

  initiateCheckout(): void {
    const memberId = this.member()?.id;
    const planId = this.selectedPlanId();
    if (!memberId || !planId) return;

    this.checkoutLoading.set(true);
    this.paymentsService.createCheckout(planId).subscribe({
      next: (res) => {
        this.checkoutLoading.set(false);
        this.closePaymentDialog();
        // Redirect to Stripe Checkout
        window.location.href = res.data.sessionUrl;
      },
      error: (err) => {
        this.checkoutLoading.set(false);
        this.toastr.error(err.error?.message ?? 'Failed to create checkout session', 'Payment Error');
      },
    });
  }

  getInitials(m: Member): string {
    const first = m.firstName?.[0] ?? m.fullName?.[0] ?? '?';
    const last = m.lastName?.[0] ?? '';
    return `${first}${last}`.toUpperCase();
  }
}
