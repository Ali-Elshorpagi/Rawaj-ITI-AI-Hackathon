# Feature Specification: GymDesk — Small Gym Management System

**Feature Number:** 001
**Branch:** `001-gymdesk`
**Status:** Draft
**Created:** 2026-06-09

---

## Overview

GymDesk is a web platform for managing gym memberships, attendance, payments, and class schedules for small to mid-sized gyms. It replaces manual paper-based or spreadsheet-based workflows with a structured, role-driven digital system that is accessible on any device and available in both Arabic and English.

### Problem Statement

Small and mid-sized gyms struggle with:
- Tracking membership expiry and renewals manually
- Recording attendance without a reliable check-in system
- Managing payments and identifying overdue accounts
- Coordinating trainer schedules and class rosters
- Having no central dashboard to monitor daily operations

### Goals

- Give gym staff a fast, reliable way to manage members, payments, and check-ins
- Give members self-service visibility into their own subscription and schedule
- Give managers and owners actionable reports without building custom queries
- Support Arabic-speaking gym staff and members natively

### UI Style Direction

- Primary palette: `#618764` and `#2B5748`
- Neutral palette: black (`#000000`) and white for contrast
- Visual intent: polished, modern, and "fancy" presentation with clean spacing, smooth rounded components, subtle elevation/shadows, and clear hierarchy
- Accessibility intent: keep text/background contrast high and preserve readability in both Arabic and English layouts

### Non-Goals (Out of Scope for MVP)

- Native mobile app (iOS/Android) — responsive web only
- Multi-branch gym support
- Equipment inventory management
- Online payment gateway integration (payments are recorded manually)
- Member-facing class booking (enrollment is staff-managed in MVP)

---

## User Roles

| Role | Description |
|------|-------------|
| **Guest** | Unauthenticated visitor — views public pricing and services only |
| **Member** | Registered gym member — views own subscription, attendance, and schedule |
| **ReceptionStaff** | Manages members, records payments, performs check-ins |
| **Trainer** | Views assigned classes and marks session attendance |
| **Manager** | Monitors operations, manages staff, views reports |
| **Owner** | Full access — configures plans, pricing, analytics, and all accounts |

---

## User Stories

### Guest

**US-001** — As a Guest, I want to view the gym's services, classes, and membership pricing so I can decide whether to join.

- Acceptance Criteria:
	- [ ] Public landing page shows available membership plans with prices
	- [ ] Class schedule is visible without logging in
	- [ ] A clear call-to-action prompts the guest to register or contact the gym

---

### Gym Member

**US-002** — As a Member, I want to view my current subscription status and expiry date so I know when to renew.

- Acceptance Criteria:
	- [ ] Dashboard shows membership plan name, status (Active/Expired/Frozen), and expiry date
	- [ ] A visual warning appears when expiry is within 7 days
	- [ ] Status is accurate in real time (no stale cache)

**US-003** — As a Member, I want to check in using my QR code so I can enter the gym without staff manually searching for me.

- Acceptance Criteria:
	- [ ] Member profile page shows a scannable QR code linked to their `qr_token`
	- [ ] QR scan records an attendance entry with `method = QR` and current timestamp
	- [ ] If membership is expired or suspended, scan is rejected with a clear error message

**US-004** — As a Member, I want to view my personal attendance history so I can track how often I visit.

- Acceptance Criteria:
	- [ ] Attendance list shows date, check-in time, check-out time, and method
	- [ ] History is paginated — 20 entries per page
	- [ ] Member can only see their own attendance, never another member's

**US-005** — As a Member, I want to receive a notification before my subscription expires so I have time to renew.

- Acceptance Criteria:
	- [ ] Notification is sent 7 days before expiry and again 1 day before
	- [ ] Notification includes plan name, expiry date, and a renewal prompt
	- [ ] Delivery channel is configurable (Email, SMS, or Push)

---

### Reception Staff

**US-006** — As Reception Staff, I want to add, edit, search, and deactivate member profiles so I can keep the member directory accurate.

- Acceptance Criteria:
	- [ ] Create member form captures: name (EN + AR), phone, email, photo, membership plan, join date
	- [ ] Search filters by name, status (Active/Expired/Frozen/Suspended), and plan
	- [ ] Edit updates all fields; deactivation sets `is_active = false` without deleting the record
	- [ ] Member code is auto-generated and unique

