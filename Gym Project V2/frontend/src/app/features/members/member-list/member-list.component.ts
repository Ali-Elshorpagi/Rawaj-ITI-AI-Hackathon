import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { TranslateModule } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { debounceTime, Subject } from 'rxjs';

import { MembersService } from '../../../services/members.service';
import { AuthService } from '../../../core/auth.service';
import { Member, PaginationMeta } from '../../../models/interfaces';
import { MembershipStatus } from '../../../models/enums';
import { ModalService } from '../../../shared/modal/modal.service';

@Component({
  selector: 'gd-member-list',
  standalone: true,
  imports: [
    CommonModule, RouterLink, FormsModule,
    MatButtonModule, MatInputModule, MatFormFieldModule,
    MatSelectModule, MatMenuModule, MatTooltipModule, MatChipsModule,
    MatPaginatorModule, TranslateModule,
  ],
  template: `
    <div class="page">
      <div class="gd-page-header">
        <div>
          <h1 class="gd-page-header__title">{{ 'members.title' | translate }}</h1>
          <p class="gd-page-header__subtitle">{{ meta()?.total ?? 0 }} total members</p>
        </div>
        <div class="gd-page-header__actions" *ngIf="auth.isStaff()">
          <button mat-stroked-button (click)="exportMembers()">
            <i class="fa-solid fa-download"></i> Export
          </button>
          <button mat-flat-button color="primary" routerLink="/members/new">
            <i class="fa-solid fa-user-plus"></i> {{ 'members.addMember' | translate }}
          </button>
        </div>
      </div>

      <!-- Filters -->
      <div class="gd-table-container">
        <div class="gd-table-toolbar">
          <mat-form-field appearance="outline" class="search-field">
            <i class="fa-solid fa-magnifying-glass" matPrefix></i>
            <input matInput placeholder="{{ 'common.search' | translate }} members..."
                   [(ngModel)]="searchQuery" (ngModelChange)="onSearch($event)">
          </mat-form-field>
          <div class="filter-group">
            <mat-form-field appearance="outline" class="filter-field">
              <mat-label>Status</mat-label>
              <mat-select [(ngModel)]="statusFilter" (ngModelChange)="loadMembers()">
                <mat-option value="">All</mat-option>
                <mat-option *ngFor="let s of statusOptions" [value]="s.value">{{ s.label }}</mat-option>
              </mat-select>
            </mat-form-field>
          </div>
        </div>

        @if (loading()) {
          <div class="loading-rows">
            @for (_ of [1,2,3,4,5]; track $index) {
              <div class="gd-skeleton" style="height: 56px; margin: 1px 0;"></div>
            }
          </div>
        } @else if (members().length === 0) {
          <div class="gd-empty-state">
            <i class="fa-solid fa-user-slash"></i>
            <h3>No members found</h3>
            <p>{{ searchQuery ? 'Try adjusting your search.' : 'Add your first member to get started.' }}</p>
            <button mat-flat-button color="primary" routerLink="/members/new" *ngIf="auth.isStaff()">
              Add Member
            </button>
          </div>
        } @else {
          <div class="table-scroll">
            <table class="gd-table">
              <thead>
                <tr>
                  <th>Member</th>
                  <th>ID</th>
                  <th>Subscription</th>
                  <th>Status</th>
                  <th>Expiry</th>
                  <th>Attendance</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                @for (member of members(); track member.id) {
                  <tr>
                    <td>
                      <div class="member-cell">
                        <div class="gd-avatar gd-avatar--sm">
                          @if (member.profilePhoto) {
                            <img [src]="member.profilePhoto" [alt]="member.fullName">
                          } @else {
                            {{ getInitials(member) }}
                          }
                        </div>
                        <div>
                          <div class="member-name">{{ member.fullName }}</div>
                          <div class="member-email">{{ member.email }}</div>
                        </div>
                      </div>
                    </td>
                    <td><code style="font-size:.7rem;word-break:break-all">{{ member.id }}</code></td>
                    <td>{{ member.subscriptionPlan?.name ?? '—' }}</td>
                    <td>
                      <span class="badge" [ngClass]="'badge--' + member.membershipStatus">
                        {{ 'members.status.' + member.membershipStatus | translate }}
                      </span>
                    </td>
                    <td>
                      @if (member.subscriptionEndDate) {
                        <span [class.text-error]="isExpired(member.subscriptionEndDate)">
                          {{ member.subscriptionEndDate | date:'mediumDate' }}
                        </span>
                      } @else { —}
                    </td>
                    <td>{{ member.totalAttendance }}</td>
                    <td>
                      <div class="action-btns">
                        <a mat-icon-button [routerLink]="'/members/' + member.id" matTooltip="View">
                          <i class="fa-solid fa-eye"></i>
                        </a>
                        <a mat-icon-button [routerLink]="'/members/' + member.id + '/edit'" matTooltip="Edit" *ngIf="auth.isStaff()">
                          <i class="fa-solid fa-pen"></i>
                        </a>
                        <button mat-icon-button [matMenuTriggerFor]="memberMenu" matTooltip="More">
                          <i class="fa-solid fa-ellipsis-vertical"></i>
                        </button>
                        <mat-menu #memberMenu="matMenu">
                          <button mat-menu-item (click)="openQR(member)">
                            <i class="fa-solid fa-qrcode"></i> View QR Code
                          </button>
                          <button mat-menu-item *ngIf="auth.isAdmin()" (click)="deleteMember(member)">
                            <i class="fa-solid fa-trash" style="color: var(--color-error)"></i>
                            <span style="color: var(--color-error)">Delete</span>
                          </button>
                        </mat-menu>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <mat-paginator
            [length]="meta()?.total ?? 0"
            [pageSize]="pageSize"
            [pageSizeOptions]="[10, 25, 50]"
            (page)="onPageChange($event)"
            showFirstLastButtons>
          </mat-paginator>
        }
      </div>
    </div>
  `,
  styles: [`
    .page { max-width: 1400px; }
    .search-field { width: 320px; }
    .filter-field { width: 160px; }
    .filter-group { display: flex; gap: 12px; align-items: center; }
    .table-scroll { overflow-x: auto; }
    .loading-rows { padding: 8px; }
    .member-cell { display: flex; align-items: center; gap: 10px; }
    .member-name { font-weight: 500; color: var(--text-primary); font-size: 0.875rem; }
    .member-email { font-size: 0.75rem; color: var(--text-muted); }
    code { font-family: monospace; font-size: 0.75rem; background: var(--surface-bg); padding: 2px 6px; border-radius: 4px; }
    .action-btns { display: flex; align-items: center; }
    .text-error { color: var(--color-error) !important; }
  `]
})
export class MemberListComponent implements OnInit {
  protected readonly auth = inject(AuthService);
  private readonly membersService = inject(MembersService);
  private readonly toastr = inject(ToastrService);
  private readonly modal = inject(ModalService);

