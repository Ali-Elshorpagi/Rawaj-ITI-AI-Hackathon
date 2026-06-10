# Plan: 011-notifications

feature: 011-notifications
created: 2026-06-10
status: Ready for execution

## Summary

Deliver reliable notification workflows for manual sends and automated reminders with channel routing, read tracking, and idempotent scheduler behavior.

## Dependencies

- Depends on 005-memberships, 006-payments, and 009-classes for trigger events.
- Uses auth and user identity foundations from 001 and 002.

## Scope Outcomes

- User notification inbox and read-state complete.
- Manager/owner manual send complete.
- Automated reminders (expiry, overdue, cancellation) complete.
- Delivery failure and deduplication observability complete.

## Implementation Phases

### Phase 1: Domain and Persistence

- Finalize notification entity, channel enum, delivery state fields.

### Phase 2: Services and Trigger Engine

- Build notification service and scheduler handlers.
- Add idempotent trigger processing rules.

### Phase 3: API and Authorization

- Implement inbox/read/send endpoints with owner/manager controls.

### Phase 4: Frontend UX

- Build inbox list/read interactions and manual send panel.

### Phase 5: Security and Audit

- Audit manual sends and sensitive notification events.

### Phase 6: Testing and CI

- Add trigger idempotency and ownership tests.

### Phase 7: Documentation and Release

- Publish channel policy, trigger schedule, and operational playbook.

## Exit Criteria

- Automated trigger windows behave as specified.
- Duplicate scheduler runs do not duplicate messages.
- Ownership and role restrictions are enforced.
