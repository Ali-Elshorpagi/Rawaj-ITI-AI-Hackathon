import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { ToastrService } from 'ngx-toastr';
import { DashboardService } from '../../../services/dashboard.service';

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

@Component({
  selector: 'gd-owner-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, MatButtonModule],
  template: `
    <div class="owner-page">

      <!-- Hero -->
      <section class="ops-hero">
        <div>
          <p class="eyebrow">Owner Console</p>
          <h1>Platform Overview</h1>
          <p class="hero-copy">Full analytics, revenue, members, and configuration in one view.</p>
        </div>
        <div class="hero-actions">
          <a mat-flat-button routerLink="/settings"><i class="fa-solid fa-gear"></i> Settings</a>
          <a mat-stroked-button routerLink="/reports"><i class="fa-solid fa-chart-bar"></i> Reports</a>
        </div>
      </section>

      <!-- KPI Grid (8 cards) -->
      @if (loading()) {
        <div class="metrics-grid">
          @for (_ of [1,2,3,4,5,6,7,8]; track $index) {
            <div class="metric-card"><div class="gd-skeleton" style="height:96px"></div></div>
          }
        </div>
      } @else {
        <div class="metrics-grid">
          @for (m of metrics(); track m.label) {
            <div class="metric-card">
              <div class="metric-icon" [style.background]="m.bg"><i [class]="m.icon" [style.color]="m.color"></i></div>
              <div class="metric-value">
                {{ m.prefix }}{{ m.value }}
                @if (m.trend !== undefined && m.trend !== null) {
                  <span class="trend" [class.trend--up]="m.trend >= 0" [class.trend--down]="m.trend < 0">
                    {{ m.trend >= 0 ? '+' : '' }}{{ m.trend }}%
                  </span>
                }
              </div>
              <div class="metric-label">{{ m.label }}</div>
            </div>
          }
        </div>
      }

      <!-- Revenue Chart + Member Distribution -->
      <div class="desk-grid">
        <section class="desk-panel">
          <div class="panel-header">
            <div><h2>Revenue (Last 6 Months)</h2><p>Paid subscriptions revenue by month.</p></div>
            <a routerLink="/reports">Full report</a>
          </div>
          <div class="chart-wrap">
            @if (revenueChart().length === 0) {
              <div class="empty-state">No revenue data yet.</div>
            } @else {
              <div class="bar-chart">
                @for (bar of revenueChart(); track bar.label) {
                  <div class="bar-col">
                    <span class="bar-val">\${{ bar.value | number:'1.0-0' }}</span>
                    <div class="bar" [style.height.%]="bar.pct" [style.background]="barColor(bar.pct)"></div>
                    <span class="bar-label">{{ bar.label }}</span>
                  </div>
                }
              </div>
            }
          </div>
        </section>

        <section class="desk-panel">
          <div class="panel-header">
            <div><h2>Member Status</h2><p>Current membership distribution.</p></div>
          </div>
          <div class="dist-list">
            @for (d of memberDist(); track d.label) {
              <div class="dist-row">
                <div class="dist-label">
                  <span class="dist-dot" [style.background]="d.color"></span>
                  <span>{{ d.label }}</span>
                </div>
                <div class="dist-bar-wrap">
                  <div class="dist-bar" [style.width.%]="d.pct" [style.background]="d.color"></div>
                </div>
                <span class="dist-count">{{ d.value }}</span>
              </div>
            }
          </div>

          <div class="panel-header" style="margin-top:20px;margin-bottom:12px">
            <div><h2>Plan Distribution</h2><p>Active subscriptions per plan.</p></div>
          </div>
          <div class="dist-list">
            @for (p of planDist(); track p.name) {
              <div class="dist-row">
                <div class="dist-label"><span class="dist-dot" style="background:var(--owner)"></span><span>{{ p.name }}</span></div>
                <div class="dist-bar-wrap"><div class="dist-bar" [style.width.%]="p.pct" style="background:var(--owner)"></div></div>
                <span class="dist-count">{{ p.count }}</span>
              </div>
            } @empty {
              <div class="empty-state" style="padding:8px">No active subscriptions.</div>
            }
          </div>
        </section>
      </div>

      <!-- Quick Actions -->
      <section class="desk-panel">
        <div class="panel-header">
          <div><h2>Owner Actions</h2><p>Full platform management.</p></div>
          <i class="fa-solid fa-crown"></i>
        </div>
        <div class="action-grid">
          <a routerLink="/members"       class="action-tile"><i class="fa-solid fa-users"></i><span>All Members</span></a>
          <a routerLink="/subscriptions" class="action-tile"><i class="fa-solid fa-id-card"></i><span>Subscription Plans</span></a>
          <a routerLink="/payments"      class="action-tile"><i class="fa-solid fa-money-bill-wave"></i><span>Payments</span></a>
          <a routerLink="/trainers"      class="action-tile"><i class="fa-solid fa-person-running"></i><span>Trainers</span></a>
          <a routerLink="/classes"       class="action-tile"><i class="fa-solid fa-dumbbell"></i><span>Classes</span></a>
          <a routerLink="/attendance"    class="action-tile"><i class="fa-solid fa-clipboard-check"></i><span>Attendance</span></a>
          <a routerLink="/reports"       class="action-tile"><i class="fa-solid fa-chart-bar"></i><span>Reports</span></a>
          <a routerLink="/settings"      class="action-tile"><i class="fa-solid fa-gear"></i><span>Settings</span></a>
        </div>
      </section>

      <!-- Recent Members + Attendance Trend -->
      <div class="desk-grid">
        <section class="desk-panel">
          <div class="panel-header">
            <div><h2>Recent Members</h2><p>Latest registrations.</p></div>
            <a routerLink="/members">All Members</a>
          </div>
          <div class="data-table">
            <div class="data-head"><span>Member</span><span>Email</span><span>Status</span><span>Joined</span></div>
            @for (m of recentMembers(); track m._id) {
              <div class="data-row">
                <span class="data-name">{{ m.fullName }}</span>
                <span class="text-muted-sm">{{ m.email }}</span>
                <span>
                  <span class="status-pill" [class.status-pill--active]="m.membershipStatus === 'active'"
                        [class.status-pill--expired]="m.membershipStatus !== 'active'">
                    {{ m.membershipStatus }}
                  </span>
                </span>
                <span class="text-muted-sm">{{ m.createdAt | date:'MMM d' }}</span>
              </div>
            } @empty {
              <div class="empty-row">No members yet.</div>
            }
          </div>
        </section>

        <section class="desk-panel">
          <div class="panel-header">
            <div><h2>Attendance Trend</h2><p>Daily check-ins (last 30 days).</p></div>
          </div>
          <div class="sparkline-wrap">
            @if (attendanceSparkline().length === 0) {
              <div class="empty-state">No attendance data.</div>
            } @else {
              <div class="sparkline">
                @for (bar of attendanceSparkline(); track bar.day) {
                  <div class="spark-bar" [style.height.%]="bar.pct" [title]="bar.day + ': ' + bar.count + ' check-ins'"></div>
                }
              </div>
              <div class="sparkline-labels">
                <span>{{ attendanceSparkline()[0]?.day }}</span>
                <span>{{ attendanceSparkline()[attendanceSparkline().length-1]?.day }}</span>
              </div>
              <div class="sparkline-stats">
                <span>Peak: {{ peakAttendance() }} check-ins</span>
                <span>Avg: {{ avgAttendance() }} / day</span>
              </div>
            }
          </div>
        </section>
      </div>

    </div>
  `,
  styles: [`
    :host {
      --owner:      #d97706;
      --owner-dark: #92400e;
      --owner-soft: #fffbeb;
      --owner-line: #fde68a;
    }
    .owner-page { max-width:1400px;display:flex;flex-direction:column;gap:22px; }
    .ops-hero {
      background: linear-gradient(135deg, #78350f 0%, #d97706 55%, #fbbf24 100%);
      color:#fff;border-radius:16px;padding:24px;
      display:flex;align-items:center;justify-content:space-between;gap:18px;flex-wrap:wrap;
      box-shadow:0 18px 40px rgba(217,119,6,.32);
    }
    .eyebrow { font-size:.75rem;font-weight:800;text-transform:uppercase;letter-spacing:.08em;opacity:.75;margin-bottom:6px; }
    .ops-hero h1 { font-size:1.65rem;font-weight:800;margin:0 0 6px; }
    .hero-copy { opacity:.9;margin:0; }
    .hero-actions { display:flex;gap:10px;flex-wrap:wrap; }
    .hero-actions a[mat-flat-button]   { background:#fff;color:#78350f; }
    .hero-actions a[mat-stroked-button]{ border-color:rgba(255,255,255,.55);color:#fff; }

    .metrics-grid { display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px; }
    @media (min-width:1100px) { .metrics-grid { grid-template-columns:repeat(4,minmax(0,1fr)); } }
    .metric-card,.desk-panel { background:var(--surface-card);border:1px solid var(--surface-border);border-radius:12px; }
    .metric-card { padding:16px;border-top:3px solid var(--owner); }
    .metric-icon { width:36px;height:36px;border-radius:9px;display:flex;align-items:center;justify-content:center;margin-bottom:10px; }
    .metric-value { font-size:1.55rem;font-weight:800;color:var(--text-primary);line-height:1;display:flex;align-items:baseline;gap:6px; }
    .metric-label { color:var(--text-muted);font-size:.73rem;font-weight:700;text-transform:uppercase;letter-spacing:.05em;margin-top:5px; }
    .trend { font-size:.7rem;font-weight:700;padding:1px 6px;border-radius:20px; }
    .trend--up   { background:#dcfce7;color:#15803d; }
    .trend--down { background:#fee2e2;color:#dc2626; }

    .desk-grid { display:grid;grid-template-columns:1.4fr 1fr;gap:18px; }
    .desk-panel { padding:20px;border-top:3px solid var(--owner-line); }
    .panel-header { display:flex;justify-content:space-between;align-items:flex-start;gap:12px;margin-bottom:16px; }
    .panel-header h2 { font-size:1rem;font-weight:800;margin:0 0 4px;color:var(--text-primary); }
    .panel-header p,.text-muted-sm,.empty-row,.empty-state { color:var(--text-muted);font-size:.83rem;margin:0; }
    .panel-header > i { color:var(--owner);font-size:1.25rem; }
    .panel-header a { color:var(--owner);font-weight:700;font-size:.82rem;text-decoration:none; }

    /* Bar chart */
    .chart-wrap { height:200px;display:flex;align-items:flex-end; }
    .bar-chart { display:flex;align-items:flex-end;gap:8px;width:100%;height:100%; }
    .bar-col { display:flex;flex-direction:column;align-items:center;justify-content:flex-end;flex:1;gap:4px;height:100%; }
    .bar { width:100%;max-width:40px;border-radius:6px 6px 0 0;min-height:4px;transition:height .3s; }
    .bar-val { font-size:.65rem;font-weight:700;color:var(--text-muted); }
    .bar-label { font-size:.65rem;color:var(--text-muted);font-weight:600; }

    /* Dist */
    .dist-list { display:flex;flex-direction:column;gap:10px; }
    .dist-row { display:flex;align-items:center;gap:10px; }
    .dist-label { display:flex;align-items:center;gap:6px;width:100px;flex-shrink:0;font-size:.83rem;color:var(--text-primary); }
    .dist-dot { width:10px;height:10px;border-radius:50%;flex-shrink:0; }
    .dist-bar-wrap { flex:1;height:8px;background:var(--surface-bg);border-radius:4px;overflow:hidden; }
    .dist-bar { height:100%;border-radius:4px;transition:width .4s; }
    .dist-count { font-size:.8rem;font-weight:700;color:var(--text-primary);width:28px;text-align:right;flex-shrink:0; }

    /* Actions */
    .action-grid { display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px; }
    .action-tile { border:1px solid var(--owner-line);background:var(--owner-soft);border-radius:10px;padding:14px;color:#78350f;text-decoration:none;display:flex;align-items:center;gap:10px;font-weight:800;transition:background .15s; }
    .action-tile:hover { background:#fde68a; }

    /* Table */
    .data-table { display:flex;flex-direction:column; }
    .data-head { display:grid;grid-template-columns:2fr 2.5fr 1fr 1fr;padding:6px 10px;font-size:.7rem;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:var(--text-muted);background:var(--surface-bg);border-radius:8px;margin-bottom:4px; }
    .data-row  { display:grid;grid-template-columns:2fr 2.5fr 1fr 1fr;padding:9px 10px;border-bottom:1px solid var(--surface-border);font-size:.83rem;align-items:center; }
    .data-row:last-child { border-bottom:none; }
    .data-name { font-weight:700;color:var(--text-primary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap; }
    .empty-row { padding:18px;text-align:center;background:var(--surface-bg);border-radius:10px;color:var(--text-muted); }
    .status-pill { padding:2px 8px;border-radius:20px;font-size:.7rem;font-weight:700;text-transform:capitalize; }
    .status-pill--active  { background:#dcfce7;color:#15803d; }
    .status-pill--expired { background:#fee2e2;color:#dc2626; }

    /* Sparkline */
    .sparkline-wrap { display:flex;flex-direction:column;gap:8px; }
    .sparkline { display:flex;align-items:flex-end;gap:2px;height:120px;width:100%;border-bottom:1px solid var(--surface-border);padding-bottom:4px; }
    .spark-bar { flex:1;background:var(--owner);border-radius:2px 2px 0 0;min-height:2px;opacity:.8; }
    .sparkline-labels { display:flex;justify-content:space-between;font-size:.7rem;color:var(--text-muted); }
    .sparkline-stats { display:flex;justify-content:space-between;font-size:.78rem;color:var(--text-muted);font-weight:600; }

    @media (max-width:1100px) { .metrics-grid{grid-template-columns:repeat(2,1fr)}.desk-grid{grid-template-columns:1fr}.action-grid{grid-template-columns:repeat(2,1fr)} }
  `],
})
export class OwnerDashboardComponent implements OnInit {
  protected readonly MONTH_NAMES = MONTH_NAMES;
  private readonly dashboardService = inject(DashboardService);
  private readonly toastr = inject(ToastrService);

