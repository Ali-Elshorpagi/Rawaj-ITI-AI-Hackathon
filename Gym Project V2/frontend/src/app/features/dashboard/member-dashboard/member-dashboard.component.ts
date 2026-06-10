import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { DashboardService } from '../../../services/dashboard.service';
import { AttendanceService } from '../../../services/attendance.service';
import { NotificationsService } from '../../../services/notifications.service';
import { AuthService } from '../../../core/auth.service';

@Component({
  selector: 'gd-member-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="member-page">

      <!-- Greeting Banner -->
      <div class="greeting-banner">
        <div class="greeting-banner__left">
          <div class="greeting-banner__avatar">{{ initials() }}</div>
          <div>
            <h1 class="greeting-banner__name">Welcome back, {{ auth.currentUser()?.firstName }}!</h1>
            <div class="greeting-banner__meta">
              <span class="member-id-badge">
                <i class="fa-solid fa-id-badge"></i>
                {{ member()?.qrCode ? member()!.qrCode!.slice(0, 8).toUpperCase() : 'No profile' }}
              </span>
              <span class="greeting-banner__status"
                    [class.status--active]="member()?.membershipStatus === 'active'"
                    [class.status--expired]="member()?.membershipStatus === 'expired'"
                    [class.status--suspended]="member()?.membershipStatus === 'suspended'">
                <span class="status-dot"></span>
                {{ (member()?.membershipStatus ?? 'Unknown') | titlecase }}
              </span>
            </div>
          </div>
        </div>
        <div class="greeting-banner__right">
          @if (isCheckedIn()) {
            <div class="checkin-success-pill">
              <i class="fa-solid fa-circle-check"></i> Checked in today!
            </div>
          }
        </div>
      </div>

      @if (loading()) {
        <div class="stats-row">
          @for (_ of [1,2,3]; track $index) {
            <div class="stat-card"><div class="skeleton" style="height:140px"></div></div>
          }
        </div>
      } @else {

        <!-- Stats Row -->
        <div class="stats-row">

          <!-- Subscription Card -->
          <div class="stat-card stat-card--subscription">
            <div class="stat-card__header">
              <div class="stat-card__icon stat-card__icon--teal">
                <i class="fa-solid fa-id-card"></i>
              </div>
              <span class="stat-card__label">Subscription</span>
            </div>
            @if (data()?.subscription) {
              <div class="stat-card__plan-name">{{ planName() }}</div>
              <div class="subscription-progress">
                <div class="subscription-progress__bar">
                  <div class="subscription-progress__fill" [style.width.%]="progressPercent()"></div>
                </div>
                <div class="subscription-progress__labels">
                  <span>{{ daysUntilExpiry() }} days left</span>
                  <span>{{ data()?.durationDays }}d plan</span>
                </div>
              </div>
              <div class="stat-card__expiry">
                <i class="fa-regular fa-calendar"></i>
                Expires {{ subscriptionEndDate() | date:'MMM d, yyyy' }}
              </div>
            } @else {
              <div class="empty-state">
                <i class="fa-solid fa-id-card"></i>
                <p>No active subscription</p>
                <a routerLink="/subscribe" class="subscribe-cta">
                  <i class="fa-solid fa-credit-card"></i> Subscribe Now
                </a>
              </div>
            }
          </div>

          <!-- Attendance Stats -->
          <div class="stat-card stat-card--attendance">
            <div class="stat-card__header">
              <div class="stat-card__icon stat-card__icon--blue">
                <i class="fa-solid fa-clipboard-check"></i>
              </div>
              <span class="stat-card__label">Attendance</span>
            </div>
            <div class="stat-card__big-number">{{ data()?.stats?.totalAttendance ?? 0 }}</div>
            <div class="stat-card__sub">total visits</div>
            <div class="stat-pill">
              <i class="fa-regular fa-calendar-days"></i>
              {{ data()?.stats?.thisMonthAttendance ?? 0 }} this month
            </div>
          </div>

          <!-- Classes -->
          <div class="stat-card stat-card--classes">
            <div class="stat-card__header">
              <div class="stat-card__icon stat-card__icon--amber">
                <i class="fa-solid fa-dumbbell"></i>
              </div>
              <span class="stat-card__label">Classes</span>
            </div>
            @if (data()?.upcomingClasses?.length) {
              <div class="next-class">
                <div class="next-class__name">{{ data()!.upcomingClasses[0].name }}</div>
                @if (data()!.upcomingClasses[0].schedule?.[0]) {
                  <div class="next-class__detail">
                    <i class="fa-regular fa-clock"></i>
                    {{ dayName(data()!.upcomingClasses[0].schedule[0].dayOfWeek) }}
                    {{ data()!.upcomingClasses[0].schedule[0].startTime }}
                  </div>
                }
                <div class="next-class__detail">
                  <i class="fa-solid fa-location-dot"></i>
                  {{ data()!.upcomingClasses[0].location }}
                </div>
              </div>
              <a routerLink="/classes" class="view-all-link">View all classes <i class="fa-solid fa-arrow-right"></i></a>
            } @else {
              <div class="empty-state">
                <i class="fa-solid fa-dumbbell"></i>
                <p>No classes available</p>
              </div>
            }
          </div>
        </div>

        <!-- Bottom Section -->
        <div class="bottom-section">

          <!-- Self Check-In / Check-Out -->
          <div class="panel">
            <div class="panel__header">
              <i class="fa-solid fa-clipboard-check panel__icon"></i>
              <h3>Gym Attendance</h3>
            </div>

            <div class="token-display">
              <label>Your Member Token</label>
              <div class="token-display__value">
                {{ member()?.qrCode?.slice(0, 8).toUpperCase() ?? '—' }}
              </div>
            </div>

            @if (isCheckedOut()) {
              <!-- Session complete — show last session and allow re-entry -->
              <div class="session-summary">
                <div class="session-row">
                  <span><i class="fa-solid fa-arrow-right-to-bracket"></i> Last In</span>
                  <span>{{ todayRecord()?.checkedInAt | date:'h:mm a' }}</span>
                </div>
                <div class="session-row">
                  <span><i class="fa-solid fa-arrow-right-from-bracket"></i> Last Out</span>
                  <span>{{ todayRecord()?.checkedOutAt | date:'h:mm a' }}</span>
                </div>
              </div>
              <button class="checkin-btn" (click)="selfCheckIn()" [disabled]="checkingIn()">
                @if (checkingIn()) {
                  <i class="fa-solid fa-rotate fa-spin"></i> Recording...
                } @else {
                  <i class="fa-solid fa-clipboard-check"></i> Check In Again
                }
              </button>
            } @else if (isCheckedIn()) {
              <!-- Checked in, not yet out -->
              <div class="session-summary">
                <div class="session-row">
                  <span><i class="fa-solid fa-arrow-right-to-bracket"></i> Checked in at</span>
                  <span>{{ todayRecord()?.checkedInAt | date:'h:mm a' }}</span>
                </div>
                <div class="session-row session-row--active">
                  <span><i class="fa-solid fa-clock"></i> Duration</span>
                  <span>{{ timeDiff(todayRecord()?.checkedInAt) }}</span>
                </div>
              </div>
              <p class="panel__desc" style="font-size:0.8rem;color:var(--text-muted);margin-bottom:12px">
                Auto check-out in 3 hours if not done manually.
              </p>
              <button class="checkin-btn checkin-btn--checkout" (click)="selfCheckOut()" [disabled]="checkingOut()">
                @if (checkingOut()) {
                  <i class="fa-solid fa-rotate fa-spin"></i> Checking out...
                } @else {
                  <i class="fa-solid fa-arrow-right-from-bracket"></i> Check Out Now
                }
              </button>
            } @else {
              <!-- Not yet checked in -->
              <p class="panel__desc">Tap below to record your gym visit for today.</p>
              <button class="checkin-btn" (click)="selfCheckIn()" [disabled]="checkingIn() || !member()">
                @if (checkingIn()) {
                  <i class="fa-solid fa-rotate fa-spin"></i> Recording...
                } @else if (!member()) {
                  <i class="fa-solid fa-triangle-exclamation"></i> No Member Profile
                } @else {
                  <i class="fa-solid fa-clipboard-check"></i> Check In Now
                }
              </button>
            }

            @if (!member()) {
              <div class="info-box">
                <i class="fa-solid fa-circle-info"></i>
                No member profile linked. Please log out and back in, or contact reception.
              </div>
            }

            @if (checkInError()) {
              <div class="error-box">
                <i class="fa-solid fa-circle-exclamation"></i>
                {{ checkInError() }}
              </div>
            }
          </div>

          <!-- QR Code -->
          <div class="panel">
            <div class="panel__header">
              <i class="fa-solid fa-qrcode panel__icon"></i>
              <h3>Your QR Code</h3>
            </div>
            <p class="panel__desc">Show this to reception staff for a quick check-in.</p>
            @if (qrDataUrl()) {
              <div class="qr-wrapper" (click)="toggleQrZoom()">
                <img [src]="qrDataUrl()" alt="QR Code" class="qr-image" [class.qr-image--zoomed]="qrZoomed()">
                <span class="qr-hint">
                  <i [class]="qrZoomed() ? 'fa-solid fa-magnifying-glass-minus' : 'fa-solid fa-magnifying-glass-plus'"></i>
                  {{ qrZoomed() ? 'Click to shrink' : 'Click to enlarge' }}
                </span>
              </div>
            } @else if (member()) {
              <div class="qr-generating">
                <div class="qr-spinner"></div>
                <p>Generating QR code...</p>
              </div>
            } @else {
              <div class="empty-state" style="text-align:center;padding:24px 0">
                <i class="fa-solid fa-qrcode"></i>
                <p>No member profile linked</p>
              </div>
            }
          </div>

          <!-- Notifications -->
          <div class="panel">
            <div class="panel__header">
              <i class="fa-solid fa-bell panel__icon"></i>
              <h3>Notifications</h3>
              @if (notifService.unreadCount() > 0) {
                <span class="notif-badge">{{ notifService.unreadCount() }}</span>
              }
            </div>
            @if (notificationsLoading()) {
              <div class="skeleton" style="height:120px;margin-top:12px;border-radius:8px"></div>
            } @else if (notifications().length) {
              <div class="notif-list">
                @for (n of notifications(); track n.id ?? n._id) {
                  <div class="notif-item" [class.notif-item--unread]="!n.isRead">
                    <div class="notif-dot" [class.notif-dot--unread]="!n.isRead"></div>
                    <div class="notif-body">
                      <p class="notif-title">{{ n.title_en ?? n.title ?? 'Notification' }}</p>
                      <p class="notif-msg">{{ n.message_en ?? n.message }}</p>
                      <p class="notif-time">{{ n.createdAt | date:'MMM d, h:mm a' }}</p>
                    </div>
                  </div>
                }
              </div>
              <a routerLink="/notifications" class="view-all-link" style="margin-top:12px;display:block">
                View all <i class="fa-solid fa-arrow-right"></i>
              </a>
            } @else {
              <div class="empty-state" style="text-align:center;padding:24px 0">
                <i class="fa-regular fa-bell-slash"></i>
                <p>No notifications</p>
              </div>
            }
          </div>
        </div>

        <!-- Attendance History -->
        <div class="history-panel">
          <div class="history-panel__header">
            <h3><i class="fa-solid fa-clock-rotate-left"></i> Recent Attendance</h3>
            <span class="history-count">Last {{ recentAttendance().length }} visits</span>
          </div>
          @if (recentAttendance().length) {
            <div class="history-table">
              <div class="history-row history-row--head">
                <span>Date</span><span>Time</span><span>Method</span>
              </div>
              @for (record of recentAttendance(); track record._id) {
                <div class="history-row">
                  <span>{{ record.checkedInAt | date:'EEE, MMM d' }}</span>
                  <span>{{ record.checkedInAt | date:'h:mm a' }}</span>
                  <span>
                    <span class="method-badge" [class.method-badge--qr]="record.method === 'qr'" [class.method-badge--manual]="record.method === 'manual'">
                      <i [class]="record.method === 'qr' ? 'fa-solid fa-qrcode' : 'fa-solid fa-hand-pointer'"></i>
                      {{ record.method }}
                    </span>
                  </span>
                </div>
              }
            </div>
          } @else {
            <div class="empty-state" style="padding:40px;text-align:center">
              <i class="fa-regular fa-calendar-xmark" style="font-size:2.5rem"></i>
              <p>No attendance records yet</p>
              <small>Check in at the gym to start tracking your visits!</small>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    :host {
      --m-primary: #0D9488;
      --m-primary-light: #CCFBF1;
      --m-primary-dark: #0F766E;
      --m-accent: #14B8A6;
    }

    .member-page { max-width: 1200px; display: flex; flex-direction: column; gap: 24px; }

    /* Greeting Banner */
    .greeting-banner {
      background: linear-gradient(135deg, #0F766E 0%, #0D9488 55%, #14B8A6 100%);
      border-radius: var(--radius-xl); padding: 24px 28px;
      display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px;
    }
    .greeting-banner__left { display: flex; align-items: center; gap: 16px; }
    .greeting-banner__avatar {
      width: 56px; height: 56px; border-radius: 50%;
      background: rgba(255,255,255,0.2); border: 2px solid rgba(255,255,255,0.3);
      display: flex; align-items: center; justify-content: center;
      font-size: 1.25rem; font-weight: 700; color: white; flex-shrink: 0;
    }
    .greeting-banner__name { font-size: 1.375rem; font-weight: 700; color: white; margin-bottom: 8px; }
    .greeting-banner__meta { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }

    .member-id-badge {
      display: inline-flex; align-items: center; gap: 5px;
      background: rgba(255,255,255,0.15); color: white;
      padding: 4px 12px; border-radius: 20px; font-size: 0.8125rem; font-weight: 600;
      font-family: monospace; letter-spacing: 0.05em;
    }
    .greeting-banner__status {
      display: inline-flex; align-items: center; gap: 5px;
      padding: 4px 12px; border-radius: 20px; font-size: 0.8125rem; font-weight: 600;
      &.status--active { background: rgba(255,255,255,0.2); color: white; }
      &.status--expired { background: rgba(239,68,68,0.3); color: #fca5a5; }
      &.status--suspended { background: rgba(245,158,11,0.3); color: #fde68a; }
    }
    .status-dot {
      width: 7px; height: 7px; border-radius: 50%;
      .status--active & { background: #86efac; }
      .status--expired & { background: #f87171; }
      .status--suspended & { background: #fbbf24; }
    }
    .checkin-success-pill {
      display: flex; align-items: center; gap: 8px;
      background: rgba(255,255,255,0.2); color: white;
      padding: 10px 18px; border-radius: 24px; font-weight: 600; font-size: 0.875rem;
    }

    /* Stats Row */
    .stats-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
    @media (max-width: 900px) { .stats-row { grid-template-columns: 1fr; } }

    .stat-card {
      background: var(--surface-card); border-radius: var(--radius-xl);
      padding: 20px; border: 1px solid var(--surface-border);
      display: flex; flex-direction: column; gap: 12px;
    }
    .stat-card__header { display: flex; align-items: center; gap: 10px; }
    .stat-card__icon {
      width: 38px; height: 38px; border-radius: 10px;
      display: flex; align-items: center; justify-content: center; font-size: 1rem; flex-shrink: 0;
      &--teal { background: #CCFBF1; color: #0D9488; }
      &--blue { background: #DBEAFE; color: #2563EB; }
      &--amber { background: #FEF3C7; color: #D97706; }
    }
    .stat-card__label { font-size: 0.75rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.06em; }
    .stat-card__big-number { font-size: 2.75rem; font-weight: 800; color: var(--text-primary); line-height: 1; }
    .stat-card__sub { font-size: 0.8125rem; color: var(--text-muted); margin-top: -4px; }
    .stat-card__plan-name { font-size: 1.125rem; font-weight: 700; color: var(--text-primary); }
    .stat-card__expiry { display: flex; align-items: center; gap: 6px; font-size: 0.8125rem; color: var(--text-muted); }
    .stat-pill {
      display: inline-flex; align-items: center; gap: 6px;
      background: var(--surface-bg); padding: 5px 12px; border-radius: 20px;
      font-size: 0.8125rem; color: var(--text-secondary);
    }

    /* Subscription progress */
    .subscription-progress__bar { height: 8px; background: var(--surface-bg); border-radius: 4px; overflow: hidden; }
    .subscription-progress__fill { height: 100%; background: linear-gradient(90deg, var(--m-primary-dark), var(--m-accent)); border-radius: 4px; transition: width 0.6s; }
    .subscription-progress__labels { display: flex; justify-content: space-between; font-size: 0.75rem; color: var(--text-muted); margin-top: 4px; }

    /* Next class */
    .next-class { display: flex; flex-direction: column; gap: 6px; }
    .next-class__name { font-size: 1rem; font-weight: 700; color: var(--text-primary); }
    .next-class__detail { display: flex; align-items: center; gap: 6px; font-size: 0.8125rem; color: var(--text-muted); i { width: 14px; text-align: center; } }

    .view-all-link { font-size: 0.8125rem; color: var(--m-primary); font-weight: 600; text-decoration: none; &:hover { text-decoration: underline; } }

    .subscribe-cta {
      display: inline-flex; align-items: center; gap: 6px;
      background: linear-gradient(135deg, #0F766E, #14B8A6); color: white;
      padding: 7px 16px; border-radius: 20px; font-size: 0.8125rem; font-weight: 600;
      text-decoration: none; margin-top: 4px;
      &:hover { box-shadow: 0 4px 12px rgba(13,148,136,0.35); transform: translateY(-1px); }
      transition: all 0.2s;
    }

    .empty-state {
      display: flex; flex-direction: column; align-items: center; gap: 4px; color: var(--text-muted); padding: 8px 0;
      i { font-size: 1.75rem; opacity: 0.35; margin-bottom: 4px; }
      p { font-size: 0.875rem; font-weight: 500; margin: 0; }
      small { font-size: 0.75rem; opacity: 0.7; }
    }

    /* Bottom section */
    .bottom-section { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
    @media (max-width: 900px) { .bottom-section { grid-template-columns: 1fr; } }

    .panel {
      background: var(--surface-card); border-radius: var(--radius-xl);
      padding: 20px; border: 1px solid var(--surface-border); display: flex; flex-direction: column; gap: 8px;
    }
    .panel__header { display: flex; align-items: center; gap: 8px; margin-bottom: 2px; }
    .panel__icon { color: var(--m-primary); font-size: 1.125rem; }
    .panel__header h3 { font-size: 1rem; font-weight: 700; color: var(--text-primary); margin: 0; flex: 1; }
    .panel__desc { font-size: 0.8125rem; color: var(--text-muted); margin: 0 0 8px; }

    .token-display {
      background: var(--surface-bg); border-radius: var(--radius-md); padding: 12px; margin-bottom: 4px;
      label { font-size: 0.6875rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; display: block; margin-bottom: 4px; }
    }
    .token-display__value { font-family: monospace; font-size: 1.125rem; font-weight: 700; color: var(--text-primary); letter-spacing: 0.1em; }

    .checkin-btn {
      width: 100%; padding: 13px; border: none; border-radius: var(--radius-lg); cursor: pointer;
      background: linear-gradient(135deg, var(--m-primary-dark), var(--m-accent));
      color: white; font-weight: 700; font-size: 0.9375rem;
      display: flex; align-items: center; justify-content: center; gap: 8px;
      transition: all 0.2s ease; margin-top: 4px;
      &:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(13,148,136,0.4); }
      &:disabled { opacity: 0.55; cursor: not-allowed; transform: none; box-shadow: none; }
      &--checkout { background: linear-gradient(135deg, #B45309, #F59E0B); &:hover:not(:disabled) { box-shadow: 0 6px 20px rgba(245,158,11,0.4); } }
      &--done { background: #059669; }
    }

    .session-summary {
      background: var(--surface-bg); border-radius: var(--radius-md);
      padding: 12px 14px; margin-bottom: 12px; display: flex; flex-direction: column; gap: 8px;
    }
    .session-row {
      display: flex; justify-content: space-between; align-items: center;
      font-size: 0.875rem; color: var(--text-secondary);
      span:first-child { display: flex; align-items: center; gap: 6px; color: var(--text-muted); }
      span:last-child { font-weight: 600; color: var(--text-primary); }
      i { width: 14px; text-align: center; }
      &--active span:first-child i { color: #0D9488; }
      &--active span:last-child { color: #0D9488; }
    }

    .info-box {
      display: flex; align-items: flex-start; gap: 8px; padding: 10px 12px;
      background: #EFF6FF; border: 1px solid #BFDBFE; border-radius: var(--radius-md);
      color: #1D4ED8; font-size: 0.8125rem; line-height: 1.4;
      i { margin-top: 1px; flex-shrink: 0; }
    }
    .error-box {
      display: flex; align-items: flex-start; gap: 8px; padding: 10px 12px;
      background: #FEF2F2; border: 1px solid #FECACA; border-radius: var(--radius-md);
      color: #DC2626; font-size: 0.8125rem;
      i { flex-shrink: 0; }
    }

    /* QR */
    .qr-wrapper { display: flex; flex-direction: column; align-items: center; gap: 8px; cursor: pointer; padding: 8px 0; }
    .qr-image { width: 140px; height: 140px; border-radius: var(--radius-md); transition: all 0.3s; border: 3px solid var(--m-primary-light); &--zoomed { width: 190px; height: 190px; } }
    .qr-hint { font-size: 0.75rem; color: var(--text-muted); }
    .qr-generating { display: flex; flex-direction: column; align-items: center; gap: 10px; padding: 24px; }
    .qr-spinner { width: 44px; height: 44px; border: 3px solid var(--m-primary-light); border-top-color: var(--m-primary); border-radius: 50%; animation: spin 0.8s linear infinite; }

    /* Notifications */
    .notif-badge { background: #EF4444; color: white; font-size: 0.6875rem; font-weight: 700; padding: 1px 7px; border-radius: 12px; }
    .notif-list { display: flex; flex-direction: column; margin-top: 8px; }
    .notif-item {
      display: flex; align-items: flex-start; gap: 10px; padding: 9px 8px;
      border-radius: var(--radius-md); cursor: pointer; transition: background 0.15s;
      &:hover { background: var(--surface-hover); }
      &--unread { background: rgba(13,148,136,0.05); }
    }
    .notif-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--surface-border); margin-top: 5px; flex-shrink: 0; &--unread { background: var(--m-primary); } }
    .notif-body { flex: 1; }
    .notif-title { font-size: 0.8125rem; font-weight: 600; color: var(--text-primary); margin: 0 0 2px; line-height: 1.3; }
    .notif-msg { font-size: 0.75rem; color: var(--text-secondary); margin: 0 0 3px; line-height: 1.4; }
    .notif-time { font-size: 0.75rem; color: var(--text-muted); }

    /* History */
    .history-panel {
      background: var(--surface-card); border-radius: var(--radius-xl); padding: 20px; border: 1px solid var(--surface-border);
      &__header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;
        h3 { display: flex; align-items: center; gap: 8px; font-size: 1rem; font-weight: 700; margin: 0; i { color: var(--m-primary); } }
      }
    }
    .history-count { font-size: 0.8125rem; color: var(--text-muted); }
    .history-table { display: flex; flex-direction: column; }
    .history-row {
      display: grid; grid-template-columns: 2fr 1.5fr 1fr; padding: 10px 12px;
      border-bottom: 1px solid var(--surface-border); font-size: 0.875rem;
      &:last-child { border-bottom: none; }
      &--head { font-size: 0.6875rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; background: var(--surface-bg); border-radius: var(--radius-sm); margin-bottom: 2px; }
    }
    .method-badge {
      display: inline-flex; align-items: center; gap: 4px; padding: 2px 9px;
      border-radius: 12px; font-size: 0.75rem; font-weight: 600; text-transform: capitalize;
      &--manual { background: #DBEAFE; color: #2563EB; }
      &--qr { background: #CCFBF1; color: #0D9488; }
    }

    .skeleton { background: linear-gradient(90deg, var(--surface-bg) 25%, var(--surface-hover) 50%, var(--surface-bg) 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; border-radius: var(--radius-lg); }
    @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  `],
})
export class MemberDashboardComponent implements OnInit {
  protected readonly auth = inject(AuthService);
  private readonly dashboardService = inject(DashboardService);
  private readonly attendanceService = inject(AttendanceService);
  protected readonly notifService = inject(NotificationsService);
  private readonly toastr = inject(ToastrService);

  readonly loading = signal(true);
  readonly data = signal<any>(null);
  readonly todayRecord = signal<any>(null);
  readonly checkingIn = signal(false);
  readonly checkingOut = signal(false);
  readonly checkInError = signal('');
  readonly qrDataUrl = signal<string | null>(null);
  readonly qrZoomed = signal(false);
  readonly notifications = signal<any[]>([]);
  readonly notificationsLoading = signal(true);

  readonly member = () => this.data()?.member ?? null;
  readonly recentAttendance = () => this.data()?.recentAttendance ?? [];
  readonly daysUntilExpiry = () => this.data()?.daysUntilExpiry ?? null;
  readonly planName = () => (this.data()?.subscription as any)?.planId?.name ?? 'Active Plan';
  readonly subscriptionEndDate = () => (this.data()?.subscription as any)?.endDate ?? null;
  readonly isCheckedIn = () => !!this.todayRecord()?.checkedInAt && !this.todayRecord()?.checkedOutAt;
  readonly isCheckedOut = () => !!this.todayRecord()?.checkedOutAt;
  readonly progressPercent = () => {
    const days = this.daysUntilExpiry();
    const total = this.data()?.durationDays;
    if (days === null || !total) return 0;
    return Math.round((days / total) * 100);
  };
  readonly initials = () => {
    const u = this.auth.currentUser();
    return u ? `${u.firstName?.[0] ?? ''}${u.lastName?.[0] ?? ''}`.toUpperCase() : '?';
  };

  ngOnInit(): void {
    this.dashboardService.getMemberDashboard().subscribe({
      next: (res) => {
        this.data.set(res.data);
        this.loading.set(false);
        if (res.data?.member?.qrCode) {
          this.generateQrImage(res.data.member.qrCode);
        }
      },
      error: () => this.loading.set(false),
    });

    this.attendanceService.getTodayStatus().subscribe({
      next: (res) => this.todayRecord.set(res.data ?? null),
      error: () => {},
    });

    this.notifService.getAll({ limit: 5 } as any).subscribe({
      next: (res) => { this.notifications.set(res.data ?? []); this.notificationsLoading.set(false); },
      error: () => this.notificationsLoading.set(false),
    });
  }

  private async generateQrImage(token: string): Promise<void> {
    try {
      const QRCode = (await import('qrcode')).default;
      const url = await QRCode.toDataURL(token, {
        width: 200, margin: 1,
        color: { dark: '#0F766E', light: '#FFFFFF' },
      });
      this.qrDataUrl.set(url);
    } catch { /* no-op */ }
  }

  selfCheckIn(): void {
    if (this.checkingIn() || this.isCheckedIn() || !this.member()) return;
    this.checkingIn.set(true);
    this.checkInError.set('');
    this.attendanceService.selfCheckIn().subscribe({
      next: (res) => {
        this.checkingIn.set(false);
        this.todayRecord.set(res.data);
        this.toastr.success('Attendance recorded! Have a great workout!', 'Checked In');
        this.data.update(d => d ? {
          ...d,
          stats: {
            totalAttendance: (d.stats?.totalAttendance ?? 0) + 1,
            thisMonthAttendance: (d.stats?.thisMonthAttendance ?? 0) + 1,
          },
        } : d);
      },
      error: (err) => {
        this.checkingIn.set(false);
        const msg = err.error?.message ?? 'Check-in failed. Please try again.';
        this.checkInError.set(msg);
        this.toastr.error(msg, 'Check-In Failed');
      },
    });
  }

  selfCheckOut(): void {
    if (this.checkingOut() || !this.isCheckedIn()) return;
    this.checkingOut.set(true);
    this.attendanceService.selfCheckOut().subscribe({
      next: (res) => {
        this.checkingOut.set(false);
        this.todayRecord.set(res.data);
        this.toastr.success('See you next time!', 'Checked Out');
      },
      error: (err) => {
        this.checkingOut.set(false);
        this.toastr.error(err.error?.message ?? 'Check-out failed.', 'Error');
      },
    });
  }

  markRead(n: any): void {
    if (n.isRead) return;
    this.notifService.markAsRead(n.id ?? n._id).subscribe({
      next: () => this.notifications.update(list =>
        list.map(x => (x.id ?? x._id) === (n.id ?? n._id) ? { ...x, isRead: true } : x)
      ),
    });
  }

  toggleQrZoom(): void { this.qrZoomed.update(v => !v); }

  dayName(day: number): string {
    return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][day] ?? '';
  }

  timeDiff(from: string | Date): string {
    const mins = Math.floor((Date.now() - new Date(from).getTime()) / 60000);
    if (mins < 60) return `${mins}m`;
    return `${Math.floor(mins / 60)}h ${mins % 60}m`;
  }
}
