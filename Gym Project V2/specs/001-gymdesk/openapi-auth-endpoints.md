# OpenAPI: Authentication Endpoints (001-gymdesk)

This document maps the implemented authentication API to an OpenAPI-style contract for backend and frontend integration.

## Base URL

- Local API: `http://localhost:5164`
- Auth base path: `/api/v1/auth`

## Security Model

- Access token: JWT Bearer in `Authorization: Bearer <token>`.
- Refresh token: returned in response body and also written to cookie name from `CookieSettings:Name`.
- Cookie-based refresh/logout requires CSRF header when `CookieSettings:RequireCsrfHeader=true`.

## Endpoints

### POST /api/v1/auth/register

Registers a user account and returns access + refresh tokens.

Request body:

```json
{
  "email": "owner@example.com",
  "password": "Password123!"
}
```

Success response (`201 Created`):

```json
{
  "accessToken": "<jwt>",
  "refreshToken": "<refresh-token>"
}
```

Error response (`400 Bad Request`):

```json
{
  "error": "Email is already registered"
}
```

### POST /api/v1/auth/login

Authenticates active user credentials and returns access + refresh tokens.

Request body:

```json
{
  "email": "owner@example.com",
  "password": "Password123!"
}
```

Success response (`200 OK`):

```json
{
  "accessToken": "<jwt>",
  "refreshToken": "<refresh-token>"
}
```

Error response (`401 Unauthorized`):

```json
{
  "error": "Invalid credentials"
}
```

### POST /api/v1/auth/refresh

Rotates refresh token and issues new access + refresh token pair.

Request body (body-token flow):

```json
{
  "refreshToken": "<refresh-token>"
}
```

Request body (cookie flow):

```json
{
  "refreshToken": ""
}
```

When cookie flow is used, include header:

```http
X-CSRF-Token: <csrf-value>
```

Success response (`200 OK`):

```json
{
  "accessToken": "<new-jwt>",
  "refreshToken": "<new-refresh-token>"
}
```

Error responses:

- `400 Bad Request` when token is missing or CSRF header required.
- `401 Unauthorized` when refresh token is invalid/revoked/expired.

### POST /api/v1/auth/logout

Revokes current refresh token and clears refresh cookie.

Request body:

```json
{
  "refreshToken": "<refresh-token>"
}
```

Success response: `204 No Content`

Error response (`400 Bad Request`) when token missing or cookie flow missing CSRF header.

### POST /api/v1/auth/password-reset/request

Creates a password reset token for active users.

Request body:

```json
{
  "email": "owner@example.com"
}
```

Success response: `204 No Content`

### POST /api/v1/auth/password-reset/confirm

Confirms password reset token and updates password.

Request body:

```json
{
  "token": "<reset-token>",
  "newPassword": "NewPassword123!"
}
```

Success response (`200 OK`):

```json
{
  "message": "Password has been reset."
}
```

Error response (`400 Bad Request`):

```json
{
  "error": "Invalid or expired reset token."
}
```

### POST /api/v1/auth/password-change

Changes password for authenticated user.

Authentication: required bearer token.

Request body:

```json
{
  "currentPassword": "Password123!",
  "newPassword": "NewPassword123!"
}
```

Success response (`200 OK`):

```json
{
  "message": "Password changed."
}
```

Error response (`400 Bad Request`) when current password invalid.

### GET /api/v1/auth/sessions

Returns active sessions for current user.

Authentication: required bearer token.

Success response (`200 OK`):

```json
[
  {
    "id": "d5f5f26e-4b8d-4f95-b269-f32ab8f5ce11",
    "ip": "unknown",
    "userAgent": "unknown",
    "createdAt": "2026-06-09T18:00:00Z",
    "lastSeenAt": "2026-06-09T18:02:00Z"
  }
]
```

### DELETE /api/v1/auth/sessions/{id}

Revokes one active session.

Authentication: required bearer token.

Success response: `204 No Content`

Not found: `404 Not Found`

## Related Role Management Endpoints

These endpoints are implemented in user management and protected by role policy `ManagerOrOwner`.

- `POST /api/v1/users/{id}/roles`
- `DELETE /api/v1/users/{id}/roles/{roleId}`

## Notes

- OpenAPI document endpoint in development: `/openapi/v1.json`.
- Rate-limited endpoints: `POST /api/v1/auth/login`, `POST /api/v1/auth/password-reset/request`, `POST /api/v1/auth/password-reset/confirm`.
