# Tasks: 005-memberships — Memberships

Feature: 005-memberships
Input: specs/005-memberships/plan.md

## Phase 1: Domain and Persistence

- [x] T-005-001 Define membership status model (Active, Expired, Frozen, Suspended) and related fields
- [x] T-005-002 Add persistence constraints for member-plan relationships and expiry dates
- [x] T-005-003 Create migration updates for lifecycle state metadata

## Phase 2: Services and Rules

- [x] T-005-004 Implement IMembershipLifecycleService and lifecycle transition methods
- [x] T-005-005 Implement renewal rule to extend from current expiry date
- [x] T-005-006 Implement status recompute logic on renewal and expiry boundaries
- [x] T-005-007 Add validation for illegal transitions and plan eligibility
- [x] T-005-008 Implement transactional coupling with payment creation flow

## Phase 3: API Integration

- [x] T-005-009 Wire membership lifecycle behavior into member renew and patch endpoints
- [x] T-005-010 Standardize transition error responses and status codes
- [x] T-005-011 Enforce role and ownership checks for lifecycle actions

## Phase 4: Frontend UX

- [x] T-005-012 Add membership state/expiry models and API integration in Angular
- [x] T-005-013 Build membership status panel with active/expired/frozen/suspended indicators
- [x] T-005-014 Add renewal action flow with method selection and confirmations
- [x] T-005-015 Add warning states for near-expiry memberships

## Phase 5: Security and Audit

- [x] T-005-016 Emit audit logs for renewals and lifecycle status transitions
- [x] T-005-017 Log denied transition attempts and policy violations

## Phase 6: Testing and CI

- [x] T-005-018 Unit tests for renewal math and transition guards
- [x] T-005-019 Integration tests for atomic renewal + payment behavior
- [x] T-005-020 Integration tests for role and ownership constraints
- [x] T-005-021 Frontend tests for renewal UX and status rendering
- [x] T-005-022 Add CI suite for membership lifecycle tests

## Phase 7: Documentation and Release

- [x] T-005-023 Document lifecycle transition matrix and examples
- [x] T-005-024 Update API docs for renew and status semantics
- [x] T-005-025 Add release notes and deployment checklist
