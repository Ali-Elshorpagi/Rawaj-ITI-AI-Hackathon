import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSelectModule } from '@angular/material/select';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { ThemeService } from '../../core/theme.service';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'gd-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatSlideToggleModule, MatSelectModule, TranslateModule],
  template: `
    <div class="page">
      <div class="gd-page-header">
        <div>
          <h1 class="gd-page-header__title">{{ 'settings.title' | translate }}</h1>
          <p class="gd-page-header__subtitle">Application preferences and account settings</p>
        </div>
      </div>

      <div class="settings-layout">
        <aside class="settings-nav">
          @for (section of sections; track section.id) {
            <button class="settings-nav__item" [class.active]="activeSection() === section.id" (click)="activeSection.set(section.id)">
              <i [class]="section.icon"></i>
              <span>{{ section.label }}</span>
            </button>
          }
        </aside>

        <div class="settings-content">
          <!-- Appearance -->
          @if (activeSection() === 'appearance') {
            <div class="settings-section gd-card">
              <h3 class="settings-section__title">Appearance</h3>

              <div class="setting-row">
                <div class="setting-info">
                  <div class="setting-label">Dark Mode</div>
                  <div class="setting-desc">Switch between light and dark interface</div>
                </div>
                <mat-slide-toggle [checked]="themeService.isDark()" (change)="themeService.toggleTheme()"></mat-slide-toggle>
              </div>

              <div class="setting-row">
                <div class="setting-info">
                  <div class="setting-label">Language</div>
                  <div class="setting-desc">Choose the application language</div>
                </div>
                <mat-form-field appearance="outline" style="width:160px">
                  <mat-select [value]="themeService.language()" (selectionChange)="onLangChange($event.value)">
                    <mat-option value="en">English</mat-option>
                    <mat-option value="ar">العربية</mat-option>
                  </mat-select>
                </mat-form-field>
              </div>

              <div class="theme-preview">
                <div class="theme-swatch" [class.selected]="!themeService.isDark()" (click)="themeService.isDark() && themeService.toggleTheme()">
                  <div class="swatch-box light-swatch"></div>
                  <span>Light</span>
                </div>
                <div class="theme-swatch" [class.selected]="themeService.isDark()" (click)="!themeService.isDark() && themeService.toggleTheme()">
                  <div class="swatch-box dark-swatch"></div>
                  <span>Dark</span>
                </div>
              </div>
            </div>
          }

          <!-- Security -->
          @if (activeSection() === 'security') {
            <div class="settings-section gd-card">
              <h3 class="settings-section__title">Change Password</h3>
              <form [formGroup]="passwordForm" (ngSubmit)="changePassword()">
                <mat-form-field appearance="outline">
                  <mat-label>Current Password</mat-label>
                  <input matInput type="password" formControlName="currentPassword">
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>New Password</mat-label>
                  <input matInput type="password" formControlName="newPassword">
                  <mat-hint>Min 8 chars with uppercase, lowercase, and number</mat-hint>
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>Confirm New Password</mat-label>
                  <input matInput type="password" formControlName="confirmPassword">
                  @if (passwordForm.errors?.['mismatch']) {
                    <mat-error>Passwords do not match</mat-error>
                  }
                </mat-form-field>
                <button mat-flat-button color="primary" type="submit" [disabled]="passwordForm.invalid || savingPassword()">
                  {{ savingPassword() ? 'Saving...' : 'Update Password' }}
                </button>
              </form>
            </div>
          }

          <!-- Notifications -->
          @if (activeSection() === 'notifications') {
            <div class="settings-section gd-card">
              <h3 class="settings-section__title">Notification Preferences</h3>
              @for (pref of notifPrefs; track pref.id) {
                <div class="setting-row">
                  <div class="setting-info">
                    <div class="setting-label">{{ pref.label }}</div>
                    <div class="setting-desc">{{ pref.desc }}</div>
                  </div>
                  <mat-slide-toggle [(ngModel)]="pref.enabled"></mat-slide-toggle>
                </div>
              }
              <button mat-flat-button color="primary" style="margin-top:16px" (click)="saveNotifPrefs()">Save Preferences</button>
            </div>
          }

          <!-- About -->
          @if (activeSection() === 'about') {
            <div class="settings-section gd-card">
              <h3 class="settings-section__title">About GymDesk</h3>
              <div class="about-content">
                <div class="app-logo">
                  <i class="fa-solid fa-dumbbell" style="font-size:48px;color:var(--color-primary-500)"></i>
                </div>
                <h2>GymDesk</h2>
                <p class="version">Version 1.0.0</p>
                <p class="tagline">Modern Gym Management Platform</p>
                <div class="about-grid">
                  <div class="about-item"><span class="label">Framework</span><span class="value">Angular 18</span></div>
                  <div class="about-item"><span class="label">Backend</span><span class="value">Express + MongoDB</span></div>
                  <div class="about-item"><span class="label">UI</span><span class="value">Angular Material</span></div>
                  <div class="about-item"><span class="label">Payments</span><span class="value">Stripe</span></div>
                  <div class="about-item"><span class="label">Real-time</span><span class="value">Pusher</span></div>
                  <div class="about-item"><span class="label">Storage</span><span class="value">Cloudinary</span></div>
                </div>
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page { max-width: 1000px; }
    .settings-layout { display: grid; grid-template-columns: 220px 1fr; gap: 24px; }
    .settings-nav { display: flex; flex-direction: column; gap: 2px; background: var(--surface-card); border-radius: var(--radius-lg); padding: 8px; height: fit-content; }
    .settings-nav__item { display: flex; align-items: center; gap: 10px; padding: 10px 14px; border: none; border-radius: var(--radius-md); background: transparent; color: var(--text-secondary); font-size: 0.875rem; font-weight: 500; cursor: pointer; text-align: left; transition: all var(--transition-base); i { font-size: 18px; } }
    .settings-nav__item.active { background: var(--color-primary-50, #EEF1F8); color: var(--color-primary-600, #3F5587); font-weight: 600; }
    .settings-section { padding: 28px; }
    .settings-section__title { font-size: 1rem; font-weight: 700; margin-bottom: 24px; }
    form { display: flex; flex-direction: column; gap: 4px; max-width: 440px; }
    mat-form-field { width: 100%; }
    .setting-row { display: flex; justify-content: space-between; align-items: center; padding: 16px 0; border-bottom: 1px solid var(--surface-border); }
    .setting-row:last-of-type { border-bottom: none; }
    .setting-label { font-size: 0.875rem; font-weight: 600; color: var(--text-primary); }
    .setting-desc { font-size: 0.8125rem; color: var(--text-muted); margin-top: 2px; }
    .theme-preview { display: flex; gap: 16px; margin-top: 20px; }
    .theme-swatch { display: flex; flex-direction: column; align-items: center; gap: 8px; cursor: pointer; }
    .swatch-box { width: 100px; height: 64px; border-radius: var(--radius-md); border: 2px solid transparent; transition: border-color var(--transition-base); }
    .theme-swatch.selected .swatch-box { border-color: var(--color-primary-500); }
    .light-swatch { background: linear-gradient(135deg, #f5f7fa 50%, #e9ecef 50%); }
    .dark-swatch { background: linear-gradient(135deg, #1a1f2e 50%, #0f1117 50%); }
    .about-content { display: flex; flex-direction: column; align-items: center; text-align: center; padding: 24px 0; }
    .app-logo { margin-bottom: 12px; }
    h2 { font-size: 1.5rem; font-weight: 700; }
    .version { color: var(--text-muted); font-size: 0.875rem; }
    .tagline { color: var(--text-secondary); margin-bottom: 28px; }
    .about-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; width: 100%; }
    .about-item { background: var(--surface-bg); padding: 12px; border-radius: var(--radius-md); display: flex; flex-direction: column; gap: 4px; }
    .about-item .label { font-size: 0.6875rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); }
    .about-item .value { font-size: 0.875rem; font-weight: 600; }
    @media (max-width: 640px) { .settings-layout { grid-template-columns: 1fr; } .settings-nav { flex-direction: row; flex-wrap: wrap; } }
  `]
})
export class SettingsComponent {
  protected readonly themeService = inject(ThemeService);
  protected readonly auth = inject(AuthService);
  private readonly translate = inject(TranslateService);
  private readonly fb = inject(FormBuilder);
  private readonly toastr = inject(ToastrService);

