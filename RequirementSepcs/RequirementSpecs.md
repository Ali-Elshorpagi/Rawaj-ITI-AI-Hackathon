# GymDesk System Requirements Specification

## 1. Document Purpose

This document consolidates all current GymDesk system requirements into one reference for product, backend, frontend, QA, and release work.

## 2. Product Scope

GymDesk is a web platform for small and mid-sized gyms to manage:

- Authentication and secure access
- User and role management
- Member lifecycle and memberships
- Payments and overdue tracking
- Attendance and check-in/checkout
- Trainers, classes, and session attendance
- Notifications
- Reports and analytics
- Gym settings and bilingual presentation (English/Arabic)

Out of scope for MVP:

- Native mobile apps
- Multi-branch gyms
- Equipment inventory
- Online payment gateway integration
- Member self-booking for classes
- MFA and social/OAuth login

## 3. User Roles

- Guest: unauthenticated visitor
- Member: authenticated gym member
- ReceptionStaff: member and payment operations
- Trainer: trainer schedule and session attendance
- Manager: operations oversight and staff management
- Owner: full platform access
- System: background jobs, token/notification processing

## 4. Functional Requirements

### 4.1 Authentication, Sessions, and Access Control

FR-AUTH-001: Login
- The system shall provide `POST /api/v1/auth/login` with email and password.
- On valid credentials for an active user, the system shall return an access token and refresh token.
- The system shall support refresh token in both response body and secure cookie.

FR-AUTH-002: Register
- The system shall provide `POST /api/v1/auth/register` to create new accounts.
- Duplicate emails shall be rejected.

FR-AUTH-003: Refresh
- The system shall provide `POST /api/v1/auth/refresh`.
- Refresh token rotation is required: issuing a new refresh token revokes the old token.
- Missing, expired, revoked, or invalid refresh tokens shall be rejected.

FR-AUTH-004: Logout
- The system shall provide `POST /api/v1/auth/logout`.
- Logout shall revoke provided refresh token and clear refresh cookie.

FR-AUTH-005: Password Reset
- The system shall support request-confirm flow:
  - `POST /api/v1/auth/password-reset/request`
  - `POST /api/v1/auth/password-reset/confirm`
- Reset token shall be single-use and expire in 1 hour.
- Successful reset shall revoke all active refresh tokens for the user.

FR-AUTH-006: Password Change
- The system shall provide authenticated `POST /api/v1/auth/password-change`.
- Current password verification is mandatory.
- Successful password change shall revoke refresh tokens.

FR-AUTH-007: Session Management
- The system shall provide:
  - `GET /api/v1/auth/sessions` (list own active sessions)
  - `DELETE /api/v1/auth/sessions/{id}` (revoke one own session)

FR-AUTH-008: JWT Claims and Validation
- Access tokens shall include `sub`, `roles`, `iat`, `exp`, `jti`.
- Issuer, audience, signature, and lifetime validation shall be enforced.
- Zero clock skew shall be used in token lifetime validation.

FR-AUTH-009: RBAC Enforcement
- Role-based authorization shall be enforced server-side on all protected endpoints.
- UI authorization checks are convenience only and not a security boundary.

### 4.2 User and Role Management

FR-USER-001: User Directory
- The system shall provide paginated user listing with search and active-status filtering.

FR-USER-002: User CRUD
- The system shall provide create, read, update for users.
- User deactivation/reactivation shall be soft state transitions (no hard delete).

FR-USER-003: Role Assignment
- The system shall provide assign/remove role endpoints.
- Role management endpoints shall require ManagerOrOwner policy.

FR-USER-004: Manager Constraints
- Manager shall be able to create and manage ReceptionStaff and Trainer accounts.
- Manager shall not create or modify Manager/Owner accounts.

FR-USER-005: Owner Privileges
- Owner shall have full access to all platform actions and accounts.
- System shall maintain at least one active owner account (lockout prevention policy).

FR-USER-006: Validation and Conflicts
- Email uniqueness is required.
- Duplicate identity conflicts shall return safe validation errors.

### 4.3 Member Management

FR-MEMBER-001: Member CRUD
- ReceptionStaff, Manager, and Owner shall manage member records.
- Deletion shall be soft delete (`is_active = false`).

FR-MEMBER-002: Member Identification
- Member code shall be auto-generated and unique.
- QR token shall be generated per member for check-in.

FR-MEMBER-003: Member Search and Filters
- Member listing shall support search and filters by status and plan.

FR-MEMBER-004: Self and Staff Access
- Member can view only own member profile and own QR.
- ReceptionStaff and above can view member records.

