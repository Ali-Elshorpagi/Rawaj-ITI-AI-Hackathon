import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { ToastrService } from 'ngx-toastr';
import { DashboardService } from '../../../services/dashboard.service';
import { AttendanceService } from '../../../services/attendance.service';
import { AttendanceMethod } from '../../../models/enums';

@Component({
  selector: 'gd-reception-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, MatButtonModule],
  template: `
    <div class="reception-page">
      <section class="ops-hero">
        <div>
          <p class="eyebrow">Reception Desk</p>
          <h1>Front desk operations</h1>
          <p class="hero-copy">Fast check-ins, renewals, payments, and member support in one workspace.</p>
        </div>
        <div class="hero-actions">
          <a mat-flat-button routerLink="/members/new"><i class="fa-solid fa-user-plus"></i> Add Member</a>
          <a mat-stroked-button routerLink="/payments"><i class="fa-solid fa-receipt"></i> Payments</a>
        </div>
      </section>

      @if (loading()) {
        <div class="metrics-grid">
          @for (_ of [1,2,3,4]; track $index) {
            <div class="metric-card"><div class="gd-skeleton" style="height:96px"></div></div>
          }
        </div>
      } @else {
        <div class="metrics-grid">
          @for (metric of metrics(); track metric.label) {
            <div class="metric-card">
              <div class="metric-icon" [style.background]="metric.bg"><i [class]="metric.icon" [style.color]="metric.color"></i></div>
              <div class="metric-value">{{ metric.value }}</div>
              <div class="metric-label">{{ metric.label }}</div>
            </div>
          }
        </div>
      }

      <div class="desk-grid">
        <section class="desk-panel checkin-panel">
          <div class="panel-header">
            <div>
              <h2>Quick Check-In</h2>
              <p>Use member database id, email, or full QR token.</p>
            </div>
            <i class="fa-solid fa-clipboard-check"></i>
          </div>

          <div class="checkin-input-wrap">
            <i class="fa-solid fa-magnifying-glass"></i>
            <input
              class="checkin-input"
              type="text"
              [value]="identifier"
              (input)="identifier = $any($event.target).value"
              (keyup.enter)="checkIn()"
              placeholder="Email, phone, or QR token"
              autocomplete="off"
            />
          </div>

          <div class="checkin-actions">
            <button mat-flat-button (click)="checkIn()" [disabled]="!identifier.trim() || checkingIn()">
              @if (checkingIn()) {
                <i class="fa-solid fa-rotate fa-spin"></i> Checking in...
              } @else {
                <i class="fa-solid fa-right-to-bracket"></i> Check In
              }
            </button>
            <a mat-stroked-button routerLink="/attendance/check-in"><i class="fa-solid fa-qrcode"></i> QR Tools</a>
          </div>

          @if (lastCheckIn()) {
            <div class="success-strip">
              <i class="fa-solid fa-circle-check"></i>
              <div>
                <strong>{{ memberName(lastCheckIn()?.memberId) }}</strong>
                <span style="display:block;font-size:.78rem;font-weight:400">Checked in at {{ lastCheckIn()?.checkedInAt | date:'shortTime' }}</span>
              </div>
            </div>
          }
        </section>

        <section class="desk-panel">
          <div class="panel-header">
            <div>
              <h2>Core Actions</h2>
              <p>Most used front desk workflows.</p>
            </div>
            <i class="fa-solid fa-bolt"></i>
          </div>
          <div class="action-grid">
            <a routerLink="/members" class="action-tile"><i class="fa-solid fa-users"></i><span>Manage Members</span></a>
            <a routerLink="/subscriptions" class="action-tile"><i class="fa-solid fa-id-card"></i><span>Renew Plans</span></a>
            <a routerLink="/payments" class="action-tile"><i class="fa-solid fa-money-bill-wave"></i><span>Record Payments</span></a>
            <a routerLink="/attendance" class="action-tile"><i class="fa-solid fa-calendar-check"></i><span>Attendance</span></a>
          </div>
        </section>
      </div>

      <div class="lists-grid">
        <section class="desk-panel">
          <div class="panel-header">
            <div>
              <h2>Currently Inside</h2>
              <p>Members checked in today.</p>
            </div>
            <a routerLink="/attendance">View all</a>
          </div>
          <div class="activity-list">
            @for (record of recentAttendance(); track record._id ?? record.id) {
              <div class="activity-row" [class.activity-row--checked-out]="record.checkedOutAt">
                <div class="avatar" [class.avatar--out]="record.checkedOutAt">{{ initials(record.memberId) }}</div>
                <div style="flex:1">
                  <strong>{{ memberName(record.memberId) }}</strong>
                  <span>
                    In {{ record.checkedInAt | date:'shortTime' }}
                    @if (record.checkedOutAt) { · Out {{ record.checkedOutAt | date:'shortTime' }} }
                  </span>
                </div>
                @if (!record.checkedOutAt) {
                  <button class="uncheck-btn"
                    [disabled]="checkingOut(record._id ?? record.id)"
                    (click)="checkOut(record)">
                    @if (checkingOut(record._id ?? record.id)) {
                      <i class="fa-solid fa-rotate fa-spin"></i>
                    } @else {
                      <i class="fa-solid fa-right-from-bracket"></i> Check Out
                    }
                  </button>
                } @else {
                  <span class="out-badge">Out</span>
                }
              </div>
            } @empty {
              <div class="empty-row">No check-ins yet today.</div>
            }
          </div>
        </section>

        <section class="desk-panel">
          <div class="panel-header">
            <div>
              <h2>Expiring Soon</h2>
              <p>Subscriptions ending in the next 7 days.</p>
            </div>
            <a routerLink="/members">Members</a>
          </div>
          <div class="activity-list">
            @for (sub of expiringSubscriptions(); track sub._id ?? sub.id) {
              <div class="activity-row activity-row--warning">
                <div class="avatar avatar--warning">{{ initials(sub.memberId) }}</div>
                <div>
                  <strong>{{ memberName(sub.memberId) }}</strong>
                  <span>{{ planName(sub.planId) }} ends {{ sub.endDate | date:'MMM d' }}</span>
                </div>
              </div>
            } @empty {
              <div class="empty-row">No subscriptions expiring soon.</div>
            }
          </div>
        </section>
      </div>

      <!-- Subscriptions & Payments -->
      <div class="lists-grid">
        <section class="desk-panel">
          <div class="panel-header">
            <div>
              <h2>Recent Subscriptions</h2>
              <p>Latest membership plans.</p>
            </div>
            <a routerLink="/subscriptions">View all</a>
          </div>
          <div class="data-table">
            <div class="data-head">
              <span>Member</span><span>Plan</span><span>Status</span><span>Expires</span>
            </div>
            @for (sub of recentSubscriptions(); track sub._id ?? sub.id) {
              <div class="data-row">
                <span class="data-name">{{ memberName(sub.memberId) }}</span>
                <span>{{ planName(sub.planId) }}</span>
                <span>
                  <span class="status-badge" [class.status-badge--active]="sub.status === 'active'"
                        [class.status-badge--expired]="sub.status === 'expired'">
                    {{ sub.status }}
                  </span>
                </span>
                <span class="text-muted-sm">{{ sub.endDate | date:'MMM d, y' }}</span>
              </div>
            } @empty {
              <div class="empty-row">No subscriptions yet.</div>
            }
          </div>
        </section>

        <section class="desk-panel">
          <div class="panel-header">
            <div>
              <h2>Recent Payments</h2>
              <p>Latest transactions.</p>
            </div>
            <a routerLink="/payments">View all</a>
          </div>
          <div class="data-table">
            <div class="data-head">
              <span>Member</span><span>Amount</span><span>Status</span><span>Date</span>
            </div>
            @for (pay of recentPayments(); track pay._id ?? pay.id) {
              <div class="data-row">
                <span class="data-name">{{ memberName(pay.memberId) }}</span>
                <span class="data-amount">\${{ pay.amount | number:'1.2-2' }}</span>
                <span>
                  <span class="status-badge"
                    [class.status-badge--active]="pay.status === 'paid'"
                    [class.status-badge--warn]="pay.status === 'pending'"
                    [class.status-badge--expired]="pay.status === 'overdue'">
                    {{ pay.status }}
                  </span>
                </span>
                <span class="text-muted-sm">{{ (pay.paidAt ?? pay.createdAt) | date:'MMM d' }}</span>
              </div>
            } @empty {
              <div class="empty-row">No payments yet.</div>
            }
          </div>
        </section>
      </div>
    </div>
  `,
  styles: [`
    :host {
      --desk:      #2563eb;
      --desk-dark: #1e40af;
      --desk-soft: #eff6ff;
      --desk-line: #bfdbfe;
    }
    .reception-page { max-width: 1400px; display: flex; flex-direction: column; gap: 22px; }
    .ops-hero {
      background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #0891b2 100%);
      color: #fff; border-radius: 16px; padding: 24px;
      display: flex; align-items: center; justify-content: space-between; gap: 18px; flex-wrap: wrap;
      box-shadow: 0 18px 40px rgba(37, 99, 235, 0.28);
    }
    .eyebrow { font-size: .75rem; font-weight: 800; text-transform: uppercase; letter-spacing: .08em; opacity: .75; margin-bottom: 6px; }
    .ops-hero h1 { font-size: 1.65rem; font-weight: 800; margin: 0 0 6px; }
    .hero-copy { opacity: .9; margin: 0; }
    .hero-actions { display: flex; gap: 10px; flex-wrap: wrap; }
    .hero-actions a[mat-flat-button] { background: #fff; color: #1e40af; }
    .hero-actions a[mat-stroked-button] { border-color: rgba(255,255,255,.55); color: #fff; }
    .metrics-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 16px; }
    .metric-card, .desk-panel { background: var(--surface-card); border: 1px solid var(--surface-border); border-radius: 12px; }
    .metric-card { padding: 18px; border-top: 3px solid var(--desk); }
    .metric-icon { width: 38px; height: 38px; border-radius: 10px; display: flex; align-items: center; justify-content: center; margin-bottom: 12px; }
    .metric-value { font-size: 1.8rem; font-weight: 800; color: var(--text-primary); line-height: 1; }
    .metric-label { color: var(--text-muted); font-size: .78rem; font-weight: 700; text-transform: uppercase; letter-spacing: .05em; margin-top: 6px; }
    .desk-grid, .lists-grid { display: grid; grid-template-columns: 1.15fr .85fr; gap: 18px; }
    .desk-panel { padding: 20px; border-top: 3px solid var(--desk-line); }
    .panel-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; margin-bottom: 16px; }
    .panel-header h2 { font-size: 1rem; font-weight: 800; margin: 0 0 4px; color: var(--text-primary); }
    .panel-header p, .activity-row span, .empty-row { color: var(--text-muted); font-size: .83rem; margin: 0; }
    .panel-header > i { color: var(--desk); font-size: 1.25rem; }
    .panel-header a { color: var(--desk); font-weight: 700; font-size: .82rem; text-decoration: none; }
    .checkin-input-wrap { position: relative; margin-bottom: 2px; }
    .checkin-input-wrap i { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #64748b; pointer-events: none; font-size: .85rem; }
    .checkin-input { width: 100%; padding: 11px 12px 11px 34px; border: 1.5px solid #cbd5e1; border-radius: 8px; font-size: .9rem; outline: none; background: #fff; color: #1e293b; box-sizing: border-box; }
    .checkin-input:focus { border-color: var(--desk); box-shadow: 0 0 0 3px rgba(37,99,235,.12); }
    .checkin-actions { display: flex; gap: 10px; flex-wrap: wrap; }
    .checkin-actions button[mat-flat-button] { background: var(--desk); color: #fff; }
    .success-strip { margin-top: 14px; padding: 10px 12px; border-radius: 10px; background: #eff6ff; color: #1d4ed8; display: flex; gap: 8px; align-items: center; font-weight: 700; font-size: .85rem; }
    .action-grid { display: grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap: 10px; }
    .action-tile { border: 1px solid var(--desk-line); background: var(--desk-soft); border-radius: 10px; padding: 14px; color: #1e40af; text-decoration: none; display: flex; align-items: center; gap: 10px; font-weight: 800; transition: background .15s; }
    .action-tile:hover { background: #dbeafe; }
    .activity-list { display: flex; flex-direction: column; gap: 10px; }
    .activity-row { display: flex; align-items: center; gap: 12px; padding: 10px; border-radius: 10px; background: var(--surface-bg); }
    .activity-row strong { display: block; color: var(--text-primary); font-size: .9rem; }
    .activity-row--warning { background: #fefce8; }
    .activity-row--checked-out { opacity: .55; }
    .avatar { width: 36px; height: 36px; border-radius: 50%; background: #dbeafe; color: var(--desk-dark); display: flex; align-items: center; justify-content: center; font-weight: 800; flex-shrink: 0; }
    .avatar--warning { background: #fef9c3; color: #854d0e; }
    .avatar--out { background: #f1f5f9; color: #94a3b8; }
    .uncheck-btn { display: flex; align-items: center; gap: 5px; padding: 5px 10px; border: 1.5px solid #fca5a5; border-radius: 7px; background: #fff; color: #dc2626; font-size: .78rem; font-weight: 700; cursor: pointer; white-space: nowrap; transition: background .15s; flex-shrink: 0; }
    .uncheck-btn:hover:not(:disabled) { background: #fee2e2; }
    .uncheck-btn:disabled { opacity: .5; cursor: not-allowed; }
    .out-badge { padding: 3px 10px; border-radius: 20px; background: #f1f5f9; color: #94a3b8; font-size: .75rem; font-weight: 700; flex-shrink: 0; }
    .empty-row { padding: 18px; text-align: center; background: var(--surface-bg); border-radius: 10px; }
    .data-table { display: flex; flex-direction: column; }
    .data-head { display: grid; grid-template-columns: 2fr 1.5fr 1fr 1.2fr; padding: 6px 10px; font-size: .7rem; font-weight: 700; text-transform: uppercase; letter-spacing: .05em; color: var(--text-muted); background: var(--surface-bg); border-radius: 8px; margin-bottom: 4px; }
    .data-row { display: grid; grid-template-columns: 2fr 1.5fr 1fr 1.2fr; padding: 9px 10px; border-bottom: 1px solid var(--surface-border); font-size: .83rem; align-items: center; }
    .data-row:last-child { border-bottom: none; }
    .data-name { font-weight: 700; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .data-amount { font-weight: 700; color: var(--text-primary); }
    .text-muted-sm { color: var(--text-muted); font-size: .78rem; }
    .status-badge { padding: 2px 8px; border-radius: 20px; font-size: .72rem; font-weight: 700; text-transform: capitalize; background: var(--surface-bg); color: var(--text-muted); }
    .status-badge--active { background: #dcfce7; color: #15803d; }
    .status-badge--expired { background: #fee2e2; color: #dc2626; }
    .status-badge--warn { background: #fef9c3; color: #854d0e; }
    @media (max-width: 1000px) { .metrics-grid { grid-template-columns: repeat(2, 1fr); } .desk-grid, .lists-grid { grid-template-columns: 1fr; } }
    @media (max-width: 560px) { .metrics-grid, .action-grid { grid-template-columns: 1fr; } }
  `],
})
export class ReceptionDashboardComponent implements OnInit {
  private readonly dashboardService = inject(DashboardService);
  private readonly attendanceService = inject(AttendanceService);
  private readonly toastr = inject(ToastrService);