  readonly activeSection = signal('appearance');
  readonly savingPassword = signal(false);

  readonly sections = [
    { id: 'appearance', label: 'Appearance', icon: 'fa-solid fa-palette' },
    { id: 'security', label: 'Security', icon: 'fa-solid fa-lock' },
    { id: 'notifications', label: 'Notifications', icon: 'fa-solid fa-bell' },
    { id: 'about', label: 'About', icon: 'fa-solid fa-circle-info' },
  ];

  notifPrefs = [
    { id: 'membership_expiry', label: 'Membership Expiry', desc: 'Get notified when memberships are about to expire', enabled: true },
    { id: 'payment_success', label: 'Payment Confirmation', desc: 'Receive confirmation for successful payments', enabled: true },
    { id: 'attendance', label: 'Attendance Alerts', desc: 'Notifications for member check-ins', enabled: false },
    { id: 'system', label: 'System Updates', desc: 'Updates about system changes and maintenance', enabled: true },
  ];

  readonly passwordForm = this.fb.group({
    currentPassword: ['', Validators.required],
    newPassword: ['', [Validators.required, Validators.minLength(8), Validators.pattern(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).+$/)]],
    confirmPassword: ['', Validators.required],
  }, { validators: this.passwordMatchValidator });

  private passwordMatchValidator(form: any) {
    const np = form.get('newPassword')?.value;
    const cp = form.get('confirmPassword')?.value;
    return np && cp && np !== cp ? { mismatch: true } : null;
  }

  onLangChange(lang: string): void {
    this.themeService.setLanguage(lang as 'en' | 'ar');
    this.translate.use(lang);
  }

  changePassword(): void {
    if (this.passwordForm.invalid) return;
    this.savingPassword.set(true);
    const { currentPassword, newPassword } = this.passwordForm.value;
    this.auth.changePassword(currentPassword!, newPassword!).subscribe({
      next: () => {
        this.toastr.success('Password updated successfully', 'Success');
        this.passwordForm.reset();
        this.savingPassword.set(false);
      },
      error: (err) => {
        this.savingPassword.set(false);
        this.toastr.error(err.error?.message ?? 'Update failed', 'Error');
      },
    });
  }

  saveNotifPrefs(): void {
    this.toastr.success('Notification preferences saved', 'Saved');
  }
}
