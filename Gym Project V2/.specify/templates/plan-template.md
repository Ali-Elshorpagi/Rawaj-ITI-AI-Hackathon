# Implementation Plan: GymDesk

**Feature:** 001-gymdesk
**Created:** 2026-06-09
**Status:** Ready for tasks

---

## Phase -1: Pre-Implementation Gates

### Simplicity Gate
- [x] Using ≤ 3 top-level projects? → **Yes**: `backend`, `frontend`, `shared`
- [x] No future-proofing for unspecified features? → confirmed (no multi-branch, no payment gateway)

### Anti-Abstraction Gate
- [x] Using framework features directly (no wrapper layers beyond controller → service → repository)?
- [x] Single model representation per entity (no DTO explosion)?

### Integration-First Gate
- [x] API contracts defined before implementation? → see `contracts/`
- [x] Contract tests written before service code?

---

## Technology Stack

### Backend
- **Runtime:** Node.js 20 LTS
- **Framework:** Fastify 4 (chosen over Express for built-in schema validation and performance)
- **Language:** TypeScript 5
- **ORM:** Prisma 5 (type-safe, migrations, PostgreSQL support)
- **Database:** PostgreSQL 16
- **Auth:** JWT (access 8h, refresh 30d) via `@fastify/jwt`
- **QR Code:** `qrcode` library — server-side generation, stored as data URI or served as endpoint
- **File Upload:** Local storage for MVP; `multipart/form-data` via `@fastify/multipart`
- **Email:** Nodemailer + SMTP (configurable)
- **Testing:** Vitest + Supertest for integration tests

### Frontend
- **Framework:** React 18 + Vite
- **Language:** TypeScript 5
- **State:** TanStack Query (server state) + Zustand (UI state)
- **Routing:** React Router v6
- **UI Components:** shadcn/ui (Radix + Tailwind)
- **i18n:** react-i18next + i18next (EN + AR, RTL)
- **QR Scanner:** `html5-qrcode` (browser-based camera scan)
- **Charts:** Recharts
- **Testing:** Vitest + React Testing Library

### Infrastructure (MVP)
- **Containerization:** Docker + Docker Compose (single host deployment)
- **Reverse Proxy:** Nginx
- **Environment:** `.env` files; no secrets in source control

---

## Architecture

```
┌─────────────────────────────────────────────┐
│              Nginx (reverse proxy)           │
└────────────┬───────────────────┬────────────┘
             │                   │
    ┌────────▼──────┐   ┌───────▼────────┐
    │  React SPA    │   │  Fastify API   │
    │  (port 3000)  │   │  (port 4000)   │
    └───────────────┘   └───────┬────────┘
                                │
                    ┌───────────▼──────────┐
                    │  PostgreSQL 16        │
                    │  (port 5432)          │
                    └──────────────────────┘
```

**API Design:** RESTful, JSON, versioned under `/api/v1`
**Auth Flow:** Login → access JWT + refresh JWT (httpOnly cookie) → Bearer token on all requests
**RBAC:** Middleware on every route checks `req.user.roles` against route permission map

---

## Implementation Phases

### Phase 1: Foundation (Sprint 1, Week 1–2)

**Goal:** Working auth, RBAC, and member CRUD — the skeleton everything else attaches to.

#### 1.1 Project Setup
- Initialize monorepo: `backend/`, `frontend/`, `shared/`
- Docker Compose: postgres + api + frontend + nginx services
- Prisma schema from database specification (all 14 tables)
- Initial migration and seed script (roles + owner account)

#### 1.2 Authentication
- `POST /api/v1/auth/login` — email + password → JWT pair
- `POST /api/v1/auth/refresh` — refresh token → new access token
- `POST /api/v1/auth/logout` — invalidate refresh token
- JWT middleware: decode, attach `req.user`, enforce role guards
- Password hashing: bcrypt cost 12

#### 1.3 User & Role Management
- `GET/POST /api/v1/users` — Owner/Manager only
- `GET/PATCH/DELETE /api/v1/users/:id`
- `POST /api/v1/users/:id/roles` — assign role
- `DELETE /api/v1/users/:id/roles/:roleId` — remove role

#### 1.4 Member Management
- `GET /api/v1/members` — with search, filter by status/plan, pagination
- `POST /api/v1/members` — create with auto-generated member_code + qr_token
- `GET /api/v1/members/:id`
- `PATCH /api/v1/members/:id`
- `DELETE /api/v1/members/:id` — soft delete (is_active = false)
- `GET /api/v1/members/:id/qr` — returns QR code image

#### 1.5 Frontend Shell
- React app with React Router, i18n setup (EN + AR), RTL toggle
- Login page
- Protected route wrapper (checks auth + role)
- Layout with sidebar nav (role-aware menu items)
- Member list page + create/edit form

---

### Phase 2: Payments, Subscriptions & Check-in (Sprint 2, Week 3–4)

**Goal:** The core daily operations — reception staff can do their full job.

#### 2.1 Membership Plans
- `GET/POST /api/v1/plans` — Owner only for write
- `GET/PATCH /api/v1/plans/:id`
- Plans returned in member-facing views (name, price, features)

#### 2.2 Payments
- `GET /api/v1/payments` — filterable by member, status, date range
- `POST /api/v1/payments` — record payment, auto-set processed_by
- `PATCH /api/v1/payments/:id` — update status (Paid/Refunded)
- `GET /api/v1/payments/overdue` — due_date < today AND status = Pending
- Member renewal: PATCH member expiry + create payment in one transaction