  readonly loading = signal(true);
  readonly data = signal<any>(null);
  readonly recentMembers = computed(() => this.data()?.recentMembers ?? []);

  metrics() {
    const k = this.data()?.kpis ?? {};
    return [
      { label: 'Total Members',    value: k.totalMembers     ?? 0,  prefix: '',  icon: 'fa-solid fa-users',               bg: '#eff6ff', color: '#2563eb', trend: undefined },
      { label: 'Active Members',   value: k.activeMembers    ?? 0,  prefix: '',  icon: 'fa-solid fa-user-check',          bg: '#ecfdf5', color: '#059669', trend: undefined },
      { label: 'Monthly Revenue',  value: (k.monthlyRevenue ?? 0).toFixed(0), prefix: '$', icon: 'fa-solid fa-dollar-sign', bg: '#fffbeb', color: '#d97706', trend: k.revenueGrowth },
      { label: "Today's Visits",   value: k.todayAttendance  ?? 0,  prefix: '',  icon: 'fa-solid fa-calendar-check',      bg: '#fff7ed', color: '#b45309', trend: undefined },
      { label: 'New This Month',   value: k.newMembersThisMonth ?? 0, prefix: '', icon: 'fa-solid fa-user-plus',          bg: '#f5f3ff', color: '#7c3aed', trend: undefined },
      { label: 'Expiring Soon',    value: k.expiringMembers  ?? 0,  prefix: '',  icon: 'fa-solid fa-clock',               bg: '#fef9c3', color: '#ca8a04', trend: undefined },
      { label: 'Trainers',         value: k.trainerCount     ?? 0,  prefix: '',  icon: 'fa-solid fa-person-running',      bg: '#fce7f3', color: '#be185d', trend: undefined },
      { label: 'Overdue Payments', value: k.overduePayments  ?? 0,  prefix: '',  icon: 'fa-solid fa-triangle-exclamation',bg: '#fef2f2', color: '#dc2626', trend: undefined },
    ];
  }

