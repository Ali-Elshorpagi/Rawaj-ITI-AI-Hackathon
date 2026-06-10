import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { TranslateModule } from '@ngx-translate/core';
import { ApiService } from '../../../services/api.service';
import { GymClass } from '../../../models/interfaces';

interface DayColumn {
  date: Date;
  label: string;
  dayShort: string;
  classes: ScheduleEvent[];
}

interface ScheduleEvent extends GymClass {
  occurrenceStart: Date;
  occurrenceEnd: Date;
}

@Component({
  selector: 'gd-class-schedule',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, MatButtonModule, MatDatepickerModule, MatNativeDateModule, MatFormFieldModule, MatInputModule, TranslateModule],
  template: `
    <div class="page">
      <div class="gd-page-header">
        <div>
          <h1 class="gd-page-header__title">Class Schedule</h1>
          <p class="gd-page-header__subtitle">Weekly overview of gym classes</p>
        </div>
        <div style="display:flex;gap:10px;align-items:center">
          <button mat-icon-button (click)="prevWeek()"><i class="fa-solid fa-chevron-left"></i></button>
          <span class="week-label">{{ weekLabel() }}</span>
          <button mat-icon-button (click)="nextWeek()"><i class="fa-solid fa-chevron-right"></i></button>
          <button mat-stroked-button (click)="goToToday()">Today</button>
          <a mat-stroked-button routerLink="/classes"><i class="fa-solid fa-list"></i> List</a>
        </div>
      </div>

      @if (loading()) {
        <div class="gd-skeleton" style="height:400px;border-radius:var(--radius-lg)"></div>
      } @else {
        <div class="schedule-grid">
          @for (day of days(); track day.date.toISOString()) {
            <div class="schedule-day" [class.today]="isToday(day.date)">
              <div class="schedule-day__header">
                <span class="day-name">{{ day.dayShort }}</span>
                <span class="day-num" [class.today-circle]="isToday(day.date)">{{ day.date | date:'d' }}</span>
              </div>
              <div class="schedule-day__classes">
                @for (cls of day.classes; track (cls.id ?? cls._id) + '-' + cls.occurrenceStart.toISOString()) {
                  <div class="schedule-event" [style.background]="getEventColor(cls)">
                    <div class="event-title">{{ cls.name }}</div>
                    <div class="event-meta">{{ cls.occurrenceStart | date:'shortTime' }} - {{ cls.occurrenceEnd | date:'shortTime' }}</div>
                    <div class="event-meta">{{ trainerName(cls.trainerId) }}</div>
                    <div class="event-meta">{{ cls.enrollmentCount ?? cls.participants?.length ?? 0 }}/{{ cls.capacity }}</div>
                  </div>
                } @empty {
                  <div class="no-classes">—</div>
                }
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .page { max-width: 1400px; }
    .week-label { font-weight: 600; font-size: 0.9375rem; min-width: 200px; text-align: center; }
    .schedule-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 12px; }
    .schedule-day { background: var(--surface-card); border-radius: var(--radius-lg); overflow: hidden; border: 1px solid var(--surface-border); }
    .schedule-day.today { border-color: var(--color-primary-500); }
    .schedule-day__header { padding: 12px 8px; text-align: center; border-bottom: 1px solid var(--surface-border); background: var(--surface-bg); }
    .day-name { display: block; font-size: 0.6875rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); font-weight: 600; }
    .day-num { display: block; font-size: 1.25rem; font-weight: 700; color: var(--text-primary); margin-top: 2px; }
    .today-circle { background: var(--color-primary-500); color: #fff; border-radius: 50%; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; margin: 2px auto 0; }
    .schedule-day__classes { padding: 8px; display: flex; flex-direction: column; gap: 8px; min-height: 200px; }
    .schedule-event { padding: 8px; border-radius: 8px; font-size: 0.75rem; }
    .event-title { font-weight: 600; margin-bottom: 2px; }
    .event-meta { color: rgba(0,0,0,0.6); font-size: 0.6875rem; line-height: 1.4; }
    .no-classes { text-align: center; color: var(--text-muted); font-size: 0.8125rem; padding: 16px 0; }
    @media (max-width: 900px) { .schedule-grid { grid-template-columns: repeat(3,1fr); } }
    @media (max-width: 500px) { .schedule-grid { grid-template-columns: 1fr 1fr; } }
  `]
})
export class ClassScheduleComponent implements OnInit {
  private readonly api = inject(ApiService);

