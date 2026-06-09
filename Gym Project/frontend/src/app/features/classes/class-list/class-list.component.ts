import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { TranslateModule } from '@ngx-translate/core';
import { ApiService } from '../../../services/api.service';
import { AuthService } from '../../../core/auth.service';
import { GymClass } from '../../../models/interfaces';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'gd-class-list',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule, MatButtonModule, MatChipsModule, TranslateModule],
  template: `
    <div class="page">
      <div class="gd-page-header">
        <div>
          <h1 class="gd-page-header__title">{{ 'classes.title' | translate }}</h1>
          <p class="gd-page-header__subtitle">Upcoming classes and schedule</p>
        </div>
        <div style="display:flex;gap:10px">
          <a mat-stroked-button routerLink="/classes/schedule">
            <mat-icon>calendar_month</mat-icon> Schedule
          </a>
          <button mat-flat-button color="primary" (click)="openAddDialog()" *ngIf="auth.isAdmin()">
            <mat-icon>add</mat-icon> Add Class
          </button>
        </div>
      </div>

      <div class="classes-grid">
        @if (loading()) {
          @for (_ of [1,2,3,4,5,6]; track $index) {
            <div class="gd-card"><div class="gd-skeleton" style="height:200px"></div></div>
          }
        } @else {
          @for (cls of classes(); track cls.id) {
            <div class="class-card gd-card">
              <div class="class-card__header">
                <h3 class="class-card__title">{{ cls.title }}</h3>
                <span class="badge" [ngClass]="getStatusClass(cls)">
                  {{ 'classes.status.' + cls.status | translate }}
                </span>
              </div>
              <div class="class-card__trainer">
                <div class="gd-avatar gd-avatar--sm">
                  {{ getTrainerInitials(cls.trainer) }}
                </div>
                <span>{{ cls.trainer?.firstName }} {{ cls.trainer?.lastName }}</span>
              </div>
              <div class="class-card__time">
                <mat-icon>schedule</mat-icon>
                {{ cls.startTime | date:'EEE, MMM d' }} · {{ cls.startTime | date:'shortTime' }} – {{ cls.endTime | date:'shortTime' }}
              </div>
              @if (cls.location) {
                <div class="class-card__location">
                  <mat-icon>place</mat-icon> {{ cls.location }}
                </div>
              }
              <div class="class-card__capacity">
                <div class="capacity-bar">
                  <div class="capacity-fill" [style.width.%]="(cls.participants.length / cls.capacity) * 100"></div>
                </div>
                <span>{{ cls.participants.length }}/{{ cls.capacity }} participants</span>
              </div>
              <div class="class-card__tags">
                @for (tag of cls.tags.slice(0,3); track tag) {
                  <span class="tag">{{ tag }}</span>
                }
              </div>
              <div class="class-card__actions" *ngIf="auth.isStaff()">
                <button mat-stroked-button (click)="enrollMember(cls)" [disabled]="cls.isFull">
                  @if (cls.isFull) { Full } @else { Enroll Member }
                </button>
              </div>
            </div>
          } @empty {
            <div class="gd-empty-state" style="grid-column:1/-1">
              <mat-icon>fitness_center</mat-icon>
              <h3>No upcoming classes</h3>
              <p>Add classes to start scheduling sessions.</p>
            </div>
          }
        }
      </div>
    </div>
  `,
  styles: [`
    .page { max-width: 1400px; }
    .classes-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 24px; }
    .class-card { display: flex; flex-direction: column; gap: 10px; }
    .class-card__header { display: flex; justify-content: space-between; align-items: flex-start; }
    .class-card__title { font-size: 1rem; font-weight: 600; }
    .class-card__trainer { display: flex; align-items: center; gap: 8px; font-size: 0.875rem; color: var(--text-secondary); }
    .class-card__time { display: flex; align-items: center; gap: 6px; font-size: 0.875rem; color: var(--text-muted); mat-icon { font-size: 16px; width: 16px; height: 16px; } }
    .class-card__location { display: flex; align-items: center; gap: 6px; font-size: 0.8125rem; color: var(--text-muted); mat-icon { font-size: 16px; width: 16px; height: 16px; } }
    .class-card__capacity { font-size: 0.8125rem; color: var(--text-muted); }
    .capacity-bar { height: 4px; background: var(--surface-border); border-radius: 2px; margin-bottom: 4px; overflow: hidden; }
    .capacity-fill { height: 100%; background: var(--color-primary-500); border-radius: 2px; transition: width var(--transition-base); }
    .class-card__tags { display: flex; flex-wrap: wrap; gap: 4px; }
    .tag { background: var(--surface-bg); color: var(--text-muted); padding: 2px 8px; border-radius: 100px; font-size: 0.6875rem; font-weight: 500; }
    .class-card__actions { margin-top: 4px; }
  `]
})
export class ClassListComponent implements OnInit {
  protected readonly auth = inject(AuthService);
  private readonly api = inject(ApiService);
  private readonly toastr = inject(ToastrService);

  readonly classes = signal<GymClass[]>([]);
  readonly loading = signal(true);

  ngOnInit(): void {
    this.api.get<any>('/classes', { page: 1, limit: 20 }).subscribe({
      next: (res) => { this.classes.set(res.data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  getStatusClass(cls: GymClass): string {
    const map: Record<string, string> = { scheduled: 'active', ongoing: 'pending', completed: 'cancelled', cancelled: 'expired' };
    return `badge--${map[cls.status] ?? 'pending'}`;
  }

  getTrainerInitials(trainer: any): string {
    if (!trainer) return '?';
    return `${trainer.firstName?.[0]}${trainer.lastName?.[0]}`.toUpperCase();
  }

  openAddDialog(): void {
    this.toastr.info('Class creation form — implement with inline dialog.', 'Add Class');
  }

  enrollMember(cls: GymClass): void {
    const memberId = prompt('Enter Member ID to enroll:');
    if (!memberId) return;
    this.api.post<any>(`/classes/${cls.id}/enroll`, { memberId }).subscribe({
      next: () => { this.toastr.success('Member enrolled', 'Success'); this.ngOnInit(); },
      error: (err) => this.toastr.error(err.error?.message ?? 'Enrollment failed', 'Error'),
    });
  }
}
