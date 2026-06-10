# Auth API Documentation

Base path: /api/v1/auth

## Models

### LoginRequest

{
  "email": "string",
  "password": "string"
}

### RegisterRequest

{
  "email": "string",
  "password": "string"
}

### RefreshRequest

{
  "refreshToken": "string"
}

### PasswordResetRequest

{
  "email": "string"
}

### PasswordResetConfirmRequest

{
  "token": "string",
  "newPassword": "string"
}

### PasswordChangeRequest

{
  "currentPassword": "string",
  "newPassword": "string"
}

### AuthSessionDto

{
  "id": "guid",
  "ip": "string",
  "userAgent": "string",
  "createdAt": "datetime",
  "lastSeenAt": "datetime|null"
}

## Endpoints

## POST /api/v1/auth/register

Registers a new account.

Request body: RegisterRequest

Success:

- 201 Created

Example response:

{
  "accessToken": "<jwt>",
  "refreshToken": "<refresh-token>"
}

Failure:

- 400 Bad Request

## POST /api/v1/auth/login

Authenticates user and returns token pair. Also sets refresh cookie.

Rate limited by AuthSensitive policy.

Request body: LoginRequest

Success:

- 200 OK

Example response:

{
  "accessToken": "<jwt>",
  "refreshToken": "<refresh-token>"
}

Failure:

- 401 Unauthorized

## POST /api/v1/auth/refresh

Refreshes access token and rotates refresh token.

Request body: RefreshRequest

Notes:

- If refreshToken is empty in body, API will try refresh cookie.
- If using cookie-based refresh and CSRF protection is enabled, send X-CSRF-Token header.

Success:

- 200 OK

Example response:

{
  "accessToken": "<jwt>",
  "refreshToken": "<refresh-token>"
}

Failure:

- 400 Bad Request (missing refresh token or missing CSRF header)
- 401 Unauthorized (invalid/revoked/expired token)

## POST /api/v1/auth/logout

Revokes refresh token and clears refresh cookie.

Request body: RefreshRequest

Notes:

- If refreshToken is empty in body, API will try refresh cookie.
- If using cookie-based logout and CSRF protection is enabled, send X-CSRF-Token header.

Success:

- 204 No Content

Failure:

- 400 Bad Request (missing refresh token or missing CSRF header)

## POST /api/v1/auth/password-reset/request

Requests password reset token for provided email.

Rate limited by AuthSensitive policy.

Request body: PasswordResetRequest

Success:

- 204 No Content

## POST /api/v1/auth/password-reset/confirm

Confirms password reset using reset token.

Rate limited by AuthSensitive policy.

Request body: PasswordResetConfirmRequest

Success:

- 200 OK

Example response:

{
  "message": "Password has been reset."
}

Failure:

- 400 Bad Request

## POST /api/v1/auth/password-change

Changes password for currently authenticated user.

Authorization: Bearer token required.

Request body: PasswordChangeRequest

Success:

- 200 OK

Example response:

{
  "message": "Password changed."
}

Failure:

- 400 Bad Request
- 401 Unauthorized

## GET /api/v1/auth/sessions

Returns active sessions for currently authenticated user.

Authorization: Bearer token required.

Success:

- 200 OK

Example response:

[
  {
    "id": "9f74f6f1-b781-4cb7-b71d-0a9d040d302f",
    "ip": "unknown",
    "userAgent": "unknown",
    "createdAt": "2026-06-10T00:00:00Z",
    "lastSeenAt": null
  }
]

Failure:

- 401 Unauthorized

## DELETE /api/v1/auth/sessions/{id}

Revokes one session for currently authenticated user.

Authorization: Bearer token required.

Path params:

- id (guid): session id

Success:

- 204 No Content

Failure:

- 401 Unauthorized
- 404 Not Found
