import { Component, signal, inject, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../core/auth.service';
import { ThemeService } from '../../core/theme.service';
import { NotificationsService } from '../../services/notifications.service';
import { PusherClientService } from '../../services/pusher.service';
import { UserRole } from '../../models/enums';
import { ConfirmModalComponent } from '../../shared/modal/confirm-modal.component';

interface NavItem {
  label: string;
  icon: string;
  path: string;
  roles?: UserRole[];
  badge?: () => number;
}

@Component({
  selector: 'gd-dashboard-layout',
  standalone: true,
  imports: [
    RouterOutlet, RouterLink, RouterLinkActive,
    CommonModule, MatButtonModule,
    MatMenuModule, MatTooltipModule, MatBadgeModule, MatDividerModule, TranslateModule,
    ConfirmModalComponent,
  ],
  template: `
    <!-- Mobile overlay -->
    @if (mobileSidebarOpen()) {
      <div class="fixed inset-0 bg-black/60 z-40 md:hidden" (click)="closeMobileSidebar()"></div>
    }

    <div class="layout"
         [class.layout--collapsed]="sidebarCollapsed()"
         [class.layout--mobile-open]="mobileSidebarOpen()"
         [class.reception-theme]="authService.isReception()"
         [class.trainer-theme]="authService.isTrainer()"
         [class.manager-theme]="authService.isManager()"
         [class.owner-theme]="authService.isOwner()">
      <!-- Sidebar -->
      <aside class="sidebar">
        <div class="sidebar__header">
          <div class="sidebar__brand">
            <div class="sidebar__logo">
              <i class="fa-solid fa-dumbbell"></i>
            </div>
            <span class="sidebar__name">GymDesk</span>
          </div>
          <button mat-icon-button class="sidebar__toggle" (click)="toggleSidebar()" matTooltip="Toggle sidebar">
            <i [class]="sidebarCollapsed() ? 'fa-solid fa-xmark' : 'fa-solid fa-bars'"></i>
          </button>
        </div>

        <nav class="sidebar__nav">
          @for (item of visibleNavItems(); track item.path) {
            <a class="nav-item" [routerLink]="item.path" routerLinkActive="nav-item--active"
               (click)="closeMobileSidebar()"
               [matTooltip]="sidebarCollapsed() ? (item.label | translate) : ''"
               matTooltipPosition="after">
              <i class="nav-item__icon fa-solid" [ngClass]="item.icon"></i>
              <span class="nav-item__label">{{ item.label | translate }}</span>
              @if (item.badge && item.badge() > 0) {
                <span class="nav-item__badge">{{ item.badge() }}</span>
              }
            </a>
          }
        </nav>

        <div class="sidebar__footer">
          <div class="sidebar__user">
            <div class="gd-avatar gd-avatar--sm sidebar__user-avatar">
              @if (authService.currentUser()?.profilePhoto) {
                <img [src]="authService.currentUser()?.profilePhoto" [alt]="authService.currentUser()?.firstName">
              } @else {
                {{ getInitials() }}
              }
            </div>
            <div class="sidebar__user-info">
              <span class="sidebar__user-name">{{ authService.currentUser()?.firstName }} {{ authService.currentUser()?.lastName }}</span>
              <span class="sidebar__user-role">{{ authService.currentUser()?.role }}</span>
            </div>
          </div>
          <button class="sidebar__logout" (click)="logout()" matTooltip="Logout" matTooltipPosition="after">
            <i class="fa-solid fa-right-from-bracket"></i>
            <span class="sidebar__logout-label">Logout</span>
          </button>
        </div>
      </aside>

      <!-- Main Content -->
      <div class="main">
        <!-- Header -->
        <header class="header">
          <div class="header__left">
            <button mat-icon-button class="header__menu-btn" (click)="toggleMobileSidebar()">
              <i class="fa-solid fa-bars"></i>
            </button>
          </div>
          <div class="header__right">
            <!-- Language Toggle -->
            <button mat-icon-button (click)="themeService.toggleLanguage()"
                    [matTooltip]="themeService.language() === 'en' ? 'Switch to Arabic' : 'Switch to English'">
              <i class="fa-solid fa-language"></i>
            </button>

            <!-- Theme Toggle -->
            <button mat-icon-button (click)="themeService.toggleTheme()"
                    [matTooltip]="themeService.isDark() ? 'Light mode' : 'Dark mode'">
              <i [class]="themeService.isDark() ? 'fa-solid fa-sun' : 'fa-solid fa-moon'"></i>
            </button>

            <!-- Notifications -->
            <a mat-icon-button routerLink="/notifications" class="header__notif-btn"
               [matBadge]="notificationsService.unreadCount() > 0 ? notificationsService.unreadCount() : null"
               matBadgeColor="warn" matBadgeSize="small">
              <i class="fa-solid fa-bell"></i>
            </a>

            <!-- User Menu -->
            <button mat-icon-button [matMenuTriggerFor]="userMenu">
              <div class="gd-avatar gd-avatar--sm">{{ getInitials() }}</div>
            </button>
            <mat-menu #userMenu="matMenu" xPosition="before">
              <a mat-menu-item routerLink="/profile">
                <i class="fa-solid fa-user"></i>
                <span>{{ 'nav.profile' | translate }}</span>
              </a>
              <a mat-menu-item routerLink="/settings" *ngIf="authService.isOwner()">
                <i class="fa-solid fa-gear"></i>
                <span>{{ 'nav.settings' | translate }}</span>
              </a>
              <mat-divider></mat-divider>
              <button mat-menu-item (click)="logout()">
                <i class="fa-solid fa-right-from-bracket"></i>
                <span>{{ 'nav.logout' | translate }}</span>
              </button>
            </mat-menu>
          </div>
        </header>

        <!-- Page Content -->
        <main class="content">
          <router-outlet />
        </main>
      </div>
    </div>

    <!-- Global Confirm Modal -->
    <gd-confirm-modal />
  `,
  styles: [`
    .layout {
      display: flex; min-height: 100vh;
      --sidebar-w: var(--sidebar-width);

      &--collapsed { --sidebar-w: var(--sidebar-collapsed-width); }
    }

    .sidebar {
      width: var(--sidebar-w); min-height: 100vh; position: fixed; top: 0; left: 0;
      background: var(--surface-card); border-right: 1px solid var(--surface-border);
      display: flex; flex-direction: column; transition: width var(--transition-slow);
      z-index: 100; overflow: hidden;

      :host-context(.rtl) & { left: unset; right: 0; border-right: none; border-left: 1px solid var(--surface-border); }

      &__header {
        display: flex; align-items: center; justify-content: space-between;
        padding: 16px; height: var(--header-height); border-bottom: 1px solid var(--surface-border);
        flex-shrink: 0;
      }

      &__brand { display: flex; align-items: center; gap: 10px; overflow: hidden; }

      &__logo {
        width: 36px; height: 36px; border-radius: 10px; flex-shrink: 0;
        background: var(--color-primary-500); display: flex; align-items: center; justify-content: center;
        i { color: white; font-size: 20px; }
      }

      &__name {
        font-size: 1.0625rem; font-weight: 700; color: var(--text-primary);
        white-space: nowrap; overflow: hidden;
        .layout--collapsed & { opacity: 0; width: 0; }
        transition: opacity var(--transition-base), width var(--transition-base);
      }

      &__toggle { color: var(--text-muted); flex-shrink: 0; }

      &__nav { flex: 1; padding: 8px; overflow-y: auto; overflow-x: hidden; }

      &__footer {
        padding: 12px; border-top: 1px solid var(--surface-border);
        overflow: hidden;
      }

      &__user { display: flex; align-items: center; gap: 10px; padding: 8px; border-radius: var(--radius-md); }
      &__user-info { overflow: hidden; .layout--collapsed & { display: none; } }
      &__user-name { display: block; font-size: 0.8125rem; font-weight: 600; color: var(--text-primary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      &__user-role { display: block; font-size: 0.6875rem; color: var(--text-muted); text-transform: capitalize; }
      &__user-avatar { flex-shrink: 0; }
    }

    .nav-item {
      display: flex; align-items: center; gap: 10px;
      padding: 9px 10px; border-radius: var(--radius-md);
      color: var(--text-muted); text-decoration: none; cursor: pointer;
      transition: all var(--transition-fast); white-space: nowrap; overflow: hidden;
      position: relative; margin-bottom: 2px;

      &:hover { background: var(--surface-hover); color: var(--text-primary); }

      &--active {
        background: var(--surface-active) !important;
        color: var(--color-primary-600) !important;
        font-weight: 600;
        .nav-item__icon { color: var(--color-primary-600); }
      }

      &__icon { font-size: 20px; width: 20px; height: 20px; flex-shrink: 0; }
      &__label { font-size: 0.875rem; .layout--collapsed & { opacity: 0; width: 0; } transition: opacity var(--transition-base), width var(--transition-base); }
      &__badge {
        margin-left: auto; background: var(--color-error); color: white;
        border-radius: var(--radius-full); min-width: 20px; height: 20px;
        display: flex; align-items: center; justify-content: center;
        font-size: 0.6875rem; font-weight: 700; padding: 0 5px;
        .layout--collapsed & { display: none; }
      }
    }

    .main {
      flex: 1; margin-left: var(--sidebar-w); transition: margin var(--transition-slow);
      display: flex; flex-direction: column; min-height: 100vh;
      :host-context(.rtl) & { margin-left: 0; margin-right: var(--sidebar-w); }
    }

    .header {
      height: var(--header-height); background: var(--surface-card);
      border-bottom: 1px solid var(--surface-border);
      display: flex; align-items: center; justify-content: space-between;
      padding: 0 24px; position: sticky; top: 0; z-index: 50;

      &__right { display: flex; align-items: center; gap: 4px; }
      &__notif-btn { position: relative; }
    }

    .content { flex: 1; padding: 24px; background: var(--surface-bg); }

    .sidebar__logout {
      display: flex; align-items: center; gap: 10px;
      width: 100%; padding: 8px 10px; margin-top: 6px;
      border: none; background: transparent; cursor: pointer; border-radius: var(--radius-md);
      color: var(--text-muted); font-size: .875rem; transition: all var(--transition-fast);
      &:hover { background: var(--surface-hover); color: var(--color-error, #ef4444); }
    }
    .sidebar__logout-label { .layout--collapsed & { opacity: 0; width: 0; overflow: hidden; } transition: opacity var(--transition-base), width var(--transition-base); }

    /* ── Reception blue theme ─────────────────────────────── */
    .reception-theme {
      .sidebar {
        background: #1e3a8a;
        border-color: #1e40af;
      }
      .sidebar__header, .sidebar__footer { border-color: #1d4ed8; }
      .sidebar__logo { background: #2563eb; }
      .sidebar__name, .sidebar__user-name { color: #fff; }
      .sidebar__user-role { color: #93c5fd; }
      .sidebar__toggle { color: #93c5fd; }
      .sidebar__toggle:hover { color: #fff; }
      .nav-item { color: #93c5fd; }
      .nav-item:hover { background: rgba(255,255,255,.1); color: #fff; }
      .nav-item--active {
        background: rgba(255,255,255,.18) !important;
        color: #fff !important;
        .nav-item__icon { color: #fff; }
      }
      .nav-item__badge { background: #f97316; }
      .sidebar__logout { color: #93c5fd; }
      .sidebar__logout:hover { background: rgba(255,255,255,.1); color: #fca5a5; }
      .header {
        background: #1e40af;
        border-color: #2563eb;
      }
      .header button, .header a { color: #e0f2fe; }
      .header button:hover, .header a:hover { color: #fff; background: rgba(255,255,255,.12); border-radius: 8px; }
      .gd-avatar { background: #2563eb; color: #fff; border: 2px solid #60a5fa; }
      .content { background: #eff6ff; }
    }

    /* ── Trainer emerald theme ────────────────────────────── */
    .trainer-theme {
      .sidebar { background: #064e3b; border-color: #065f46; }
      .sidebar__header, .sidebar__footer { border-color: #065f46; }
      .sidebar__logo { background: #059669; }
      .sidebar__name, .sidebar__user-name { color: #fff; }
      .sidebar__user-role { color: #6ee7b7; }
      .sidebar__toggle { color: #6ee7b7; }
      .sidebar__toggle:hover { color: #fff; }
      .nav-item { color: #6ee7b7; }
      .nav-item:hover { background: rgba(255,255,255,.1); color: #fff; }
      .nav-item--active {
        background: rgba(255,255,255,.18) !important;
        color: #fff !important;
        .nav-item__icon { color: #fff; }
      }
      .nav-item__badge { background: #f97316; }
      .sidebar__logout { color: #6ee7b7; }
      .sidebar__logout:hover { background: rgba(255,255,255,.1); color: #fca5a5; }
      .header { background: #065f46; border-color: #059669; }
      .header button, .header a { color: #d1fae5; }
      .header button:hover, .header a:hover { color: #fff; background: rgba(255,255,255,.12); border-radius: 8px; }
      .gd-avatar { background: #059669; color: #fff; border: 2px solid #34d399; }
      .content { background: #f0fdf4; }
    }

    /* ── Manager violet theme ─────────────────────────────── */
    .manager-theme {
      .sidebar { background: #2e1065; border-color: #4c1d95; }
      .sidebar__header, .sidebar__footer { border-color: #4c1d95; }
      .sidebar__logo { background: #7c3aed; }
      .sidebar__name, .sidebar__user-name { color: #fff; }
      .sidebar__user-role { color: #c4b5fd; }
      .sidebar__toggle { color: #c4b5fd; }
      .sidebar__toggle:hover { color: #fff; }
      .nav-item { color: #c4b5fd; }
      .nav-item:hover { background: rgba(255,255,255,.1); color: #fff; }
      .nav-item--active {
        background: rgba(255,255,255,.18) !important;
        color: #fff !important;
        .nav-item__icon { color: #fff; }
      }
      .nav-item__badge { background: #f97316; }
      .sidebar__logout { color: #c4b5fd; }
      .sidebar__logout:hover { background: rgba(255,255,255,.1); color: #fca5a5; }
      .header { background: #4c1d95; border-color: #7c3aed; }
      .header button, .header a { color: #ede9fe; }
      .header button:hover, .header a:hover { color: #fff; background: rgba(255,255,255,.12); border-radius: 8px; }
      .gd-avatar { background: #7c3aed; color: #fff; border: 2px solid #a78bfa; }
      .content { background: #f5f3ff; }
    }

    /* ── Owner amber theme ────────────────────────────────── */
    .owner-theme {
      .sidebar { background: #451a03; border-color: #78350f; }
      .sidebar__header, .sidebar__footer { border-color: #78350f; }
      .sidebar__logo { background: #d97706; }
      .sidebar__name, .sidebar__user-name { color: #fff; }
      .sidebar__user-role { color: #fcd34d; }
      .sidebar__toggle { color: #fcd34d; }
      .sidebar__toggle:hover { color: #fff; }
      .nav-item { color: #fcd34d; }
      .nav-item:hover { background: rgba(255,255,255,.1); color: #fff; }
      .nav-item--active {
        background: rgba(255,255,255,.18) !important;
        color: #fff !important;
        .nav-item__icon { color: #fff; }
      }
      .nav-item__badge { background: #ef4444; }
      .sidebar__logout { color: #fcd34d; }
      .sidebar__logout:hover { background: rgba(255,255,255,.1); color: #fca5a5; }
      .header { background: #78350f; border-color: #d97706; }
      .header button, .header a { color: #fef3c7; }
      .header button:hover, .header a:hover { color: #fff; background: rgba(255,255,255,.12); border-radius: 8px; }
      .gd-avatar { background: #d97706; color: #fff; border: 2px solid #fbbf24; }
      .content { background: #fffbeb; }
    }

    @media (max-width: 768px) {
      .sidebar {
        transform: translateX(-100%);
        z-index: 50;
        .layout--mobile-open & { transform: none; }
        :host-context([dir="rtl"]) & { transform: translateX(100%); }
        :host-context([dir="rtl"]) .layout--mobile-open & { transform: none; }
      }
      .main { margin-left: 0 !important; margin-right: 0 !important; }
      .header__menu-btn { display: flex !important; }
    }
  `]
})
export class DashboardLayoutComponent implements OnInit, OnDestroy {
  protected readonly authService = inject(AuthService);
  protected readonly themeService = inject(ThemeService);
  protected readonly notificationsService = inject(NotificationsService);
  private readonly pusher = inject(PusherClientService);

  readonly sidebarCollapsed = signal(false);
  readonly mobileSidebarOpen = signal(false);

  ngOnInit(): void {
    // Load initial unread count
    this.notificationsService.getUnreadCount().subscribe();

    // Connect Pusher and subscribe to real-time channels
    this.pusher.init();

    const userId = this.authService.currentUser()?.id;
    if (userId) {
      // User-specific notifications (public channel fallback since no auth endpoint)
      this.pusher.on(`user-${userId}`, 'notification', () => {
        this.notificationsService.getUnreadCount().subscribe();
      });
    }

    // Dashboard-level events
    this.pusher.on('members', 'new-member', () => {
      // Surfaces to components via their own subscriptions
    });
  }

  ngOnDestroy(): void {
    this.pusher.disconnect();
  }

  private readonly allNavItems: NavItem[] = [
    { label: 'nav.dashboard', icon: 'fa-gauge', path: '/dashboard' },
    { label: 'nav.members', icon: 'fa-users', path: '/members', roles: [UserRole.OWNER, UserRole.MANAGER, UserRole.RECEPTION, UserRole.TRAINER] },
    { label: 'nav.subscriptions', icon: 'fa-id-card', path: '/subscriptions', roles: [UserRole.OWNER, UserRole.MANAGER, UserRole.RECEPTION] },
    { label: 'nav.attendance', icon: 'fa-clipboard-check', path: '/attendance', roles: [UserRole.OWNER, UserRole.MANAGER, UserRole.RECEPTION, UserRole.TRAINER] },
    { label: 'nav.payments', icon: 'fa-money-bill-wave', path: '/payments', roles: [UserRole.OWNER, UserRole.MANAGER, UserRole.RECEPTION] },
    { label: 'nav.trainers', icon: 'fa-person-running', path: '/trainers', roles: [UserRole.OWNER, UserRole.MANAGER] },
    { label: 'nav.classes', icon: 'fa-dumbbell', path: '/classes' },
    { label: 'nav.reports', icon: 'fa-chart-bar', path: '/reports', roles: [UserRole.OWNER, UserRole.MANAGER] },
    {
      label: 'nav.notifications',
      icon: 'fa-bell',
      path: '/notifications',
      badge: () => this.notificationsService.unreadCount(),
    },
    { label: 'nav.subscribe', icon: 'fa-credit-card', path: '/subscribe', roles: [UserRole.MEMBER] },
    { label: 'nav.profile', icon: 'fa-user-gear', path: '/profile', roles: [UserRole.MEMBER] },
    { label: 'nav.settings', icon: 'fa-gear', path: '/settings', roles: [UserRole.OWNER] },
  ];

  visibleNavItems() {
    const role = this.authService.currentUser()?.role;
    return this.allNavItems.filter(item => !item.roles || (role && item.roles.includes(role)));
  }

  toggleSidebar(): void {
    this.sidebarCollapsed.update(v => !v);
  }

  toggleMobileSidebar(): void {
    this.mobileSidebarOpen.update(v => !v);
  }

  closeMobileSidebar(): void {
    this.mobileSidebarOpen.set(false);
  }

  getInitials(): string {
    const user = this.authService.currentUser();
    if (!user) return '?';
    const first = user.firstName?.[0] ?? '';
    const last = user.lastName?.[0] ?? '';
    return (first + last).toUpperCase() || '?';
  }

  logout(): void {
    this.authService.logout().subscribe();
  }
}