FR-MEMBER-005: Renewal
- The system shall provide member renewal endpoint.
- Renewal shall extend expiry from current expiry date (not from current date).
- Renewal shall create a payment record.

### 4.4 Membership Plans

FR-PLAN-001: Plan Visibility
- All authenticated users can list membership plans.

FR-PLAN-002: Plan Administration
- Owner shall create, update, and deactivate plans.

FR-PLAN-003: Plan Schema
- Plan shall include billing cycle, duration days, price, and feature JSON.
- Feature JSON shall support: gym_access, locker_access, personal_training_sessions.

FR-PLAN-004: Plan Change Safety
- Plan updates shall not retroactively modify existing active memberships.

### 4.5 Payments

FR-PAY-001: Payment Recording
- ReceptionStaff, Manager, and Owner shall create payment entries with member, plan, amount, dates, method, and optional notes/reference.
- Processed-by user shall be captured automatically.

FR-PAY-002: Payment Lifecycle
- Status lifecycle shall support: Pending, Paid, Overdue, Refunded.

FR-PAY-003: Overdue Detection
- Overdue rule: `dueDate < today` and `status = Pending`.
- The system shall expose overdue payment list and mark-as-paid operations.

FR-PAY-004: Payment Validation
- Amount must be positive.
- Method enum must enforce Cash, Card, or BankTransfer.

### 4.6 Attendance and Check-In

FR-ATT-001: Check-In Modes
- The system shall support:
  - QR self-check-in for members
  - Manual check-in by ReceptionStaff, Manager, Owner

FR-ATT-002: Check-In Rules
- Attendance record shall include member, check-in time, and method (QR or Manual).
- Manual check-in shall capture operator (`checked_in_by_user_id`).

FR-ATT-003: Eligibility and Conflicts
- Expired or suspended memberships shall be blocked from check-in unless explicit authorized override flow is used.
- Duplicate active check-in shall return conflict.

FR-ATT-004: Checkout
- The system shall support checkout by attendance identifier.

FR-ATT-005: Attendance Visibility
- Staff roles can query attendance with filters and pagination.
- Member can view only own attendance history, 20 items per page default, latest first.

### 4.7 Trainers, Classes, and Sessions

FR-CLASS-001: Trainer Records
- Manager and Owner can create trainer records linked to users.
- Trainer can update own allowed profile subset.

FR-CLASS-002: Class Management
- Manager and Owner can create/update classes and create class sessions.

FR-CLASS-003: Session Management
- Manager and Owner can update session status, including cancellation.
- Canceled sessions shall trigger member notifications.

FR-CLASS-004: Enrollment and Capacity
- Session enrollments shall track participant status.
- Enrolled count shall not exceed max capacity.

FR-CLASS-005: Trainer Schedule and Roster
- Trainer dashboard shall provide weekly assigned sessions.
- Session roster shall expose participant list with attendance status.

FR-CLASS-006: Session Attendance Marking
- Trainer (own sessions), Manager, and Owner can set enrollment attendance states (Attended/Absent).
- Changes should persist immediately.

### 4.8 Notifications

FR-NOTIF-001: User Notifications
- Authenticated users shall list own notifications and mark individual notifications as read.

FR-NOTIF-002: Manual Send
- Manager and Owner shall send notifications to selected users through Email, SMS, or Push.

FR-NOTIF-003: Automated Triggers
- System shall generate automated reminders:
  - Membership expiry at D-7 and D-1
  - Payment overdue at D+1
  - Session cancellation immediate notification

FR-NOTIF-004: Delivery Reliability
- Failed notification deliveries shall be logged for retry/monitoring.
- Trigger processing shall be idempotent to prevent duplicate sends.

### 4.9 Reports and Analytics

FR-REPORT-001: Attendance Report
- Manager and Owner can query attendance report by date range.
- CSV export shall be supported.

FR-REPORT-002: Revenue Report
- Manager and Owner can query total revenue, breakdown by payment method, and monthly trend.

FR-REPORT-003: Member Report
- Manager and Owner can query total members and distribution by status and plan.

FR-REPORT-004: Class Utilization Report
- Manager and Owner can query class/session utilization metrics.

FR-REPORT-005: Dashboard Metrics
- The system shall provide dashboard metrics for:
  - Today's check-ins
  - Active and expired memberships
  - 30-day attendance chart
  - Revenue/member/class utilization analytics for owner views

### 4.10 Settings and Public Data

FR-SET-001: Public Settings
- Public endpoint shall expose non-sensitive gym settings: name, logo, working hours, currency, default language.

FR-SET-002: Owner Settings Control
- Owner can read and update full gym settings.

FR-SET-003: Language Behavior
- Default language setting shall apply to new sessions.

