import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ApiResponse, PaginatedResponse, Member, QueryParams } from '../models/interfaces';
import { MembershipStatus } from '../models/enums';

@Injectable({ providedIn: 'root' })
export class MembersService extends ApiService {
  private readonly path = '/members';

  getAll(params?: QueryParams): Observable<PaginatedResponse<Member>> {
    return this.get<PaginatedResponse<Member>>(this.path, params);
  }

  getById(id: string): Observable<ApiResponse<Member>> {
    return this.get<ApiResponse<Member>>(`${this.path}/${id}`);
  }

  getByMemberId(memberId: string): Observable<ApiResponse<Member>> {
    return this.get<ApiResponse<Member>>(`${this.path}/qr/${memberId}`);
  }

  create(formData: FormData): Observable<ApiResponse<Member>> {
    return this.postFormData<ApiResponse<Member>>(this.path, formData);
  }

  update(id: string, formData: FormData): Observable<ApiResponse<Member>> {
    return this.patchFormData<ApiResponse<Member>>(`${this.path}/${id}`, formData);
  }

  updateStatus(id: string, status: MembershipStatus): Observable<ApiResponse<Member>> {
    return this.patch<ApiResponse<Member>>(`${this.path}/${id}/status`, { status });
  }

  deleteMember(id: string): Observable<void> {
    return this.delete(`${this.path}/${id}`);
  }

  getStats(): Observable<ApiResponse<Record<string, number>>> {
    return this.get<ApiResponse<Record<string, number>>>(`${this.path}/stats`);
  }
}
