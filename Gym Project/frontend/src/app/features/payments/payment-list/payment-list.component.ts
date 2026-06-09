import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { TranslateModule } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { PaymentsService } from '../../../services/payments.service';
import { Payment, PaginationMeta } from '../../../models/interfaces';
import { PaymentStatus } from '../../../models/enums';
import { AuthService } from '../../../core/auth.service';
import { ModalService } from '../../../shared/modal/modal.service';

@Component({
  selector: 'gd-payment-list',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatButtonModule, MatSelectModule, MatFormFieldModule, MatPaginatorModule, TranslateModule],
  template: `
    <div class="page">
      <div class="gd-page-header">
        <div>
          <h1 class="gd-page-header__title">{{ 'payments.title' | translate }}</h1>
          <p class="gd-page-header__subtitle">{{ meta()?.total ?? 0 }} total payments</p>
        </div>
      </div>

      <!-- Revenue Summary -->
      <div class="gd-grid gd-grid--4" style="margin-bottom:24px">
        @for (stat of revenueStats(); track $index) {
          <div class="gd-kpi-card">
            <div class="gd-kpi-card__icon" [style.background]="stat.bg">
              <mat-icon [style.color]="stat.color">{{ stat.icon }}</mat-icon>
            </div>
            <div class="gd-kpi-card__value">{{ stat.value }}</div>
            <div class="gd-kpi-card__label">{{ stat.label }}</div>
          </div>
        }
      </div>

      <div class="gd-table-container">
        <div class="gd-table-toolbar">
          <mat-form-field appearance="outline" style="width:180px">
            <mat-label>Status</mat-label>
            <mat-select [(ngModel)]="statusFilter" (ngModelChange)="loadPayments()">
              <mat-option value="">All</mat-option>
              <mat-option *ngFor="let s of statusOptions" [value]="s.value">{{ s.label }}</mat-option>
            </mat-select>
          </mat-form-field>
        </div>

        @if (loading()) {
          <div class="gd-skeleton" style="height:300px"></div>
        } @else {
          <table class="gd-table">
            <thead>
              <tr>
                <th>Invoice</th>
                <th>Member</th>
                <th>Plan</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
                <th *ngIf="auth.isAdmin()">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (payment of payments(); track payment.id) {
                <tr>
                  <td><code>{{ payment.invoiceNumber }}</code></td>
                  <td>{{ $any(payment.member)?.firstName ?? '—' }} {{ $any(payment.member)?.lastName ?? '' }}</td>
                  <td>{{ payment.subscriptionPlan?.name ?? '—' }}</td>
                  <td>{{ payment.amount | currency:payment.currency }}</td>
                  <td>
                    <span class="badge" [ngClass]="'badge--' + payment.status">
                      {{ 'payments.status.' + payment.status | translate }}
                    </span>
                  </td>
                  <td>{{ (payment.paymentDate || payment.createdAt) | date:'mediumDate' }}</td>
                  <td *ngIf="auth.isAdmin()">
                    @if (payment.status === 'paid') {
                      <button mat-stroked-button color="warn" (click)="refund(payment)" style="font-size:0.75rem;height:32px">
                        Refund
                      </button>
                    }
                  </td>
                </tr>
              } @empty {
                <tr><td colspan="7" style="text-align:center;padding:40px;color:var(--text-muted)">No payments found</td></tr>
              }
            </tbody>
          </table>
          <mat-paginator [length]="meta()?.total ?? 0" [pageSize]="10" [pageSizeOptions]="[10,25,50]" (page)="onPageChange($event)" showFirstLastButtons></mat-paginator>
        }
      </div>
    </div>
  `,
  styles: [`.page { max-width: 1400px; } code { font-family: monospace; font-size: 0.75rem; background: var(--surface-bg); padding: 2px 6px; border-radius: 4px; }`]
})
export class PaymentListComponent implements OnInit {
  protected readonly auth = inject(AuthService);
  private readonly paymentsService = inject(PaymentsService);
  private readonly toastr = inject(ToastrService);
  private readonly modal = inject(ModalService);

  readonly payments = signal<Payment[]>([]);
  readonly meta = signal<PaginationMeta | null>(null);
  readonly loading = signal(true);
  readonly revenueStats = signal<any[]>([]);

  statusFilter = '';
  page = 1;

  readonly statusOptions = [
    { value: PaymentStatus.PAID, label: 'Paid' },
    { value: PaymentStatus.PENDING, label: 'Pending' },
    { value: PaymentStatus.FAILED, label: 'Failed' },
    { value: PaymentStatus.REFUNDED, label: 'Refunded' },
  ];

  ngOnInit(): void {
    this.loadPayments();
    this.loadRevenueStats();
  }

  loadPayments(): void {
    this.loading.set(true);
    const params: any = { page: this.page, limit: 10 };
    if (this.statusFilter) params.status = this.statusFilter;
    this.paymentsService.getAll(params).subscribe({
      next: (res) => { this.payments.set(res.data); this.meta.set(res.meta); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  loadRevenueStats(): void {
    this.paymentsService.getRevenueStats().subscribe({
      next: (res) => {
        const total = res.data.reduce((sum: number, m: any) => sum + m.revenue, 0);
        const currentMonth = res.data.find((m: any) => m.month === new Date().getMonth() + 1)?.revenue ?? 0;
        this.revenueStats.set([
          { icon: 'payments', label: 'Total Revenue (YTD)', value: `$${total.toFixed(0)}`, bg: '#EEF1F8', color: '#3F5587' },
          { icon: 'trending_up', label: 'This Month', value: `$${currentMonth.toFixed(0)}`, bg: '#F0FDF4', color: '#16A34A' },
        ]);
      },
    });
  }

  onPageChange(event: PageEvent): void {
    this.page = event.pageIndex + 1;
    this.loadPayments();
  }

  async refund(payment: Payment): Promise<void> {
    const confirmed = await this.modal.confirm({
      title: 'Process Refund',
      message: `Refund invoice ${payment.invoiceNumber}? This will reverse the payment and cannot be undone.`,
      confirmText: 'Refund',
      cancelText: 'Cancel',
      type: 'warning',
    });
    if (!confirmed) return;
    this.paymentsService.refund(payment.id).subscribe({
      next: () => { this.toastr.success('Refund processed', 'Success'); this.loadPayments(); },
      error: (err) => this.toastr.error(err.error?.message ?? 'Refund failed', 'Error'),
    });
  }
}
