import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { TranslateModule } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { MembersService } from '../../../services/members.service';

@Component({
  selector: 'gd-member-form',
  standalone: true,
  imports: [
    ReactiveFormsModule, RouterLink, CommonModule,
    MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule,
    MatSelectModule, MatDatepickerModule, MatNativeDateModule, TranslateModule,
  ],
  template: `
    <div class="page">
      <div class="gd-page-header">
        <div>
          <h1 class="gd-page-header__title">{{ isEdit() ? 'Edit Member' : 'members.addMember' | translate }}</h1>
          <p class="gd-page-header__subtitle">{{ isEdit() ? 'Update member information' : 'Register a new gym member' }}</p>
        </div>
        <a mat-stroked-button routerLink="/members">
          <mat-icon>arrow_back</mat-icon> Back
        </a>
      </div>

      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <div class="form-grid">
          <!-- Personal Information -->
          <div class="gd-card">
            <div class="gd-card__header">
              <div class="gd-card__title">Personal Information</div>
            </div>
            <div class="form-row">
              <mat-form-field appearance="outline">
                <mat-label>{{ 'auth.firstName' | translate }}</mat-label>
                <input matInput formControlName="firstName">
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>{{ 'auth.lastName' | translate }}</mat-label>
                <input matInput formControlName="lastName">
              </mat-form-field>
            </div>
            <mat-form-field appearance="outline">
              <mat-label>{{ 'auth.email' | translate }}</mat-label>
              <input matInput type="email" formControlName="email">
              <mat-icon matPrefix>email</mat-icon>
            </mat-form-field>
            <div class="form-row">
              <mat-form-field appearance="outline">
                <mat-label>{{ 'auth.phone' | translate }}</mat-label>
                <input matInput type="tel" formControlName="phone">
                <mat-icon matPrefix>phone</mat-icon>
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>{{ 'members.gender' | translate }}</mat-label>
                <mat-select formControlName="gender">
                  <mat-option value="male">{{ 'members.male' | translate }}</mat-option>
                  <mat-option value="female">{{ 'members.female' | translate }}</mat-option>
                  <mat-option value="other">{{ 'members.other' | translate }}</mat-option>
                </mat-select>
              </mat-form-field>
            </div>
            <mat-form-field appearance="outline">
              <mat-label>Birth Date</mat-label>
              <input matInput [matDatepicker]="picker" formControlName="birthDate">
              <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
              <mat-datepicker #picker></mat-datepicker>
            </mat-form-field>
          </div>

          <!-- Contact & Emergency -->
          <div class="gd-card">
            <div class="gd-card__header">
              <div class="gd-card__title">Address & Emergency Contact</div>
            </div>
            <mat-form-field appearance="outline">
              <mat-label>City</mat-label>
              <input matInput formControlName="city">
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Country</mat-label>
              <input matInput formControlName="country">
            </mat-form-field>

            <div class="section-divider">Emergency Contact</div>
            <mat-form-field appearance="outline">
              <mat-label>Contact Name</mat-label>
              <input matInput formControlName="emergencyName">
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Contact Phone</mat-label>
              <input matInput formControlName="emergencyPhone">
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Relationship</mat-label>
              <mat-select formControlName="emergencyRelationship">
                <mat-option value="spouse">Spouse</mat-option>
                <mat-option value="parent">Parent</mat-option>
                <mat-option value="sibling">Sibling</mat-option>
                <mat-option value="friend">Friend</mat-option>
                <mat-option value="other">Other</mat-option>
              </mat-select>
            </mat-form-field>
          </div>

          <!-- Photo & Notes -->
          <div class="gd-card">
            <div class="gd-card__header">
              <div class="gd-card__title">Photo & Notes</div>
            </div>

            <div class="photo-upload" (click)="fileInput.click()">
              @if (photoPreview()) {
                <img [src]="photoPreview()" class="photo-preview" alt="Member photo">
              } @else {
                <mat-icon>add_a_photo</mat-icon>
                <p>Click to upload photo</p>
              }
            </div>
            <input #fileInput type="file" accept="image/*" (change)="onPhotoSelected($event)" style="display:none">

            <mat-form-field appearance="outline" style="margin-top: 16px">
              <mat-label>{{ 'members.notes' | translate }}</mat-label>
              <textarea matInput formControlName="notes" rows="4"></textarea>
            </mat-form-field>
          </div>
        </div>

        <div class="form-actions">
          <a mat-stroked-button routerLink="/members">Cancel</a>
          <button mat-flat-button color="primary" type="submit" [disabled]="loading()">
            @if (loading()) { Saving... }
            @else { {{ isEdit() ? 'Update Member' : 'Create Member' }} }
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .page { max-width: 1000px; }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 24px; @media (max-width: 768px) { grid-template-columns: 1fr; } }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    mat-form-field { width: 100%; }
    .section-divider { font-size: 0.8125rem; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; margin: 16px 0 8px; }
    .photo-upload { border: 2px dashed var(--surface-border); border-radius: var(--radius-lg); padding: 32px; text-align: center; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 8px; transition: border-color var(--transition-fast); &:hover { border-color: var(--color-primary-400); } mat-icon { font-size: 40px; width: 40px; height: 40px; color: var(--text-muted); } p { color: var(--text-muted); font-size: 0.875rem; } }
    .photo-preview { width: 120px; height: 120px; border-radius: 50%; object-fit: cover; }
    .form-actions { display: flex; justify-content: flex-end; gap: 12px; padding-top: 8px; }
  `]
})
export class MemberFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly membersService = inject(MembersService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly toastr = inject(ToastrService);

  readonly isEdit = signal(false);
  readonly loading = signal(false);
  readonly photoPreview = signal<string | null>(null);
  private selectedFile: File | null = null;
  private memberId = '';

  readonly form = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
    gender: [''],
    birthDate: [null],
    city: [''],
    country: [''],
    emergencyName: [''],
    emergencyPhone: [''],
    emergencyRelationship: [''],
    notes: [''],
  });

  ngOnInit(): void {
    this.memberId = this.route.snapshot.paramMap.get('id') ?? '';
    if (this.memberId) {
      this.isEdit.set(true);
      this.membersService.getById(this.memberId).subscribe({
        next: (res) => {
          const m = res.data;
          this.form.patchValue({
            firstName: m.firstName,
            lastName: m.lastName,
            email: m.email,
            phone: m.phone ?? '',
            gender: m.gender ?? '',
            birthDate: m.birthDate ? new Date(m.birthDate) as any : null,
            city: m.address?.city ?? '',
            country: m.address?.country ?? '',
            emergencyName: m.emergencyContact?.name ?? '',
            emergencyPhone: m.emergencyContact?.phone ?? '',
            emergencyRelationship: m.emergencyContact?.relationship ?? '',
            notes: m.notes ?? '',
          });
          if (m.profilePhoto) this.photoPreview.set(m.profilePhoto);
        },
      });
    }
  }

  onPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.[0]) {
      this.selectedFile = input.files[0];
      const reader = new FileReader();
      reader.onload = (e) => this.photoPreview.set(e.target?.result as string);
      reader.readAsDataURL(this.selectedFile);
    }
  }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);

    const v = this.form.value;
    const formData = new FormData();
    formData.append('firstName', v.firstName!);
    formData.append('lastName', v.lastName!);
    formData.append('email', v.email!);
    if (v.phone) formData.append('phone', v.phone);
    if (v.gender) formData.append('gender', v.gender);
    if (v.birthDate) formData.append('birthDate', new Date(v.birthDate as any).toISOString());
    if (v.notes) formData.append('notes', v.notes);
    if (v.city || v.country) {
      formData.append('address', JSON.stringify({ city: v.city, country: v.country }));
    }
    if (v.emergencyName) {
      formData.append('emergencyContact', JSON.stringify({
        name: v.emergencyName,
        phone: v.emergencyPhone,
        relationship: v.emergencyRelationship,
      }));
    }
    if (this.selectedFile) formData.append('profilePhoto', this.selectedFile);

    const obs = this.isEdit()
      ? this.membersService.update(this.memberId, formData)
      : this.membersService.create(formData);

    obs.subscribe({
      next: () => {
        this.toastr.success(this.isEdit() ? 'Member updated' : 'Member created', 'Success');
        this.router.navigate(['/members']);
      },
      error: (err) => {
        this.loading.set(false);
        this.toastr.error(err.error?.message ?? 'Save failed', 'Error');
      },
    });
  }
}