#### 2.3 Attendance & QR Check-in
- `POST /api/v1/attendance/checkin` — body: `{ member_id, method }` or `{ qr_token }`
- `POST /api/v1/attendance/checkout` — body: `{ attendance_id }`
- `GET /api/v1/attendance` — filterable by member, date range
- `GET /api/v1/attendance/today` — all check-ins today (for reception dashboard)
- QR scanner screen in frontend (camera-based via html5-qrcode)
- Manual check-in: staff search + confirm modal

#### 2.4 Reception Dashboard
- Today's check-in count
- Overdue payments list with quick "Mark Paid" action
- Member expiring within 7 days

---

### Phase 3: Classes, Trainers & Notifications (Sprint 3, Week 5–6)

**Goal:** Trainers can manage their sessions; automated notifications go out.

#### 3.1 Trainers
- `GET/POST /api/v1/trainers`
- `GET/PATCH /api/v1/trainers/:id`
- Trainer profile links to Users record

#### 3.2 Classes & Sessions
- `GET/POST /api/v1/classes`
- `GET/PATCH /api/v1/classes/:id`
- `GET/POST /api/v1/classes/:id/sessions` — create session with start/end time, capacity
- `PATCH /api/v1/sessions/:id` — edit or cancel session
- `GET /api/v1/sessions/:id/enrollments` — participant list with status
- `PATCH /api/v1/sessions/:id/attendance` — bulk update attendance status

#### 3.3 Trainer Dashboard (Frontend)
- Weekly calendar view of assigned sessions
- Session detail: participant list + attendance toggle
- Past vs. upcoming visual distinction

#### 3.4 Notifications
- Background job (cron, runs daily at 8:00 AM):
  - Find members with expiry in 7 days → send SubscriptionExpiry notification
  - Find members with expiry in 1 day → send SubscriptionExpiry notification
  - Find payments with due_date = yesterday + status = Pending → send PaymentReminder
- Class cancellation: immediate notification on session status change to Cancelled
- `POST /api/v1/notifications/send` — manual trigger (Owner/Manager)
- `GET /api/v1/notifications` — user's notification history
- `PATCH /api/v1/notifications/:id/read` — mark as read

---

### Phase 4: Reports, Analytics, Settings & Audit (Sprint 4, Week 7–8)

**Goal:** Managers and owners have the data they need; system is production-ready.

#### 4.1 Reports API
- `GET /api/v1/reports/attendance?from=&to=` — daily check-in counts
- `GET /api/v1/reports/revenue?from=&to=` — totals by method + monthly trend
- `GET /api/v1/reports/members` — counts by status and plan
- `GET /api/v1/reports/classes` — utilization per class (enrolled/capacity)
- All reports support CSV export via `Accept: text/csv` header

#### 4.2 Analytics Dashboard (Frontend)
- KPI cards: active members, monthly revenue, today's attendance, utilization rate
- Revenue trend chart (Recharts line chart)
- Attendance heatmap (last 30 days)
- Date range filter: 30 / 90 / 365 days or custom

#### 4.3 Gym Settings
- `GET/PATCH /api/v1/settings` — Owner only
- Logo upload endpoint: `POST /api/v1/settings/logo`
- Settings propagated to frontend via initial app load (`/api/v1/settings/public`)

#### 4.4 Audit Logs
- Fastify lifecycle hook auto-logs all state-changing requests (POST/PATCH/DELETE)
- `GET /api/v1/audit-logs` — Manager/Owner only, filterable by entity, user, date
- Append-only: no update/delete routes for audit logs

#### 4.5 Member Self-Service (Frontend)
- Member dashboard: subscription card, QR code, next class
- Attendance history (paginated)
- Notification history + unread count badge

---

## Data Model Reference

See provided database schema. Key notes for implementation:

- All UUIDs generated server-side with `crypto.randomUUID()`
- `member_code`: format `GYM-{6-digit-random}`, checked for uniqueness
- `qr_token`: UUID v4, used as the scannable payload
- JSONB fields (`features`, `certifications`, `opening_hours`, `metadata`): typed interfaces in `shared/types`
- Soft delete: set `is_active = false` — never issue SQL DELETE on Members or Users

---

## Complexity Tracking

| Decision | Justification |
|----------|--------------|
| Fastify over Express | Built-in JSON schema validation reduces boilerplate for input validation |
| Prisma over raw SQL | Type-safe queries reduce runtime errors; migrations are version-controlled |
| TanStack Query | Eliminates manual loading/error state management across 20+ data-fetching views |
| shadcn/ui | Radix primitives give accessibility for free; Tailwind gives full visual control |
| No Redis in MVP | Session state fits in JWTs; caching is premature until performance testing shows need |

## Constitution Alignment
Quick validation checklist to ensure the plan follows the project constitution:

- [ ] `Specification-First`: Plan references a versioned spec and links to `/specs/` where applicable.
- [ ] `Reusable Components`: Tasks separate reusable/shared work into `shared/` and documented modules.
- [ ] `Test-First`: Integration/contract tests are defined as gates before implementation phases.
- [ ] `Integration & Observability`: Integration tests and logging/observability points are included for each integration boundary.
- [ ] `Simplicity & Compatibility`: Breaking-change considerations and versioning guidance included where relevant.
