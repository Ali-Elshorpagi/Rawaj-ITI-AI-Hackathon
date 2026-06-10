import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { ToastrService } from 'ngx-toastr';
import { DashboardService } from '../../../services/dashboard.service';

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

@Component({
  selector: 'gd-trainer-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, MatButtonModule],
  template: `
    <div class="trainer-page">

      <!-- Hero -->
      <section class="ops-hero">
        <div>
          <p class="eyebrow">Trainer Workspace</p>
          <h1>Welcome back, {{ trainerName() }}</h1>
          <p class="hero-copy">{{ data()?.classes?.length ?? 0 }} classes · {{ totalEnrollments() }} enrolled members</p>
        </div>
        <div class="hero-actions">
          <a mat-flat-button routerLink="/classes"><i class="fa-solid fa-dumbbell"></i> All Classes</a>
          <a mat-stroked-button routerLink="/attendance"><i class="fa-solid fa-clipboard-check"></i> Attendance Log</a>
        </div>
      </section>

      <!-- KPIs -->
      @if (loading()) {
        <div class="metrics-grid">
          @for (_ of [1,2,3,4]; track $index) {
            <div class="metric-card"><div class="gd-skeleton" style="height:96px"></div></div>
          }
        </div>
      } @else {
        <div class="metrics-grid">
          @for (m of metrics(); track m.label) {
            <div class="metric-card">
              <div class="metric-icon" [style.background]="m.bg"><i [class]="m.icon" [style.color]="m.color"></i></div>
              <div class="metric-value">{{ m.value }}</div>
              <div class="metric-label">{{ m.label }}</div>
            </div>
          }
        </div>
      }

      <!-- Today's Sessions + Quick Actions -->
      <div class="desk-grid">
        <section class="desk-panel">
          <div class="panel-header">
            <div>
              <h2>Today's Sessions</h2>
              <p>Classes scheduled for today ({{ todayName }}).</p>
            </div>
            <i class="fa-solid fa-calendar-day"></i>
          </div>
          @if (todaySessions().length === 0) {
            <div class="empty-state">
              <i class="fa-solid fa-mug-hot" style="font-size:2rem;color:var(--text-muted);margin-bottom:8px"></i>
              <p>No sessions today — enjoy the rest!</p>
            </div>
          } @else {
            <div class="session-list">
              @for (cls of todaySessions(); track cls._id) {
                <div class="session-card">
                  <div class="session-info">
                    <strong>{{ cls.name }}</strong>
                    <span>{{ cls.location }}</span>
                    <span class="session-time">
                      @for (s of todaySchedule(cls); track $index) {
                        {{ s.startTime }} – {{ s.endTime }}
                      }
                    </span>
                  </div>
                  <div class="session-meta">
                    <span class="pill pill--green">{{ cls.enrollmentCount ?? 0 }} enrolled</span>
                    <span class="pill">Cap: {{ cls.capacity }}</span>
                  </div>
                </div>
              }
            </div>
          }
        </section>

        <section class="desk-panel">
          <div class="panel-header">
            <div><h2>Quick Actions</h2><p>Trainer workflows.</p></div>
            <i class="fa-solid fa-bolt"></i>
          </div>
          <div class="action-grid">
            <a routerLink="/classes" class="action-tile"><i class="fa-solid fa-dumbbell"></i><span>My Classes</span></a>
            <a routerLink="/attendance" class="action-tile"><i class="fa-solid fa-calendar-check"></i><span>Attendance</span></a>
            <a routerLink="/members" class="action-tile"><i class="fa-solid fa-users"></i><span>Members</span></a>
            <a routerLink="/profile" class="action-tile"><i class="fa-solid fa-user-gear"></i><span>My Profile</span></a>
          </div>
        </section>
      </div>

      <!-- All Classes -->
      <section class="desk-panel">
        <div class="panel-header">
          <div>
            <h2>My Classes</h2>
            <p>All classes assigned to you with enrollment info.</p>
          </div>
          <a routerLink="/classes">View all</a>
        </div>
        @if (loading()) {
          <div class="gd-skeleton" style="height:200px"></div>
        } @else {
          <div class="class-grid">
            @for (cls of classes(); track cls._id) {
              <div class="class-card">
                <div class="class-card__header">
                  <div class="class-icon"><i class="fa-solid fa-dumbbell"></i></div>
                  <div>
                    <strong>{{ cls.name }}</strong>
                    <span>{{ cls.location }}</span>
                  </div>
                </div>
                <p class="class-desc">{{ cls.description }}</p>
                <div class="class-schedule">
                  @for (s of cls.schedule; track $index) {
                    <span class="day-pill">{{ DAY_NAMES[s.dayOfWeek] }} {{ s.startTime }}</span>
                  }
                </div>
                <div class="class-footer">
                  <span><i class="fa-solid fa-users" style="margin-right:4px"></i>{{ cls.enrollmentCount ?? 0 }} / {{ cls.capacity }}</span>
                  @if (cls.lastSession) {
                    <span class="text-muted">Last: {{ cls.lastSession | date:'MMM d' }}</span>
                  }
                </div>
              </div>
            } @empty {
              <div class="empty-state" style="grid-column:1/-1">
                <p>No classes assigned yet. Contact your manager.</p>
              </div>
            }
          </div>
        }
      </section>

    </div>
  `,
  styles: [`
    :host {
      --trainer:      #059669;
      --trainer-dark: #065f46;
      --trainer-soft: #ecfdf5;
      --trainer-line: #a7f3d0;
    }
    .trainer-page { max-width: 1400px; display: flex; flex-direction: column; gap: 22px; }
    .ops-hero {
      background: linear-gradient(135deg, #064e3b 0%, #059669 55%, #10b981 100%);
      color: #fff; border-radius: 16px; padding: 24px;
      display: flex; align-items: center; justify-content: space-between; gap: 18px; flex-wrap: wrap;
      box-shadow: 0 18px 40px rgba(5,150,105,.28);
    }
    .eyebrow { font-size:.75rem;font-weight:800;text-transform:uppercase;letter-spacing:.08em;opacity:.75;margin-bottom:6px; }
    .ops-hero h1 { font-size:1.65rem;font-weight:800;margin:0 0 6px; }
    .hero-copy { opacity:.9;margin:0; }
    .hero-actions { display:flex;gap:10px;flex-wrap:wrap; }
    .hero-actions a[mat-flat-button] { background:#fff;color:#065f46; }
    .hero-actions a[mat-stroked-button] { border-color:rgba(255,255,255,.55);color:#fff; }

    .metrics-grid { display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:16px; }
    .metric-card, .desk-panel { background:var(--surface-card);border:1px solid var(--surface-border);border-radius:12px; }
    .metric-card { padding:18px;border-top:3px solid var(--trainer); }
    .metric-icon { width:38px;height:38px;border-radius:10px;display:flex;align-items:center;justify-content:center;margin-bottom:12px; }
    .metric-value { font-size:1.8rem;font-weight:800;color:var(--text-primary);line-height:1; }
    .metric-label { color:var(--text-muted);font-size:.78rem;font-weight:700;text-transform:uppercase;letter-spacing:.05em;margin-top:6px; }

    .desk-grid { display:grid;grid-template-columns:1.15fr .85fr;gap:18px; }
    .desk-panel { padding:20px;border-top:3px solid var(--trainer-line); }
    .panel-header { display:flex;justify-content:space-between;align-items:flex-start;gap:12px;margin-bottom:16px; }
    .panel-header h2 { font-size:1rem;font-weight:800;margin:0 0 4px;color:var(--text-primary); }
    .panel-header p { color:var(--text-muted);font-size:.83rem;margin:0; }
    .panel-header > i { color:var(--trainer);font-size:1.25rem; }
    .panel-header a { color:var(--trainer);font-weight:700;font-size:.82rem;text-decoration:none; }

    .session-list { display:flex;flex-direction:column;gap:10px; }
    .session-card { display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px;border-radius:10px;background:var(--trainer-soft);border:1px solid var(--trainer-line); }
    .session-info { display:flex;flex-direction:column;gap:2px; }
    .session-info strong { color:var(--text-primary);font-size:.9rem; }
    .session-info span { color:var(--text-muted);font-size:.78rem; }
    .session-time { color:var(--trainer-dark)!important;font-weight:700!important; }
    .session-meta { display:flex;flex-direction:column;gap:4px;align-items:flex-end; }
    .pill { padding:3px 10px;border-radius:20px;font-size:.72rem;font-weight:700;background:var(--surface-bg);color:var(--text-muted); }
    .pill--green { background:#d1fae5;color:#065f46; }

    .action-grid { display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px; }
    .action-tile { border:1px solid var(--trainer-line);background:var(--trainer-soft);border-radius:10px;padding:14px;color:#065f46;text-decoration:none;display:flex;align-items:center;gap:10px;font-weight:800;transition:background .15s; }
    .action-tile:hover { background:#a7f3d0; }

    .class-grid { display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:16px; }
    .class-card { border:1px solid var(--surface-border);border-radius:12px;padding:16px;background:var(--surface-card);border-top:3px solid var(--trainer); }
    .class-card__header { display:flex;align-items:center;gap:12px;margin-bottom:8px; }
    .class-card__header strong { display:block;color:var(--text-primary);font-size:.9rem;font-weight:700; }
    .class-card__header span { color:var(--text-muted);font-size:.75rem; }
    .class-icon { width:40px;height:40px;border-radius:10px;background:var(--trainer-soft);color:var(--trainer);display:flex;align-items:center;justify-content:center;flex-shrink:0; }
    .class-desc { color:var(--text-muted);font-size:.8rem;margin:0 0 10px; }
    .class-schedule { display:flex;flex-wrap:wrap;gap:6px;margin-bottom:12px; }
    .day-pill { padding:3px 8px;border-radius:6px;background:var(--trainer-soft);color:var(--trainer-dark);font-size:.72rem;font-weight:700; }
    .class-footer { display:flex;justify-content:space-between;align-items:center;font-size:.78rem;color:var(--text-muted);padding-top:10px;border-top:1px solid var(--surface-border); }
    .text-muted { color:var(--text-muted);font-size:.78rem; }

    .empty-state { text-align:center;padding:32px;color:var(--text-muted); }
    @media (max-width:1000px) { .metrics-grid{grid-template-columns:repeat(2,1fr)}.desk-grid{grid-template-columns:1fr} }
    @media (max-width:560px) { .metrics-grid,.action-grid,.class-grid{grid-template-columns:1fr} }
  `],
})
export class TrainerDashboardComponent implements OnInit {
  protected readonly DAY_NAMES = DAY_NAMES;
  private readonly dashboardService = inject(DashboardService);
  private readonly toastr = inject(ToastrService);

