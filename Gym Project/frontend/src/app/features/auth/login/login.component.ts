import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../../core/auth.service';

@Component({
  selector: 'gd-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, CommonModule, TranslateModule],
  template: `
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-black text-white mb-2" style="font-family:'Space Grotesk',Inter,sans-serif">
        {{ 'auth.login' | translate }}
      </h1>
      <p class="text-gray-500 text-sm">{{ 'auth.haveAccount' | translate }}</p>
    </div>

    <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-5">

      <!-- Email -->
      <div>
        <label class="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
          {{ 'auth.email' | translate }}
        </label>
        <div class="relative">
          <i class="fa-solid fa-envelope absolute start-4 top-1/2 -translate-y-1/2 text-gray-600 text-sm pointer-events-none"></i>
          <input
            formControlName="email"
            type="email"
            autocomplete="email"
            [placeholder]="'auth.email' | translate"
            class="w-full bg-[#111111] border text-white placeholder-gray-700 rounded-xl ps-11 pe-4 py-3.5 text-sm outline-none transition-all
                   focus:border-[#22C55E] focus:ring-2 focus:ring-[#22C55E]/20"
            [class.border-gray-800]="!(form.get('email')?.invalid && form.get('email')?.touched)"
            [class.border-red-500]="form.get('email')?.invalid && form.get('email')?.touched"
          >
        </div>
        @if (form.get('email')?.hasError('required') && form.get('email')?.touched) {
          <p class="mt-1.5 text-xs text-red-400 flex items-center gap-1">
            <i class="fa-solid fa-circle-exclamation"></i> {{ 'auth.email' | translate }} is required
          </p>
        } @else if (form.get('email')?.hasError('email') && form.get('email')?.touched) {
          <p class="mt-1.5 text-xs text-red-400 flex items-center gap-1">
            <i class="fa-solid fa-circle-exclamation"></i> Enter a valid email address
          </p>
        }
      </div>

      <!-- Password -->
      <div>
        <div class="flex items-center justify-between mb-2">
          <label class="block text-xs font-semibold text-gray-400 uppercase tracking-wider">
            {{ 'auth.password' | translate }}
          </label>
          <a routerLink="/auth/forgot-password"
             class="text-xs text-[#22C55E] hover:text-[#16A34A] transition-colors font-medium">
            {{ 'auth.forgotPassword' | translate }}
          </a>
        </div>
        <div class="relative">
          <i class="fa-solid fa-lock absolute start-4 top-1/2 -translate-y-1/2 text-gray-600 text-sm pointer-events-none"></i>
          <input
            formControlName="password"
            [type]="showPassword() ? 'text' : 'password'"
            autocomplete="current-password"
            [placeholder]="'auth.password' | translate"
            class="w-full bg-[#111111] border text-white placeholder-gray-700 rounded-xl ps-11 pe-12 py-3.5 text-sm outline-none transition-all
                   focus:border-[#22C55E] focus:ring-2 focus:ring-[#22C55E]/20"
            [class.border-gray-800]="!(form.get('password')?.invalid && form.get('password')?.touched)"
            [class.border-red-500]="form.get('password')?.invalid && form.get('password')?.touched"
          >
          <button type="button" (click)="togglePassword()"
                  class="absolute end-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400 transition-colors text-sm">
            <i [class]="showPassword() ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'"></i>
          </button>
        </div>
        @if (form.get('password')?.hasError('required') && form.get('password')?.touched) {
          <p class="mt-1.5 text-xs text-red-400 flex items-center gap-1">
            <i class="fa-solid fa-circle-exclamation"></i> {{ 'auth.password' | translate }} is required
          </p>
        }
      </div>

      <!-- Remember me -->
      <div class="flex items-center gap-3">
        <label class="relative inline-flex items-center cursor-pointer">
          <input type="checkbox" formControlName="rememberMe" class="sr-only peer">
          <div class="w-10 h-5 bg-gray-800 peer-focus:ring-2 peer-focus:ring-[#22C55E]/20 rounded-full peer
                      peer-checked:bg-[#22C55E] after:content-[''] after:absolute after:top-[2px] after:start-[2px]
                      after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all
                      peer-checked:after:translate-x-5 border border-gray-700 peer-checked:border-[#22C55E]"></div>
        </label>
        <span class="text-sm text-gray-500">{{ 'auth.rememberMe' | translate }}</span>
      </div>

      <!-- Submit -->
      <button
        type="submit"
        [disabled]="loading()"
        class="w-full bg-[#22C55E] hover:bg-[#16A34A] disabled:opacity-60 disabled:cursor-not-allowed
               text-[#0a0a0a] font-black text-sm tracking-widest uppercase py-4 rounded-xl
               transition-all shadow-[0_0_20px_rgba(34,197,94,0.25)] hover:shadow-[0_0_30px_rgba(34,197,94,0.4)]
               flex items-center justify-center gap-2">
        @if (loading()) {
          <i class="fa-solid fa-spinner animate-spin"></i>
          <span>{{ 'common.loading' | translate }}</span>
        } @else {
          <span>{{ 'auth.login' | translate }}</span>
          <i class="fa-solid fa-arrow-right text-xs"></i>
        }
      </button>
    </form>

    <!-- Footer -->
    <p class="mt-8 text-center text-sm text-gray-600">
      {{ 'auth.noAccount' | translate }}
      <a routerLink="/auth/register" class="text-[#22C55E] hover:text-[#16A34A] font-semibold ms-1 transition-colors">
        {{ 'auth.register' | translate }}
      </a>
    </p>

    <!-- Back to website -->
    <div class="mt-6 text-center">
      <a routerLink="/" class="inline-flex items-center gap-2 text-xs text-gray-700 hover:text-gray-500 transition-colors">
        <i class="fa-solid fa-arrow-left text-[10px]"></i>
        Back to website
      </a>
    </div>
  `,
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toastr = inject(ToastrService);

  readonly showPassword = signal(false);
  readonly loading = signal(false);

  togglePassword(): void { this.showPassword.update(v => !v); }

  readonly form = this.fb.group({
    email:      ['', [Validators.required, Validators.email]],
    password:   ['', Validators.required],
    rememberMe: [false],
  });

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { email, password } = this.form.value;
    this.loading.set(true);

    this.authService.login(email!, password!).subscribe({
      next: () => {
        this.toastr.success('Welcome back!', 'Signed In');
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading.set(false);
        this.toastr.error(err.error?.message ?? 'Invalid email or password.', 'Sign In Failed');
      },
      complete: () => this.loading.set(false),
    });
  }
}