FR-SET-004: Global Branding
- Logo URL and gym identity settings shall propagate to all relevant pages.

### 4.11 Audit and Observability

FR-AUDIT-001: Sensitive Action Audit
- Create/update/delete-equivalent operations shall write audit records including actor, target entity, old values, new values, and timestamp.

FR-AUDIT-002: Auth Security Audit
- System shall audit successful and failed login attempts, token issuance/rotation/revocation, and password changes.

FR-AUDIT-003: Access to Audit Data
- Audit data is append-only and readable by Manager and Owner only.

FR-AUDIT-004: Authorization Denial Logging
- Denied authorization attempts on protected endpoints shall be logged in structured logs.

## 5. API and Integration Requirements

IR-API-001: Base API conventions
- API base path shall be `/api/v1`.
- JSON request/response content type shall be used.

IR-API-002: Status code contract
- API shall use standard status semantics: 200, 201, 204, 400, 401, 403, 404, 409, 429.

IR-API-003: Error contract
- Handled business/validation failures should return `{ "error": "message" }`.

IR-API-004: Rate limits
- Auth-sensitive endpoints shall be limited to 5 requests/minute/IP.

IR-API-005: CSRF for cookie refresh/logout
- When cookie-based refresh/logout is used and protection enabled, CSRF header is required.

## 6. Non-Functional Requirements

NFR-001: Performance
- API list endpoints p95 < 300ms.
- QR check-in end-to-end < 1 second.
- Dashboard initial load < 2.5 seconds on 4G.

NFR-002: Responsiveness
- Fully usable at 375px, 768px, and 1280px+ widths.
- No horizontal scroll at supported breakpoints.

NFR-003: Internationalization and RTL
- Full EN/AR UI support.
- Arabic must use RTL layout.
- Translatable user-facing strings across modules.

NFR-004: Accessibility
- Public/member-facing views shall meet WCAG 2.1 AA.
- Keyboard navigation and screen-reader labeling required.

NFR-005: Security
- HTTPS only in production.
- Password hash via bcrypt cost >= 12.
- Access token lifetime default 8 hours.
- Refresh token lifetime default 30 days.
- Refresh tokens stored as hashes, not raw values.
- Browser cookie refresh token flags: HttpOnly, Secure, SameSite policy.
- PII exposure shall follow least-privilege per role.

NFR-006: Reliability and Data Integrity
- Renewal operation (expiry update + payment creation) shall be atomic.
- Critical scheduled actions (notifications) shall be idempotent.
- Concurrency conflicts shall return deterministic safe failures.

NFR-007: Observability
- Structured logs for security events and authorization denials.
- Audit trails retained for sensitive operations.

## 7. Data and Domain Rules

DR-001: User
- Fields include identity (email/phone), bilingual names, active status, timestamps, password hash, and role links.

DR-002: RefreshToken
- Store token hash, issued/expiry/revocation, and rotation lineage.

DR-003: Session
- Store session id, user id, created/last-seen timestamps, IP, user agent.

DR-004: Membership
- Status values: Active, Expired, Frozen, Suspended.

DR-005: Payment
- Status values: Pending, Paid, Overdue, Refunded.

DR-006: Attendance
- Methods: QR, Manual.
- One active check-in per member at a time.

DR-007: Class Session
- Status values: Scheduled, Completed, Cancelled.
- Enrollment attendance values: Registered, Attended, Absent, Cancelled.

## 8. Testing and Acceptance Requirements

TR-001: Auth endpoint coverage
- Authentication flows shall have unit and integration coverage for success/failure paths.

TR-002: Token rotation and replay defense
- Reusing rotated/revoked refresh token must fail and be logged.

TR-003: Authorization matrix
- Tests shall verify role permissions for users, members, classes, reports, and settings.

TR-004: User management tests
- Unit tests for user/role services and integration tests for user CRUD and role assignment are required.

TR-005: UX quality checks
- Accessibility checks, bilingual rendering checks, and responsive checks are required.

TR-006: Export and localization checks
- CSV exports shall validate headers and Arabic text handling.

TR-007: Security behavior checks
- Password reset shall avoid account enumeration.
- CSRF checks shall enforce cookie-flow protections when enabled.

## 9. Definition of Done (System Requirement Baseline)

All modules are considered requirement-complete when:

- Functional requirements in sections 4 and 5 are implemented or explicitly deferred.
- Non-functional targets in section 6 are measured and documented.
- Domain and lifecycle rules in section 7 are enforced in API and persistence layers.
- Tests in section 8 are present in CI with pass results.
- Audit and observability requirements are verifiable in runtime logs.