  readonly loading = signal(true);
  readonly data = signal<any>(null);
  readonly checkingIn = signal(false);
  readonly lastCheckIn = signal<any>(null);
  readonly checkingOutId = signal<string | null>(null);
  identifier = '';

  checkingOut(id: string): boolean { return this.checkingOutId() === id; }

  readonly recentAttendance = computed(() => this.data()?.recentAttendance ?? []);
  readonly expiringSubscriptions = computed(() => this.data()?.expiringSubscriptions ?? []);
  readonly recentSubscriptions = computed(() => this.data()?.recentSubscriptions ?? []);
  readonly recentPayments = computed(() => this.data()?.recentPayments ?? []);

  ngOnInit(): void {
    this.dashboardService.getReceptionDashboard().subscribe({
      next: (res) => { this.data.set(res.data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  metrics() {
    const k = this.data()?.kpis ?? {};
    return [
      { label: 'Active Members', value: k.activeMembers ?? 0, icon: 'fa-solid fa-user-check', bg: '#ecfdf5', color: '#059669' },
      { label: 'Today Check-Ins', value: k.todayAttendance ?? 0, icon: 'fa-solid fa-calendar-check', bg: '#fff7ed', color: '#b45309' },
      { label: 'Pending Payments', value: k.pendingPayments ?? 0, icon: 'fa-solid fa-clock', bg: '#eef2ff', color: '#4338ca' },
      { label: 'Overdue Flags', value: k.overduePayments ?? 0, icon: 'fa-solid fa-triangle-exclamation', bg: '#fef2f2', color: '#dc2626' },
    ];
  }

  checkIn(): void {
    const value = this.identifier.trim();
    if (!value || this.checkingIn()) return;
    this.checkingIn.set(true);
    this.attendanceService.checkIn(value, AttendanceMethod.MANUAL).subscribe({
      next: (res) => {
        this.lastCheckIn.set(res.data);
        this.identifier = '';
        this.checkingIn.set(false);
        this.toastr.success('Attendance recorded', 'Checked In');
        this.ngOnInit();
      },
      error: (err) => {
        this.checkingIn.set(false);
        this.toastr.error(err.error?.message ?? 'Check-in failed', 'Error');
      },
    });
  }

  checkOut(record: any): void {
    const id = record._id ?? record.id;
    if (!id || this.checkingOutId()) return;
    this.checkingOutId.set(id);
    this.attendanceService.staffCheckOut(id).subscribe({
      next: (res) => {
        this.checkingOutId.set(null);
        this.toastr.success(`${this.memberName(record.memberId)} checked out`, 'Checked Out');
        this.data.update(d => {
          if (!d) return d;
          return {
            ...d,
            recentAttendance: d.recentAttendance.map((r: any) =>
              (r._id ?? r.id) === id ? { ...r, checkedOutAt: res.data?.checkedOutAt ?? new Date() } : r
            ),
          };
        });
      },
      error: (err) => {
        this.checkingOutId.set(null);
        this.toastr.error(err.error?.message ?? 'Check-out failed', 'Error');
      },
    });
  }

  initials(member: any): string {
    const name = this.memberName(member);
    return name.split(' ').map((p: string) => p[0]).join('').slice(0, 2).toUpperCase() || '?';
  }

  memberName(member: any): string {
    return member?.fullName ?? [member?.firstName, member?.lastName].filter(Boolean).join(' ') ?? 'Member';
  }

  planName(plan: any): string {
    return plan?.name ?? 'Plan';
  }
}
