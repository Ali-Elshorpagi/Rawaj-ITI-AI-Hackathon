import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ApiResponse, PaginatedResponse, Attendance, QueryParams } from '../models/interfaces';
import { AttendanceMethod } from '../models/enums';

@Injectable({ providedIn: 'root' })
export class AttendanceService extends ApiService {
  checkIn(memberId: string, method: AttendanceMethod = AttendanceMethod.MANUAL, classId?: string): Observable<ApiResponse<Attendance>> {
    return this.post<ApiResponse<Attendance>>('/attendance/checkin', { memberId, method, classId });
  }

  checkInQR(qrData: string): Observable<ApiResponse<Attendance>> {
    return this.post<ApiResponse<Attendance>>('/attendance/check-in/qr', { qrData });
  }

  checkOut(id: string): Observable<ApiResponse<Attendance>> {
    return this.patch<ApiResponse<Attendance>>(`/attendance/${id}/check-out`, {});
  }

  staffCheckOut(id: string): Observable<ApiResponse<Attendance>> {
    return this.patch<ApiResponse<Attendance>>(`/attendance/${id}/checkout`, {});
  }

  getTodayReport(): Observable<ApiResponse<{ date: Date; total: number; records: Attendance[] }>> {
    return this.get<ApiResponse<any>>('/attendance/today');
  }

  getDailyReport(date?: string): Observable<ApiResponse<any>> {
    return this.get<ApiResponse<any>>('/attendance/daily', { date });
  }

  getMonthlyStats(year?: number, month?: number): Observable<ApiResponse<any>> {
    return this.get<ApiResponse<any>>('/attendance/monthly', { year, month });
  }

  getMemberHistory(memberId: string, params?: QueryParams): Observable<PaginatedResponse<Attendance>> {
    return this.get<PaginatedResponse<Attendance>>(`/attendance/member/${memberId}`, params);
  }

  selfCheckIn(): Observable<ApiResponse<Attendance>> {
    return this.post<ApiResponse<Attendance>>('/attendance/self-checkin', {});
  }

  selfCheckOut(): Observable<ApiResponse<Attendance>> {
    return this.post<ApiResponse<Attendance>>('/attendance/self-checkout', {});
  }

  getTodayStatus(): Observable<ApiResponse<Attendance | null>> {
    return this.get<ApiResponse<Attendance | null>>('/attendance/today-status');
  }
}
