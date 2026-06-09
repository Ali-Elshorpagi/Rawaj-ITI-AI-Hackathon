import { Component, inject, signal, ViewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../../core/auth.service';
import { OtpInputComponent } from '../../../shared/otp-input/otp-input.component';

function passwordStrengthValidator(control: AbstractControl): ValidationErrors | null {
  const val = control.value as string;
  if (!val) return null;
  if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(val)) return { passwordStrength: true };
  return null;
}

function passwordsMatchValidator(control: AbstractControl): ValidationErrors | null {
  const parent = control.parent;
  if (!parent) return null;
  const pw = parent.get('newPassword')?.value;
  return control.value !== pw ? { passwordsMismatch: true } : null;
}

type Step = 'email' | 'otp' | 'password' | 'done';

@Component({
  selector: 'gd-forgot-password',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, CommonModule, OtpInputComponent],
  template: `
    <!-- Step indicator dots -->
    <div class="flex items-center justify-center gap-2 mb-8">
      @for (s of steps; track s; let i = $index) {
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all"
               [class.bg-[#22C55E]]="isStepDone(i) || currentStepIndex() === i"
               [class.text-[#0a0a0a]]="isStepDone(i) || currentStepIndex() === i"
               [class.bg-gray-800]="currentStepIndex() < i"
               [class.text-gray-600]="currentStepIndex() < i">
            @if (isStepDone(i)) {
              <i class="fa-solid fa-check text-[10px]"></i>
            } @else {
              {{ i + 1 }}
            }
          </div>
          @if (i < steps.length - 1) {
            <div class="w-8 h-px"
                 [class.bg-[#22C55E]]="isStepDone(i)"
                 [class.bg-gray-800]="!isStepDone(i)"></div>
          }
        </div>
      }
    </div>

    <!-- Step 1 — Email -->
    @if (step() === 'email') {
      <div class="mb-8">
        <h1 class="text-3xl font-black text-white mb-2">Forgot password?</h1>
        <p class="text-gray-500 text-sm">Enter your email and we'll send a 6-digit verification code.</p>
      </div>

      <form [formGroup]="emailForm" (ngSubmit)="sendOtp()" class="space-y-5">
        <div>
          <label class="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Email Address</label>
          <div class="relative">
            <i class="fa-solid fa-envelope absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 text-sm pointer-events-none"></i>
            <input formControlName="email" type="email" autocomplete="email" placeholder="you@gymdesk.com"
              class="w-full bg-[#111111] border text-white placeholder-gray-700 rounded-xl pl-11 pr-4 py-3.5 text-sm outline-none transition-all focus:border-[#22C55E] focus:ring-2 focus:ring-[#22C55E]/20"
              [class.border-gray-800]="!(emailForm.get('email')?.invalid && emailForm.get('email')?.touched)"
              [class.border-red-500]="emailForm.get('email')?.invalid && emailForm.get('email')?.touched">
          </div>
          @if (emailForm.get('email')?.hasError('required') && emailForm.get('email')?.touched) {
            <p class="mt-1.5 text-xs text-red-400"><i class="fa-solid fa-circle-exclamation mr-1"></i>Email is required</p>
          } @else if (emailForm.get('email')?.hasError('email') && emailForm.get('email')?.touched) {
            <p class="mt-1.5 text-xs text-red-400"><i class="fa-solid fa-circle-exclamation mr-1"></i>Enter a valid email</p>
          }
        </div>

        <button type="submit" [disabled]="loading()"
          class="w-full bg-[#22C55E] hover:bg-[#16A34A] disabled:opacity-60 disabled:cursor-not-allowed
                 text-[#0a0a0a] font-black text-sm tracking-widest uppercase py-4 rounded-xl
                 transition-all shadow-[0_0_20px_rgba(34,197,94,0.25)] flex items-center justify-center gap-2">
          @if (loading()) {
            <i class="fa-solid fa-spinner animate-spin"></i> Sending code...
          } @else {
            <i class="fa-solid fa-paper-plane"></i> Send Verification Code
          }
        </button>
      </form>

      <p class="mt-8 text-center text-sm text-gray-600">
        Remember your password?
        <a routerLink="/auth/login" class="text-[#22C55E] hover:text-[#16A34A] font-semibold ml-1 transition-colors">Sign in</a>
      </p>
    }

    <!-- Step 2 — OTP -->
    @if (step() === 'otp') {
      <div class="text-center mb-8">
        <div class="w-16 h-16 bg-[#22C55E]/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <i class="fa-solid fa-envelope-circle-check text-[#22C55E] text-3xl"></i>
        </div>
        <h1 class="text-3xl font-black text-white mb-2">Check your email</h1>
        <p class="text-gray-500 text-sm">
          We sent a 6-digit code to<br>
          <span class="text-white font-semibold">{{ emailForm.value.email }}</span>
        </p>
      </div>

      <div class="space-y-6">
        <gd-otp-input #otpRef (otpComplete)="onOtpComplete($event)" (otpChange)="currentOtp.set($event)" />

        @if (otpError()) {
          <div class="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-xl p-3">
            <i class="fa-solid fa-circle-exclamation text-red-400 text-sm flex-shrink-0"></i>
            <p class="text-red-400 text-sm">{{ otpError() }}</p>
          </div>
        }

        <button (click)="verifyOtp()" [disabled]="loading() || currentOtp().length < 6"
          class="w-full bg-[#22C55E] hover:bg-[#16A34A] disabled:opacity-50 disabled:cursor-not-allowed
                 text-[#0a0a0a] font-black text-sm tracking-widest uppercase py-4 rounded-xl
                 transition-all shadow-[0_0_20px_rgba(34,197,94,0.25)] flex items-center justify-center gap-2">
          @if (loading()) {
            <i class="fa-solid fa-spinner animate-spin"></i> Verifying...
          } @else {
            <i class="fa-solid fa-check"></i> Verify Code
          }
        </button>

        <div class="text-center space-y-3">
          <p class="text-gray-600 text-sm">Didn't receive it?</p>
          @if (resendCountdown() > 0) {
            <p class="text-gray-600 text-sm">Resend in <span class="text-white font-semibold">{{ resendCountdown() }}s</span></p>
          } @else {
            <button (click)="sendOtp()" [disabled]="loading()" class="text-sm text-[#22C55E] hover:text-[#16A34A] font-semibold transition-colors">
              <i class="fa-solid fa-rotate-right mr-1"></i> Resend code
            </button>
          }
        </div>

        <button (click)="step.set('email')" class="w-full text-gray-600 hover:text-gray-400 text-sm transition-colors py-2">
          <i class="fa-solid fa-arrow-left mr-1"></i> Change email
        </button>
      </div>
    }

    <!-- Step 3 — New Password -->
    @if (step() === 'password') {
      <div class="mb-8 text-center">
        <div class="w-16 h-16 bg-[#22C55E]/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <i class="fa-solid fa-lock-open text-[#22C55E] text-3xl"></i>
        </div>
        <h1 class="text-3xl font-black text-white mb-2">New password</h1>
        <p class="text-gray-500 text-sm">Create a strong password for your account.</p>
      </div>

      <form [formGroup]="passwordForm" (ngSubmit)="resetPassword()" class="space-y-5">
        <div>
          <label class="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">New Password</label>
          <div class="relative">
            <i class="fa-solid fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 text-sm pointer-events-none"></i>
            <input formControlName="newPassword" [type]="showPassword() ? 'text' : 'password'"
              autocomplete="new-password" placeholder="Min 8 chars, uppercase & number"
              class="w-full bg-[#111111] border text-white placeholder-gray-700 rounded-xl pl-11 pr-12 py-3.5 text-sm outline-none transition-all focus:border-[#22C55E] focus:ring-2 focus:ring-[#22C55E]/20"
              [class.border-gray-800]="!(passwordForm.get('newPassword')?.invalid && passwordForm.get('newPassword')?.touched)"
              [class.border-red-500]="passwordForm.get('newPassword')?.invalid && passwordForm.get('newPassword')?.touched">
            <button type="button" (click)="togglePwd()"
                    class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400 transition-colors text-sm">
              <i [class]="showPassword() ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'"></i>
            </button>
          </div>
          @if (passwordForm.get('newPassword')?.hasError('required') && passwordForm.get('newPassword')?.touched) {
            <p class="mt-1.5 text-xs text-red-400"><i class="fa-solid fa-circle-exclamation mr-1"></i>Password is required</p>
          } @else if (passwordForm.get('newPassword')?.hasError('passwordStrength') && passwordForm.get('newPassword')?.touched) {
            <p class="mt-1.5 text-xs text-red-400"><i class="fa-solid fa-circle-exclamation mr-1"></i>Min 8 chars with uppercase and number</p>
          }
        </div>

        <div>
          <label class="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Confirm Password</label>
          <div class="relative">
            <i class="fa-solid fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 text-sm pointer-events-none"></i>
            <input formControlName="confirmPassword" [type]="showPassword() ? 'text' : 'password'"
              autocomplete="new-password" placeholder="Repeat your password"
              class="w-full bg-[#111111] border text-white placeholder-gray-700 rounded-xl pl-11 pr-4 py-3.5 text-sm outline-none transition-all focus:border-[#22C55E] focus:ring-2 focus:ring-[#22C55E]/20"
              [class.border-gray-800]="!(passwordForm.get('confirmPassword')?.invalid && passwordForm.get('confirmPassword')?.touched)"
              [class.border-red-500]="passwordForm.get('confirmPassword')?.invalid && passwordForm.get('confirmPassword')?.touched">
          </div>
          @if (passwordForm.get('confirmPassword')?.hasError('passwordsMismatch') && passwordForm.get('confirmPassword')?.touched) {
            <p class="mt-1.5 text-xs text-red-400"><i class="fa-solid fa-circle-exclamation mr-1"></i>Passwords do not match</p>
          }
        </div>

        @if (resetError()) {
          <div class="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-xl p-3">
            <i class="fa-solid fa-circle-exclamation text-red-400 text-sm flex-shrink-0"></i>
            <p class="text-red-400 text-sm">{{ resetError() }}</p>
          </div>
        }

        <button type="submit" [disabled]="loading()"
          class="w-full bg-[#22C55E] hover:bg-[#16A34A] disabled:opacity-60 disabled:cursor-not-allowed
                 text-[#0a0a0a] font-black text-sm tracking-widest uppercase py-4 rounded-xl
                 transition-all shadow-[0_0_20px_rgba(34,197,94,0.25)] flex items-center justify-center gap-2">
          @if (loading()) {
            <i class="fa-solid fa-spinner animate-spin"></i> Resetting...
          } @else {
            <i class="fa-solid fa-key"></i> Reset Password
          }
        </button>
      </form>
    }

    <!-- Step 4 — Done -->
    @if (step() === 'done') {
      <div class="text-center">
        <div class="w-20 h-20 bg-[#22C55E]/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <i class="fa-solid fa-circle-check text-[#22C55E] text-4xl"></i>
        </div>
        <h1 class="text-3xl font-black text-white mb-3">Password reset!</h1>
        <p class="text-gray-500 text-sm mb-8">Your password has been updated successfully.<br>You can now sign in with your new password.</p>
        <a routerLink="/auth/login"
          class="inline-flex items-center justify-center gap-2 bg-[#22C55E] hover:bg-[#16A34A]
                 text-[#0a0a0a] font-black text-sm tracking-widest uppercase px-8 py-4 rounded-xl
                 transition-all shadow-[0_0_20px_rgba(34,197,94,0.25)]">
          <i class="fa-solid fa-arrow-right-to-bracket"></i> Sign In
        </a>
      </div>
    }

    @if (step() !== 'done') {
      <div class="mt-6 text-center">
        <a routerLink="/" class="inline-flex items-center gap-2 text-xs text-gray-700 hover:text-gray-500 transition-colors">
          <i class="fa-solid fa-arrow-left text-[10px]"></i> Back to website
        </a>
      </div>
    }
  `,
})
export class ForgotPasswordComponent {
  @ViewChild('otpRef') otpRef?: OtpInputComponent;

  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toastr = inject(ToastrService);

