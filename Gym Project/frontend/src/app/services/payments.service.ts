import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ApiResponse, PaginatedResponse, Payment, QueryParams } from '../models/interfaces';

@Injectable({ providedIn: 'root' })
export class PaymentsService extends ApiService {
  createCheckout(memberId: string, planId: string): Observable<ApiResponse<{ sessionId: string; sessionUrl: string; invoiceNumber: string }>> {
    return this.post<ApiResponse<any>>('/payments/checkout', { memberId, planId });
  }

  refund(id: string, amount?: number): Observable<ApiResponse<Payment>> {
    return this.post<ApiResponse<Payment>>(`/payments/${id}/refund`, { amount });
  }

  getAll(params?: QueryParams): Observable<PaginatedResponse<Payment>> {
    return this.get<PaginatedResponse<Payment>>('/payments', params);
  }

  getMemberPayments(memberId: string, params?: QueryParams): Observable<PaginatedResponse<Payment>> {
    return this.get<PaginatedResponse<Payment>>(`/payments/member/${memberId}`, params);
  }

  getBySessionId(sessionId: string): Observable<ApiResponse<Payment>> {
    return this.get<ApiResponse<Payment>>(`/payments/session/${sessionId}`);
  }

  getRevenueStats(year?: number): Observable<ApiResponse<any[]>> {
    return this.get<ApiResponse<any[]>>('/payments/revenue/stats', { year });
  }
}
