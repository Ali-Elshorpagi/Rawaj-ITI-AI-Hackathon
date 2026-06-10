import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { ToastrService } from 'ngx-toastr';
import { DashboardService } from '../../../services/dashboard.service';

@Component({
  selector: 'gd-manager-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, MatButtonModule],
  template: `
    <div class="manager-page">

      <!-- Hero -->
      <section class="ops-hero">
        <div>
          <p class="eyebrow">Management Console</p>
          <h1>Gym Manager Dashboard</h1>
          <p class="hero-copy">Monitor attendance, revenue, trainers, and staff from one place.</p>
        </div>
        <div class="hero-actions">
          <a mat-flat-button routerLink="/members/new"><i class="fa-solid fa-user-plus"></i> Add Member</a>
          <a mat-stroked-button routerLink="/reports"><i class="fa-solid fa-chart-bar"></i> Reports</a>
        </div>
      </section>

      <!-- KPIs -->
      @if (loading()) {
        <div class="metrics-grid">
          @for (_ of [1,2,3,4,5,6]; track $index) {
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

      <!-- Attendance + Staff -->
      <div class="desk-grid">
        <section class="desk-panel">
          <div class="panel-header">
            <div><h2>Today's Check-Ins</h2><p>Members currently tracked today.</p></div>
            <a routerLink="/attendance">View all</a>
          </div>
          <div class="activity-list">
            @for (rec of recentAttendance(); track rec._id ?? rec.id) {
              <div class="activity-row">
                <div class="avatar">{{ initials(rec.memberId) }}</div>
                <div style="flex:1">
                  <strong>{{ memberName(rec.memberId) }}</strong>
                  <span>In {{ rec.checkedInAt | date:'shortTime' }}
                    @if (rec.checkedOutAt) { · Out {{ rec.checkedOutAt | date:'shortTime' }} }
                  </span>
                </div>
                <span class="status-pill" [class.status-pill--active]="!rec.checkedOutAt"
                      [class.status-pill--muted]="rec.checkedOutAt">
                  {{ rec.checkedOutAt ? 'Out' : 'Inside' }}
                </span>
              </div>
            } @empty {
              <div class="empty-row">No check-ins today yet.</div>
            }
          </div>
        </section>

        <section class="desk-panel">
          <div class="panel-header">
            <div><h2>Quick Actions</h2><p>Management workflows.</p></div>
            <i class="fa-solid fa-bolt"></i>
          </div>
          <div class="action-grid">
            <a routerLink="/members"       class="action-tile"><i class="fa-solid fa-users"></i><span>Members</span></a>
            <a routerLink="/trainers"      class="action-tile"><i class="fa-solid fa-person-running"></i><span>Trainers</span></a>
            <a routerLink="/attendance"    class="action-tile"><i class="fa-solid fa-clipboard-check"></i><span>Attendance</span></a>
            <a routerLink="/payments"      class="action-tile"><i class="fa-solid fa-money-bill-wave"></i><span>Payments</span></a>
            <a routerLink="/subscriptions" class="action-tile"><i class="fa-solid fa-id-card"></i><span>Plans</span></a>
            <a routerLink="/reports"       class="action-tile"><i class="fa-solid fa-chart-bar"></i><span>Reports</span></a>
          </div>
        </section>
      </div>

      <!-- Trainers + Recent Members -->
      <div class="desk-grid">
        <section class="desk-panel">
          <div class="panel-header">
            <div><h2>Trainer Overview</h2><p>Active trainers and their class loads.</p></div>
            <a routerLink="/trainers">Manage</a>
          </div>
          <div class="data-table">
            <div class="data-head"><span>Trainer</span><span>Specialization</span><span>Classes</span></div>
            @for (t of trainers(); track t._id) {
              <div class="data-row">
                <span class="data-name">{{ t.userId?.name ?? 'Trainer' }}</span>
                <span class="text-muted-sm">{{ t.specialization }}</span>
                <span><span class="pill pill--purple">{{ t.classCount ?? 0 }} classes</span></span>
              </div>
            } @empty {
              <div class="empty-row">No trainers yet.</div>
            }
          </div>
        </section>

        <section class="desk-panel">
          <div class="panel-header">
            <div><h2>Recent Members</h2><p>Latest registrations.</p></div>
            <a routerLink="/members">All Members</a>
          </div>
          <div class="activity-list">
            @for (m of recentMembers(); track m._id ?? m.id) {
              <div class="activity-row">
                <div class="avatar" [class.avatar--active]="m.membershipStatus === 'active'">
                  {{ (m.fullName ?? 'M').charAt(0).toUpperCase() }}
                </div>
                <div style="flex:1">
                  <strong>{{ m.fullName }}</strong>
                  <span>{{ m.email }}</span>
                </div>
                <span class="status-pill" [class.status-pill--active]="m.membershipStatus === 'active'"
                      [class.status-pill--expired]="m.membershipStatus !== 'active'">
                  {{ m.membershipStatus }}
                </span>
              </div>
            } @empty {
              <div class="empty-row">No members yet.</div>
            }
          </div>
        </section>
      </div>

      <!-- Staff Accounts -->
      <section class="desk-panel">
        <div class="panel-header">
          <div><h2>Staff Accounts</h2><p>Trainers, receptionists, and managers.</p></div>
          <i class="fa-solid fa-id-badge"></i>
        </div>
        <div class="data-table">
          <div class="data-head"><span>Name</span><span>Email</span><span>Role</span><span>Joined</span></div>
          @for (s of staffUsers(); track s._id) {
            <div class="data-row">
              <span class="data-name">{{ s.name }}</span>
              <span class="text-muted-sm">{{ s.email }}</span>
              <span>
                @for (role of s.roles; track role) {
                  <span class="role-badge role-badge--{{ role }}">{{ role }}</span>
                }
              </span>
              <span class="text-muted-sm">{{ s.createdAt | date:'MMM d, y' }}</span>
            </div>
          } @empty {
            <div class="empty-row">No staff accounts.</div>
          }
        </div>
      </section>

    </div>
  `,
  styles: [`
    :host {
      --mgr:      #7c3aed;
      --mgr-dark: #4c1d95;
      --mgr-soft: #f5f3ff;
      --mgr-line: #ddd6fe;
    }
    .manager-page { max-width:1400px;display:flex;flex-direction:column;gap:22px; }
    .ops-hero {
      background: linear-gradient(135deg, #4c1d95 0%, #7c3aed 55%, #a78bfa 100%);
      color:#fff;border-radius:16px;padding:24px;
      display:flex;align-items:center;justify-content:space-between;gap:18px;flex-wrap:wrap;
      box-shadow:0 18px 40px rgba(124,58,237,.28);
    }
    .eyebrow { font-size:.75rem;font-weight:800;text-transform:uppercase;letter-spacing:.08em;opacity:.75;margin-bottom:6px; }
    .ops-hero h1 { font-size:1.65rem;font-weight:800;margin:0 0 6px; }
    .hero-copy { opacity:.9;margin:0; }
    .hero-actions { display:flex;gap:10px;flex-wrap:wrap; }
    .hero-actions a[mat-flat-button] { background:#fff;color:#4c1d95; }
    .hero-actions a[mat-stroked-button] { border-color:rgba(255,255,255,.55);color:#fff; }

    .metrics-grid { display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:14px; }
    .metric-card, .desk-panel { background:var(--surface-card);border:1px solid var(--surface-border);border-radius:12px; }
    .metric-card { padding:16px;border-top:3px solid var(--mgr); }
    .metric-icon { width:34px;height:34px;border-radius:9px;display:flex;align-items:center;justify-content:center;margin-bottom:10px; }
    .metric-value { font-size:1.55rem;font-weight:800;color:var(--text-primary);line-height:1;display:flex;align-items:baseline;gap:6px; }
    .metric-label { color:var(--text-muted);font-size:.73rem;font-weight:700;text-transform:uppercase;letter-spacing:.05em;margin-top:5px; }
    .trend { font-size:.7rem;font-weight:700;padding:1px 6px;border-radius:20px; }
    .trend--up   { background:#dcfce7;color:#15803d; }
    .trend--down { background:#fee2e2;color:#dc2626; }

    .desk-grid { display:grid;grid-template-columns:1.2fr .8fr;gap:18px; }
    .desk-panel { padding:20px;border-top:3px solid var(--mgr-line); }
    .panel-header { display:flex;justify-content:space-between;align-items:flex-start;gap:12px;margin-bottom:16px; }
    .panel-header h2 { font-size:1rem;font-weight:800;margin:0 0 4px;color:var(--text-primary); }
    .panel-header p,.activity-row span,.empty-row,.text-muted-sm { color:var(--text-muted);font-size:.83rem;margin:0; }
    .panel-header > i { color:var(--mgr);font-size:1.25rem; }
    .panel-header a { color:var(--mgr);font-weight:700;font-size:.82rem;text-decoration:none; }

    .activity-list { display:flex;flex-direction:column;gap:8px; }
    .activity-row { display:flex;align-items:center;gap:12px;padding:9px;border-radius:10px;background:var(--surface-bg); }
    .activity-row strong { display:block;color:var(--text-primary);font-size:.88rem; }
    .avatar { width:34px;height:34px;border-radius:50%;background:var(--mgr-soft);color:var(--mgr-dark);display:flex;align-items:center;justify-content:center;font-weight:800;font-size:.8rem;flex-shrink:0; }
    .avatar--active { background:#d1fae5;color:#065f46; }
    .status-pill { padding:3px 10px;border-radius:20px;font-size:.7rem;font-weight:700;flex-shrink:0;text-transform:capitalize; }
    .status-pill--active  { background:#dcfce7;color:#15803d; }
    .status-pill--expired { background:#fee2e2;color:#dc2626; }
    .status-pill--muted   { background:#f1f5f9;color:#94a3b8; }

    .action-grid { display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px; }
    .action-tile { border:1px solid var(--mgr-line);background:var(--mgr-soft);border-radius:10px;padding:12px 10px;color:#4c1d95;text-decoration:none;display:flex;align-items:center;gap:8px;font-weight:800;font-size:.82rem;transition:background .15s; }
    .action-tile:hover { background:#ede9fe; }

    .data-table { display:flex;flex-direction:column; }
    .data-head { display:grid;grid-template-columns:2fr 2fr 1fr 1.2fr;padding:6px 10px;font-size:.7rem;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:var(--text-muted);background:var(--surface-bg);border-radius:8px;margin-bottom:4px; }
    .data-row  { display:grid;grid-template-columns:2fr 2fr 1fr 1.2fr;padding:9px 10px;border-bottom:1px solid var(--surface-border);font-size:.83rem;align-items:center; }
    .data-row:last-child { border-bottom:none; }
    .data-name { font-weight:700;color:var(--text-primary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap; }
    .empty-row { padding:18px;text-align:center;background:var(--surface-bg);border-radius:10px;color:var(--text-muted); }

    .pill { padding:3px 9px;border-radius:20px;font-size:.72rem;font-weight:700; }
    .pill--purple { background:#ede9fe;color:#4c1d95; }

    .role-badge { padding:2px 8px;border-radius:20px;font-size:.68rem;font-weight:700;margin-right:4px;text-transform:capitalize; }
    .role-badge--trainer   { background:#fef9c3;color:#854d0e; }
    .role-badge--reception { background:#dbeafe;color:#1e40af; }
    .role-badge--manager   { background:#ede9fe;color:#4c1d95; }

    @media (max-width:1200px) { .metrics-grid{grid-template-columns:repeat(3,1fr)} }
    @media (max-width:800px)  { .metrics-grid{grid-template-columns:repeat(2,1fr)}.desk-grid{grid-template-columns:1fr}.data-head,.data-row{grid-template-columns:2fr 2fr 1fr} }
  `],
})
export class ManagerDashboardComponent implements OnInit {
  private readonly dashboardService = inject(DashboardService);
  private readonly toastr = inject(ToastrService);

