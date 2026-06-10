# Tasks: 001-gymdesk — Authentication

**Feature:** Authentication (part of 001-gymdesk)
**Input:** `specs/001-gymdesk/authentication-spec.md`, `specs/001-gymdesk/auth-plan-dotnet-angular.md`

## Phase 1: Backend Scaffolding

* [x] T-AUTH-001 Initialize backend projects: `GymDesk.API`, `GymDesk.Application`, `GymDesk.Domain`, `GymDesk.Persistence`
* [x] T-AUTH-002 Add NuGet packages: JwtBearer, EF Core (SQL Server), BCrypt/Argon2, FluentValidation, Serilog, MailKit
* [x] T-AUTH-003 Create EF Core migrations and initial schema (Users, RefreshTokens, Sessions, AuditLogs)
* [x] T-AUTH-004 Add configuration: `JwtSettings`, `RefreshTokenSettings`, `CookieSettings` and environment variable wiring

## Phase 2: Token & Session Services

* [x] T-AUTH-005 Implement `ITokenService` and `TokenService` (create/validate JWT access tokens)
* [x] T-AUTH-006 Implement `IRefreshTokenRepository` and refresh token hashing/storage
* [x] T-AUTH-007 Implement `ISessionService` for session creation/listing/revocation
* [x] T-AUTH-008 Unit tests: token generation/validation, refresh token hashing and verification

## Phase 3: Auth Endpoints

* [x] T-AUTH-009 Implement `POST /api/v1/auth/login` (verify password, create session, issue tokens)
* [x] T-AUTH-010 Implement `POST /api/v1/auth/refresh` (rotate refresh token, issue new access token)
* [x] T-AUTH-011 Implement `POST /api/v1/auth/logout` (revoke refresh token, end session)
* [x] T-AUTH-012 Implement password reset endpoints: `password-reset/request` and `password-reset/confirm`
* [x] T-AUTH-013 Implement `POST /api/v1/auth/password-change` (authenticated)
* [x] T-AUTH-014 Implement `GET/DELETE /api/v1/auth/sessions` endpoints for session management
* [x] T-AUTH-015 Implement `POST/DELETE /api/v1/users/:id/roles` endpoints (RBAC-protected)

## Phase 4: Middleware, Security & Observability

* [x] T-AUTH-016 Configure JwtBearer authentication and role-based authorization policies
* [x] T-AUTH-017 Implement rate limiting for login/password-reset endpoints
* [x] T-AUTH-018 Integrate Serilog with structured events for auth actions
* [x] T-AUTH-019 Add audit logging for login attempts, token rotation, revocation, password operations
* [x] T-AUTH-020 Implement cookie settings (HttpOnly, Secure, SameSite) and CSRF considerations

## Phase 5: Frontend (Angular)

* [x] T-AUTH-021 Create `AuthService` with login, refresh, logout, session listing, password flows
* [x] T-AUTH-022 Implement `auth.interceptor` to attach access token and handle automatic refresh
* [x] T-AUTH-023 Implement `AuthGuard` and role-based route protection
* [x] T-AUTH-024 Implement UI components: `Login`, `Logout`, `Sessions`, `PasswordResetRequest`, `PasswordResetConfirm`, `ChangePassword`
* [x] T-AUTH-025 Frontend unit tests for `AuthService`, `auth.interceptor`, and `AuthGuard`

## Phase 6: Tests & CI

* [x] T-AUTH-026 Integration tests: login → refresh → logout flows (test host + test SQL Server)
* [x] T-AUTH-027 Security tests: token rotation and revoked token rejection
* [x] T-AUTH-028 Add CI steps: run unit and integration tests, linting, security checks

## Phase 7: Documentation & Release

* [x] T-AUTH-029 Document OpenAPI endpoints and update API docs
* [x] T-AUTH-030 Add README: env variables, migration commands, token policies
* [x] T-AUTH-031 Create release notes: token lifecycle and migration notes


## Notes
- Assign tasks to backend/frontend engineers as required.
- Refer to `specs/001-gymdesk/authentication-spec.md` for acceptance tests to drive implementation.
- UI styling direction for all auth-facing screens/components: use `#618764`, `#2B5748`, and black (`#000000`) with a polished, fancy look and strong readability.
