# Plan: 007-attendance

feature: 007-attendance
created: 2026-06-10
status: Ready for execution

## Summary

Deliver robust attendance workflows for QR/manual check-in, checkout, and staff/member visibility while enforcing membership eligibility and duplicate-prevention rules.

## Dependencies

- Requires 003-member-management and 005-memberships for member eligibility state.
- Integrates with 012-reports-dashboard for attendance analytics.

## Scope Outcomes

- QR and manual check-in flows complete.
- Checkout flow complete.
- Duplicate check-in prevention complete.
- Staff and member scoped attendance visibility complete.

## Implementation Phases

### Phase 1: Domain and Persistence

- Finalize attendance record schema and indexes.
- Add constraints for open check-in uniqueness.

### Phase 2: Services and Rules

- Build attendance service for checkin/checkout/list/today.
- Enforce eligibility and duplicate conflict rules.

### Phase 3: API and Authorization

- Implement attendance endpoints and role/ownership controls.

### Phase 4: Frontend UX

- Build check-in tools, attendance list, and member history views.

### Phase 5: Security and Audit

- Audit manual operations and override attempts.

### Phase 6: Testing and CI

- Add conflict/eligibility/ownership test coverage.

### Phase 7: Documentation and Release

- Update endpoint docs and operational SOP notes.

## Exit Criteria

- Eligibility and duplicate rules are enforced server-side.
- Member can view only own attendance.
- Attendance flows meet latency targets.
