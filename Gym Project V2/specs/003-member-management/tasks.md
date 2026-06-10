# Tasks: 003-member-management — Member Management

Feature: 003-member-management
Input: specs/003-member-management/plan.md

## Phase 1: Domain and Persistence

- [x] T-003-001 Define Member aggregate fields (user link, status, joinDate, emergency contact, qrToken, memberCode, isActive)
- [x] T-003-002 Add unique constraints/indexes for memberCode and key lookups
- [x] T-003-003 Implement soft-delete columns and query filters for members
- [x] T-003-004 Add EF Core migration and seed/dev fixtures for active/expired/frozen/suspended members

## Phase 2: Services and Business Rules

- [x] T-003-005 Create IMemberService and MemberService for CRUD-lite and search
- [x] T-003-006 Implement memberCode generation with collision-safe retry
- [x] T-003-007 Implement ownership checks for member self-read access
- [x] T-003-008 Add validation and domain error contracts for invalid transitions and bad payloads

## Phase 3: API and Authorization

- [x] T-003-009 Implement GET /api/v1/members with search/status/plan/page/limit filters
- [x] T-003-010 Implement POST /api/v1/members and map request/response DTOs
- [x] T-003-011 Implement GET /api/v1/members/{id} and ownership-scoped access rules
- [x] T-003-012 Implement PATCH /api/v1/members/{id} for editable profile fields
- [x] T-003-013 Implement DELETE /api/v1/members/{id} as soft delete only
- [x] T-003-014 Implement GET /api/v1/members/{id}/qr endpoint contract
- [x] T-003-015 Apply role policies: ReceptionStaff/Manager/Owner and member self-access

## Phase 4: Frontend UX

- [x] T-003-016 Add member models and API client methods in Angular
- [x] T-003-017 Build member directory table/cards with filters, paging, and status chips
- [x] T-003-018 Build create/edit member forms with validation and EN/AR field support
- [x] T-003-019 Add deactivate/reactivate and QR-view actions with confirmations
- [x] T-003-020 Ensure responsive behavior and keyboard-friendly form/list interactions

## Phase 5: Security, Audit, Observability

- [x] T-003-021 Emit audit logs for create/update/deactivate and QR retrieval access
- [x] T-003-022 Add structured logs for forbidden ownership access attempts
- [x] T-003-023 Harden inputs and safe error responses (no sensitive leakage)

## Phase 6: Testing and CI

- [x] T-003-024 Unit tests for MemberService validation and code-generation rules
- [x] T-003-025 Integration tests for member CRUD, ownership checks, and soft delete behavior
- [x] T-003-026 Frontend tests for search/filter/forms and state actions
- [x] T-003-027 Add CI pipeline target for member-management backend/frontend tests

## Phase 7: Documentation and Release

- [x] T-003-028 Document members endpoints and examples in API docs
- [x] T-003-029 Update permissions matrix and member lifecycle docs
- [x] T-003-030 Add release notes and rollout checklist
