import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { NotificationsService } from '../../services/notifications.service';
import { Notification } from '../../models/interfaces';

@Component({
  selector: 'gd-notifications',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, TranslateModule],
  template: `
    <div class="page">
      <div class="gd-page-header">
        <div>
          <h1 class="gd-page-header__title">{{ 'notifications.title' | translate }}</h1>
          <p class="gd-page-header__subtitle">
            {{ notificationsService.unreadCount() }} unread notifications
          </p>
        </div>
        <button mat-stroked-button (click)="markAllRead()" [disabled]="notificationsService.unreadCount() === 0">
          <mat-icon>done_all</mat-icon> Mark all as read
        </button>
      </div>

      <div class="notifications-list">
        @if (loading()) {
          @for (_ of [1,2,3,4,5]; track $index) {
            <div class="gd-card" style="margin-bottom:8px"><div class="gd-skeleton" style="height:72px"></div></div>
          }
        } @else {
          @for (n of notifications(); track n.id) {
            <div class="notif-item gd-card" [class.unread]="!n.isRead" (click)="markRead(n)">
              <div class="notif-icon" [ngClass]="'notif-icon--' + n.type">
                <mat-icon>{{ getIcon(n.type) }}</mat-icon>
              </div>
              <div class="notif-body">
                <div class="notif-title">{{ n.title }}</div>
                <div class="notif-message">{{ n.message }}</div>
                <div class="notif-time">{{ n.createdAt | date:'medium' }}</div>
              </div>
              @if (!n.isRead) {
                <div class="unread-dot"></div>
              }
              <button mat-icon-button class="delete-btn" (click)="deleteNotif($event, n)">
                <mat-icon>close</mat-icon>
              </button>
            </div>
          } @empty {
            <div class="gd-empty-state">
              <mat-icon>notifications_none</mat-icon>
              <h3>All caught up!</h3>
              <p>No notifications to show.</p>
            </div>
          }
        }
      </div>
    </div>
  `,
  styles: [`
    .page { max-width: 800px; }
    .notifications-list { display: flex; flex-direction: column; gap: 8px; }
    .notif-item { display: flex; align-items: flex-start; gap: 14px; padding: 16px; position: relative; cursor: pointer; transition: background var(--transition-base); }
    .notif-item:hover { background: var(--surface-bg); }
    .notif-item.unread { background: rgba(91,119,188,0.04); border-left: 3px solid var(--color-primary-500); }
    .notif-icon { width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; mat-icon { font-size: 20px; width: 20px; height: 20px; } }
    .notif-icon--membership_expiry { background: #FEF3C7; mat-icon { color: #D97706; } }
    .notif-icon--payment { background: #F0FDF4; mat-icon { color: #16A34A; } }
    .notif-icon--attendance { background: #EEF1F8; mat-icon { color: #3F5587; } }
    .notif-icon--welcome { background: #FDF2F8; mat-icon { color: #9333EA; } }
    .notif-icon--system { background: var(--surface-bg); mat-icon { color: var(--text-muted); } }
    .notif-body { flex: 1; min-width: 0; }
    .notif-title { font-size: 0.875rem; font-weight: 600; color: var(--text-primary); }
    .notif-message { font-size: 0.8125rem; color: var(--text-secondary); margin-top: 2px; }
    .notif-time { font-size: 0.75rem; color: var(--text-muted); margin-top: 4px; }
    .unread-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--color-primary-500); flex-shrink: 0; margin-top: 4px; }
    .delete-btn { opacity: 0; transition: opacity var(--transition-base); color: var(--text-muted); margin-left: 4px; }
    .notif-item:hover .delete-btn { opacity: 1; }
  `]
})
export class NotificationsComponent implements OnInit {
  protected readonly notificationsService = inject(NotificationsService);
  private readonly toastr = inject(ToastrService);

  readonly notifications = signal<Notification[]>([]);
  readonly loading = signal(true);

  ngOnInit(): void {
    this.notificationsService.getAll({ page: 1, limit: 50 }).subscribe({
      next: (res) => { this.notifications.set(res.data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  markRead(n: Notification): void {
    if (n.isRead) return;
    this.notificationsService.markAsRead(n.id).subscribe({
      next: () => {
        this.notifications.update(list => list.map(x => x.id === n.id ? { ...x, isRead: true } : x));
      },
    });
  }

  markAllRead(): void {
    this.notificationsService.markAllAsRead().subscribe({
      next: () => {
        this.notifications.update(list => list.map(x => ({ ...x, isRead: true })));
        this.toastr.success('All notifications marked as read', 'Done');
      },
    });
  }

  deleteNotif(event: Event, n: Notification): void {
    event.stopPropagation();
    this.notificationsService.deleteNotification(n.id).subscribe({
      next: () => {
        this.notifications.update(list => list.filter(x => x.id !== n.id));
        if (!n.isRead) this.notificationsService.setUnreadCount(Math.max(0, this.notificationsService.unreadCount() - 1));
      },
    });
  }

  getIcon(type: string): string {
    const map: Record<string, string> = {
      membership_expiry: 'card_membership',
      payment: 'payments',
      attendance: 'how_to_reg',
      welcome: 'waving_hand',
      system: 'info',
    };
    return map[type] ?? 'notifications';
  }
}
