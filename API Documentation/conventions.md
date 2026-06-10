# API Conventions

## Transport and Content Type

- Protocol: HTTPS in production.
- Content type for request/response payloads: application/json.

## Authentication and Authorization

GymDesk uses JWT bearer tokens for authenticated endpoints.

Header format:

Authorization: Bearer <access-token>

### JWT Validation

- Issuer and audience are validated.
- Signing key is validated.
- Token lifetime is validated with zero clock skew.

## Refresh Token Behavior

Refresh tokens are returned:

- In response body for login/refresh/register flows.
- As secure cookie on login and refresh.

Cookie behavior is controlled by CookieSettings:

- Name (default: gymdesk.refresh)
- HttpOnly
- Secure
- SameSite
- RequireCsrfHeader
- CsrfHeaderName (default: X-CSRF-Token)

## CSRF Rule for Cookie-Based Refresh and Logout

When refresh token is sent via cookie (not request body), the CSRF header is required if enabled by settings.

Default header:

X-CSRF-Token: <token>

## Rate Limiting

Policy name: AuthSensitive

Applied to:

- POST /api/v1/auth/login
- POST /api/v1/auth/password-reset/request
- POST /api/v1/auth/password-reset/confirm

Default limit:

- 5 requests per minute per IP.
- Exceeded requests return 429 Too Many Requests.

## Error Response Shape

Most handled failures return:

{
  "error": "message"
}

Some authorization failures may return framework defaults (401/403) without this object.

## Status Code Conventions

- 200 OK: successful read/update action
- 201 Created: successful create action
- 204 No Content: successful action with no response body
- 400 Bad Request: validation/input/business rule failure
- 401 Unauthorized: invalid or missing authentication credentials/token
- 403 Forbidden: authenticated but not authorized for operation
- 404 Not Found: resource not found
- 429 Too Many Requests: rate limit exceeded
