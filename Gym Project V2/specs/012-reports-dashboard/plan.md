# Plan: 012-reports-dashboard

feature: 012-reports-dashboard
created: 2026-06-10
status: Ready for execution

## Summary

Deliver role-scoped reporting and dashboard insights for attendance, revenue, member status, and class utilization with consistent date-range filtering and CSV export behavior.

## Dependencies

- Aggregates data from 003 through 011 modules.
- Requires stable auth/role controls from 001 and 002.

## Scope Outcomes

- Attendance/revenue/member/class reports complete.
- Dashboard KPI cards and trend widgets complete.
- CSV export support complete.
- Report performance and reliability telemetry complete.

## Implementation Phases

### Phase 1: Data Aggregation and Persistence Strategy

- Define report query projections and aggregation contracts.

### Phase 2: Services and Query Logic

- Build report service with range validation and metric semantics.

### Phase 3: API and Authorization

- Implement report endpoints with manager/owner access policy.

### Phase 4: Frontend Dashboard UX

- Build dashboard cards, chart/table views, filters, and export actions.

### Phase 5: Security and Observability

- Log report execution metadata and performance telemetry.

### Phase 6: Testing and CI

- Add report correctness, range validation, and export tests.

### Phase 7: Documentation and Release

- Publish metric definitions, endpoint docs, and dashboard usage notes.

## Exit Criteria

- Report semantics match specification definitions.
- Date range validation consistent across endpoints.
- Dashboard renders within target performance baseline.
