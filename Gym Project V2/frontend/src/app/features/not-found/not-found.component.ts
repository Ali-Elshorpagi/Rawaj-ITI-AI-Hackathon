import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'gd-not-found',
  standalone: true,
  imports: [RouterLink, MatButtonModule],
  template: `
    <div class="not-found-page">
      <div class="not-found-content">
        <div class="not-found-graphic">
          <span class="not-found-code">404</span>
          <i class="fa-solid fa-dumbbell not-found-icon"></i>
        </div>
        <h1>Page Not Found</h1>
        <p>Looks like this page skipped leg day and doesn't exist anymore.</p>
        <div class="not-found-actions">
          <a routerLink="/dashboard" mat-flat-button color="primary">
            <i class="fa-solid fa-house"></i> Back to Dashboard
          </a>
          <button mat-stroked-button onclick="history.back()">
            <i class="fa-solid fa-arrow-left"></i> Go Back
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .not-found-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--surface-bg);
      padding: 24px;
    }
    .not-found-content {
      text-align: center;
      max-width: 480px;
    }
    .not-found-graphic {
      position: relative;
      display: inline-block;
      margin-bottom: 32px;
    }
    .not-found-code {
      font-size: 9rem;
      font-weight: 900;
      color: var(--color-primary-100, #D0D8EE);
      line-height: 1;
      display: block;
    }
    .not-found-icon {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 4rem;
      width: 4rem;
      height: 4rem;
      color: var(--color-primary-500);
    }
    h1 {
      font-size: 1.75rem;
      font-weight: 700;
      margin-bottom: 12px;
    }
    p {
      color: var(--text-muted);
      font-size: 1rem;
      margin-bottom: 32px;
      line-height: 1.6;
    }
    .not-found-actions {
      display: flex;
      gap: 12px;
      justify-content: center;
    }
  `]
})
export class NotFoundComponent {}
