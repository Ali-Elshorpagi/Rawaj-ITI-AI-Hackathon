import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { TranslateModule } from '@ngx-translate/core';
import { RouterLink } from '@angular/router';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';

import { DashboardService } from '../../services/dashboard.service';
import { AuthService } from '../../core/auth.service';
import { UserRole } from '../../models/enums';

@Component({
  selector: 'gd-dashboard',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, MatCardModule, TranslateModule, RouterLink, BaseChartDirective],
  template: `
    <div class="page">
      <div class="gd-page-header">
        <div>
          <h1 class="gd-page-header__title">{{ 'dashboard.title' | translate }}</h1>
          <p class="gd-page-header__subtitle">Welcome back, {{ auth.currentUser()?.firstName }}</p>
        </div>
        <div class="gd-page-header__actions">
          <button mat-stroked-button routerLink="/attendance/check-in">
            <mat-icon>how_to_reg</mat-icon> Check In
          </button>
          <button mat-flat-button color="primary" routerLink="/members/new">
            <mat-icon>person_add</mat-icon> Add Member
          </button>
        </div>
      </div>

      @if (loading()) {
        <div class="gd-grid gd-grid--4">
          @for (_ of [1,2,3,4]; track $index) {
            <div class="gd-card"><div class="gd-skeleton" style="height:80px"></div></div>
          }
        </div>
      } @else if (dashboardData()) {
        <!-- KPI Cards -->
        <div class="gd-grid gd-grid--4">
          @for (kpi of kpiCards(); track kpi.label) {
            <div class="gd-kpi-card">
              <div class="gd-kpi-card__icon" [style.background]="kpi.bgColor">
                <mat-icon [style.color]="kpi.color">{{ kpi.icon }}</mat-icon>
              </div>
              <div class="gd-kpi-card__value">{{ kpi.value }}</div>
              <div class="gd-kpi-card__label">{{ kpi.label | translate }}</div>
              @if (kpi.trend !== undefined) {
                <div class="gd-kpi-card__trend" [class.gd-kpi-card__trend--up]="kpi.trend >= 0" [class.gd-kpi-card__trend--down]="kpi.trend < 0">
                  <mat-icon>{{ kpi.trend >= 0 ? 'trending_up' : 'trending_down' }}</mat-icon>
                  {{ kpi.trend >= 0 ? '+' : '' }}{{ kpi.trend }}% {{ 'dashboard.vsLastMonth' | translate }}
                </div>
              }
            </div>
          }
        </div>

        <!-- Charts -->
        @if (auth.isAdmin()) {
          <div class="gd-grid gd-grid--2" style="margin-top: 24px">
            <div class="gd-card">
              <div class="gd-card__header">
                <div>
                  <div class="gd-card__title">{{ 'dashboard.revenueChart' | translate }}</div>
                </div>
              </div>
              <canvas baseChart [data]="revenueChartData" [options]="lineChartOptions" type="line"></canvas>
            </div>
            <div class="gd-card">
              <div class="gd-card__header">
                <div class="gd-card__title">{{ 'dashboard.attendanceChart' | translate }}</div>
              </div>
              <canvas baseChart [data]="attendanceChartData" [options]="barChartOptions" type="bar"></canvas>
            </div>
          </div>
        }
      }
    </div>
  `,
  styles: [`
    .page { max-width: 1400px; }
  `]
})
export class DashboardComponent implements OnInit {
  protected readonly auth = inject(AuthService);
  private readonly dashboardService = inject(DashboardService);

  readonly loading = signal(true);
  readonly dashboardData = signal<any>(null);

  kpiCards() {
    const data = this.dashboardData();
    if (!data?.kpis) return [];
    const kpis = data.kpis;
    return [
      { icon: 'people', label: 'dashboard.totalMembers', value: kpis.totalMembers, bgColor: '#EEF1F8', color: '#3F5587', trend: undefined },
      { icon: 'person_check', label: 'dashboard.activeMembers', value: kpis.activeMembers, bgColor: '#F0FDF4', color: '#16A34A', trend: undefined },
      { icon: 'today', label: 'dashboard.todayAttendance', value: kpis.todayAttendance, bgColor: '#FFF7ED', color: '#EA580C', trend: undefined },
      { icon: 'payments', label: 'dashboard.monthlyRevenue', value: `$${(kpis.monthlyRevenue ?? 0).toFixed(0)}`, bgColor: '#F5F3FF', color: '#7C3AED', trend: kpis.revenueGrowth },
      { icon: 'person_add', label: 'dashboard.newThisMonth', value: kpis.newMembersThisMonth, bgColor: '#EFF2FB', color: '#5B77BC', trend: undefined },
      { icon: 'warning', label: 'dashboard.expiringMembers', value: kpis.expiringMembers, bgColor: '#FFFBEB', color: '#D97706', trend: undefined },
      { icon: 'sports', label: 'dashboard.trainers', value: kpis.trainerCount, bgColor: '#FFF1F2', color: '#E11D48', trend: undefined },
      { icon: 'fitness_center', label: 'dashboard.classes', value: kpis.classCount, bgColor: '#F0F9FF', color: '#0284C7', trend: undefined },
    ];
  }

  revenueChartData: ChartData<'line'> = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [{
      label: 'Revenue',
      data: [],
      borderColor: '#5B77BC',
      backgroundColor: 'rgba(91,119,188,0.1)',
      fill: true,
      tension: 0.4,
    }],
  };

  attendanceChartData: ChartData<'bar'> = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
      label: 'Check-ins',
      data: [],
      backgroundColor: 'rgba(91,119,188,0.7)',
      borderRadius: 6,
    }],
  };

  lineChartOptions: ChartConfiguration['options'] = {
    responsive: true, maintainAspectRatio: true,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true } },
  };

  barChartOptions: ChartConfiguration['options'] = {
    responsive: true, maintainAspectRatio: true,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true } },
  };

  ngOnInit(): void {
    const role = this.auth.currentUser()?.role;
    let dashboardObs;

    switch (role) {
      case UserRole.OWNER: dashboardObs = this.dashboardService.getOwnerDashboard(); break;
      case UserRole.MANAGER: dashboardObs = this.dashboardService.getManagerDashboard(); break;
      case UserRole.TRAINER: dashboardObs = this.dashboardService.getTrainerDashboard(); break;
      case UserRole.MEMBER: dashboardObs = this.dashboardService.getMemberDashboard(); break;
      default: dashboardObs = this.dashboardService.getOwnerDashboard();
    }

    dashboardObs.subscribe({
      next: (res) => {
        this.dashboardData.set(res.data);

        if (res.data?.charts?.revenueByMonth) {
          const revenueData = new Array(12).fill(0);
          res.data.charts.revenueByMonth.forEach((item: any) => {
            revenueData[item.month - 1] = item.revenue;
          });
          this.revenueChartData = { ...this.revenueChartData, datasets: [{ ...this.revenueChartData.datasets[0], data: revenueData }] };
        }

        if (res.data?.charts?.weeklyAttendance) {
          const attendanceData = new Array(7).fill(0);
          res.data.charts.weeklyAttendance.forEach((item: any) => {
            attendanceData[(item.day - 1) % 7] = item.count;
          });
          this.attendanceChartData = { ...this.attendanceChartData, datasets: [{ ...this.attendanceChartData.datasets[0], data: attendanceData }] };
        }

        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
