# Release Notes: Authentication Feature (001-gymdesk)

Release date: 2026-06-09

## Summary

Authentication delivery is complete across backend, frontend, tests/CI, and documentation.

## Implemented Scope

Backend:

- JWT bearer authentication and authorization policy `ManagerOrOwner`
- Register, login, refresh (rotation), logout endpoints
- Password reset request/confirm and authenticated password change
- Session listing and session revocation endpoints
- Role assignment/removal endpoints (policy protected)
- Rate limiting for auth-sensitive endpoints
- Structured auth logging and audit log events
- Cookie controls (`HttpOnly`, `Secure`, `SameSite`) and CSRF header enforcement for cookie-based refresh/logout

Frontend:

- Auth service methods for full token/session/password flow
- HTTP interceptor for bearer attach and refresh-on-401 behavior
- Route guard support with role-based checks
- Auth UI components for login/logout/sessions/password reset/password change

Testing and CI:

- Unit tests for token and refresh token services
- Integration flow tests for login -> refresh -> logout
- Security tests for refresh replay rejection after rotation
- CI workflow covering backend build/tests, frontend build/type checks, and security checks

## Token Lifecycle Notes

1. Register/login issues an access token and a refresh token.
2. Refresh endpoint rotates refresh token:
   - old token is revoked
   - new token is issued
3. Reusing a revoked refresh token returns unauthorized.
4. Logout revokes the active refresh token and clears cookie.
5. Password reset confirm and password change revoke all active refresh tokens for the user.

## Migration Notes

Authentication schema includes users, roles, refresh tokens, sessions, audit logs, and password reset tokens.

Current migration chain includes:

- `InitialAuthSchema`
- `AuthPhase3_PasswordResetAndSessionEndpoints`

Apply migrations with:

```bash
dotnet ef database update --project src/GymDesk.Persistence/GymDesk.Persistence.csproj --startup-project src/GymDesk.API/GymDesk.API.csproj
```

## Known Follow-Ups

- Address package vulnerability advisories for JWT dependencies (`NU1902`) by upgrading to patched versions when validated.
