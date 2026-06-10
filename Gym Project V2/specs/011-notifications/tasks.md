# Tasks: 011-notifications — Notifications

Feature: 011-notifications
Input: specs/011-notifications/plan.md

## Phase 1: Domain and Persistence

- [x] T-011-001 Define Notification entity and channel/delivery/read state fields
- [x] T-011-002 Add indexes for user inbox retrieval and read filters
- [x] T-011-003 Add migration and fixture data for delivery/read scenarios

## Phase 2: Services and Trigger Engine

- [x] T-011-004 Create INotificationService and NotificationService for inbox/send/read operations
- [x] T-011-005 Implement trigger handlers for expiry D-7, expiry D-1, overdue D+1, session cancellation
- [x] T-011-006 Implement idempotency keys or dedupe strategy for scheduler retries
- [x] T-011-007 Implement delivery outcome capture and retry scheduling hooks

## Phase 3: API and Authorization

- [x] T-011-008 Implement GET /api/v1/notifications with paging/read filter
- [x] T-011-009 Implement PATCH /api/v1/notifications/{id}/read with ownership guard
- [x] T-011-010 Implement POST /api/v1/notifications/send for manager/owner
- [x] T-011-011 Apply role and ownership policies and safe error contracts

## Phase 4: Frontend UX

- [x] T-011-012 Add notification models and API methods in Angular
- [x] T-011-013 Build user inbox view with read/unread filtering and mark-read action
- [x] T-011-014 Build manager/owner manual send form with recipient/channel controls
- [x] T-011-015 Add delivery status feedback and empty/error states

## Phase 5: Security and Audit

- [x] T-011-016 Emit audit logs for manual sends and high-impact automated runs
- [x] T-011-017 Log forbidden read/send attempts and channel errors
- [x] T-011-018 Ensure message payload validation and safe response handling

## Phase 6: Testing and CI

- [x] T-011-019 Unit tests for trigger timing and dedupe behavior
- [x] T-011-020 Integration tests for inbox/read/send ownership and role matrix
- [x] T-011-021 Integration tests for scheduler idempotency scenarios
- [x] T-011-022 Frontend tests for inbox and send workflows
- [x] T-011-023 Add CI stage for notifications module tests

## Phase 7: Documentation and Release

- [x] T-011-024 Document notifications endpoints and trigger policies
- [x] T-011-025 Update operations guide for delivery monitoring and retries
- [x] T-011-026 Add release notes and readiness checklist
