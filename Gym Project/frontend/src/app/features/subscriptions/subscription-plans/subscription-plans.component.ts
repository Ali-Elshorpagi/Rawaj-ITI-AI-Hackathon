import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { TranslateModule } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { SubscriptionsService } from '../../../services/subscriptions.service';
import { SubscriptionPlan } from '../../../models/interfaces';
import { AuthService } from '../../../core/auth.service';
import { SubscriptionPlanType } from '../../../models/enums';
import { ModalService } from '../../../shared/modal/modal.service';

@Component({
  selector: 'gd-subscription-plans',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule,
    MatIconModule, MatButtonModule, MatDialogModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatSlideToggleModule, TranslateModule,
  ],
  template: `
    <div class="page">
      <div class="gd-page-header">
        <div>
          <h1 class="gd-page-header__title">{{ 'subscriptions.title' | translate }}</h1>
          <p class="gd-page-header__subtitle">Manage membership subscription plans</p>
        </div>
        <button mat-flat-button color="primary" (click)="openPlanDialog()" *ngIf="auth.isAdmin()">
          <mat-icon>add</mat-icon> {{ 'subscriptions.addPlan' | translate }}
        </button>
      </div>

      @if (loading()) {
        <div class="gd-grid gd-grid--4">
          @for (_ of [1,2,3,4]; track $index) {
            <div class="gd-card"><div class="gd-skeleton" style="height:200px"></div></div>
          }
        </div>
      } @else {
        <div class="plans-grid">
          @for (plan of plans(); track plan.id) {
            <div class="plan-card" [class.plan-card--popular]="plan.isPopular">
              @if (plan.isPopular) {
                <div class="plan-card__badge">Most Popular</div>
              }
              <div class="plan-card__header" [style.border-color]="plan.color">
                <h3>{{ plan.name }}</h3>
                <span class="badge badge--{{ plan.isActive ? 'active' : 'expired' }}">
                  {{ plan.isActive ? 'Active' : 'Inactive' }}
                </span>
              </div>
              <div class="plan-card__price">
                <span class="plan-card__amount">{{ plan.price | currency:plan.currency }}</span>
                <span class="plan-card__period">/ {{ plan.durationDays }} days</span>
              </div>
              <div class="plan-card__type">{{ 'subscriptions.types.' + plan.type | translate }}</div>
              <ul class="plan-card__features">
                @for (feature of plan.features; track $index) {
                  <li><mat-icon>check</mat-icon> {{ feature }}</li>
                }
              </ul>
              @if (auth.isAdmin()) {
                <div class="plan-card__actions">
                  <button mat-stroked-button (click)="openPlanDialog(plan)">
                    <mat-icon>edit</mat-icon> Edit
                  </button>
                  <button mat-stroked-button color="warn" (click)="deletePlan(plan)">
                    <mat-icon>delete</mat-icon>
                  </button>
                </div>
              }
            </div>
          } @empty {
            <div class="gd-empty-state" style="grid-column:1/-1">
              <mat-icon>card_membership</mat-icon>
              <h3>No subscription plans</h3>
              <p>Create your first subscription plan to get started.</p>
            </div>
          }
        </div>
      }
    </div>

    <!-- Plan Dialog Template -->
    @if (showDialog()) {
      <div class="dialog-overlay" (click)="closeDialog()">
        <div class="dialog-panel" (click)="$event.stopPropagation()">
          <h3>{{ editingPlan() ? 'Edit Plan' : 'Create Plan' }}</h3>
          <form [formGroup]="planForm" (ngSubmit)="savePlan()">
            <mat-form-field appearance="outline">
              <mat-label>Plan Name</mat-label>
              <input matInput formControlName="name">
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Type</mat-label>
              <mat-select formControlName="type">
                <mat-option *ngFor="let t of planTypes" [value]="t.value">{{ t.label }}</mat-option>
              </mat-select>
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Price (USD)</mat-label>
              <input matInput type="number" formControlName="price">
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Description</mat-label>
              <textarea matInput formControlName="description" rows="2"></textarea>
            </mat-form-field>
            <mat-slide-toggle formControlName="isPopular">Mark as Popular</mat-slide-toggle>
            <mat-slide-toggle formControlName="isActive" style="margin-top:8px">Active</mat-slide-toggle>
            <div class="dialog-actions">
              <button mat-stroked-button type="button" (click)="closeDialog()">Cancel</button>
              <button mat-flat-button color="primary" type="submit" [disabled]="savingPlan()">
                {{ savingPlan() ? 'Saving...' : 'Save' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    }
  `,
  styles: [`
    .page { max-width: 1400px; }
    .plans-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 24px; }
    .plan-card {
      background: var(--surface-card); border: 2px solid var(--surface-border);
      border-radius: var(--radius-xl); padding: 24px; position: relative;
      transition: transform var(--transition-base), box-shadow var(--transition-base);
      &:hover { transform: translateY(-2px); box-shadow: var(--shadow-lg); }
      &--popular { border-color: var(--color-primary-400); }
      &__badge { position: absolute; top: -12px; right: 16px; background: var(--color-primary-500); color: white; font-size: 0.75rem; font-weight: 600; padding: 4px 12px; border-radius: 100px; }
      &__header { display: flex; justify-content: space-between; align-items: flex-start; border-top: 4px solid; border-radius: 4px 4px 0 0; margin: -24px -24px 16px; padding: 16px 24px 12px; h3 { font-size: 1.125rem; font-weight: 700; } }
      &__price { margin-bottom: 8px; }
      &__amount { font-size: 2rem; font-weight: 800; color: var(--text-primary); }
      &__period { font-size: 0.875rem; color: var(--text-muted); margin-left: 4px; }
      &__type { font-size: 0.8125rem; font-weight: 500; color: var(--color-primary-500); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 16px; }
      &__features { list-style: none; margin-bottom: 20px; li { display: flex; align-items: center; gap: 8px; font-size: 0.875rem; color: var(--text-secondary); margin-bottom: 8px; mat-icon { font-size: 16px; width: 16px; height: 16px; color: var(--color-success-600); } } }
      &__actions { display: flex; gap: 8px; }
    }
    .dialog-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 1000; display: flex; align-items: center; justify-content: center; }
    .dialog-panel { background: var(--surface-card); border-radius: var(--radius-xl); padding: 32px; width: 480px; max-width: 90vw; h3 { margin-bottom: 24px; font-size: 1.25rem; } display: flex; flex-direction: column; gap: 4px; form { display: flex; flex-direction: column; gap: 4px; } }
    mat-form-field { width: 100%; }
    .dialog-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 16px; }
  `]
})
export class SubscriptionPlansComponent implements OnInit {
  protected readonly auth = inject(AuthService);
  private readonly subscriptionsService = inject(SubscriptionsService);
  private readonly toastr = inject(ToastrService);
  private readonly fb = inject(FormBuilder);
  private readonly modal = inject(ModalService);

