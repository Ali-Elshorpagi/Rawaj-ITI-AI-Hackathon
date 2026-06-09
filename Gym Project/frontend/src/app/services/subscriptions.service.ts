import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ApiResponse, SubscriptionPlan } from '../models/interfaces';

@Injectable({ providedIn: 'root' })
export class SubscriptionsService extends ApiService {
  getPlans(): Observable<ApiResponse<SubscriptionPlan[]>> {
    return this.get<ApiResponse<SubscriptionPlan[]>>('/subscriptions/plans');
  }

  getAllPlans(): Observable<ApiResponse<SubscriptionPlan[]>> {
    return this.get<ApiResponse<SubscriptionPlan[]>>('/subscriptions/plans/all');
  }

  getPlanById(id: string): Observable<ApiResponse<SubscriptionPlan>> {
    return this.get<ApiResponse<SubscriptionPlan>>(`/subscriptions/plans/${id}`);
  }

  createPlan(data: Partial<SubscriptionPlan>): Observable<ApiResponse<SubscriptionPlan>> {
    return this.post<ApiResponse<SubscriptionPlan>>('/subscriptions/plans', data);
  }

  updatePlan(id: string, data: Partial<SubscriptionPlan>): Observable<ApiResponse<SubscriptionPlan>> {
    return this.patch<ApiResponse<SubscriptionPlan>>(`/subscriptions/plans/${id}`, data);
  }

  deletePlan(id: string): Observable<void> {
    return this.delete(`/subscriptions/plans/${id}`);
  }

  assignPlan(memberId: string, planId: string, startDate?: string): Observable<ApiResponse<any>> {
    return this.post<ApiResponse<any>>('/subscriptions/assign', { memberId, planId, startDate });
  }

  renewPlan(memberId: string, planId?: string): Observable<ApiResponse<any>> {
    return this.post<ApiResponse<any>>('/subscriptions/renew', { memberId, planId });
  }
}
