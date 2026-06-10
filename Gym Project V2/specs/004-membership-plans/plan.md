# Plan: 004-membership-plans

feature: 004-membership-plans
created: 2026-06-10
status: Ready for execution

## Summary

Deliver owner-governed membership plan catalog management with validated pricing, duration, feature schema, and non-retroactive behavior for active memberships.

## Dependencies

- Requires 001-gymdesk auth and role policy foundations.
- Integrates with 005-memberships and 006-payments for assignment and billing context.

## Scope Outcomes

- Plan create/list/update/deactivate flows complete.
- Feature JSON schema validation complete.
- Owner-only mutation policy complete.
- Non-retroactive plan update behavior verified.

## Implementation Phases

### Phase 1: Domain and Persistence

- Finalize MembershipPlan schema and status behavior.
- Add indexes and soft-delete pattern.

### Phase 2: Services and Validation

- Build plan service for catalog operations.
- Add billing cycle, price, duration, and features validation.

### Phase 3: API and Authorization

- Implement plans endpoints with owner mutation policy.
- Add consistent response/error contracts.

### Phase 4: Frontend UX

- Build plan catalog and owner admin workflows.
- Add create/edit/deactivate interactions and validation messaging.

### Phase 5: Security and Audit

- Audit plan changes and denied non-owner mutation attempts.

### Phase 6: Testing and CI

- Add unit/integration/frontend coverage and CI job.

### Phase 7: Documentation and Release

- Publish endpoint docs and operational policy notes.

## Exit Criteria

- Owner-only policy enforced for all mutating operations.
- Deactivated plans are not assignable.
- Existing active memberships unaffected by plan edits.