  readonly members = signal<Member[]>([]);
  readonly meta = signal<PaginationMeta | null>(null);
  readonly loading = signal(true);

  searchQuery = '';
  statusFilter = '';
  page = 1;
  pageSize = 10;

  private searchSubject = new Subject<string>();

  readonly statusOptions = [
    { value: MembershipStatus.ACTIVE, label: 'Active' },
    { value: MembershipStatus.EXPIRED, label: 'Expired' },
    { value: MembershipStatus.FROZEN, label: 'Frozen' },
    { value: MembershipStatus.PENDING, label: 'Pending' },
  ];

  ngOnInit(): void {
    this.loadMembers();
    this.searchSubject.pipe(debounceTime(400)).subscribe(() => {
      this.page = 1;
      this.loadMembers();
    });
  }

  loadMembers(): void {
    this.loading.set(true);
    const params: Record<string, string | number> = {
      page: this.page,
      limit: this.pageSize,
    };
    if (this.searchQuery) params['search'] = this.searchQuery;
    if (this.statusFilter) params['status'] = this.statusFilter;

    this.membersService.getAll(params).subscribe({
      next: (res) => {
        this.members.set(res.data.items);
        this.meta.set(res.data.pagination);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  onSearch(value: string): void {
    this.searchSubject.next(value);
  }

  onPageChange(event: PageEvent): void {
    this.page = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.loadMembers();
  }

  getInitials(member: Member): string {
    const first = member.firstName?.[0] ?? member.fullName?.[0] ?? '?';
    const last = member.lastName?.[0] ?? '';
    return `${first}${last}`.toUpperCase();
  }

  isExpired(date: string): boolean {
    return new Date(date) < new Date();
  }

  async openQR(member: Member): Promise<void> {
    if (member.qrCode) {
      const QRCode = (await import('qrcode')).default;
      const qrImage = await QRCode.toDataURL(member.qrCode, { width: 260, margin: 1 });
      const win = window.open('', '_blank');
      win?.document.write(`<img src="${qrImage}" style="max-width:300px"><p>${member.fullName}</p><code>${member.qrCode}</code>`);
    }
  }

  async deleteMember(member: Member): Promise<void> {
    const confirmed = await this.modal.confirm({
      title: 'Delete Member',
      message: `Are you sure you want to delete ${member.fullName}? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      type: 'danger',
    });
    if (!confirmed) return;
    this.membersService.deleteMember(member.id).subscribe({
      next: () => {
        this.toastr.success('Member deleted', 'Success');
        this.loadMembers();
      },
      error: (err) => this.toastr.error(err.error?.message ?? 'Delete failed', 'Error'),
    });
  }

  exportMembers(): void {
    this.toastr.info('Export feature: available via Reports module (Excel/PDF).', 'Export');
  }
}