  readonly loading = signal(true);
  readonly data = signal<any>(null);
  readonly todayName = DAY_NAMES[new Date().getDay()];

  readonly classes = computed(() => this.data()?.classes ?? []);
  readonly todaySessions = computed(() => this.data()?.todaySessions ?? []);

  readonly totalEnrollments = computed(() =>
    (this.data()?.classes ?? []).reduce((sum: number, c: any) => sum + (c.enrollmentCount ?? 0), 0)
  );

  trainerName() {
    const t = this.data()?.trainer;
    return t ? (t.specialization ?? 'Trainer') : 'Trainer';
  }

  metrics() {
    const t = this.data()?.trainer ?? {};
    return [
      { label: 'My Classes',        value: this.data()?.classes?.length ?? 0,    icon: 'fa-solid fa-dumbbell',       bg: '#ecfdf5', color: '#059669' },
      { label: 'Total Enrolled',    value: this.totalEnrollments(),               icon: 'fa-solid fa-users',           bg: '#eff6ff', color: '#2563eb' },
      { label: "Today's Sessions",  value: this.todaySessions().length,           icon: 'fa-solid fa-calendar-day',   bg: '#fff7ed', color: '#b45309' },
      { label: 'Sessions This Month', value: t.thisMonthAttendance ?? 0,          icon: 'fa-solid fa-calendar-check', bg: '#faf5ff', color: '#7c3aed' },
    ];
  }

  todaySchedule(cls: any) {
    const dow = new Date().getDay();
    return (cls.schedule ?? []).filter((s: any) => s.dayOfWeek === dow);
  }

  ngOnInit(): void {
    this.dashboardService.getTrainerDashboard().subscribe({
      next: (res) => { this.data.set(res.data); this.loading.set(false); },
      error: () => { this.loading.set(false); this.toastr.error('Failed to load dashboard'); },
    });
  }
}
