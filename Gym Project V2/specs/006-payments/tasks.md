# Tasks: 006-payments — Payments

Feature: 006-payments
Input: specs/006-payments/plan.md

## Phase 1: Domain and Persistence

- [x] T-006-001 Define Payment entity fields and status enum (Pending, Paid, Overdue, Refunded)
- [x] T-006-002 Add DB indexes for member/status/date-range and overdue queries
- [x] T-006-003 Add migration updates and development seed transactions

## Phase 2: Services and Rules

- [x] T-006-004 Create IPaymentService and PaymentService for create/list/update/overdue
- [x] T-006-005 Implement overdue detection rule (dueDate < today and status = Pending)
- [x] T-006-006 Implement status transition validation and conflict handling
- [x] T-006-007 Enforce processedBy attribution from authenticated actor context

## Phase 3: API and Authorization

- [x] T-006-008 Implement GET /api/v1/payments with filters and paging
- [x] T-006-009 Implement POST /api/v1/payments for payment entry
- [x] T-006-010 Implement PATCH /api/v1/payments/{id} for status transitions
- [x] T-006-011 Implement GET /api/v1/payments/overdue endpoint
- [x] T-006-012 Apply role policy checks for ReceptionStaff, Manager, Owner

## Phase 4: Frontend UX

- [x] T-006-013 Add payment models and API client methods in Angular
- [x] T-006-014 Build payments list with filters, paging, and status chips
- [x] T-006-015 Build payment create form with method/date/amount validation
- [x] T-006-016 Build overdue list view with mark-as-paid quick action

## Phase 5: Security and Audit

- [x] T-006-017 Emit audit logs for create/status-change actions
- [x] T-006-018 Log forbidden payment mutation attempts and suspicious transitions
- [x] T-006-019 Ensure safe error messages for invalid financial inputs

## Phase 6: Testing and CI

- [x] T-006-020 Unit tests for overdue and transition rules
- [x] T-006-021 Integration tests for payment endpoints and role authorization matrix
- [x] T-006-022 Frontend tests for forms, filters, and overdue actions
- [x] T-006-023 Add CI stage for payments module test coverage

## Phase 7: Documentation and Release

- [x] T-006-024 Document payments endpoints and payload examples
- [x] T-006-025 Update reporting data assumptions and finance workflow notes
- [x] T-006-026 Add release notes and verification checklist
