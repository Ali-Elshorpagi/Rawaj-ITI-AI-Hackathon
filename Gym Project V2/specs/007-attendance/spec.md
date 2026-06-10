# Feature Specification: Attendance

Feature: 007-attendance
Created: 2026-06-10
Status: Draft

## Overview

Attendance defines member entry and exit records using QR and manual workflows. It provides operational visibility, access gate rules, and a reliable history for staff and members.

## Goals

- Provide fast and reliable check-in/check-out processing.
- Enforce eligibility rules based on membership state.
- Prevent duplicate active check-in records.
- Expose attendance history by role and ownership.

## In Scope

- QR and manual check-in endpoints.
- Check-out endpoint and record completion.
- Listing endpoints for staff and member scoped views.
- Duplicate prevention and conflict handling.

## Out of Scope

- Hardware scanner device integration protocols.
- Turnstile IoT gate control.

## Actors and Permissions

- Member: QR self-check-in and own checkout/history.
- ReceptionStaff: manual check-in, checkout, and attendance operations.
- Manager/Owner: full attendance visibility and operations.

## User Stories

- As Member, I can check in quickly with QR and see my history.
- As ReceptionStaff, I can manually check in members when scanning is unavailable.
- As Manager, I can monitor attendance trends and daily activity.

## Functional Requirements

FR-ATT-001 Check-in methods
- Support QR-based and Manual check-in requests.

FR-ATT-002 Eligibility gate
- Reject check-in for Expired/Suspended membership unless override flow policy exists.

FR-ATT-003 Duplicate prevention
- Reject duplicate active check-in with conflict response.

FR-ATT-004 Check-out
- Support check-out by attendance id and update completion timestamp.

FR-ATT-005 Attendance listing
- Staff can query attendance by member/date range with pagination.
- Member can query own attendance only.

FR-ATT-006 Today summary
- Provide current-day attendance summary endpoint.

## API Contract

Base path: /api/v1/attendance

- POST /api/v1/attendance/checkin
- POST /api/v1/attendance/checkout
- GET /api/v1/attendance
- GET /api/v1/attendance/today
- GET /api/v1/attendance/member/{memberId}

## Validation Rules

- QR payload must include valid qrToken.
- Manual payload must include valid memberId.
- checkout requires valid open attendance record.

## Audit and Observability

- Log manual check-in operator id and target member id.
- Log override usage with reason and actor.
- Track check-in conflict rate for diagnostics.

## Non-Functional Requirements

- Check-in end-to-end target under 1 second.
- p95 list endpoint under 300ms for normal filters.
- Attendance actions should be idempotency-safe where applicable.

## Acceptance Criteria

- [ ] QR and manual check-in flows work with role-based controls.
- [ ] Duplicate check-ins are blocked.
- [ ] Expired/suspended gate rules are enforced.
- [ ] Member ownership restriction is validated.
- [ ] Attendance events are auditable.

## Test Scenarios

- Valid QR check-in creates attendance entry.
- Second check-in while open entry exists returns conflict.
- Expired membership check-in returns forbidden.
- Member cannot access another member attendance history.

