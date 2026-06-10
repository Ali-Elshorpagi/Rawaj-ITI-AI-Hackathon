# Spec: Authentication System

**Feature:** Authentication
**Parent Feature:** 001-gymdesk
**Version:** 0.1.0
**Created:** 2026-06-09
**Status:** Draft

---

## Overview

This spec defines the authentication and session management system for GymDesk. It covers user login, JWT access and refresh tokens, logout, password reset/change, session revocation, role assignment basics, and audit logging for security-sensitive actions.

Goals:
- Provide secure, testable authentication flows for all user roles.
- Allow short-lived access tokens and securely managed refresh tokens.
- Make authentication behavior explicit and machine-checkable.

UI/UX Style Direction (Auth Screens):
- Preferred palette: `#618764`, `#2B5748`, and black (`#000000`).
- Auth views should feel modern and fancy while remaining clear and professional.
- Prioritize strong contrast and legibility for form-heavy interfaces.

Non-goals:
- Multi-factor authentication (MFA) is out of scope for MVP.
- Social login or third-party OAuth providers are out of scope for MVP.

---

## Actors

- Guest: unauthenticated user attempting to sign up or login
- Member: authenticated user with member role
- ReceptionStaff, Trainer, Manager, Owner: authenticated staff roles
- System: background jobs and token cleanup processes

---

## Key Data

- User: { id: UUID, email, phone, name_en, name_ar, password_hash, is_active, roles[] }
- RefreshToken: { id: UUID, user_id, token_hash, issued_at, expires_at, revoked_at, replaced_by (optional), client_metadata }
- Session: { id: UUID, user_id, created_at, last_seen_at, ip, user_agent }

---

## User Scenarios

1. Successful login with email + password
   - Given valid credentials and active user, return `access_token` (JWT) and `refresh_token` (HTTP-only cookie or response body depending on client type) and create a Session.

2. Token refresh
   - Given a valid refresh token, issue a new access token and rotate refresh token (revoke old, issue new) to mitigate reuse.

3. Logout
   - Invalidate the refresh token and mark session ended.

4. Password reset (email flow)
   - Request password reset → email with single-use reset token → use token to set new password → revoke all refresh tokens for user.

5. Password change (authenticated)
   - Authenticated user changes password → verify current password → set new password → revoke all refresh tokens (or optionally keep current session depending on policy).

6. Admin role assignment
   - Manager/Owner assigns roles to users; changes are audited.

7. Suspended/Deactivated users
   - Login attempts rejected; existing sessions invalidated on suspension.

---

## Functional Requirements (testable)

FR-AUTH-001: Login endpoint
- `POST /api/v1/auth/login` accepts `{ email, password }`.
- On success (active user + correct password) returns `200` with `access_token` (JWT) and issues `refresh_token` (Set-Cookie httpOnly secure) or returns refresh token in response for non-browser clients.
- Access token claims include `sub` (user id), `roles`, `iat`, `exp`, `jti`.
- Access token lifetime: 8 hours (configurable ENV).
- Refresh token lifetime: 30 days (configurable ENV).
- Password verification uses bcrypt cost >= 12.

FR-AUTH-002: Refresh endpoint
- `POST /api/v1/auth/refresh` accepts a refresh token (cookie or body).
- Valid refresh token issues new access token and a new refresh token (rotation); old token marked revoked.
- Rejected if refresh token is expired or revoked.

FR-AUTH-003: Logout endpoint
- `POST /api/v1/auth/logout` revokes the provided refresh token and clears cookie.
- Returns `204` on success.

FR-AUTH-004: Password reset flow
- `POST /api/v1/auth/password-reset/request` with `{ email }` sends single-use reset token via email (expiry 1 hour).
- `POST /api/v1/auth/password-reset/confirm` with `{ token, new_password }` validates token and sets new password.
- On success, revoke all refresh tokens for the user.

FR-AUTH-005: Password change
- `POST /api/v1/auth/password-change` authenticated endpoint with `{ current_password, new_password }`.
- Verify current password; on success set new password and revoke refresh tokens.

FR-AUTH-006: Session listing & revocation (UI for user)
- `GET /api/v1/auth/sessions` returns active sessions for the authenticated user.
- `DELETE /api/v1/auth/sessions/:id` revokes a session and related refresh tokens.

FR-AUTH-007: Admin user role assignment
- `POST /api/v1/users/:id/roles` and `DELETE /api/v1/users/:id/roles/:roleId` endpoints restricted to Manager/Owner per RBAC.
- All role changes audited.

FR-AUTH-008: Audit logging
- Log successful and failed login attempts (user id or email, timestamp, ip, user agent, reason for failure) to audit logs.
- Log refresh token creation, rotation, revocation, and password changes.

---

## Success Criteria (measurable)

- 100% of authentication endpoints have unit tests covering success and failure paths.
- 95% of login attempts from valid credentials succeed and return tokens within 200ms (local dev target).
- Token rotation prevents reuse: presenting a rotated refresh token is rejected and logged.
- Password reset tokens expire after 1 hour; invalid tokens rejected.

---

## Key Entities and Schema Notes

- Users table: add `password_hash`, `is_active`, `last_password_change_at`.
- RefreshTokens table: store token_hash (not raw token), `issued_at`, `expires_at`, `revoked_at`, `parent_token_id` for rotation chains.
- Sessions table: track `ip` and `user_agent` for session management and audits.

---

## Security & Privacy Constraints

- Store only hashed refresh tokens (use HMAC or bcrypt/scrypt) to prevent token theft from DB.
- Use `HttpOnly`, `Secure`, `SameSite=Strict` cookies for browser refresh tokens.
- Rate-limit login/password-reset endpoints to mitigate brute-force.
- Ensure PII is not leaked in error messages.
- All password operations must use a secure password policy (min length 10, checks for common passwords) — document policy in spec.

---

## Testing Scenarios (acceptance)

- Login with valid credentials returns tokens and creates a session.
- Login with wrong password records failed attempt and returns `401`.
- Refresh with valid refresh token returns new pair; old token revoked.
- Reuse of revoked refresh token returns `401` and logs incident.
- Password reset request for unknown email returns `204` (no account enumeration).
- Password reset confirm with valid token allows password change and revokes prior sessions.

---

## Assumptions

- Email service available for password reset delivery.
- No MFA for MVP; will add later as extension.
- Clients: browser clients prefer cookie-based refresh; non-browser (mobile or scripts) may use token-in-body.

---

## Acceptance Checklist

- [ ] Endpoints implemented and documented in OpenAPI
- [ ] Unit tests cover token issuance, rotation, and revocation
- [ ] Integration tests cover full login → refresh → logout flows
- [ ] Security review performed for token lifetimes and storage
- [ ] Audit logs stored and accessible to Manager/Owner roles

---

## Constitution Alignment

- `Specification-First`: This spec is versioned and lives under `specs/001-gymdesk/`.
- `Test-First`: Tests are specified as required acceptance scenarios and checklist items.
- `Integration & Observability`: Audit logs and session tables are defined for observability.

