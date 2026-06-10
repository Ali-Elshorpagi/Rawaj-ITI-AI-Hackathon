# Plan: 005-memberships

feature: 005-memberships
created: 2026-06-10
status: Ready for execution

## Summary

Deliver membership lifecycle orchestration including activation, expiry, freeze/suspend semantics, and renewal behavior that extends from current expiry and couples to payment creation.

## Dependencies

- Requires 003-member-management and 004-membership-plans.
- Integrates tightly with 006-payments for renewal transaction coupling.
- Feeds eligibility decisions used by 007-attendance.

## Scope Outcomes

- Membership status model and transition rules complete.
- Renewal behavior complete with atomic update/payment coupling.
- Ownership-scoped member visibility complete.
- Lifecycle audit trail complete.

## Implementation Phases

### Phase 1: Domain and Persistence

- Finalize membership state fields and transition metadata.
- Add constraints for plan/member references.

### Phase 2: Services and Rules

- Implement lifecycle transition service and renewal logic.
- Implement expiry extension and state recalculation logic.

### Phase 3: API Integration

- Integrate lifecycle operations in member endpoints.
- Standardize transition error handling.

### Phase 4: Frontend UX

- Show membership status and expiry with clear visual cues.
- Provide authorized renewal and state actions.

### Phase 5: Security and Audit

- Audit lifecycle transitions and renewal events.

### Phase 6: Testing and CI

- Add lifecycle, rollback, and authorization tests.

### Phase 7: Documentation and Release

- Publish lifecycle matrix and renewal semantics.

## Exit Criteria

- Renewal extends from current expiry and writes payment atomically.
- Invalid lifecycle transitions are blocked.
- Attendance eligibility signals are consistent with membership state.
