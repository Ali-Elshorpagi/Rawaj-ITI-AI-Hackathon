import { Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../../core/auth.service';

@Component({
  selector: 'gd-reset-password',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, CommonModule],
  template: `
    <div class="mb-8">
      <div class="w-14 h-14 bg-[#22C55E]/10 rounded-2xl flex items-center justify-center mb-6">
        <i class="fa-solid fa-lock-open text-[#22C55E] text-2xl"></i>
      </div>
      <h1 class="text-3xl font-black text-white mb-2">Set new password</h1>
      <p class="text-gray-500 text-sm">Must be at least 8 characters with uppercase and a number.</p>
    </div>

    <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-5">
      <!-- New password -->
      <div>
        <label class="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">New Password</label>
        <div class="relative">
          <i class="fa-solid fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 text-sm pointer-events-none"></i>
          <input formControlName="password" [type]="showPwd() ? 'text' : 'password'"
            placeholder="Enter new password"
            class="w-full bg-[#111111] border text-white placeholder-gray-700 rounded-xl pl-11 pr-12 py-3.5 text-sm outline-none transition-all focus:border-[#22C55E] focus:ring-2 focus:ring-[#22C55E]/20"
            [class.border-gray-800]="!(form.get('password')?.invalid && form.get('password')?.touched)"
            [class.border-red-500]="form.get('password')?.invalid && form.get('password')?.touched">
          <button type="button" (click)="togglePwd()"
                  class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400 transition-colors text-sm">
            <i [class]="showPwd() ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'"></i>
          </button>
        </div>
        @if (form.get('password')?.invalid && form.get('password')?.touched) {
          <p class="mt-1.5 text-xs text-red-400"><i class="fa-solid fa-circle-exclamation mr-1"></i>Min 8 chars with uppercase & number</p>
        }
      </div>

      <!-- Confirm password -->
      <div>
        <label class="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Confirm Password</label>
        <div class="relative">
          <i class="fa-solid fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 text-sm pointer-events-none"></i>
          <input formControlName="confirmPassword" [type]="showPwd() ? 'text' : 'password'"
            placeholder="Confirm new password"
            class="w-full bg-[#111111] border text-white placeholder-gray-700 rounded-xl pl-11 pr-4 py-3.5 text-sm outline-none transition-all focus:border-[#22C55E] focus:ring-2 focus:ring-[#22C55E]/20"
            [class.border-gray-800]="!(form.get('confirmPassword')?.invalid && form.get('confirmPassword')?.touched)"
            [class.border-red-500]="form.get('confirmPassword')?.invalid && form.get('confirmPassword')?.touched">
        </div>
        @if (form.get('confirmPassword')?.hasError('mismatch') && form.get('confirmPassword')?.touched) {
          <p class="mt-1.5 text-xs text-red-400"><i class="fa-solid fa-circle-exclamation mr-1"></i>Passwords do not match</p>
        }
      </div>

      <button type="submit" [disabled]="loading()"
        class="w-full bg-[#22C55E] hover:bg-[#16A34A] disabled:opacity-60 text-[#0a0a0a] font-black text-sm tracking-widest uppercase py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(34,197,94,0.25)] flex items-center justify-center gap-2">
        @if (loading()) {
          <i class="fa-solid fa-spinner animate-spin"></i> Updating...
        } @else {
          <i class="fa-solid fa-check"></i> Reset Password
        }
      </button>
    </form>

    <p class="mt-8 text-center text-sm text-gray-600">
      <a routerLink="/auth/login" class="text-[#22C55E] hover:text-[#16A34A] font-semibold transition-colors">
        <i class="fa-solid fa-arrow-left mr-1"></i> Back to sign in
      </a>
    </p>
  `,
})
export class ResetPasswordComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly toastr = inject(ToastrService);

  readonly showPwd = signal(false);
  readonly loading = signal(false);
  private token = '';

  togglePwd(): void { this.showPwd.update(v => !v); }

  readonly form = this.fb.group({
    password:        ['', [Validators.required, Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/)]],
    confirmPassword: ['', Validators.required],
  });

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token') ?? '';
    if (!this.token) {
      this.toastr.error('Invalid reset link.', 'Error');
      this.router.navigate(['/auth/login']);
    }
  }

  onSubmit(): void {
    const pwd = this.form.value.password;
    const confirm = this.form.value.confirmPassword;
    if (pwd !== confirm) {
      this.form.get('confirmPassword')!.setErrors({ mismatch: true });
    }
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);
    this.authService.resetPassword(this.token, pwd!).subscribe({
      next: () => {
        this.toastr.success('Password updated. Please sign in.', 'Success');
        this.router.navigate(['/auth/login']);
      },
      error: (err) => {
        this.loading.set(false);
        this.toastr.error(err.error?.message ?? 'Reset failed. Link may have expired.', 'Error');
      },
    });
  }
}
