import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { TranslateModule } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from '../../../services/api.service';
import { AuthService } from '../../../core/auth.service';
import { Trainer } from '../../../models/interfaces';
import { ModalService } from '../../../shared/modal/modal.service';

@Component({
  selector: 'gd-trainer-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatButtonModule, MatFormFieldModule, MatInputModule, TranslateModule],
  template: `
    <div class="page">
      <div class="gd-page-header">
        <div>
          <h1 class="gd-page-header__title">{{ 'trainers.title' | translate }}</h1>
          <p class="gd-page-header__subtitle">{{ trainers().length }} trainers on staff</p>
        </div>
        <button mat-flat-button color="primary" (click)="openDialog()" *ngIf="auth.isAdmin()">
          <i class="fa-solid fa-plus"></i> {{ 'trainers.addTrainer' | translate }}
        </button>
      </div>

      @if (loading()) {
        <div class="gd-grid gd-grid--3">
          @for (_ of [1,2,3]; track $index) {
            <div class="gd-card"><div class="gd-skeleton" style="height:180px"></div></div>
          }
        </div>
      } @else {
        <div class="trainers-grid">
          @for (trainer of trainers(); track trainer.id) {
            <div class="trainer-card gd-card">
              <div class="trainer-card__photo gd-avatar gd-avatar--lg">
                @if (trainer.profilePhoto) {
                  <img [src]="trainer.profilePhoto" [alt]="trainer.fullName">
                } @else {
                  {{ getInitials(trainer) }}
                }
              </div>
              <div class="trainer-card__info">
                <h3 class="trainer-card__name">{{ trainer.fullName }}</h3>
                <p class="trainer-card__spec">{{ $any(trainer.specialization)?.join ? $any(trainer.specialization).join(', ') : trainer.specialization }}</p>
                <span class="badge badge--{{ trainer.isActive !== false ? 'active' : 'expired' }}">
                  {{ trainer.isActive !== false ? 'Active' : 'Inactive' }}
                </span>
              </div>
              <div class="trainer-card__actions" *ngIf="auth.isAdmin()">
                <button mat-icon-button (click)="editTrainer(trainer)"><i class="fa-solid fa-pen"></i></button>
                <button mat-icon-button color="warn" (click)="deleteTrainer(trainer)"><i class="fa-solid fa-trash"></i></button>
              </div>
            </div>
          } @empty {
            <div class="gd-empty-state" style="grid-column:1/-1">
              <i class="fa-solid fa-person-running"></i>
              <h3>No trainers yet</h3>
              <p>Add your first trainer to get started.</p>
            </div>
          }
        </div>
      }
    </div>

    @if (showDialog()) {
      <div class="dialog-overlay" (click)="closeDialog()">
        <div class="dialog-panel" (click)="$event.stopPropagation()">
          <h3>{{ editingTrainer() ? 'Edit Trainer' : 'Add Trainer' }}</h3>
          <form [formGroup]="form" (ngSubmit)="save()">
            <div class="name-row">
              <mat-form-field appearance="outline"><mat-label>First Name</mat-label><input matInput formControlName="firstName"></mat-form-field>
              <mat-form-field appearance="outline"><mat-label>Last Name</mat-label><input matInput formControlName="lastName"></mat-form-field>
            </div>
            <mat-form-field appearance="outline"><mat-label>Email</mat-label><input matInput type="email" formControlName="email"></mat-form-field>
            <mat-form-field appearance="outline"><mat-label>Phone</mat-label><input matInput formControlName="phone"></mat-form-field>
            <mat-form-field appearance="outline"><mat-label>Specialization (comma-separated)</mat-label><input matInput formControlName="specialization"></mat-form-field>
            <mat-form-field appearance="outline"><mat-label>Bio</mat-label><textarea matInput formControlName="bio" rows="3"></textarea></mat-form-field>
            <div class="dialog-actions">
              <button mat-stroked-button type="button" (click)="closeDialog()">Cancel</button>
              <button mat-flat-button color="primary" type="submit" [disabled]="saving()">{{ saving() ? 'Saving...' : 'Save' }}</button>
            </div>
          </form>
        </div>
      </div>
    }
  `,
  styles: [`
    .page { max-width: 1400px; }
    .trainers-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 24px; }
    .trainer-card { display: flex; flex-direction: column; align-items: center; text-align: center; padding: 32px 24px; }
    .trainer-card__photo { margin-bottom: 16px; }
    .trainer-card__name { font-size: 1rem; font-weight: 600; margin-bottom: 4px; }
    .trainer-card__spec { font-size: 0.8125rem; color: var(--text-muted); margin-bottom: 10px; }
    .trainer-card__actions { display: flex; gap: 4px; margin-top: 12px; }
    .name-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    mat-form-field { width: 100%; }
    .dialog-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 1000; display: flex; align-items: center; justify-content: center; }
    .dialog-panel { background: var(--surface-card); border-radius: var(--radius-xl); padding: 32px; width: 520px; max-width: 90vw; h3 { margin-bottom: 20px; font-size: 1.25rem; } form { display: flex; flex-direction: column; gap: 4px; } }
    .dialog-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 12px; }
  `]
})
export class TrainerListComponent implements OnInit {
  protected readonly auth = inject(AuthService);
  private readonly api = inject(ApiService);
  private readonly toastr = inject(ToastrService);
  private readonly fb = inject(FormBuilder);
  private readonly modal = inject(ModalService);

