# Tasks: 010-class-enrollment — Class Enrollment

Feature: 010-class-enrollment
Input: specs/010-class-enrollment/plan.md

## Phase 1: Domain and Persistence

- [ ] T-010-001 Define Enrollment entity fields and status enum (Registered, Attended, Absent, Cancelled)
- [ ] T-010-002 Add constraints for unique member-session enrollment and session linkage integrity
- [ ] T-010-003 Add indexes for session roster retrieval and status aggregates
- [ ] T-010-004 Add migration updates and seed enrollment fixtures

## Phase 2: Services and Validation

- [ ] T-010-005 Create IEnrollmentService and EnrollmentService for roster and attendance update flows
- [ ] T-010-006 Implement status transition guards and batch update validation
- [ ] T-010-007 Implement session ownership checks for trainer mutations
- [ ] T-010-008 Enforce capacity consistency and duplicate enrollment protection

## Phase 3: API and Authorization

- [ ] T-010-009 Implement GET /api/v1/sessions/{id}/enrollments
- [ ] T-010-010 Implement PATCH /api/v1/sessions/{id}/attendance
- [ ] T-010-011 Apply trainer-own-session and manager/owner policy checks
- [ ] T-010-012 Add consistent conflict/validation response contracts

## Phase 4: Frontend UX

- [ ] T-010-013 Add enrollment models and API methods in Angular
- [ ] T-010-014 Build session roster view with enrollment status indicators
- [ ] T-010-015 Build attendance marking UI with quick toggles and optimistic updates
- [ ] T-010-016 Add empty/error states and retry affordances for roster operations

## Phase 5: Security and Audit

- [ ] T-010-017 Emit audit logs for attendance updates and cancellation actions
- [ ] T-010-018 Log denied trainer ownership operations and invalid batch payloads
- [ ] T-010-019 Harden request validation and safe error messaging

## Phase 6: Testing and CI

- [ ] T-010-020 Unit tests for transition and capacity consistency logic
- [ ] T-010-021 Integration tests for roster read/attendance patch role matrix
- [ ] T-010-022 Frontend tests for roster rendering and attendance update UX
- [ ] T-010-023 Add CI module coverage for class-enrollment tests

## Phase 7: Documentation and Release

- [ ] T-010-024 Document enrollment and attendance endpoints
- [ ] T-010-025 Update trainer operations guide for attendance marking
- [ ] T-010-026 Add release notes and readiness checklist
