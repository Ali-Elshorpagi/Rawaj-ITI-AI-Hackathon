import { Component, signal, inject, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
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
    CommonModule, MatIconModule, MatButtonModule,
    MatMenuModule, MatTooltipModule, MatBadgeModule, MatDividerModule, TranslateModule,
    ConfirmModalComponent,
  ],
  template: `
    <!-- Mobile overlay -->
    @if (mobileSidebarOpen()) {
      <div class="fixed inset-0 bg-black/60 z-40 md:hidden" (click)="closeMobileSidebar()"></div>
    }

    <div class="layout" [class.layout--collapsed]="sidebarCollapsed()" [class.layout--mobile-open]="mobileSidebarOpen()">
      <!-- Sidebar -->
      <aside class="sidebar">
        <div class="sidebar__header">
          <div class="sidebar__brand">
            <div class="sidebar__logo">
              <mat-icon>fitness_center</mat-icon>
            </div>
            <span class="sidebar__name">GymDesk</span>
          </div>
          <button mat-icon-button class="sidebar__toggle" (click)="toggleSidebar()" matTooltip="Toggle sidebar">
            <mat-icon>{{ sidebarCollapsed() ? 'menu_open' : 'menu' }}</mat-icon>
          </button>
        </div>

        <nav class="sidebar__nav">
          @for (item of visibleNavItems(); track item.path) {
            <a class="nav-item" [routerLink]="item.path" routerLinkActive="nav-item--active"
               (click)="closeMobileSidebar()"
               [matTooltip]="sidebarCollapsed() ? (item.label | translate) : ''"
               matTooltipPosition="after">
              <mat-icon class="nav-item__icon">{{ item.icon }}</mat-icon>
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
        </div>
      </aside>

      <!-- Main Content -->
      <div class="main">
        <!-- Header -->
        <header class="header">
          <div class="header__left">
            <button mat-icon-button class="header__menu-btn" (click)="toggleMobileSidebar()">
              <mat-icon>menu</mat-icon>
            </button>
          </div>
          <div class="header__right">
            <!-- Language Toggle -->
            <button mat-icon-button (click)="themeService.toggleLanguage()"
                    [matTooltip]="themeService.language() === 'en' ? 'Switch to Arabic' : 'Switch to English'">
              <mat-icon>translate</mat-icon>
            </button>

            <!-- Theme Toggle -->
            <button mat-icon-button (click)="themeService.toggleTheme()"
                    [matTooltip]="themeService.isDark() ? 'Light mode' : 'Dark mode'">
              <mat-icon>{{ themeService.isDark() ? 'light_mode' : 'dark_mode' }}</mat-icon>
            </button>

            <!-- Notifications -->
            <a mat-icon-button routerLink="/notifications" class="header__notif-btn">
              <mat-icon [matBadge]="notificationsService.unreadCount() > 0 ? notificationsService.unreadCount() : null"
                        matBadgeColor="warn" matBadgeSize="small">
                notifications
              </mat-icon>
            </a>

            <!-- User Menu -->
            <button mat-icon-button [matMenuTriggerFor]="userMenu">
              <div class="gd-avatar gd-avatar--sm">{{ getInitials() }}</div>
            </button>
            <mat-menu #userMenu="matMenu" xPosition="before">
              <a mat-menu-item routerLink="/profile">
                <mat-icon>person</mat-icon>
                <span>{{ 'nav.profile' | translate }}</span>
              </a>
              <a mat-menu-item routerLink="/settings" *ngIf="authService.isOwner()">
                <mat-icon>settings</mat-icon>
                <span>{{ 'nav.settings' | translate }}</span>
              </a>
              <mat-divider></mat-divider>
              <button mat-menu-item (click)="logout()">
                <mat-icon>logout</mat-icon>
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
        mat-icon { color: white; font-size: 20px; width: 20px; height: 20px; }
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
    { label: 'nav.dashboard', icon: 'dashboard', path: '/dashboard' },
    { label: 'nav.members', icon: 'people', path: '/members', roles: [UserRole.OWNER, UserRole.MANAGER, UserRole.RECEPTION, UserRole.TRAINER] },
    { label: 'nav.subscriptions', icon: 'card_membership', path: '/subscriptions', roles: [UserRole.OWNER, UserRole.MANAGER, UserRole.RECEPTION] },
    { label: 'nav.attendance', icon: 'how_to_reg', path: '/attendance', roles: [UserRole.OWNER, UserRole.MANAGER, UserRole.RECEPTION, UserRole.TRAINER] },
    { label: 'nav.payments', icon: 'payments', path: '/payments', roles: [UserRole.OWNER, UserRole.MANAGER, UserRole.RECEPTION] },
    { label: 'nav.trainers', icon: 'sports', path: '/trainers', roles: [UserRole.OWNER, UserRole.MANAGER] },
    { label: 'nav.classes', icon: 'fitness_center', path: '/classes' },
    { label: 'nav.reports', icon: 'bar_chart', path: '/reports', roles: [UserRole.OWNER, UserRole.MANAGER] },
    {
      label: 'nav.notifications',
      icon: 'notifications',
      path: '/notifications',
      badge: () => this.notificationsService.unreadCount(),
    },
    { label: 'nav.settings', icon: 'settings', path: '/settings', roles: [UserRole.OWNER] },
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
    return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
  }

  logout(): void {
    this.authService.logout().subscribe();
  }
}
