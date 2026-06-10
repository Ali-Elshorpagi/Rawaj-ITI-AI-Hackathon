# Technical Plan: Authentication (ASP.NET Core + Angular)

**Feature:** Authentication
**Parent Feature:** 001-gymdesk
**Version:** 0.1.0
**Created:** 2026-06-09
**Status:** Draft

---

## Goal

Design and implement a secure, testable authentication system using ASP.NET Core (backend) and Angular (frontend). Provide JWT-based access tokens and rotating refresh tokens, session management, password reset/change flows, role-based access control (RBAC), and audit logging. Ensure safe defaults for cookies, token storage, and rate limiting.

## UI Theme Direction

- Theme colors: `#618764`, `#2B5748`, and black (`#000000`).
- Auth pages/components should look fancy and premium, with clean composition and modern interactions.
- Maintain accessibility standards while applying visual polish.

---

## Architecture Overview

- Backend: ASP.NET Core Web API (minimal controllers + services), Entity Framework Core (SQL Server), layered architecture: API -> Application -> Domain -> Persistence
- Frontend: Angular 15+; single-page application using `HttpClient`, `Interceptor`, `AuthService`, `AuthGuard` and reactive forms
- Tokens: short-lived JWT access tokens (8h default), long-lived refresh tokens (30d default) with rotation and server-side revocation
- Cookie strategy: refresh tokens issued as `HttpOnly`, `Secure`, `SameSite=Strict` cookies for browsers; non-browser clients receive refresh token in response body (documented)
- Session/Refresh storage: `RefreshTokens` table storing token hash and metadata; `Sessions` table for user sessions for UI listing/revocation
- Observability: structured logs for auth events; audit entries for login attempts, refresh, revocation, password changes

Architecture diagram (logical):

Client (Angular) <-> API Gateway / ASP.NET Core API <-> SQL Server (Users, RefreshTokens, Sessions, AuditLogs)

---

## Backend (ASP.NET Core) Implementation Details

Folder layout (suggested):

- src/
  - GymDesk.API (controllers, filters)
  - GymDesk.Application (services, interfaces, DTOs)
  - GymDesk.Domain (entities, value objects, enums)
  - GymDesk.Persistence (EF Core DbContext, migrations, repositories)
  - GymDesk.Tests (unit/integration tests for auth)

Packages to use:
- Microsoft.AspNetCore.Authentication.JwtBearer
- Microsoft.AspNetCore.Identity (optional, or custom user store)
- Microsoft.EntityFrameworkCore.SqlServer
- BCrypt.Net-Next or Argon2 library for password hashing
- FluentValidation
- Serilog (structured logging) + sinks
- MailKit / FluentEmail for password reset emails

### Configuration

Use strongly-typed settings:

- JwtSettings: Issuer, Audience, SigningKey (rotate in secret manager), AccessTokenLifetime (minutes)
- RefreshTokenSettings: LifetimeDays, RotateOnUse (true), MaxActiveRefreshTokensPerUser
- CookieSettings: Name, SecurePolicy, SameSite

Secrets stored in environment/secret manager, not in repo.

### Data Model (EF Core)

- Users (id: UUID, email, phone, password_hash, is_active, last_password_change_at, created_at, updated_at)
- RefreshTokens (id: UUID, user_id FK, token_hash, created_at, expires_at, revoked_at nullable, replaced_by_token_id nullable, ip_address, user_agent)
- Sessions (id: UUID, user_id, created_at, last_seen_at, ip, user_agent)
- AuditLogs (id: UUID, user_id nullable, action, details JSON, ip, user_agent, created_at)

Indexes: token_hash (unique), user_id+revoked_at for quick active token lookup.

Migration: create initial migration for above tables.

### Token Handling

- Access token: JWT signed with symmetric key (HMAC SHA256) or asymmetric if required. Include `sub`, `roles`, `jti`, `iat`, `exp` claims. Keep token small.
- Refresh token: opaque random token (cryptographically secure, e.g., 64 bytes base64). Store only hash of the token (HMAC or bcrypt) in DB; send raw token to client once.
- Rotation: when a refresh request is received, verify token, mark as revoked (set revoked_at) and issue new refresh token linked via `replaced_by_token_id`. If a revoked token is presented, log and consider revoking the entire token chain / sessions for security.

### Endpoints

- POST /api/v1/auth/login
  - Body: { email, password }
  - On success: create Session, issue access token, issue refresh token (Set-Cookie for browser). Return 200 with user summary + access token if desired.

- POST /api/v1/auth/refresh
  - Uses cookie or body token
  - Validate refresh token (hash match) and expiry and not revoked
  - Rotate token: create new refresh token, mark old as revoked and set replaced_by
  - Issue new access token
  - Return 200 and set new refresh cookie

- POST /api/v1/auth/logout
  - Revoke current refresh token; mark session ended
  - Clear refresh cookie
  - Return 204

- POST /api/v1/auth/password-reset/request
  - Body: { email }
  - Send reset email with JWT or single-use opaque token stored in DB with expiry 1 hour
  - Return 204 (no account enumeration)

- POST /api/v1/auth/password-reset/confirm
  - Body: { token, new_password }
  - Validate token, set password_hash, revoke all refresh tokens for user
  - Return 200

- POST /api/v1/auth/password-change
  - Authenticated. Body: { current_password, new_password }
  - Verify current password, update password_hash, revoke refresh tokens if policy requires
  - Return 200