  readonly days = signal<DayColumn[]>([]);
  readonly loading = signal(true);
  readonly weekLabel = signal('');

  private weekStart = this.getMonday(new Date());

  ngOnInit(): void { this.loadWeek(); }

  private getMonday(d: Date): Date {
    const date = new Date(d);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    date.setDate(diff);
    date.setHours(0, 0, 0, 0);
    return date;
  }

  private loadWeek(): void {
    this.loading.set(true);
    const end = new Date(this.weekStart);
    end.setDate(end.getDate() + 6);

    this.weekLabel.set(
      `${this.weekStart.toLocaleDateString('en', { month: 'short', day: 'numeric' })} – ${end.toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })}`
    );

    this.api.get<any>('/classes').subscribe({
      next: (res) => {
        const classes: GymClass[] = res.data ?? [];
        const columns: DayColumn[] = [];
        for (let i = 0; i < 7; i++) {
          const date = new Date(this.weekStart);
          date.setDate(date.getDate() + i);
          columns.push({
            date,
            label: date.toLocaleDateString('en', { weekday: 'long' }),
            dayShort: date.toLocaleDateString('en', { weekday: 'short' }),
            classes: this.eventsForDate(classes, date).sort((a, b) => a.occurrenceStart.getTime() - b.occurrenceStart.getTime()),
          });
        }
        this.days.set(columns);
        this.loading.set(false);
      },
      error: () => {
        this.buildEmptyWeek();
        this.loading.set(false);
      },
    });
  }

  private buildEmptyWeek(): void {
    const columns: DayColumn[] = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(this.weekStart);
      date.setDate(date.getDate() + i);
      columns.push({ date, label: date.toLocaleDateString('en', { weekday: 'long' }), dayShort: date.toLocaleDateString('en', { weekday: 'short' }), classes: [] });
    }
    this.days.set(columns);
  }

  prevWeek(): void { this.weekStart.setDate(this.weekStart.getDate() - 7); this.loadWeek(); }
  nextWeek(): void { this.weekStart.setDate(this.weekStart.getDate() + 7); this.loadWeek(); }
  goToToday(): void { this.weekStart = this.getMonday(new Date()); this.loadWeek(); }
  isToday(date: Date): boolean { return date.toDateString() === new Date().toDateString(); }

  private eventsForDate(classes: GymClass[], date: Date): ScheduleEvent[] {
    return classes.flatMap(cls =>
      (cls.schedule ?? [])
        .filter(slot => slot.dayOfWeek === date.getDay())
        .map(slot => ({
          ...cls,
          occurrenceStart: this.combineDateAndTime(date, slot.startTime),
          occurrenceEnd: this.combineDateAndTime(date, slot.endTime),
        }))
    );
  }

  private combineDateAndTime(date: Date, time: string): Date {
    const [hours, minutes] = time.split(':').map(Number);
    const result = new Date(date);
    result.setHours(hours || 0, minutes || 0, 0, 0);
    return result;
  }

  trainerName(trainer: GymClass['trainerId']): string {
    if (!trainer || typeof trainer === 'string') return 'Trainer TBD';
    return trainer.fullName ?? ([trainer.firstName, trainer.lastName].filter(Boolean).join(' ') || 'Trainer TBD');
  }

  getEventColor(cls: GymClass): string {
    const colors = ['#EEF1F8', '#F0FDF4', '#FEF3C7', '#FDF2F8', '#E0F2FE'];
    const idx = cls.name.charCodeAt(0) % colors.length;
    return colors[idx];
  }
}
