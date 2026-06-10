import { Component, inject, signal, ViewChild, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../../core/auth.service';
import { OtpInputComponent } from '../../../shared/otp-input/otp-input.component';

function passwordStrengthValidator(control: AbstractControl): ValidationErrors | null {
  const val = control.value as string;
  if (!val) return null;
  if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(val)) return { passwordStrength: true };
  return null;
}

type Step = 'form' | 'otp' | 'done';

@Component({
  selector: 'gd-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, CommonModule, OtpInputComponent, TranslateModule],
  template: `
    <!-- Step 1 — Registration Form -->
    @if (step() === 'form') {
      <div class="mb-8">
        <h1 class="text-3xl font-black text-white mb-2" style="font-family:'Space Grotesk',Inter,sans-serif">
          {{ 'auth.register' | translate }}
        </h1>
        <p class="text-gray-500 text-sm">Join GymDesk — we'll send a verification code to your email.</p>
      </div>

      <form [formGroup]="form" (ngSubmit)="sendOtp()" class="space-y-4">
        <!-- Name row -->
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              {{ 'auth.firstName' | translate }}
            </label>
            <div class="relative">
              <i class="fa-solid fa-user absolute start-4 top-1/2 -translate-y-1/2 text-gray-600 text-sm pointer-events-none"></i>
              <input formControlName="firstName" type="text" placeholder="John"
                class="w-full bg-[#111111] border text-white placeholder-gray-700 rounded-xl ps-11 pe-4 py-3.5 text-sm outline-none transition-all focus:border-[#22C55E] focus:ring-2 focus:ring-[#22C55E]/20"
                [class.border-gray-800]="!(form.get('firstName')?.invalid && form.get('firstName')?.touched)"
                [class.border-red-500]="form.get('firstName')?.invalid && form.get('firstName')?.touched">
            </div>
            @if (form.get('firstName')?.invalid && form.get('firstName')?.touched) {
              <p class="mt-1 text-xs text-red-400"><i class="fa-solid fa-circle-exclamation me-1"></i>Required</p>
            }
          </div>
          <div>
            <label class="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              {{ 'auth.lastName' | translate }}
            </label>
            <div class="relative">
              <i class="fa-solid fa-user absolute start-4 top-1/2 -translate-y-1/2 text-gray-600 text-sm pointer-events-none"></i>
              <input formControlName="lastName" type="text" placeholder="Doe"
                class="w-full bg-[#111111] border text-white placeholder-gray-700 rounded-xl ps-11 pe-4 py-3.5 text-sm outline-none transition-all focus:border-[#22C55E] focus:ring-2 focus:ring-[#22C55E]/20"
                [class.border-gray-800]="!(form.get('lastName')?.invalid && form.get('lastName')?.touched)"
                [class.border-red-500]="form.get('lastName')?.invalid && form.get('lastName')?.touched">
            </div>
            @if (form.get('lastName')?.invalid && form.get('lastName')?.touched) {
              <p class="mt-1 text-xs text-red-400"><i class="fa-solid fa-circle-exclamation me-1"></i>Required</p>
            }
          </div>
        </div>

        <!-- Email -->
        <div>
          <label class="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            {{ 'auth.email' | translate }}
          </label>
          <div class="relative">
            <i class="fa-solid fa-envelope absolute start-4 top-1/2 -translate-y-1/2 text-gray-600 text-sm pointer-events-none"></i>
            <input formControlName="email" type="email" autocomplete="email" placeholder="you@gymdesk.com"
              class="w-full bg-[#111111] border text-white placeholder-gray-700 rounded-xl ps-11 pe-4 py-3.5 text-sm outline-none transition-all focus:border-[#22C55E] focus:ring-2 focus:ring-[#22C55E]/20"
              [class.border-gray-800]="!(form.get('email')?.invalid && form.get('email')?.touched)"
              [class.border-red-500]="form.get('email')?.invalid && form.get('email')?.touched">
          </div>
          @if (form.get('email')?.hasError('required') && form.get('email')?.touched) {
            <p class="mt-1.5 text-xs text-red-400"><i class="fa-solid fa-circle-exclamation me-1"></i>Email is required</p>
          } @else if (form.get('email')?.hasError('email') && form.get('email')?.touched) {
            <p class="mt-1.5 text-xs text-red-400"><i class="fa-solid fa-circle-exclamation me-1"></i>Enter a valid email</p>
          }
        </div>

        <!-- Password -->
        <div>
          <label class="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            {{ 'auth.password' | translate }}
          </label>
          <div class="relative">
            <i class="fa-solid fa-lock absolute start-4 top-1/2 -translate-y-1/2 text-gray-600 text-sm pointer-events-none"></i>
            <input formControlName="password" [type]="showPassword() ? 'text' : 'password'"
              autocomplete="new-password" placeholder="Min 8 chars, uppercase & number"
              class="w-full bg-[#111111] border text-white placeholder-gray-700 rounded-xl ps-11 pe-12 py-3.5 text-sm outline-none transition-all focus:border-[#22C55E] focus:ring-2 focus:ring-[#22C55E]/20"
              [class.border-gray-800]="!(form.get('password')?.invalid && form.get('password')?.touched)"
              [class.border-red-500]="form.get('password')?.invalid && form.get('password')?.touched">
            <button type="button" (click)="togglePwd()"
                    class="absolute end-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400 transition-colors text-sm">
              <i [class]="showPassword() ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'"></i>
            </button>
          </div>
          <!-- Password strength bar -->
          <div class="mt-2 flex gap-1">
            @for (i of [1,2,3,4]; track i) {
              <div class="h-1 flex-1 rounded-full transition-colors"
                   [class.bg-red-500]="passwordStrength() >= i && passwordStrength() === 1"
                   [class.bg-orange-500]="passwordStrength() >= i && passwordStrength() === 2"
                   [class.bg-yellow-500]="passwordStrength() >= i && passwordStrength() === 3"
                   [class.bg-[#22C55E]]="passwordStrength() >= i && passwordStrength() === 4"
                   [class.bg-gray-800]="passwordStrength() < i"></div>
            }
          </div>
          @if (form.get('password')?.hasError('required') && form.get('password')?.touched) {
            <p class="mt-1.5 text-xs text-red-400"><i class="fa-solid fa-circle-exclamation me-1"></i>Password is required</p>
          } @else if (form.get('password')?.hasError('passwordStrength') && form.get('password')?.touched) {
            <p class="mt-1.5 text-xs text-red-400"><i class="fa-solid fa-circle-exclamation me-1"></i>Min 8 chars with uppercase and number</p>
          }
        </div>

        <!-- Phone -->
        <div>
          <label class="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            {{ 'auth.phone' | translate }} <span class="text-gray-700 font-normal normal-case">(optional)</span>
          </label>
          <div class="relative">
            <i class="fa-solid fa-phone absolute start-4 top-1/2 -translate-y-1/2 text-gray-600 text-sm pointer-events-none"></i>
            <input formControlName="phone" type="tel" placeholder="+1 (555) 000-0000"
              class="w-full bg-[#111111] border border-gray-800 text-white placeholder-gray-700 rounded-xl ps-11 pe-4 py-3.5 text-sm outline-none transition-all focus:border-[#22C55E] focus:ring-2 focus:ring-[#22C55E]/20">
          </div>
        </div>

        <button type="submit" [disabled]="loading()"
          class="w-full bg-[#22C55E] hover:bg-[#16A34A] disabled:opacity-60 disabled:cursor-not-allowed
                 text-[#0a0a0a] font-black text-sm tracking-widest uppercase py-4 rounded-xl mt-2
                 transition-all shadow-[0_0_20px_rgba(34,197,94,0.25)] flex items-center justify-center gap-2">
          @if (loading()) {
            <i class="fa-solid fa-spinner animate-spin"></i> {{ 'common.loading' | translate }}
          } @else {
            <i class="fa-solid fa-paper-plane"></i> Send Verification Code
          }
        </button>
      </form>

      <p class="mt-8 text-center text-sm text-gray-600">
        {{ 'auth.haveAccount' | translate }}
        <a routerLink="/auth/login" class="text-[#22C55E] hover:text-[#16A34A] font-semibold ms-1 transition-colors">
          {{ 'auth.login' | translate }}
        </a>
      </p>
      <div class="mt-4 text-center">
        <a routerLink="/" class="inline-flex items-center gap-2 text-xs text-gray-700 hover:text-gray-500 transition-colors">
          <i class="fa-solid fa-arrow-left text-[10px]"></i> Back to website
        </a>
      </div>
    }

    <!-- Step 2 — OTP Verification -->
    @if (step() === 'otp') {
      <div class="text-center mb-8">
        <div class="w-16 h-16 bg-[#22C55E]/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <i class="fa-solid fa-envelope-circle-check text-[#22C55E] text-3xl"></i>
        </div>
        <h1 class="text-3xl font-black text-white mb-2" style="font-family:'Space Grotesk',Inter,sans-serif">
          {{ 'auth.verifyEmail' | translate }}
        </h1>
        <p class="text-gray-500 text-sm">
          We sent a 6-digit code to<br>
          <span class="text-white font-semibold">{{ form.value.email }}</span>
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
            <i class="fa-solid fa-check"></i> Verify & Create Account
          }
        </button>

        <div class="text-center space-y-3">
          <p class="text-gray-600 text-sm">Didn't receive it?</p>
          @if (resendCountdown() > 0) {
            <p class="text-gray-600 text-sm">Resend in <span class="text-white font-semibold">{{ resendCountdown() }}s</span></p>
          } @else {
            <button (click)="resendCode()" [disabled]="loading()" class="text-sm text-[#22C55E] hover:text-[#16A34A] font-semibold transition-colors">
              <i class="fa-solid fa-rotate-right me-1"></i> Resend code
            </button>
          }
        </div>

        <button (click)="step.set('form')" class="w-full text-gray-600 hover:text-gray-400 text-sm transition-colors py-2">
          <i class="fa-solid fa-arrow-left me-1"></i> Change email
        </button>
      </div>
    }
  `,
})
export class RegisterComponent implements OnInit {
  @ViewChild('otpRef') otpRef?: OtpInputComponent;

  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toastr = inject(ToastrService);