  readonly step = signal<Step>('email');
  readonly loading = signal(false);
  readonly showPassword = signal(false);
  readonly otpError = signal('');
  readonly resetError = signal('');
  readonly currentOtp = signal('');
  readonly resendCountdown = signal(0);

  private resetToken = '';
  private countdownInterval?: ReturnType<typeof setInterval>;

  readonly steps = ['Email', 'Verify', 'Password'];
  readonly stepMap: Record<Step, number> = { email: 0, otp: 1, password: 2, done: 3 };

  currentStepIndex(): number { return this.stepMap[this.step()]; }
  isStepDone(i: number): boolean { return this.currentStepIndex() > i; }
  togglePwd(): void { this.showPassword.update(v => !v); }

  readonly emailForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  readonly passwordForm = this.fb.group({
    newPassword:     ['', [Validators.required, passwordStrengthValidator]],
    confirmPassword: ['', [Validators.required, passwordsMatchValidator]],
  });

  sendOtp(): void {
    if (this.emailForm.invalid) { this.emailForm.markAllAsTouched(); return; }
    this.loading.set(true);
    this.authService.sendResetOtp(this.emailForm.value.email!).subscribe({
      next: () => {
        this.loading.set(false);
        this.step.set('otp');
        this.otpError.set('');
        this.startCountdown();
        this.toastr.success('Verification code sent to your email!', 'Code Sent');
      },
      error: (err) => {
        this.loading.set(false);
        this.toastr.error(err.error?.message ?? 'Failed to send code. Please try again.', 'Error');
      },
    });
  }

