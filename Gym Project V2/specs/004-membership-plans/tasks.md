# Tasks: 004-membership-plans — Membership Plans

Feature: 004-membership-plans
Input: specs/004-membership-plans/plan.md

## Phase 1: Domain and Persistence

- [x] T-004-001 Define MembershipPlan entity fields (name, nameAr, billingCycle, durationDays, price, features, isActive)
- [x] T-004-002 Add indexes/constraints for plan lookup and soft-delete behavior
- [x] T-004-003 Add EF Core migration for plans schema
- [x] T-004-004 Seed baseline plans (monthly/quarterly/annual) for development

## Phase 2: Services and Validation

- [x] T-004-005 Create IPlanService and PlanService for list/create/update/deactivate
- [x] T-004-006 Implement billing cycle and duration validation rules
- [x] T-004-007 Implement positive price and features schema validation
- [x] T-004-008 Add domain error contracts for invalid or forbidden plan transitions

## Phase 3: API and Authorization

- [x] T-004-009 Implement GET /api/v1/plans for authenticated catalog access
- [x] T-004-010 Implement POST /api/v1/plans restricted to owner role
- [x] T-004-011 Implement PATCH /api/v1/plans/{id} with owner-only policy
- [x] T-004-012 Implement DELETE /api/v1/plans/{id} as soft deactivation
- [x] T-004-013 Add endpoint-level authorization and validation filters

## Phase 4: Frontend UX

- [x] T-004-014 Add plan models and API methods in Angular
- [x] T-004-015 Build plan list and owner admin forms for create/edit/deactivate
- [x] T-004-016 Add validation feedback for price/duration/features fields
- [x] T-004-017 Add status chips and assignment eligibility cues in UI

## Phase 5: Security and Audit

- [x] T-004-018 Emit audit logs for create/update/deactivate plan actions
- [x] T-004-019 Add structured logging for non-owner mutation attempts
- [x] T-004-020 Ensure safe error responses for malformed feature payloads

## Phase 6: Testing and CI

- [x] T-004-021 Unit tests for plan service and validation rules
- [x] T-004-022 Integration tests for owner-only policies and soft deactivation
- [x] T-004-023 Frontend tests for plan form/table behavior
- [x] T-004-024 Add CI checks for membership-plans module

## Phase 7: Documentation and Release

- [x] T-004-025 Document plans endpoints and payload examples
- [x] T-004-026 Update role-permissions docs for plan governance
- [x] T-004-027 Add release notes and readiness checklist
