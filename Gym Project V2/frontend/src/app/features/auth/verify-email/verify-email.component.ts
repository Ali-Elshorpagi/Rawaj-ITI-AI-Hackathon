import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../../core/auth.service';

@Component({
  selector: 'gd-verify-email',
  standalone: true,
  imports: [RouterLink, MatButtonModule],
  template: `
    <div class="verify-wrapper">
      @if (loading()) {
        <i class="fa-solid fa-rotate spin" style="font-size:48px"></i>
        <p>Verifying your email...</p>
      } @else if (success()) {
        <div class="icon-success"><i class="fa-solid fa-circle-check"></i></div>
        <h2>Email Verified!</h2>
        <p>Your email has been verified. You can now log in.</p>
        <a routerLink="/auth/login" mat-flat-button color="primary">Sign In</a>
      } @else {
        <div class="icon-error"><i class="fa-solid fa-circle-exclamation"></i></div>
        <h2>Verification Failed</h2>
        <p>The link may have expired. Request a new one.</p>
        <a routerLink="/auth/login" mat-flat-button color="primary">Back to Login</a>
      }
    </div>
  `,
  styles: [`.verify-wrapper { width: 100%; max-width: 400px; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 16px; } .icon-success { width: 80px; height: 80px; border-radius: 50%; background: #dcfce7; display: flex; align-items: center; justify-content: center; i { font-size: 40px; color: #16a34a; } } .icon-error { width: 80px; height: 80px; border-radius: 50%; background: #fee2e2; display: flex; align-items: center; justify-content: center; i { font-size: 40px; color: #dc2626; } } .spin { animation: spin 1s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } }`]
})
export class VerifyEmailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly authService = inject(AuthService);

  readonly loading = signal(true);
  readonly success = signal(false);

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token');
    if (!token) { this.loading.set(false); return; }

    this.authService.verifyEmail(token).subscribe({
      next: () => { this.loading.set(false); this.success.set(true); },
      error: () => { this.loading.set(false); this.success.set(false); },
    });
  }
}
