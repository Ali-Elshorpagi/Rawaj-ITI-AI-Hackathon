import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { guestGuard } from './guards/guest.guard';
import { roleGuard } from './guards/role.guard';
import { UserRole } from './models/enums';

export const routes: Routes = [
  // ── Landing Page (public) ────────────────────────────────────────────────────
  {
    path: '',
    loadComponent: () => import('./features/landing/landing.component').then(m => m.LandingComponent),
    title: 'GymDesk – Premium Gym Management Platform',
    pathMatch: 'full',
  },

  // ── Auth Routes ─────────────────────────────────────────────────────────────
  {
    path: 'auth',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./layouts/auth-layout/auth-layout.component').then(m => m.AuthLayoutComponent),
    children: [
      { path: '', redirectTo: 'login', pathMatch: 'full' },
      {
        path: 'login',
        loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent),
        title: 'Login – GymDesk',
      },
      {
        path: 'register',
        loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent),
        title: 'Register – GymDesk',
      },
      {
        path: 'forgot-password',
        loadComponent: () => import('./features/auth/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent),
        title: 'Forgot Password – GymDesk',
      },
      {
        path: 'reset-password',
        loadComponent: () => import('./features/auth/reset-password/reset-password.component').then(m => m.ResetPasswordComponent),
        title: 'Reset Password – GymDesk',
      },
      {
        path: 'verify-email',
        loadComponent: () => import('./features/auth/verify-email/verify-email.component').then(m => m.VerifyEmailComponent),
        title: 'Verify Email – GymDesk',
      },
    ],
  },

  // ── Dashboard Layout ─────────────────────────────────────────────────────────
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./layouts/dashboard-layout/dashboard-layout.component').then(m => m.DashboardLayoutComponent),
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
        title: 'Dashboard – GymDesk',
      },
      {
        path: 'members',
        canActivate: [roleGuard([UserRole.OWNER, UserRole.MANAGER, UserRole.RECEPTION, UserRole.TRAINER])],
        children: [
          {
            path: '',
            loadComponent: () => import('./features/members/member-list/member-list.component').then(m => m.MemberListComponent),
            title: 'Members – GymDesk',
          },
          {
            path: 'new',
            canActivate: [roleGuard([UserRole.OWNER, UserRole.MANAGER, UserRole.RECEPTION])],
            loadComponent: () => import('./features/members/member-form/member-form.component').then(m => m.MemberFormComponent),
            title: 'New Member – GymDesk',
          },
          {
            path: ':id',
            loadComponent: () => import('./features/members/member-detail/member-detail.component').then(m => m.MemberDetailComponent),
            title: 'Member Details – GymDesk',
          },
          {
            path: ':id/edit',
            canActivate: [roleGuard([UserRole.OWNER, UserRole.MANAGER, UserRole.RECEPTION])],
            loadComponent: () => import('./features/members/member-form/member-form.component').then(m => m.MemberFormComponent),
            title: 'Edit Member – GymDesk',
          },
        ],
      },
      {
        path: 'subscriptions',
        canActivate: [roleGuard([UserRole.OWNER, UserRole.MANAGER, UserRole.RECEPTION])],
        children: [
          {
            path: '',
            loadComponent: () => import('./features/subscriptions/subscription-plans/subscription-plans.component').then(m => m.SubscriptionPlansComponent),
            title: 'Subscriptions – GymDesk',
          },
        ],
      },
      {
        path: 'attendance',
        canActivate: [roleGuard([UserRole.OWNER, UserRole.MANAGER, UserRole.RECEPTION, UserRole.TRAINER])],
        children: [
          {
            path: '',
            loadComponent: () => import('./features/attendance/attendance-list/attendance-list.component').then(m => m.AttendanceListComponent),
            title: 'Attendance – GymDesk',
          },
          {
            path: 'check-in',
            loadComponent: () => import('./features/attendance/check-in/check-in.component').then(m => m.CheckInComponent),
            title: 'Check-In – GymDesk',
          },
        ],
      },
      {
        path: 'payments',
        canActivate: [roleGuard([UserRole.OWNER, UserRole.MANAGER, UserRole.RECEPTION])],
        children: [
          {
            path: '',
            loadComponent: () => import('./features/payments/payment-list/payment-list.component').then(m => m.PaymentListComponent),
            title: 'Payments – GymDesk',
          },
        ],
      },
      {
        path: 'trainers',
        canActivate: [roleGuard([UserRole.OWNER, UserRole.MANAGER])],
        children: [
          {
            path: '',
            loadComponent: () => import('./features/trainers/trainer-list/trainer-list.component').then(m => m.TrainerListComponent),
            title: 'Trainers – GymDesk',
          },
        ],
      },
      {
        path: 'classes',
        children: [
          {
            path: '',
            loadComponent: () => import('./features/classes/class-list/class-list.component').then(m => m.ClassListComponent),
            title: 'Classes – GymDesk',
          },
          {
            path: 'schedule',
            loadComponent: () => import('./features/classes/class-schedule/class-schedule.component').then(m => m.ClassScheduleComponent),
            title: 'Class Schedule – GymDesk',
          },
        ],
      },
      {
        path: 'reports',
        canActivate: [roleGuard([UserRole.OWNER, UserRole.MANAGER])],
        loadComponent: () => import('./features/reports/reports.component').then(m => m.ReportsComponent),
        title: 'Reports – GymDesk',
      },
      {
        path: 'notifications',
        loadComponent: () => import('./features/notifications/notifications.component').then(m => m.NotificationsComponent),
        title: 'Notifications – GymDesk',
      },
      {
        path: 'settings',
        canActivate: [roleGuard([UserRole.OWNER])],
        loadComponent: () => import('./features/settings/settings.component').then(m => m.SettingsComponent),
        title: 'Settings – GymDesk',
      },
      {
        path: 'profile',
        loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent),
        title: 'Profile – GymDesk',
      },
    ],
  },

  // ── Payment Redirect Pages ──────────────────────────────────────────────────
  {
    path: 'payments/success',
    loadComponent: () => import('./features/payments/payment-success/payment-success.component').then(m => m.PaymentSuccessComponent),
    title: 'Payment Success – GymDesk',
  },
  {
    path: 'payments/cancel',
    loadComponent: () => import('./features/payments/payment-cancel/payment-cancel.component').then(m => m.PaymentCancelComponent),
    title: 'Payment Cancelled – GymDesk',
  },

  // ── 404 ──────────────────────────────────────────────────────────────────────
  {
    path: '**',
    loadComponent: () => import('./features/not-found/not-found.component').then(m => m.NotFoundComponent),
    title: '404 – GymDesk',
  },
];
