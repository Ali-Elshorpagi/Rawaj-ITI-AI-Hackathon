# Plan: 010-class-enrollment

feature: 010-class-enrollment
created: 2026-06-10
status: Ready for execution

## Summary

Deliver enrollment and session attendance lifecycle controls with trainer-scoped updates, capacity consistency, and attendance-state auditing.

## Dependencies

- Requires 009-classes session infrastructure.
- Requires 003-member-management for participant references.
- Integrates with 012-reports-dashboard for utilization metrics.

## Scope Outcomes

- Session enrollment listing complete.
- Attendance update endpoint complete.
- Role scope and capacity consistency rules complete.

## Implementation Phases

### Phase 1: Domain and Persistence

- Finalize enrollment entity and status model.

### Phase 2: Services and Validation

- Build enrollment service and transition/consistency checks.

### Phase 3: API and Authorization

- Implement session enrollments and attendance patch endpoints.

### Phase 4: Frontend UX

- Build roster and attendance marking workflows.

### Phase 5: Security and Audit

- Audit attendance state changes and denied attempts.

### Phase 6: Testing and CI

- Add role-scope and transition tests.

### Phase 7: Documentation and Release

- Publish endpoint docs and trainer runbook steps.

## Exit Criteria

- Attendance updates enforce trainer session ownership.
- Enrollment status transitions are validated.
- Capacity consistency is maintained.
