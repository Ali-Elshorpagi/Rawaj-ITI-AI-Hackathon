# Feature Specification: Class Enrollment

Feature: 010-class-enrollment
Created: 2026-06-10
Status: Draft

## Overview

Class Enrollment defines participant lifecycle within class sessions, including registration visibility, attendance status changes, capacity controls, and cancellation/absence outcomes.

## Goals

- Keep session participant state accurate and auditable.
- Enforce capacity and duplicate enrollment constraints.
- Enable trainer-led attendance marking with management oversight.

## In Scope

- Session enrollment listing endpoint behavior.
- Session attendance status patching.
- Enrollment state model and transition rules.

## Out of Scope

- Public class booking portal.
- Waitlist auto-promotion automation.

## Actors and Permissions

- Trainer: manage attendance on assigned sessions.
- Manager/Owner: full enrollment and attendance control.
- Member: read participation where policy exposes it.

## User Stories

- As Trainer, I can mark attendees as attended or absent quickly.
- As Manager, I can review enrollment health and utilization.
- As Owner, I can trust utilization metrics derived from enrollment states.

## Functional Requirements

FR-ENR-001 Enrollment visibility
- Session enrollment list endpoint returns members and current enrollment status.

FR-ENR-002 Attendance updates
- Attendance patch endpoint supports Attended and Absent updates by enrollment id.

FR-ENR-003 Role scope
- Trainer updates restricted to own assigned sessions.
- Manager/Owner can update any session enrollment attendance.

FR-ENR-004 Capacity consistency
- Enrollment count cannot exceed session max capacity.
- Duplicate enrollment for same member and session is disallowed.

FR-ENR-005 Status model
- Enrollment statuses include Registered, Attended, Absent, Cancelled.

## API Contract

Base path: /api/v1/sessions

- GET /api/v1/sessions/{id}/enrollments
- PATCH /api/v1/sessions/{id}/attendance

## Validation Rules

- updates payload must contain valid enrollment ids.
- status transitions must follow allowed states.
- update operation should reject mismatched session/enrollment association.

## Audit and Observability

- Log attendance updates with actor, session id, and changed statuses.
- Log rejected attempts due to role/scope violations.

## Non-Functional Requirements

- Attendance patch should complete under 1 second for typical batch sizes.
- Enrollment list endpoint p95 under 300ms.
- UI supports high-frequency marking without accidental duplicate submissions.

## Acceptance Criteria

- [ ] Enrollment list returns correct participants and statuses.
- [ ] Attendance patch enforces role and session ownership constraints.
- [ ] Capacity and duplicate protections are validated.
- [ ] Attendance changes are audited.

## Test Scenarios

- Trainer marks attendees on own session successfully.
- Trainer marking attendance on unassigned session is forbidden.
- Invalid enrollment id in update batch is rejected safely.
- Duplicate enrollment creation path is blocked.

