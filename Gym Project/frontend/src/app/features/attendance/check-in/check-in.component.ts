import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { AttendanceService } from '../../../services/attendance.service';
import { AttendanceMethod } from '../../../models/enums';

@Component({
  selector: 'gd-check-in',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatRadioModule, TranslateModule],
  template: `
    <div class="page">
      <div class="gd-page-header">
        <div>
          <h1 class="gd-page-header__title">Check-In</h1>
          <p class="gd-page-header__subtitle">Register member attendance</p>
        </div>
        <a mat-stroked-button routerLink="/attendance"><mat-icon>arrow_back</mat-icon> Back</a>
      </div>

      <div class="checkin-grid">
        <!-- Manual Check-In -->
        <div class="gd-card">
          <div class="gd-card__title" style="margin-bottom:20px">Manual Check-In</div>
          <mat-form-field appearance="outline">
            <mat-label>Member ID or Email</mat-label>
            <input matInput [(ngModel)]="memberId" placeholder="GYM-XXXXXX" (keyup.enter)="checkIn()">
            <mat-icon matPrefix>person</mat-icon>
          </mat-form-field>
          <button mat-flat-button color="primary" (click)="checkIn()" [disabled]="!memberId || loadingManual()" style="width:100%;height:48px;margin-top:8px">
            @if (loadingManual()) { Checking in... }
            @else { <mat-icon>how_to_reg</mat-icon> Check In }
          </button>

          @if (lastCheckIn()) {
            <div class="success-card">
              <mat-icon>check_circle</mat-icon>
              <div>
                <p class="success-name">{{ lastCheckIn()?.member?.firstName }} {{ lastCheckIn()?.member?.lastName }}</p>
                <p class="success-time">{{ lastCheckIn()?.checkInTime | date:'shortTime' }}</p>
              </div>
            </div>
          }
        </div>

        <!-- QR Check-In -->
        <div class="gd-card">
          <div class="gd-card__title" style="margin-bottom:20px">QR Code Scan</div>
          <div class="qr-scan-area" (click)="activateQRScan()">
            @if (!qrActive()) {
              <mat-icon style="font-size:64px;width:64px;height:64px;color:var(--text-muted)">qr_code_scanner</mat-icon>
              <p>Click to activate scanner</p>
              <p style="font-size:0.8125rem;color:var(--text-muted)">(Demo: paste QR data below)</p>
            } @else {
              <mat-icon style="font-size:64px;width:64px;height:64px;color:var(--color-success-600)">qr_code_scanner</mat-icon>
              <p style="color:var(--color-success-600)">Scanner active — Paste QR data:</p>
            }
          </div>
          @if (qrActive()) {
            <mat-form-field appearance="outline" style="margin-top:16px">
              <mat-label>QR Data</mat-label>
              <input matInput [(ngModel)]="qrData" placeholder='{"memberId":"GYM-XXXX"}'>
            </mat-form-field>
            <button mat-flat-button color="accent" (click)="checkInQR()" [disabled]="loadingQR()">
              Process QR Check-In
            </button>
          }
        </div>

        <!-- Today's Summary -->
        <div class="gd-card">
          <div class="gd-card__title" style="margin-bottom:16px">Today's Check-Ins</div>
          <div class="today-count">{{ todayCount() }}</div>
          <p class="text-muted">members checked in today</p>
          <a mat-stroked-button routerLink="/attendance" style="margin-top:16px">
            View Full Report
          </a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page { max-width: 1000px; }
    .checkin-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; @media (max-width: 900px) { grid-template-columns: 1fr; } }
    mat-form-field { width: 100%; }
    .success-card { display: flex; align-items: center; gap: 12px; padding: 12px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: var(--radius-md); margin-top: 16px; mat-icon { font-size: 32px; width: 32px; height: 32px; color: var(--color-success-600); } }
    .success-name { font-weight: 600; color: var(--text-primary); margin-bottom: 2px; }
    .success-time { font-size: 0.8125rem; color: var(--text-muted); }
    .qr-scan-area { border: 2px dashed var(--surface-border); border-radius: var(--radius-lg); padding: 40px; text-align: center; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 8px; &:hover { border-color: var(--color-primary-400); } }
    .today-count { font-size: 3rem; font-weight: 800; color: var(--color-primary-500); line-height: 1; margin-bottom: 8px; }
  `]
})
export class CheckInComponent {
  private readonly attendanceService = inject(AttendanceService);
  private readonly toastr = inject(ToastrService);

  memberId = '';
  qrData = '';
  readonly loadingManual = signal(false);
  readonly loadingQR = signal(false);
  readonly qrActive = signal(false);
  readonly lastCheckIn = signal<any>(null);
  readonly todayCount = signal(0);

  constructor() {
    this.attendanceService.getTodayReport().subscribe({
      next: (res) => this.todayCount.set(res.data.total),
    });
  }

  checkIn(): void {
    if (!this.memberId) return;
    this.loadingManual.set(true);
    this.attendanceService.checkIn(this.memberId, AttendanceMethod.MANUAL).subscribe({
      next: (res) => {
        this.lastCheckIn.set(res.data);
        this.todayCount.update(c => c + 1);
        this.toastr.success(`${(res.data as any)?.member?.firstName} checked in!`, 'Check-In Successful');
        this.memberId = '';
        this.loadingManual.set(false);
      },
      error: (err) => {
        this.loadingManual.set(false);
        this.toastr.error(err.error?.message ?? 'Check-in failed', 'Error');
      },
    });
  }

  activateQRScan(): void { this.qrActive.set(true); }

  checkInQR(): void {
    if (!this.qrData) return;
    this.loadingQR.set(true);
    this.attendanceService.checkInQR(this.qrData).subscribe({
      next: (res) => {
        this.lastCheckIn.set(res.data);
        this.todayCount.update(c => c + 1);
        this.toastr.success('QR Check-in successful!', 'Success');
        this.qrData = '';
        this.qrActive.set(false);
        this.loadingQR.set(false);
      },
      error: (err) => {
        this.loadingQR.set(false);
        this.toastr.error(err.error?.message ?? 'QR check-in failed', 'Error');
      },
    });
  }
}
