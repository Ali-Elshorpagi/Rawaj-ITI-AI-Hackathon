import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTabsModule } from '@angular/material/tabs';
import { TranslateModule } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../core/auth.service';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'gd-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatIconModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatDatepickerModule, MatNativeDateModule, MatTabsModule, TranslateModule],
  template: `
    <div class="page">
      <div class="gd-page-header">
        <h1 class="gd-page-header__title">{{ 'profile.title' | translate }}</h1>
      </div>

      <div class="profile-layout">
        <div class="profile-sidebar gd-card">
          <div class="avatar-wrapper">
            <div class="gd-avatar gd-avatar--xl">
              @if (auth.currentUser()?.profilePhoto) {
                <img [src]="auth.currentUser()?.profilePhoto" alt="Profile photo">
              } @else {
                {{ getInitials() }}
              }
            </div>
            <button class="avatar-edit" mat-mini-fab (click)="photoInput.click()">
              <mat-icon>photo_camera</mat-icon>
            </button>
            <input #photoInput type="file" accept="image/*" hidden (change)="onPhotoChange($event)">
          </div>

          <h3 class="profile-name">{{ auth.currentUser()?.firstName }} {{ auth.currentUser()?.lastName }}</h3>
          <p class="profile-email">{{ auth.currentUser()?.email }}</p>
          <span class="badge badge--active role-badge">{{ auth.userRole() }}</span>

          @if (auth.currentUser()?.isEmailVerified) {
            <div class="verified-badge">
              <mat-icon>verified</mat-icon> Email verified
            </div>
          }
        </div>

        <div class="profile-main">
          <mat-tab-group animationDuration="200ms">
            <mat-tab label="Personal Info">
              <div class="tab-content gd-card">
                <form [formGroup]="profileForm" (ngSubmit)="saveProfile()">
                  <div class="form-row">
                    <mat-form-field appearance="outline">
                      <mat-label>First Name</mat-label>
                      <input matInput formControlName="firstName">
                    </mat-form-field>
                    <mat-form-field appearance="outline">
                      <mat-label>Last Name</mat-label>
                      <input matInput formControlName="lastName">
                    </mat-form-field>
                  </div>
                  <mat-form-field appearance="outline">
                    <mat-label>Email</mat-label>
                    <input matInput type="email" formControlName="email">
                    <mat-icon matSuffix [style.color]="auth.currentUser()?.isEmailVerified ? '#16a34a' : '#f59e0b'">
                      {{ auth.currentUser()?.isEmailVerified ? 'verified' : 'warning' }}
                    </mat-icon>
                  </mat-form-field>
                  <div class="form-row">
                    <mat-form-field appearance="outline">
                      <mat-label>Phone</mat-label>
                      <input matInput formControlName="phone">
                    </mat-form-field>
                    <mat-form-field appearance="outline">
                      <mat-label>Gender</mat-label>
                      <mat-select formControlName="gender">
                        <mat-option value="male">Male</mat-option>
                        <mat-option value="female">Female</mat-option>
                        <mat-option value="other">Other</mat-option>
                      </mat-select>
                    </mat-form-field>
                  </div>
                  <mat-form-field appearance="outline">
                    <mat-label>Date of Birth</mat-label>
                    <input matInput [matDatepicker]="dp" formControlName="birthDate">
                    <mat-datepicker-toggle matSuffix [for]="dp"></mat-datepicker-toggle>
                    <mat-datepicker #dp></mat-datepicker>
                  </mat-form-field>

                  <div class="form-actions">
                    <button mat-flat-button color="primary" type="submit" [disabled]="profileForm.invalid || saving()">
                      {{ saving() ? 'Saving...' : 'Save Changes' }}
                    </button>
                  </div>
                </form>
              </div>
            </mat-tab>

            <mat-tab label="Activity">
              <div class="tab-content gd-card">
                <div class="activity-stats">
                  @for (stat of activityStats(); track $index) {
                    <div class="stat-box">
                      <div class="stat-icon" [style.background]="stat.bg">
                        <mat-icon [style.color]="stat.color">{{ stat.icon }}</mat-icon>
                      </div>
                      <div class="stat-value">{{ stat.value }}</div>
                      <div class="stat-label">{{ stat.label }}</div>
                    </div>
                  }
                </div>

                <div class="last-login" *ngIf="auth.currentUser()?.lastLogin">
                  <mat-icon>login</mat-icon>
                  <span>Last login: {{ auth.currentUser()?.lastLogin | date:'medium' }}</span>
                </div>
              </div>
            </mat-tab>
          </mat-tab-group>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page { max-width: 1100px; }
    .profile-layout { display: grid; grid-template-columns: 280px 1fr; gap: 24px; }
    .profile-sidebar { display: flex; flex-direction: column; align-items: center; padding: 32px 24px; text-align: center; height: fit-content; }
    .avatar-wrapper { position: relative; margin-bottom: 16px; }
    .avatar-edit { position: absolute; bottom: 0; right: -8px; transform: scale(0.75); }
    .profile-name { font-size: 1.125rem; font-weight: 700; margin-bottom: 4px; }
    .profile-email { font-size: 0.8125rem; color: var(--text-muted); margin-bottom: 12px; word-break: break-all; }
    .role-badge { text-transform: capitalize; }
    .verified-badge { display: flex; align-items: center; gap: 4px; font-size: 0.8125rem; color: #16a34a; margin-top: 12px; mat-icon { font-size: 16px; width: 16px; height: 16px; } }
    .tab-content { padding: 24px; margin-top: 16px; }
    form { display: flex; flex-direction: column; gap: 4px; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    mat-form-field { width: 100%; }
    .form-actions { margin-top: 8px; }
    .activity-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px; }
    .stat-box { background: var(--surface-bg); padding: 20px; border-radius: var(--radius-lg); text-align: center; }
    .stat-icon { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; margin: 0 auto 12px; mat-icon { font-size: 22px; width: 22px; height: 22px; } }
    .stat-value { font-size: 1.5rem; font-weight: 700; }
    .stat-label { font-size: 0.75rem; color: var(--text-muted); margin-top: 2px; }
    .last-login { display: flex; align-items: center; gap: 8px; font-size: 0.875rem; color: var(--text-muted); padding: 12px; background: var(--surface-bg); border-radius: var(--radius-md); mat-icon { font-size: 18px; width: 18px; height: 18px; } }
    @media (max-width: 768px) { .profile-layout { grid-template-columns: 1fr; } }
  `]
})
export class ProfileComponent implements OnInit {
  protected readonly auth = inject(AuthService);
  private readonly api = inject(ApiService);
  private readonly fb = inject(FormBuilder);
  private readonly toastr = inject(ToastrService);