  readonly trainers = signal<Trainer[]>([]);
  readonly loading = signal(true);
  readonly showDialog = signal(false);
  readonly editingTrainer = signal<Trainer | null>(null);
  readonly saving = signal(false);

  readonly form = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
    specialization: [''],
    bio: [''],
  });

  ngOnInit(): void { this.loadTrainers(); }

  loadTrainers(): void {
    this.loading.set(true);
    this.api.get<any>('/trainers').subscribe({
      next: (res) => { this.trainers.set(res.data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  openDialog(trainer?: Trainer): void {
    this.editingTrainer.set(trainer ?? null);
    if (trainer) {
      const spec = Array.isArray(trainer.specialization)
        ? (trainer.specialization as string[]).join(', ')
        : trainer.specialization ?? '';
      this.form.patchValue({ ...trainer, specialization: spec });
    } else {
      this.form.reset();
    }
    this.showDialog.set(true);
  }

  editTrainer(t: Trainer): void { this.openDialog(t); }
  closeDialog(): void { this.showDialog.set(false); }

  save(): void {
    if (this.form.invalid) return;
    this.saving.set(true);
    const v = this.form.value;
    const data = { ...v, specialization: v.specialization?.split(',').map((s: string) => s.trim()).filter(Boolean) };
    const obs = this.editingTrainer()
      ? this.api.patch<any>(`/trainers/${this.editingTrainer()!.id}`, data)
      : this.api.post<any>('/trainers', data);

    obs.subscribe({
      next: () => {
        this.toastr.success(this.editingTrainer() ? 'Trainer updated' : 'Trainer created', 'Success');
        this.closeDialog();
        this.loadTrainers();
        this.saving.set(false);
      },
      error: (err) => {
        this.saving.set(false);
        this.toastr.error(err.error?.message ?? 'Save failed', 'Error');
      },
    });
  }

  async deleteTrainer(t: Trainer): Promise<void> {
    const confirmed = await this.modal.confirm({
      title: 'Delete Trainer',
      message: `Are you sure you want to remove ${t.fullName} from the system? Their class assignments will also be affected.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      type: 'danger',
    });
    if (!confirmed) return;
    this.api.delete(`/trainers/${t.id}`).subscribe({
      next: () => { this.toastr.success('Trainer deleted', 'Success'); this.loadTrainers(); },
      error: (err) => this.toastr.error(err.error?.message ?? 'Delete failed', 'Error'),
    });
  }

  getInitials(t: Trainer): string {
    const first = t.firstName?.[0] ?? t.specialization?.[0] ?? '?';
    const last = t.lastName?.[0] ?? '';
    return `${first}${last}`.toUpperCase();
  }
}