  readonly plans = signal<SubscriptionPlan[]>([]);
  readonly loading = signal(true);
  readonly showDialog = signal(false);
  readonly editingPlan = signal<SubscriptionPlan | null>(null);
  readonly savingPlan = signal(false);

  readonly planTypes = [
    { value: SubscriptionPlanType.MONTHLY, label: 'Monthly (30 days)' },
    { value: SubscriptionPlanType.QUARTERLY, label: 'Quarterly (90 days)' },
    { value: SubscriptionPlanType.SEMI_ANNUAL, label: 'Semi-Annual (180 days)' },
    { value: SubscriptionPlanType.ANNUAL, label: 'Annual (365 days)' },
  ];

  readonly planForm = this.fb.group({
    name: ['', Validators.required],
    type: [SubscriptionPlanType.MONTHLY, Validators.required],
    price: [0, [Validators.required, Validators.min(0)]],
    description: [''],
    isPopular: [false],
    isActive: [true],
  });

  ngOnInit(): void { this.loadPlans(); }

  loadPlans(): void {
    this.loading.set(true);
    const obs = this.auth.isAdmin()
      ? this.subscriptionsService.getAllPlans()
      : this.subscriptionsService.getPlans();

    obs.subscribe({
      next: (res) => { this.plans.set(res.data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  openPlanDialog(plan?: SubscriptionPlan): void {
    this.editingPlan.set(plan ?? null);
    if (plan) {
      this.planForm.patchValue({ name: plan.name, type: plan.type as any, price: plan.price, description: plan.description ?? '', isPopular: plan.isPopular, isActive: plan.isActive });
    } else {
      this.planForm.reset({ type: SubscriptionPlanType.MONTHLY, isActive: true, isPopular: false });
    }
    this.showDialog.set(true);
  }

  closeDialog(): void { this.showDialog.set(false); }

  savePlan(): void {
    if (this.planForm.invalid) return;
    this.savingPlan.set(true);
    const data = this.planForm.value as any;
    const obs = this.editingPlan()
      ? this.subscriptionsService.updatePlan(this.editingPlan()!.id, data)
      : this.subscriptionsService.createPlan(data);

    obs.subscribe({
      next: () => {
        this.toastr.success(this.editingPlan() ? 'Plan updated' : 'Plan created', 'Success');
        this.closeDialog();
        this.loadPlans();
        this.savingPlan.set(false);
      },
      error: (err) => {
        this.savingPlan.set(false);
        this.toastr.error(err.error?.message ?? 'Save failed', 'Error');
      },
    });
  }

  async deletePlan(plan: SubscriptionPlan): Promise<void> {
    const confirmed = await this.modal.confirm({
      title: 'Delete Plan',
      message: `Delete the "${plan.name}" subscription plan? Members currently on this plan will not be affected until renewal.`,
      confirmText: 'Delete Plan',
      cancelText: 'Cancel',
      type: 'danger',
    });
    if (!confirmed) return;
    this.subscriptionsService.deletePlan(plan.id).subscribe({
      next: () => { this.toastr.success('Plan deleted', 'Success'); this.loadPlans(); },
      error: (err) => this.toastr.error(err.error?.message ?? 'Delete failed', 'Error'),
    });
  }
}