  readonly step = signal<Step>('form');
  readonly showPassword = signal(false);
  readonly loading = signal(false);
  readonly otpError = signal('');
  readonly currentOtp = signal('');
  readonly resendCountdown = signal(0);

  private countdownInterval?: ReturnType<typeof setInterval>;

  togglePwd(): void { this.showPassword.update(v => !v); }

  readonly form = this.fb.group({
    firstName: ['', [Validators.required, Validators.minLength(2)]],
    lastName:  ['', [Validators.required, Validators.minLength(2)]],
    email:     ['', [Validators.required, Validators.email]],
    password:  ['', [Validators.required, passwordStrengthValidator]],
    phone:     [''],
  });

  get passwordStrength(): ReturnType<typeof signal<number>> {
    return this._passwordStrength;
  }

  private readonly _passwordStrength = signal(0);

  ngOnInit(): void {
    this.form.get('password')?.valueChanges.subscribe(val => {
      this._passwordStrength.set(this.calcStrength(val ?? ''));
    });
  }

  private calcStrength(val: string): number {
    if (!val) return 0;
    let score = 0;
    if (val.length >= 8) score++;
    if (/[A-Z]/.test(val)) score++;
    if (/[0-9]/.test(val)) score++;
    if (/[^A-Za-z0-9]/.test(val)) score++;
    return score;
  }

