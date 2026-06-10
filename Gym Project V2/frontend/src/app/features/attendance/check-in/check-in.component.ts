import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnDestroy, ViewChild, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { TranslateModule } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { AttendanceService } from '../../../services/attendance.service';
import { AttendanceMethod } from '../../../models/enums';

@Component({
  selector: 'gd-check-in',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, MatFormFieldModule, MatInputModule, MatButtonModule, TranslateModule],
  template: `
    <div class="page">
      <div class="gd-page-header">
        <div>
          <h1 class="gd-page-header__title">Check-In</h1>
          <p class="gd-page-header__subtitle">Register member attendance</p>
        </div>
        <a mat-stroked-button routerLink="/attendance"><i class="fa-solid fa-arrow-left"></i> Back</a>
      </div>

      <div class="checkin-grid">
        <div class="gd-card">
          <div class="gd-card__title" style="margin-bottom:20px">Manual Check-In</div>
          <mat-form-field appearance="outline">
            <mat-label>Member ID, email, or QR token</mat-label>
            <input matInput [(ngModel)]="memberId" placeholder="member@email.com" (keyup.enter)="checkIn()">
            <span matPrefix style="display:flex;align-items:center;padding-left:8px;padding-right:4px">
              <i class="fa-solid fa-user"></i>
            </span>
          </mat-form-field>
          <button mat-flat-button color="primary" (click)="checkIn()" [disabled]="!memberId.trim() || loadingManual()" style="width:100%;height:48px;margin-top:8px">
            @if (loadingManual()) {
              Checking in...
            } @else {
              <ng-container><i class="fa-solid fa-clipboard-check"></i> Check In</ng-container>
            }
          </button>

          @if (lastCheckIn()) {
            <div class="success-card">
              <i class="fa-solid fa-circle-check"></i>
              <div>
                <p class="success-name">Attendance recorded</p>
                <p class="success-time">{{ lastCheckIn()?.checkedInAt | date:'shortTime' }}</p>
              </div>
            </div>
          }
        </div>

        <div class="gd-card">
          <div class="gd-card__title" style="margin-bottom:20px">QR Code Scan</div>
          <div class="qr-scan-area" (click)="startCameraScan()">
            @if (!qrActive()) {
              <i class="fa-solid fa-qrcode" style="font-size:64px;color:var(--text-muted)"></i>
              <p>Click to activate camera scanner</p>
              <p style="font-size:0.8125rem;color:var(--text-muted)">Or upload a QR image below</p>
            } @else {
              <video #qrVideo autoplay muted playsinline class="qr-video"></video>
              <p style="color:var(--color-success-600)">Scanner active - hold the QR code in frame</p>
            }
          </div>

          <input #qrFileInput type="file" accept="image/*" (change)="decodeQrImage($event)" style="display:none">
          <button mat-stroked-button (click)="qrFileInput.click()" style="width:100%;margin-top:12px">
            <i class="fa-solid fa-image"></i> Upload QR Image
          </button>

          <mat-form-field appearance="outline" style="margin-top:16px">
            <mat-label>QR token fallback</mat-label>
            <input matInput [(ngModel)]="qrData" placeholder="Paste QR token" (keyup.enter)="checkInQR()">
          </mat-form-field>
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            <button mat-flat-button color="accent" (click)="checkInQR()" [disabled]="!qrData.trim() || loadingQR()">
              Process QR Check-In
            </button>
            @if (qrActive()) {
              <button mat-button (click)="stopCameraScan()">Stop Scanner</button>
            }
          </div>
        </div>

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
    .checkin-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
    mat-form-field { width: 100%; }
    .success-card { display: flex; align-items: center; gap: 12px; padding: 12px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: var(--radius-md); margin-top: 16px; }
    .success-card i { font-size: 32px; color: var(--color-success-600); }
    .success-name { font-weight: 600; color: var(--text-primary); margin-bottom: 2px; }
    .success-time { font-size: 0.8125rem; color: var(--text-muted); }
    .qr-scan-area { border: 2px dashed var(--surface-border); border-radius: var(--radius-lg); padding: 32px; text-align: center; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 8px; }
    .qr-scan-area:hover { border-color: var(--color-primary-400); }
    .qr-video { width: 100%; max-height: 220px; border-radius: var(--radius-md); object-fit: cover; background: #111827; }
    .today-count { font-size: 3rem; font-weight: 800; color: var(--color-primary-500); line-height: 1; margin-bottom: 8px; }
    @media (max-width: 900px) { .checkin-grid { grid-template-columns: 1fr; } }
  `],
})
export class CheckInComponent implements OnDestroy {
  @ViewChild('qrVideo') qrVideo?: ElementRef<HTMLVideoElement>;

