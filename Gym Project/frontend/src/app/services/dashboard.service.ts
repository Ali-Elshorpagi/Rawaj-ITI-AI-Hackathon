import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ApiResponse } from '../models/interfaces';

@Injectable({ providedIn: 'root' })
export class DashboardService extends ApiService {
  getOwnerDashboard(): Observable<ApiResponse<any>> {
    return this.get<ApiResponse<any>>('/dashboard/owner');
  }

  getManagerDashboard(): Observable<ApiResponse<any>> {
    return this.get<ApiResponse<any>>('/dashboard/manager');
  }

  getTrainerDashboard(): Observable<ApiResponse<any>> {
    return this.get<ApiResponse<any>>('/dashboard/trainer');
  }

  getMemberDashboard(): Observable<ApiResponse<any>> {
    return this.get<ApiResponse<any>>('/dashboard/member');
  }
}