  sendOtp(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);
    const { firstName, lastName, email, password, phone } = this.form.value;
    this.authService.sendRegisterOtp({ firstName: firstName!, lastName: lastName!, email: email!, password: password!, phone: phone ?? undefined }).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.step.set('otp');
        this.otpError.set('');
        this.startCountdown();
        if (res.data?.emailSent === false) {
          this.toastr.warning('Account created but email delivery failed. Use "Resend code" to try again.', 'Email Issue');
        } else {
          this.toastr.success('Verification code sent to your email!', 'Code Sent');
        }
      },
      error: (err) => {
        this.loading.set(false);
        this.toastr.error(err.error?.message ?? 'Failed to send code. Please try again.', 'Error');
      },
    });
  }

  resendCode(): void {
    const email = this.form.value.email;
    if (!email || this.loading()) return;
    this.loading.set(true);
    this.authService.resendOtp(email).subscribe({
      next: () => {
        this.loading.set(false);
        this.otpError.set('');
        this.startCountdown();
        this.toastr.success('New verification code sent!', 'Code Sent');
      },
      error: (err) => {
        this.loading.set(false);
        this.toastr.error(err.error?.message ?? 'Failed to resend code. Please try again.', 'Error');
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
    const { firstName, lastName, email, password, phone } = this.form.value;
    this.authService.verifyRegisterOtp({ email: email!, code, firstName: firstName!, lastName: lastName!, password: password!, phone: phone ?? undefined }).subscribe({
      next: () => {
        this.loading.set(false);
        this.toastr.success('Account created successfully!', 'Welcome!');
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading.set(false);
        this.otpError.set(err.error?.message ?? 'Invalid code. Please try again.');
        this.otpRef?.reset();
        this.currentOtp.set('');
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
