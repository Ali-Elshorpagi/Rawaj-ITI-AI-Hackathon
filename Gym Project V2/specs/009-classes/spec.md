# Feature Specification: Classes

Feature: 009-classes
Created: 2026-06-10
Status: Draft

## Overview

Classes defines class templates and session scheduling controls used by managers and owners to operate gym programming, assign trainers, and maintain capacity-aware schedules.

## Goals

- Manage class catalog with bilingual labels and operational metadata.
- Provide session creation and retrieval for schedule operations.
- Protect scheduling from invalid times and state transitions.

## In Scope

- Class create/list/update endpoints.
- Session list and session creation under class context.
- Trainer assignment at class level.

## Out of Scope

- Member self-booking workflow.
- Advanced recurring schedule generator.

## Actors and Permissions

- Manager/Owner: full class and session management.
- Trainer: session visibility by assignment scope.
- Member: read access where policy allows.

## User Stories

- As Manager, I can create and edit class templates.
- As Manager, I can create sessions with time and capacity.
- As Trainer, I can view my assigned sessions.

## Functional Requirements

FR-CLS-001 Class listing
- Authenticated users can list classes per policy.

FR-CLS-002 Class creation
- Manager/Owner can create class with name, category, location, duration, and trainer assignment.

FR-CLS-003 Class update
- Manager/Owner can patch editable class metadata.

FR-CLS-004 Session listing
- Return class sessions filtered by date range and status.

FR-CLS-005 Session creation
- Manager/Owner can create session with start/end and max capacity.

FR-CLS-006 Scheduling validity
- Reject invalid time windows and capacity values.

## API Contract

Base path: /api/v1/classes

- GET /api/v1/classes
- POST /api/v1/classes
- PATCH /api/v1/classes/{id}
- GET /api/v1/classes/{id}/sessions
- POST /api/v1/classes/{id}/sessions

## Validation Rules

- durationMinutes must be positive.
- endTime must be greater than startTime.
- maxCapacity must be positive integer.
- trainerId must map to existing trainer when provided.

## Audit and Observability

- Log class and session create/update actions with actor and payload diff.
- Log scheduling conflicts and rejected attempts.

## Non-Functional Requirements

- Class and session list p95 under 300ms.
- Session create action under 1 second.
- Calendar/list interfaces responsive and keyboard navigable.

## Acceptance Criteria

- [ ] Class CRUD-lite endpoints are implemented and documented.
- [ ] Session list/create behavior and filters are validated.
- [ ] Scheduling validation rules are enforced.
- [ ] Role permissions are verified across manager/owner/trainer scopes.

## Test Scenarios

- Create class with valid payload succeeds.
- Invalid start/end time ordering is rejected.
- Trainer can only query assigned session scope.
- Non-manager create attempt returns forbidden.

