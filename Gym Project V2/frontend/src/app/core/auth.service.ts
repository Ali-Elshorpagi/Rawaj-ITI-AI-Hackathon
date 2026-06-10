import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, of, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { User, ApiResponse } from '../models/interfaces';
import { UserRole } from '../models/enums';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly apiUrl = `${environment.apiUrl}/auth`;

  private readonly _currentUser = signal<User | null>(this.loadStoredUser());
  private readonly _accessToken = signal<string | null>(
    (localStorage.getItem('accessToken') ?? '').replace(/^Bearer\s+/i, '') || null
  );

  readonly currentUser = this._currentUser.asReadonly();
  readonly accessToken = this._accessToken.asReadonly();
  readonly isLoggedIn = computed(() => !!this._currentUser());
  readonly userRole = computed(() => this._currentUser()?.role ?? null);
  readonly isOwner = computed(() => this._currentUser()?.role === UserRole.OWNER);
  readonly isManager = computed(() => this._currentUser()?.role === UserRole.MANAGER);
  readonly isReception = computed(() => this._currentUser()?.role === UserRole.RECEPTION);
  readonly isTrainer = computed(() => this._currentUser()?.role === UserRole.TRAINER);
  readonly isMember = computed(() => this._currentUser()?.role === UserRole.MEMBER);
  readonly isAdmin = computed(() =>
    [UserRole.OWNER, UserRole.MANAGER].includes(this._currentUser()?.role as UserRole)
  );
  readonly isStaff = computed(() =>
    [UserRole.OWNER, UserRole.MANAGER, UserRole.RECEPTION].includes(this._currentUser()?.role as UserRole)
  );

  private loadStoredUser(): User | null {
    try {
      const stored = localStorage.getItem('currentUser');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  // Maps API user (with `name`) to the User interface (with firstName/lastName)
  private mapUserFromApi(apiUser: any): User {
    const name: string = apiUser.name ?? `${apiUser.firstName ?? ''} ${apiUser.lastName ?? ''}`.trim();
    const parts = name.split(' ');
    const firstName = parts[0] ?? '';
    const lastName = parts.slice(1).join(' ') || '';
    return {
      id: apiUser.id ?? apiUser._id,
      name,
      firstName,
      lastName,
      email: apiUser.email,
      role: apiUser.role,
      phone: apiUser.phone,
      address: apiUser.address,
      profilePhoto: apiUser.photo ?? apiUser.profilePhoto,
      isEmailVerified: apiUser.isEmailVerified ?? true,
      memberId: apiUser.memberId?.toString?.() ?? apiUser.memberId,
      createdAt: apiUser.createdAt,
    };
  }

  // POST /api/auth/login  — role defaults to 'member' if not supplied
  login(email: string, password: string, role: string = 'member'): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/login`, { email, password, role }).pipe(
      tap(res => {
        if (res.data?.token) {
          const rawToken = (res.data.token as string).replace(/^Bearer\s+/i, '');
          const user = this.mapUserFromApi(res.data.user);
          this._accessToken.set(rawToken);
          this._currentUser.set(user);
          localStorage.setItem('accessToken', rawToken);
          localStorage.setItem('currentUser', JSON.stringify(user));
        }
      })
    );
  }

  // No logout endpoint — clear session locally only
  logout(): Observable<null> {
    this.clearSession();
    return of(null);
  }

  // POST /api/auth/register — accepts name or firstName/lastName
  register(data: {
    name?: string;
    firstName?: string;
    lastName?: string;
    email: string;
    password: string;
    phone?: string;
    role?: string;
  }): Observable<ApiResponse<any>> {
    const name = data.name ?? `${data.firstName ?? ''} ${data.lastName ?? ''}`.trim();
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/register`, {
      name,
      email: data.email,
      password: data.password,
      phone: data.phone,
      role: data.role ?? 'member',
    });
  }

  // Alias kept for register component
  sendRegisterOtp(data: {
    name?: string;
    firstName?: string;
    lastName?: string;
    email: string;
    password: string;
    phone?: string;
    role?: string;
  }): Observable<ApiResponse<any>> {
    return this.register(data);
  }

  // POST /api/auth/verify — verifies email with OTP
  verifyOtp(email: string, otp: string): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/verify`, { email, otp }).pipe(
      tap(res => {
        if (res.data?.token) {
          const rawToken = (res.data.token as string).replace(/^Bearer\s+/i, '');
          const user = this.mapUserFromApi(res.data.user);
          this._accessToken.set(rawToken);
          this._currentUser.set(user);
          localStorage.setItem('accessToken', rawToken);
          localStorage.setItem('currentUser', JSON.stringify(user));
        }
      })
    );
  }

  // Alias kept for register component — accepts code or otp field
  verifyRegisterOtp(payload: {
    email: string;
    otp?: string;
    code?: string;
    [key: string]: any;
  }): Observable<ApiResponse<any>> {
    return this.verifyOtp(payload.email, payload.otp ?? payload.code ?? '');
  }

  // Alias for verify-email component (token-based link flow not supported — treat as no-op)
  verifyEmail(token: string): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/verify`, { token });
  }

  // No real refresh token endpoint — clear session on expiry
  refreshToken(): Observable<ApiResponse<any>> {
    this.clearSession();
    return throwError(() => new Error('No refresh token endpoint'));
  }

  // POST /api/auth/resend-otp
  resendOtp(email: string): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/resend-otp`, { email });
  }

  // POST /api/auth/request-password-reset
  requestPasswordReset(email: string): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/request-password-reset`, { email });
  }

  // Alias for forgot-password component
  forgotPassword(email: string): Observable<ApiResponse<any>> {
    return this.requestPasswordReset(email);
  }

  // Alias for forgot-password component
  sendResetOtp(email: string): Observable<ApiResponse<any>> {
    return this.requestPasswordReset(email);
  }

  // POST /api/auth/verify-reset-password-otp — returns { token }
  verifyResetOtp(email: string, otp: string): Observable<ApiResponse<{ token: string }>> {
    return this.http.post<ApiResponse<{ token: string }>>(`${this.apiUrl}/verify-reset-password-otp`, { email, otp });
  }

  // POST /api/auth/reset-password — uses token from verifyResetOtp
  resetPassword(token: string, password: string): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/reset-password`, { password, token });
  }

  // Alias for forgot-password component
  resetPasswordWithOtp(token: string, newPassword: string): Observable<ApiResponse<any>> {
    return this.resetPassword(token, newPassword);
  }

  // POST /api/auth/update-password — requires auth token
  changePassword(currentPassword: string, newPassword: string): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/update-password`, {
      data: { password: currentPassword, newPassword },
    });
  }

  // GET /api/auth/me
  getMe(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/me`).pipe(
      tap(res => {
        if (res.data) {
          const user = this.mapUserFromApi(res.data);
          this._currentUser.set(user);
          localStorage.setItem('currentUser', JSON.stringify(user));
        }
      })
    );
  }

  updateStoredUser(user: Partial<User>): void {
    const current = this._currentUser();
    if (current) {
      const updated = { ...current, ...user };
      this._currentUser.set(updated);
      localStorage.setItem('currentUser', JSON.stringify(updated));
    }
  }

  hasRole(...roles: UserRole[]): boolean {
    const role = this._currentUser()?.role;
    return !!role && roles.includes(role);
  }

  clearSession(): void {
    this._accessToken.set(null);
    this._currentUser.set(null);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('currentUser');
    this.router.navigate(['/auth/login']);
  }
}