**US-007** — As Reception Staff, I want to record membership payments so I can track who has paid.

- Acceptance Criteria:
	- [ ] Payment form captures: member, plan, amount, payment date, due date, method (Cash/Card/BankTransfer), and optional notes
	- [ ] Transaction reference is optional but storable
	- [ ] Payment appears immediately in the member's payment history
	- [ ] Processed-by field is automatically set to the logged-in staff user

**US-008** — As Reception Staff, I want to renew a member's subscription so their access continues uninterrupted.

- Acceptance Criteria:
	- [ ] Renewal extends `expiry_date` by the plan's `duration_days` from current expiry (not today)
	- [ ] Renewal creates a new Payment record
	- [ ] Membership status changes from Expired to Active upon renewal

**US-009** — As Reception Staff, I want to check in members manually so I can handle cases where QR scanning isn't available.

- Acceptance Criteria:
	- [ ] Staff can search for a member by name or member code and log a check-in
	- [ ] Manual check-in records `method = Manual` and the `checked_in_by_user_id`
	- [ ] Staff cannot check in an Expired or Suspended member without a warning and override confirmation

**US-010** — As Reception Staff, I want to see a list of overdue payments so I can follow up with members.

- Acceptance Criteria:
	- [ ] Overdue list shows members whose payment `due_date` has passed and `status = Pending`
	- [ ] List is sortable by days overdue
	- [ ] Staff can mark a payment as Paid directly from this view

---

### Trainer

**US-011** — As a Trainer, I want to view my assigned classes and weekly schedule so I know what sessions I'm running.

- Acceptance Criteria:
	- [ ] Trainer dashboard shows a weekly calendar view of assigned ClassSessions
	- [ ] Each session shows class name, location, start/end time, and enrolled count vs. max capacity
	- [ ] Past sessions are visually distinct from upcoming ones

**US-012** — As a Trainer, I want to view the participant list for each class session so I know who is attending.

- Acceptance Criteria:
	- [ ] Session detail page lists all enrolled members with their name and profile photo
	- [ ] List shows current attendance status (Registered / Attended / Absent / Cancelled)

**US-013** — As a Trainer, I want to mark attendance for each session so the system has an accurate record.

- Acceptance Criteria:
	- [ ] Trainer can toggle each member's status to Attended or Absent
	- [ ] Marking is only available for sessions with `status = Scheduled` or after session start time
	- [ ] Changes are saved immediately (no "submit all" required)

---

### Gym Manager

**US-014** — As a Manager, I want to monitor daily attendance and active member count on a dashboard so I can assess gym utilization.

- Acceptance Criteria:
	- [ ] Dashboard shows today's check-in count, current active members, and expired memberships
	- [ ] Attendance chart shows daily check-ins for the last 30 days
	- [ ] Data refreshes automatically every 5 minutes

**US-015** — As a Manager, I want to manage trainer schedules and class assignments so operations run smoothly.

- Acceptance Criteria:
	- [ ] Manager can create, edit, and cancel ClassSessions
	- [ ] Manager can assign or reassign a trainer to any class
	- [ ] Cancelling a session sets `status = Cancelled` and notifies enrolled members

**US-016** — As a Manager, I want to view revenue and subscription reports so I can understand financial performance.

- Acceptance Criteria:
	- [ ] Monthly revenue report shows total collected, broken down by payment method
	- [ ] Subscription report shows active vs. expired vs. frozen counts by plan
	- [ ] Reports are exportable as CSV

**US-017** — As a Manager, I want to manage staff accounts and roles so access stays appropriate.

- Acceptance Criteria:
	- [ ] Manager can create ReceptionStaff and Trainer accounts
	- [ ] Manager can deactivate accounts but cannot delete them
	- [ ] Manager cannot create or modify Manager or Owner accounts

---

### Gym Owner

**US-018** — As an Owner, I want full access to all features so I can oversee the entire operation.

- Acceptance Criteria:
	- [ ] Owner can perform every action available to every other role
	- [ ] Owner can see and manage all user accounts including Managers

**US-019** — As an Owner, I want to configure membership plans and pricing so I can adjust offerings as the business evolves.

- Acceptance Criteria:
	- [ ] Owner can create, edit, and deactivate MembershipPlans
	- [ ] Plan changes do not retroactively modify existing active memberships
	- [ ] Plan features (JSON) support gym_access, locker_access, personal_training_sessions