  readonly saving = signal(false);
  readonly activityStats = signal<any[]>([]);

  readonly profileForm = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
    gender: [''],
    birthDate: [null as Date | null],
  });

  ngOnInit(): void {
    const user = this.auth.currentUser();
    if (user) {
      this.profileForm.patchValue({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone ?? '',
        gender: user.gender ?? '',
        birthDate: user.birthDate ? new Date(user.birthDate) : null,
      });
    }
    this.activityStats.set([
      { icon: 'login', label: 'Total Logins', value: '—', bg: '#EEF1F8', color: '#3F5587' },
      { icon: 'calendar_today', label: 'Member Since', value: user?.createdAt ? new Date(user.createdAt).getFullYear() : '—', bg: '#F0FDF4', color: '#16A34A' },
      { icon: 'security', label: 'Role', value: user?.role ?? '—', bg: '#FEF3C7', color: '#D97706' },
    ]);
  }

  saveProfile(): void {
    if (this.profileForm.invalid) return;
    this.saving.set(true);
    this.api.patch<any>('/auth/me', this.profileForm.value).subscribe({
      next: (res) => {
        this.auth.updateStoredUser(res.data.user);
        this.toastr.success('Profile updated', 'Success');
        this.saving.set(false);
      },
      error: (err) => {
        this.saving.set(false);
        this.toastr.error(err.error?.message ?? 'Update failed', 'Error');
      },
    });
  }

  onPhotoChange(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('photo', file);
    this.api.patchFormData<any>('/auth/me/photo', fd).subscribe({
      next: (res) => {
        this.auth.updateStoredUser(res.data.user);
        this.toastr.success('Photo updated', 'Success');
      },
      error: (err) => this.toastr.error(err.error?.message ?? 'Upload failed', 'Error'),
    });
  }

  getInitials(): string {
    const user = this.auth.currentUser();
    return `${user?.firstName?.[0] ?? ''}${user?.lastName?.[0] ?? ''}`.toUpperCase();
  }
}