  memberDist() {
    const k = this.data()?.kpis ?? {};
    const total = (k.totalMembers ?? 0) > 0 ? (k.totalMembers ?? 0) : 1;
    return [
      { label: 'Active',    value: k.activeMembers    ?? 0, color: '#059669', pct: Math.round(((k.activeMembers    ?? 0) / total) * 100) },
      { label: 'Expired',   value: k.expiredMembers   ?? 0, color: '#dc2626', pct: Math.round(((k.expiredMembers   ?? 0) / total) * 100) },
      { label: 'Suspended', value: k.suspendedMembers ?? 0, color: '#f59e0b', pct: Math.round(((k.suspendedMembers ?? 0) / total) * 100) },
    ];
  }

  planDist() {
    const plans: any[] = this.data()?.charts?.planDistribution ?? [];
    const rawTotal = plans.reduce((s: number, p: any) => s + (p.count ?? 0), 0);
    const total = rawTotal > 0 ? rawTotal : 1;
    return plans.map((p: any) => ({ ...p, pct: Math.round((p.count / total) * 100) }));
  }

  revenueChart() {
    const raw: any[] = this.data()?.charts?.revenueByMonth ?? [];
    if (!raw.length) return [];
    const max = Math.max(...raw.map((r: any) => r.revenue), 1);
    return raw.map((r: any) => ({
      label: MONTH_NAMES[(r.month ?? 1) - 1],
      value: r.revenue ?? 0,
      pct: Math.round((r.revenue / max) * 100),
    }));
  }

  barColor(pct: number): string {
    if (pct > 75) return '#d97706';
    if (pct > 40) return '#f59e0b';
    return '#fbbf24';
  }

  attendanceSparkline() {
    const raw: any[] = this.data()?.charts?.weeklyAttendance ?? [];
    if (!raw.length) return [];
    const max = Math.max(...raw.map((r: any) => r.count), 1);
    return raw.map((r: any) => ({
      day: r.date ?? String(r.day ?? ''),
      count: r.count ?? 0,
      pct: Math.round((r.count / max) * 100),
    }));
  }

  peakAttendance() {
    const data = this.attendanceSparkline();
    return data.length ? Math.max(...data.map(d => d.count)) : 0;
  }

  avgAttendance() {
    const data = this.attendanceSparkline();
    if (!data.length) return 0;
    return Math.round(data.reduce((s, d) => s + d.count, 0) / data.length);
  }

  ngOnInit(): void {
    this.dashboardService.getOwnerDashboard().subscribe({
      next: (res) => { this.data.set(res.data); this.loading.set(false); },
      error: () => { this.loading.set(false); this.toastr.error('Failed to load dashboard'); },
    });
  }
}
