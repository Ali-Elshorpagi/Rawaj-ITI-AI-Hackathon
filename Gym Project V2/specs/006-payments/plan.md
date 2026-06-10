# Plan: 006-payments

feature: 006-payments
created: 2026-06-10
status: Ready for execution

## Summary

Deliver payments capture and lifecycle management with overdue detection, mark-as-paid flow, and reporting-aligned transaction data.

## Dependencies

- Requires 003-member-management and 004-membership-plans references.
- Integrates with 005-memberships renewal coupling.
- Feeds 012-reports-dashboard revenue metrics.

## Scope Outcomes

- Payment creation/list/update flows complete.
- Payment status model and transition checks complete.
- Overdue detection endpoint complete.
- Audit and observability for sensitive payment actions complete.

## Implementation Phases

### Phase 1: Domain and Persistence

- Finalize payment schema, indexes, and status fields.
- Add required metadata fields for processedBy and references.

### Phase 2: Services and Rules

- Build payment service for create/update/list/overdue operations.
- Implement overdue and status transition rules.

### Phase 3: API and Authorization

- Implement payments endpoints with role policy checks.
- Ensure consistent pagination/filter contract.

### Phase 4: Frontend UX

- Build payment list, entry, and overdue workflows.
- Emphasize clear status badges and quick actions.

### Phase 5: Security and Audit

- Audit payment and status change actions.

### Phase 6: Testing and CI

- Add unit/integration/frontend tests and CI wiring.

### Phase 7: Documentation and Release

- Update API docs and reporting assumptions.

## Exit Criteria

- Overdue rule is implemented exactly as specified.
- Role policies pass for mutation and view actions.
- Payment actions are auditable and report-ready.
