# Tasks: 012-reports-dashboard — Reports and Dashboard

Feature: 012-reports-dashboard
Input: specs/012-reports-dashboard/plan.md

## Phase 1: Data Aggregation and Persistence Strategy

- [ ] T-012-001 Define report projection contracts for attendance, revenue, members, and classes
- [ ] T-012-002 Define dashboard KPI query contracts and refresh strategy
- [ ] T-012-003 Add indexes/materialization strategy needed for report performance

## Phase 2: Services and Query Logic

- [ ] T-012-004 Create IReportsService and ReportsService for all report aggregations
- [ ] T-012-005 Implement date-range validation and normalization helpers
- [ ] T-012-006 Implement attendance aggregation and bucket formatting
- [ ] T-012-007 Implement revenue totals, method split, and monthly trend logic
- [ ] T-012-008 Implement member status and plan distribution aggregations
- [ ] T-012-009 Implement class utilization aggregation logic

## Phase 3: API and Authorization

- [ ] T-012-010 Implement GET /api/v1/reports/attendance with CSV option
- [ ] T-012-011 Implement GET /api/v1/reports/revenue
- [ ] T-012-012 Implement GET /api/v1/reports/members
- [ ] T-012-013 Implement GET /api/v1/reports/classes
- [ ] T-012-014 Apply manager/owner access policies and consistent error contracts

## Phase 4: Frontend Dashboard UX

- [ ] T-012-015 Add report models and API methods in Angular
- [ ] T-012-016 Build dashboard KPI cards for check-ins/active/expired metrics
- [ ] T-012-017 Build attendance and revenue trend widgets with date filters
- [ ] T-012-018 Build member/class report tables and CSV export interactions
- [ ] T-012-019 Implement responsive and accessible dashboard layout behavior

## Phase 5: Security and Observability

- [ ] T-012-020 Log report execution metadata (actor, endpoint, range, export mode)
- [ ] T-012-021 Capture report latency/failure telemetry for observability
- [ ] T-012-022 Ensure safe handling of large-range and invalid-range requests

## Phase 6: Testing and CI

- [ ] T-012-023 Unit tests for metric aggregation and range validation helpers
- [ ] T-012-024 Integration tests for report endpoint correctness and authorization
- [ ] T-012-025 Integration tests for CSV export headers and encoding behavior
- [ ] T-012-026 Frontend tests for dashboard widgets, filters, and export actions
- [ ] T-012-027 Add CI stage for reports/dashboard module tests

## Phase 7: Documentation and Release

- [ ] T-012-028 Document report endpoints and metric definitions
- [ ] T-012-029 Update dashboard user guide and interpretation notes
- [ ] T-012-030 Add release notes and readiness checklist
