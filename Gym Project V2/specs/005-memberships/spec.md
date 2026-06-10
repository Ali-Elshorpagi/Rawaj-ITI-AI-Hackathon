# Feature Specification: Memberships

Feature: 005-memberships
Created: 2026-06-10
Status: Draft

## Overview

Memberships defines assignment and lifecycle control of member subscriptions, including activation, expiry behavior, suspension/freeze states, and renewals. It is a core business feature that determines access eligibility and reminder triggers.

## Goals

- Maintain accurate membership status per member.
- Enforce deterministic lifecycle transitions.
- Apply renewal rules from current expiry date.
- Keep transitions auditable and queryable.

## In Scope

- Membership state model and transition rules.
- Renewal behavior and expiry extension rules.
- Relationship with member, plan, and payment records.

## Out of Scope

- Payment gateway integrations.
- Advanced prorating policy for partial periods.

## Actors and Permissions

- ReceptionStaff: initiate renewals and view membership status.
- Manager/Owner: lifecycle overrides (freeze/suspend/reactivate where policy allows).
- Member: read-only own status visibility.

## User Stories

- As ReceptionStaff, I can renew memberships without breaking expiry logic.
- As Member, I can see my current plan, status, and expiry date.
- As Manager, I can enforce suspension/freeze for compliance scenarios.

## Functional Requirements

FR-MS-001 Status model
- Status values: Active, Expired, Frozen, Suspended.

FR-MS-002 Expiry calculation
- Renewal extends from current expiry date, not from today.

FR-MS-003 Renewal transaction coupling
- Renewal action shall create linked payment record.
- Renewal update and payment creation should be atomic.

FR-MS-004 Access eligibility signal
- Active controls check-in eligibility.
- Expired/Suspended should block check-in unless override policy applies.

FR-MS-005 Status transition guardrails
- Illegal transitions shall be rejected with clear validation errors.

FR-MS-006 Ownership visibility
- Member can read only own membership details.

## API Contract

Membership lifecycle is currently represented through member-focused endpoints:

- POST /api/v1/members/{id}/renew
- GET /api/v1/members/{id}
- PATCH /api/v1/members/{id}

## Validation Rules

- Plan id must reference active assignable plan.
- Renewal requires payment method and valid actor context.
- Expiry cannot regress unless explicit correction workflow is used.

## Audit and Observability

- Log renewal actor, previous expiry, new expiry, and linked payment id.
- Log all lifecycle status changes and override reasons.

## Non-Functional Requirements

- Renewal operation should complete under 1 second for standard load.
- Membership status reads should be real-time consistent for access decisions.

## Acceptance Criteria

- [x] Renewal extends from existing expiry and creates payment record.
- [x] Lifecycle status values are enforced and documented.
- [x] Unauthorized transition attempts are rejected and logged.
- [x] Membership visibility follows ownership and role rules.

## Test Scenarios

- Expired member renewal sets status to Active and adjusts expiry correctly.
- Renewing active future-dated membership extends from future expiry.
- Failed payment persistence rolls back membership changes.

