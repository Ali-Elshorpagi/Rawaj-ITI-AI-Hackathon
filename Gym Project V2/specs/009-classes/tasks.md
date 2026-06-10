# Tasks: 009-classes — Classes

Feature: 009-classes
Input: specs/009-classes/plan.md

## Phase 1: Domain and Persistence

- [x] T-009-001 Define Class entity fields (name/nameAr, category, location, durationMinutes, trainerId)
- [x] T-009-002 Define ClassSession entity fields (classId, startTime, endTime, maxCapacity, status)
- [x] T-009-003 Add indexes/constraints for class and session queries
- [x] T-009-004 Add migration and seed fixtures for classes and sessions

## Phase 2: Services and Validation

- [x] T-009-005 Create IClassService and ClassService for class/session workflows
- [x] T-009-006 Implement schedule validation (endTime > startTime, duration and overlap checks)
- [x] T-009-007 Implement capacity validation and status transition guards
- [x] T-009-008 Validate trainer assignment references

## Phase 3: API and Authorization

- [x] T-009-009 Implement GET /api/v1/classes
- [x] T-009-010 Implement POST /api/v1/classes
- [x] T-009-011 Implement PATCH /api/v1/classes/{id}
- [x] T-009-012 Implement GET /api/v1/classes/{id}/sessions with date/status filters
- [x] T-009-013 Implement POST /api/v1/classes/{id}/sessions
- [x] T-009-014 Apply manager/owner mutation policies and scoped read behavior

## Phase 4: Frontend UX

- [x] T-009-015 Add class/session models and API methods in Angular
- [] T-009-016 Build class list/detail views with trainer and category metadata
- [] T-009-017 Build create/edit class forms with validation feedback
- [] T-009-018 Build session scheduling UI with capacity/time controls
- [] T-009-019 Add responsive calendar/list states and conflict messages

## Phase 5: Security and Audit

- [] T-009-020 Emit audit logs for class/session create/update/cancel actions
- [] T-009-021 Log forbidden mutations and validation failures
- [] T-009-022 Ensure safe output/error responses

## Phase 6: Testing and CI

- [] T-009-023 Unit tests for schedule, capacity, and assignment validation
- [] T-009-024 Integration tests for class/session endpoints and role matrix
- [] T-009-025 Frontend tests for class forms and scheduling flows
- [] T-009-026 Add CI stage for classes module tests

## Phase 7: Documentation and Release

- [] T-009-027 Document classes and sessions endpoints with examples
- [] T-009-028 Update operational docs for schedule management
- [] T-009-029 Add release notes and sign-off checklist
