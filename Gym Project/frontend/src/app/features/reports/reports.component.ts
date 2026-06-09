import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { TranslateModule } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from '../../services/api.service';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';

@Component({
  selector: 'gd-reports',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatButtonModule, MatSelectModule, MatFormFieldModule, MatInputModule, MatDatepickerModule, MatNativeDateModule, TranslateModule, BaseChartDirective],
  template: `
    <div class="page">
      <div class="gd-page-header">
        <div>
          <h1 class="gd-page-header__title">{{ 'reports.title' | translate }}</h1>
          <p class="gd-page-header__subtitle">Analytics and data exports</p>
        </div>
      </div>

      <div class="report-tabs">
        @for (tab of tabs; track tab.id) {
          <button class="tab-btn" [class.active]="activeTab() === tab.id" (click)="setTab(tab.id)">
            <mat-icon>{{ tab.icon }}</mat-icon> {{ tab.label }}
          </button>
        }
      </div>

      <div class="report-controls gd-card">
        <mat-form-field appearance="outline">
          <mat-label>Start Date</mat-label>
          <input matInput [matDatepicker]="startPicker" [(ngModel)]="startDate">
          <mat-datepicker-toggle matSuffix [for]="startPicker"></mat-datepicker-toggle>
          <mat-datepicker #startPicker></mat-datepicker>
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>End Date</mat-label>
          <input matInput [matDatepicker]="endPicker" [(ngModel)]="endDate">
          <mat-datepicker-toggle matSuffix [for]="endPicker"></mat-datepicker-toggle>
          <mat-datepicker #endPicker></mat-datepicker>
        </mat-form-field>
        <button mat-flat-button color="primary" (click)="loadReport()">
          <mat-icon>search</mat-icon> Generate Report
        </button>
        <button mat-stroked-button (click)="exportReport('excel')" [disabled]="!hasData()">
          <mat-icon>download</mat-icon> Export Excel
        </button>
        <button mat-stroked-button (click)="exportReport('pdf')" [disabled]="!hasData()" *ngIf="activeTab() === 'attendance'">
          <mat-icon>picture_as_pdf</mat-icon> Export PDF
        </button>
      </div>

      @if (loading()) {
        <div class="gd-skeleton" style="height:400px;border-radius:var(--radius-lg)"></div>
      } @else if (activeTab() === 'attendance') {
        <div class="report-section">
          <div class="gd-grid gd-grid--4">
            @for (kpi of attendanceKPIs(); track $index) {
              <div class="gd-kpi-card">
                <div class="gd-kpi-card__icon" [style.background]="kpi.bg"><mat-icon [style.color]="kpi.color">{{ kpi.icon }}</mat-icon></div>
                <div class="gd-kpi-card__value">{{ kpi.value }}</div>
                <div class="gd-kpi-card__label">{{ kpi.label }}</div>
              </div>
            }
          </div>
          @if (attendanceChartData()) {
            <div class="gd-card chart-card">
              <h3>Daily Attendance</h3>
              <canvas baseChart [data]="attendanceChartData()!" [options]="lineOptions" type="line"></canvas>
            </div>
          }
        </div>
      } @else if (activeTab() === 'revenue') {
        <div class="report-section">
          <div class="gd-grid gd-grid--4">
            @for (kpi of revenueKPIs(); track $index) {
              <div class="gd-kpi-card">
                <div class="gd-kpi-card__icon" [style.background]="kpi.bg"><mat-icon [style.color]="kpi.color">{{ kpi.icon }}</mat-icon></div>
                <div class="gd-kpi-card__value">{{ kpi.value }}</div>
                <div class="gd-kpi-card__label">{{ kpi.label }}</div>
              </div>
            }
          </div>
          @if (revenueChartData()) {
            <div class="gd-card chart-card">
              <h3>Monthly Revenue</h3>
              <canvas baseChart [data]="revenueChartData()!" [options]="barOptions" type="bar"></canvas>
            </div>
          }
        </div>
      } @else if (activeTab() === 'membership') {
        <div class="report-section">
          @if (membershipData()) {
            <div class="gd-grid gd-grid--2">
              <div class="gd-card chart-card">
                <h3>Members by Status</h3>
                <canvas baseChart [data]="membershipData()!.byStatus" type="doughnut" [options]="doughnutOptions"></canvas>
              </div>
              <div class="gd-card chart-card">
                <h3>Members by Plan</h3>
                <canvas baseChart [data]="membershipData()!.byPlan" type="doughnut" [options]="doughnutOptions"></canvas>
              </div>
            </div>
          }
        </div>
      } @else if (activeTab() === 'trainers') {
        <div class="report-section">
          <div class="gd-table-container">
            <table class="gd-table">
              <thead><tr><th>Trainer</th><th>Classes</th><th>Participants</th><th>Avg Occupancy</th></tr></thead>
              <tbody>
                @for (row of trainerData(); track row.trainerId) {
                  <tr>
                    <td>{{ row.trainerName }}</td>
                    <td>{{ row.totalClasses }}</td>
                    <td>{{ row.totalParticipants }}</td>
                    <td>{{ row.avgOccupancy | number:'1.0-1' }}%</td>
                  </tr>
                } @empty {
                  <tr><td colspan="4" style="text-align:center;padding:32px;color:var(--text-muted)">No data — generate the report first.</td></tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .page { max-width: 1400px; }
    .report-tabs { display: flex; gap: 4px; margin-bottom: 20px; background: var(--surface-card); padding: 4px; border-radius: var(--radius-lg); width: fit-content; }
    .tab-btn { display: flex; align-items: center; gap: 6px; padding: 8px 16px; border: none; border-radius: var(--radius-md); background: transparent; color: var(--text-secondary); font-size: 0.875rem; font-weight: 500; cursor: pointer; transition: all var(--transition-base); mat-icon { font-size: 18px; width: 18px; height: 18px; } }
    .tab-btn.active { background: var(--color-primary-500); color: #fff; }
    .report-controls { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; margin-bottom: 24px; }
    mat-form-field { min-width: 160px; }
    .report-section { display: flex; flex-direction: column; gap: 24px; }
    .chart-card { padding: 24px; h3 { margin-bottom: 16px; font-size: 1rem; font-weight: 600; } }
  `]
})
export class ReportsComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly toastr = inject(ToastrService);

  readonly activeTab = signal<string>('attendance');
  readonly loading = signal(false);
  readonly hasData = signal(false);
  readonly attendanceKPIs = signal<any[]>([]);
  readonly attendanceChartData = signal<ChartConfiguration['data'] | null>(null);
  readonly revenueKPIs = signal<any[]>([]);
  readonly revenueChartData = signal<ChartConfiguration['data'] | null>(null);
  readonly membershipData = signal<any>(null);
  readonly trainerData = signal<any[]>([]);

  startDate: Date = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  endDate: Date = new Date();

  readonly tabs = [
    { id: 'attendance', label: 'Attendance', icon: 'people' },
    { id: 'revenue', label: 'Revenue', icon: 'payments' },
    { id: 'membership', label: 'Membership', icon: 'card_membership' },
    { id: 'trainers', label: 'Trainer Performance', icon: 'sports' },
  ];

  readonly lineOptions: ChartConfiguration['options'] = { responsive: true, plugins: { legend: { display: false } } };
  readonly barOptions: ChartConfiguration['options'] = { responsive: true, plugins: { legend: { display: false } } };
  readonly doughnutOptions: ChartConfiguration['options'] = { responsive: true };

  ngOnInit(): void { this.loadReport(); }

  setTab(tab: string): void { this.activeTab.set(tab); this.loadReport(); }

  loadReport(): void {
    this.loading.set(true);
    this.hasData.set(false);
    const params = {
      startDate: this.startDate?.toISOString(),
      endDate: this.endDate?.toISOString(),
    };

    const endpointMap: Record<string, string> = {
      attendance: '/reports/attendance',
      revenue: '/reports/revenue',
      membership: '/reports/membership',
      trainers: '/reports/trainer-performance',
    };

    this.api.get<any>(endpointMap[this.activeTab()], params).subscribe({
      next: (res) => {
        this.processReportData(res.data);
        this.hasData.set(true);
        this.loading.set(false);
      },
      error: () => { this.loading.set(false); },
    });
  }

  private processReportData(data: any): void {
    const tab = this.activeTab();
    if (tab === 'attendance') {
      this.attendanceKPIs.set([
        { icon: 'people', label: 'Total Check-ins', value: data.total ?? 0, bg: '#EEF1F8', color: '#3F5587' },
        { icon: 'trending_up', label: 'Daily Average', value: data.dailyAverage?.toFixed(1) ?? '0', bg: '#F0FDF4', color: '#16A34A' },
        { icon: 'emoji_events', label: 'Peak Day', value: data.peakDay ?? '—', bg: '#FEF3C7', color: '#D97706' },
        { icon: 'fitness_center', label: 'Unique Members', value: data.uniqueMembers ?? 0, bg: '#FDF2F8', color: '#9333EA' },
      ]);
      if (data.daily?.length) {
        this.attendanceChartData.set({
          labels: data.daily.map((d: any) => d.date),
          datasets: [{ data: data.daily.map((d: any) => d.count), borderColor: '#5B77BC', tension: 0.4, fill: true, backgroundColor: 'rgba(91,119,188,0.1)' }],
        });
      }
    } else if (tab === 'revenue') {
      const total = data.reduce ? data.reduce((s: number, m: any) => s + (m.revenue ?? 0), 0) : (data.totalRevenue ?? 0);
      this.revenueKPIs.set([
        { icon: 'payments', label: 'Total Revenue', value: `$${Number(total).toFixed(0)}`, bg: '#EEF1F8', color: '#3F5587' },
        { icon: 'receipt_long', label: 'Total Transactions', value: data.totalTransactions ?? 0, bg: '#F0FDF4', color: '#16A34A' },
        { icon: 'trending_up', label: 'Avg Transaction', value: `$${Number(data.avgTransaction ?? 0).toFixed(0)}`, bg: '#FEF3C7', color: '#D97706' },
        { icon: 'undo', label: 'Refunds', value: data.totalRefunds ?? 0, bg: '#FDF2F8', color: '#9333EA' },
      ]);
      if (Array.isArray(data)) {
        this.revenueChartData.set({
          labels: data.map((m: any) => `${m.year}-${String(m.month).padStart(2, '0')}`),
          datasets: [{ data: data.map((m: any) => m.revenue), backgroundColor: '#5B77BC' }],
        });
      }
    } else if (tab === 'membership') {
      const byStatus = data.byStatus ?? [];
      const byPlan = data.byPlan ?? [];
      this.membershipData.set({
        byStatus: {
          labels: byStatus.map((s: any) => s.status),
          datasets: [{ data: byStatus.map((s: any) => s.count), backgroundColor: ['#22C55E', '#F59E0B', '#EF4444', '#8B5CF6'] }],
        },
        byPlan: {
          labels: byPlan.map((p: any) => p.planName ?? p._id),
          datasets: [{ data: byPlan.map((p: any) => p.count), backgroundColor: ['#5B77BC', '#22C55E', '#F59E0B', '#EF4444'] }],
        },
      });
    } else if (tab === 'trainers') {
      this.trainerData.set(Array.isArray(data) ? data : []);
    }
  }

  exportReport(format: 'excel' | 'pdf'): void {
    const endpointMap: Record<string, string> = {
      attendance: '/reports/attendance',
      revenue: '/reports/revenue',
    };
    const url = endpointMap[this.activeTab()];
    if (!url) return;
    const params = new URLSearchParams({
      format,
      startDate: this.startDate?.toISOString() ?? '',
      endDate: this.endDate?.toISOString() ?? '',
    });
    window.open(`${url}?${params.toString()}`, '_blank');
  }
}
