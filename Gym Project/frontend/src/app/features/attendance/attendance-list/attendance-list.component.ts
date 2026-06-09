import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';
import { AttendanceService } from '../../../services/attendance.service';

@Component({
  selector: 'gd-attendance-list',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule, MatButtonModule, TranslateModule],
  template: `
    <div class="page">
      <div class="gd-page-header">
        <div>
          <h1 class="gd-page-header__title">{{ 'attendance.title' | translate }}</h1>
          <p class="gd-page-header__subtitle">Today: {{ todayData()?.total ?? 0 }} check-ins</p>
        </div>
        <a mat-flat-button color="primary" routerLink="/attendance/check-in">
          <mat-icon>how_to_reg</mat-icon> Check-In
        </a>
      </div>

      <div class="gd-table-container">
        <div class="gd-table-toolbar">
          <h3 class="gd-card__title">Today's Attendance — {{ today | date:'longDate' }}</h3>
        </div>
        @if (loading()) {
          <div class="gd-skeleton" style="height:300px"></div>
        } @else {
          <table class="gd-table">
            <thead>
              <tr>
                <th>Member</th>
                <th>ID</th>
                <th>Check-In Time</th>
                <th>Check-Out</th>
                <th>Method</th>
              </tr>
            </thead>
            <tbody>
              @for (record of records(); track record.id) {
                <tr>
                  <td>
                    <div style="display:flex;align-items:center;gap:10px">
                      <div class="gd-avatar gd-avatar--sm">{{ getInitials(record.member) }}</div>
                      {{ record.member?.firstName }} {{ record.member?.lastName }}
                    </div>
                  </td>
                  <td><code>{{ record.member?.memberId }}</code></td>
                  <td>{{ record.checkInTime | date:'shortTime' }}</td>
                  <td>{{ record.checkOutTime ? (record.checkOutTime | date:'shortTime') : '—' }}</td>
                  <td><span class="badge badge--active">{{ record.method }}</span></td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="5">
                    <div class="gd-empty-state" style="padding:40px">
                      <mat-icon>event_busy</mat-icon>
                      <h3>No check-ins today</h3>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        }
      </div>
    </div>
  `,
  styles: [`.page { max-width: 1200px; } code { font-family: monospace; font-size: 0.75rem; background: var(--surface-bg); padding: 2px 6px; border-radius: 4px; }`]
})
export class AttendanceListComponent implements OnInit {
  private readonly attendanceService = inject(AttendanceService);

  readonly records = signal<any[]>([]);
  readonly todayData = signal<any>(null);
  readonly loading = signal(true);
  readonly today = new Date();

  ngOnInit(): void {
    this.attendanceService.getTodayReport().subscribe({
      next: (res) => {
        this.todayData.set(res.data);
        this.records.set(res.data.records);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  getInitials(member: any): string {
    if (!member) return '?';
    return `${member.firstName?.[0]}${member.lastName?.[0]}`.toUpperCase();
  }
}