**US-020** — As an Owner, I want to view platform-wide analytics so I can track business performance over time.

- Acceptance Criteria:
	- [ ] Analytics shows: total revenue (monthly trend), member growth, attendance rate, class utilization
	- [ ] Date range filter (last 30 / 90 / 365 days or custom)
	- [ ] Key metrics are exportable

**US-021** — As an Owner, I want to configure gym settings (name, logo, hours, currency, language) so the platform reflects my gym's identity.

- Acceptance Criteria:
	- [ ] Settings page allows editing all GymSettings fields
	- [ ] Logo upload stores URL and displays on all pages
	- [ ] Default language preference applies to all new user sessions

---

## Functional Requirements

### FR-001: Authentication & RBAC
- Email + password login with JWT tokens
- Role assignments stored in UserRoles (many-to-many)
- All API endpoints enforce role-based access server-side
- Session refresh without re-login within 30 days

### FR-002: Member Management
- Full CRUD on Members linked to Users
- Unique auto-generated member codes
- QR token generated per member, scannable for check-in
- Soft-delete via `is_active` — no hard deletes on members

### FR-003: Membership & Payments
- Plans: Monthly, Quarterly, Annual billing cycles
- Payment status lifecycle: Pending → Paid / Overdue / Refunded
- Expiry auto-calculated on renewal from current expiry date
- Overdue detection: due_date < today AND status = Pending

### FR-004: Attendance Tracking
- Check-in via QR scan or manual staff lookup
- Check-out time recorded when member exits (optional in MVP)
- Attendance blocked for Expired/Suspended members without staff override

### FR-005: Trainer & Class Management
- Trainer profiles linked to Users
- Classes define the recurring template; ClassSessions are individual occurrences
- Enrollment tracks registered members per session
- Enrolled count must not exceed max_capacity

### FR-006: Notifications
- Subscription expiry reminder: 7 days and 1 day before expiry
- Payment overdue reminder: 1 day after due_date passes
- Class cancellation: immediate push/email to enrolled members
- Channels: Email, SMS, Push (configurable per notification type)

### FR-007: Reporting & Analytics
- Daily attendance count
- Monthly revenue totals by method
- Active / Expired / Frozen / Suspended member counts
- Class utilization rate (enrolled / max_capacity per session)

### FR-008: Audit Logging
- Every Create, Update, Delete action logs: user, entity, old values, new values
- Audit log is append-only — no modifications permitted
- Accessible to Manager and Owner roles only

---

## Non-Functional Requirements

### NFR-001: Performance
- API p95 response time < 300ms for list endpoints
- QR check-in end-to-end < 1 second
- Dashboard initial load < 2.5 seconds on 4G

### NFR-002: Responsiveness
- Fully functional on 375px (mobile), 768px (tablet), 1280px+ (desktop)
- No horizontal scroll on any screen at any breakpoint

### NFR-003: Internationalization
- UI in Arabic and English; language toggle available at all times
- RTL layout activated for Arabic via `dir="rtl"`
- All database string fields have `_ar` variants for Arabic content

### NFR-004: Accessibility
- WCAG 2.1 AA compliance for all public-facing and member-facing pages
- Keyboard navigable; screen-reader compatible labels

### NFR-005: Security
- HTTPS only in production
- Passwords hashed with bcrypt (cost ≥ 12)
- JWT access tokens expire in 8 hours
- No PII returned in API responses beyond what the role is authorized to see

---

## Review & Acceptance Checklist

### Requirement Completeness
- [ ] All 6 user roles have defined user stories
- [ ] Every user story has measurable acceptance criteria
- [ ] No [NEEDS CLARIFICATION] markers remain
- [ ] Non-functional requirements are measurable

### Coverage
- [ ] Member lifecycle (join → active → expiry → renewal) fully specified
- [ ] Payment lifecycle (pending → paid / overdue / refunded) fully specified
- [ ] Attendance flows (QR + manual) fully specified
- [ ] Class/trainer management fully specified
- [ ] Notification triggers all identified
- [ ] Admin/owner configuration covered

### Consistency
- [ ] Role permissions do not contradict each other
- [ ] Database schema aligns with all user stories
- [ ] Arabic/English requirements are consistently applied