  readonly loading = signal(true);
  readonly data = signal<any>(null);

  readonly recentAttendance  = computed(() => this.data()?.recentAttendance  ?? []);
  readonly recentMembers     = computed(() => this.data()?.recentMembers     ?? []);
  readonly staffUsers        = computed(() => this.data()?.staffUsers        ?? []);
  readonly trainers          = computed(() => this.data()?.trainersWithClasses ?? []);

  metrics() {
    const k = this.data()?.kpis ?? {};
    return [
      { label: 'Active Members',  value: k.activeMembers  ?? 0, prefix: '',  icon: 'fa-solid fa-user-check',          bg: '#ecfdf5', color: '#059669', trend: undefined },
      { label: 'Today Check-Ins', value: k.todayAttendance ?? 0, prefix: '',  icon: 'fa-solid fa-calendar-check',      bg: '#fff7ed', color: '#b45309', trend: undefined },
      { label: 'Monthly Revenue', value: (k.monthlyRevenue ?? 0).toFixed(0), prefix: '$', icon: 'fa-solid fa-dollar-sign', bg: '#f0fdf4', color: '#16a34a', trend: k.revenueGrowth },
      { label: 'Overdue Payments',value: k.overduePayments ?? 0, prefix: '',  icon: 'fa-solid fa-triangle-exclamation', bg: '#fef2f2', color: '#dc2626', trend: undefined },
      { label: 'New This Month',  value: k.newMembersThisMonth ?? 0, prefix: '', icon: 'fa-solid fa-user-plus',        bg: '#eff6ff', color: '#2563eb', trend: undefined },
      { label: 'Expiring Soon',   value: k.expiringMembers ?? 0, prefix: '',  icon: 'fa-solid fa-clock',               bg: '#fefce8', color: '#ca8a04', trend: undefined },
    ];
  }

  memberName(member: any): string {
    return (member?.fullName ?? [member?.firstName, member?.lastName].filter(Boolean).join(' ')) || 'Member';
  }

  initials(member: any): string {
    const name = this.memberName(member);
    return name.split(' ').map((p: string) => p[0]).join('').slice(0, 2).toUpperCase() || '?';
  }

  ngOnInit(): void {
    this.dashboardService.getManagerDashboard().subscribe({
      next: (res) => { this.data.set(res.data); this.loading.set(false); },
      error: () => { this.loading.set(false); this.toastr.error('Failed to load dashboard'); },
    });
  }
}