  onOtpComplete(code: string): void {
    this.currentOtp.set(code);
    this.verifyOtp();
  }

  verifyOtp(): void {
    const code = this.currentOtp();
    if (code.length < 6 || this.loading()) return;
    this.loading.set(true);
    this.otpError.set('');
    this.authService.verifyResetOtp(this.emailForm.value.email!, code).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.resetToken = res.data.resetToken;
        this.step.set('password');
      },
      error: (err) => {
        this.loading.set(false);
        this.otpError.set(err.error?.message ?? 'Invalid code. Please try again.');
        this.otpRef?.reset();
        this.currentOtp.set('');
      },
    });
  }

  resetPassword(): void {
    this.passwordForm.get('confirmPassword')?.updateValueAndValidity();
    if (this.passwordForm.invalid) { this.passwordForm.markAllAsTouched(); return; }
    this.loading.set(true);
    this.resetError.set('');
    this.authService.resetPasswordWithOtp(this.resetToken, this.passwordForm.value.newPassword!).subscribe({
      next: () => {
        this.loading.set(false);
        this.step.set('done');
        this.toastr.success('Password reset successfully!', 'Success');
      },
      error: (err) => {
        this.loading.set(false);
        this.resetError.set(err.error?.message ?? 'Failed to reset password. Please start over.');
      },
    });
  }

  private startCountdown(): void {
    clearInterval(this.countdownInterval);
    this.resendCountdown.set(60);
    this.countdownInterval = setInterval(() => {
      this.resendCountdown.update(v => {
        if (v <= 1) { clearInterval(this.countdownInterval); return 0; }
        return v - 1;
      });
    }, 1000);
  }
}
