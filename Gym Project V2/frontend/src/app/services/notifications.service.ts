import { Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { ApiService } from './api.service';
import { ApiResponse, Notification } from '../models/interfaces';

@Injectable({ providedIn: 'root' })
export class NotificationsService extends ApiService {
  private readonly _unreadCount = signal<number>(0);
  readonly unreadCount = this._unreadCount.asReadonly();

  getAll(params?: { unread?: boolean; page?: number; limit?: number }): Observable<ApiResponse<Notification[]>> {
    return this.get<ApiResponse<Notification[]>>('/notifications', params as any);
  }

  getUnreadCount(): Observable<ApiResponse<{ count: number }>> {
    return this.get<ApiResponse<{ count: number }>>('/notifications/unread-count').pipe(
      tap(res => this._unreadCount.set(res.data.count))
    );
  }

  markAsRead(id: string): Observable<ApiResponse<null>> {
    return this.put<ApiResponse<null>>(`/notifications/${id}/read`, {}).pipe(
      tap(() => this._unreadCount.update(c => Math.max(0, c - 1)))
    );
  }

  markAllAsRead(): Observable<ApiResponse<null>> {
    return this.patch<ApiResponse<null>>('/notifications/read-all', {}).pipe(
      tap(() => this._unreadCount.set(0))
    );
  }

  deleteNotification(id: string): Observable<void> {
    return this.delete(`/notifications/${id}`);
  }

  setUnreadCount(count: number): void {
    this._unreadCount.set(count);
  }
}