  private readonly attendanceService = inject(AttendanceService);
  private readonly toastr = inject(ToastrService);
  private mediaStream: MediaStream | null = null;
  private scanTimer: number | null = null;

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

  ngOnDestroy(): void {
    this.stopCameraScan();
  }

  checkIn(): void {
    const identifier = this.memberId.trim();
    if (!identifier) return;
    this.loadingManual.set(true);
    this.attendanceService.checkIn(identifier, AttendanceMethod.MANUAL).subscribe({
      next: (res) => {
        this.lastCheckIn.set(res.data);
        this.todayCount.update(c => c + 1);
        this.toastr.success('Member checked in', 'Check-In Successful');
        this.memberId = '';
        this.loadingManual.set(false);
      },
      error: (err) => {
        this.loadingManual.set(false);
        this.toastr.error(err.error?.message ?? 'Check-in failed', 'Error');
      },
    });
  }

  async startCameraScan(): Promise<void> {
    if (this.qrActive()) return;
    if (!this.hasBarcodeDetector()) {
      this.toastr.info('Camera QR scanning is not supported in this browser. Use upload or paste instead.', 'QR Scanner');
      return;
    }

    try {
      this.qrActive.set(true);
      this.mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      setTimeout(() => {
        if (this.qrVideo?.nativeElement && this.mediaStream) {
          this.qrVideo.nativeElement.srcObject = this.mediaStream;
          this.scanFromVideo();
        }
      });
    } catch {
      this.qrActive.set(false);
      this.toastr.error('Camera access failed. You can upload or paste the QR token.', 'QR Scanner');
    }
  }

  stopCameraScan(): void {
    if (this.scanTimer !== null) window.clearTimeout(this.scanTimer);
    this.scanTimer = null;
    this.mediaStream?.getTracks().forEach(track => track.stop());
    this.mediaStream = null;
    this.qrActive.set(false);
  }

  async decodeQrImage(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    if (!this.hasBarcodeDetector()) {
      this.toastr.info('Image QR decoding is not supported in this browser. Paste the token instead.', 'QR Upload');
      return;
    }

    try {
      const bitmap = await createImageBitmap(file);
      const codes = await this.detectCodes(bitmap);
      bitmap.close();
      const token = codes[0]?.rawValue;
      if (!token) {
        this.toastr.error('No QR code found in that image.', 'QR Upload');
        return;
      }
      this.qrData = token;
      this.checkInQR();
    } catch {
      this.toastr.error('Could not read the QR image.', 'QR Upload');
    } finally {
      input.value = '';
    }
  }

  checkInQR(): void {
    const token = this.qrData.trim();
    if (!token) return;
    this.loadingQR.set(true);
    this.attendanceService.checkInQR(token).subscribe({
      next: (res) => {
        this.lastCheckIn.set(res.data);
        this.todayCount.update(c => c + 1);
        this.toastr.success('QR check-in successful', 'Success');
        this.qrData = '';
        this.loadingQR.set(false);
        this.stopCameraScan();
      },
      error: (err) => {
        this.loadingQR.set(false);
        this.toastr.error(err.error?.message ?? 'QR check-in failed', 'Error');
      },
    });
  }

  private scanFromVideo(): void {
    this.scanTimer = window.setTimeout(async () => {
      if (!this.qrActive() || !this.qrVideo?.nativeElement) return;
      try {
        const codes = await this.detectCodes(this.qrVideo.nativeElement);
        const token = codes[0]?.rawValue;
        if (token) {
          this.qrData = token;
          this.checkInQR();
          return;
        }
      } catch {
        // Keep scanning; individual frames may fail while the camera warms up.
      }
      this.scanFromVideo();
    }, 500);
  }

  private hasBarcodeDetector(): boolean {
    return 'BarcodeDetector' in window;
  }

  private detectCodes(source: CanvasImageSource): Promise<Array<{ rawValue: string }>> {
    const Detector = (window as any).BarcodeDetector;
    const detector = new Detector({ formats: ['qr_code'] });
    return detector.detect(source);
  }
}