- GET /api/v1/auth/sessions
  - Authenticated. List active sessions for current user

- DELETE /api/v1/auth/sessions/:id
  - Revoke session and related refresh tokens

- POST /api/v1/users/:id/roles (and DELETE) — RBAC protected

### Middleware & Security

- Authentication: JwtBearer configured with validation for issuer, audience, signing key
- Authorization: policies for roles (Owner, Manager, ReceptionStaff, Trainer, Member)
- Rate limiting: use ASP.NET Core Rate Limiting middleware for login and password-reset endpoints
- CSP and security headers via middleware
- CSRF: for stateful cookie flows, ensure SameSite and anti-CSRF for unsafe methods if necessary; prefer `SameSite=Strict` and rely on cookie being HttpOnly for refresh token; access token used for API requests via `Authorization: Bearer` header.

### Audit & Observability

- Create AuditLog entries for:
  - Login success/failure (include ip, user agent, reason)
  - Refresh token rotation & revocation
  - Password reset requests and confirmations
  - Password changes and role assignments
- Add Serilog events and metrics for auth failures and token misuse.

### Testing (backend)

- Unit tests for TokenService (generate/validate), AuthService (login, password verification), Refresh flow (rotation, revoked detection)
- Integration tests for login → refresh → logout flows using test host and in-memory DB or test SQL Server
- Security tests to assert tokens can't be replayed

---

## Frontend (Angular) Implementation Details

Folder layout suggestions:

- src/app/auth/
  - auth.service.ts
  - auth.interceptor.ts
  - auth.guard.ts
  - login.component.ts
  - logout.component.ts
  - sessions.component.ts
  - password-reset-request.component.ts
  - password-reset-confirm.component.ts
  - change-password.component.ts

### Token storage strategy

- Access token: stored in memory (AuthService) to avoid XSS stealing; optionally in `sessionStorage` if persistence across tabs required, but prefer in-memory.
- Refresh token (browser): rely on `HttpOnly` cookie set by backend. For non-browser clients, store refresh token securely (e.g., mobile secure storage).

### HTTP Interceptor

- Intercept requests to API and attach `Authorization: Bearer <access_token>` if available.
- On 401 responses related to token expiry, call refresh endpoint once and retry the original request. Implement a single in-flight refresh promise to avoid multiple parallel refresh attempts.
- If refresh fails, redirect to login.

### Login flow

- User submits credentials to `/api/v1/auth/login`
- On success, backend sets refresh cookie and returns access token in body
- AuthService stores access token in memory and user profile
- Navigate to protected area

### Session management UI

- `SessionsComponent` lists active sessions (`GET /api/v1/auth/sessions`) with device info/ip/last_seen
- Allow revoking sessions (DELETE) to log out remote sessions

### Password reset & change

- Password reset request: form posts to `/auth/password-reset/request` and shows generic success message
- Password reset confirm: form uses token in query param and posts to confirm endpoint
- Password change: authenticated flow that calls `/auth/password-change`

### Guards and routing

- `AuthGuard` protects routes based on role claims in access token
- `CanActivate` validates token present and not expired; if expired, trigger refresh flow

### Testing (frontend)

- Unit tests for `AuthService`, `auth.interceptor`, `AuthGuard` using Jasmine/Karma or Vitest
- E2E tests for login, refresh, logout flows using Playwright or Cypress

---

## CI / Deployment Considerations

- Include unit and integration tests in CI pipeline
- Static analysis / secrets scanning on CI
- Migrations run in deployment pipeline (with DB backups for production)
- TLS required in production; cookie `Secure` only when TLS present
- Environment variables for JWT signing key and mailer credentials

---

## Acceptance Criteria

- Endpoints implemented and documented in OpenAPI (login, refresh, logout, password reset/change, sessions)
- Tests: unit coverage for token/service modules + integration tests for login→refresh→logout
- Security: refresh tokens stored hashed; cookies set with `HttpOnly` and `Secure`; rotation implemented
- UI: login, logout, session list, password reset/change flows functional in Angular app
- Audit logs capturing required auth events

---

## Implementation Tasks (high-level)

1. Backend scaffolding
   - Create projects and folders; add packages
   - Add EF Core migrations for Users/RefreshTokens/Sessions/AuditLogs
2. Token service & models
   - Implement TokenService, hashing for refresh tokens, rotation logic
   - Implement Session and RefreshToken repositories
3. Auth endpoints
   - Implement controllers: login, refresh, logout, password reset/change, sessions
4. Middleware & security
   - Configure JwtBearer, rate limiting, Serilog
5. Tests
   - Unit tests and integration tests using test DB
6. Frontend
   - Implement AuthService, interceptor, guards, login/logout UI, session UI, password flows
7. Docs
   - OpenAPI, README for auth, environment variable docs
8. Monitoring
   - Add logs and basic metrics (login failures per minute, refresh failures)

Estimate: 2–3 developer-weeks for a single experienced developer to implement basics + tests and front-end flows (MVP). More for hardened production features (MFA, device management, deeper security review).

---

## Rollout & Migration Notes

- Rolling deployment: ensure token signing key remains consistent across instances during rollout
- Token invalidation: revoking tokens will not affect already-issued access tokens until expiry — document procedures to force-expire access tokens (e.g., rotate signing key, but that invalidates all tokens)

---

## Next Steps I can take now

- Generate `specs/001-gymdesk/tasks.md` tasks for this plan (convert each implementation step into tasks). 
- Scaffold backend projects and initial EF migration files.

