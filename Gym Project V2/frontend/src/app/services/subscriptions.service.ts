import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ApiResponse, SubscriptionPlan } from '../models/interfaces';

@Injectable({ providedIn: 'root' })
export class SubscriptionsService extends ApiService {
  getPlans(): Observable<ApiResponse<SubscriptionPlan[]>> {
    return this.get<ApiResponse<SubscriptionPlan[]>>('/plans');
  }

  getAllPlans(): Observable<ApiResponse<SubscriptionPlan[]>> {
    return this.get<ApiResponse<SubscriptionPlan[]>>('/plans');
  }

  getPlanById(id: string): Observable<ApiResponse<SubscriptionPlan>> {
    return this.get<ApiResponse<SubscriptionPlan>>(`/plans/${id}`);
  }

  createPlan(data: Partial<SubscriptionPlan>): Observable<ApiResponse<SubscriptionPlan>> {
    return this.post<ApiResponse<SubscriptionPlan>>('/plans', data);
  }

  updatePlan(id: string, data: Partial<SubscriptionPlan>): Observable<ApiResponse<SubscriptionPlan>> {
    return this.put<ApiResponse<SubscriptionPlan>>(`/plans/${id}`, data);
  }

  deletePlan(id: string): Observable<void> {
    return this.delete(`/plans/${id}`);
  }

  // Assign a plan to a member — creates a new subscription
  assignPlan(memberId: string, planId: string, method: string = 'cash'): Observable<ApiResponse<any>> {
    return this.post<ApiResponse<any>>('/subscriptions', { memberId, planId, method });
  }

  // Renew by looking up the member's active subscription on the backend
  renewPlan(memberId: string, method: string = 'cash'): Observable<ApiResponse<any>> {
    return this.post<ApiResponse<any>>('/subscriptions/renew-by-member', { memberId, method });
  }

  // Renew a known subscription by ID
  renewById(subscriptionId: string, method: string = 'cash'): Observable<ApiResponse<any>> {
    return this.put<ApiResponse<any>>(`/subscriptions/${subscriptionId}/renew`, { method });
  }
}
