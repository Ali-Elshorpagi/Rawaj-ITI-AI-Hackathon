# Plan: 013-gym-settings

feature: 013-gym-settings
created: 2026-06-10
status: Ready for execution

## Summary

Deliver centralized gym configuration management with public-safe settings exposure and owner-only mutation for branding, defaults, and localization behavior.

## Dependencies

- Requires auth/role foundations from 001 and 002.
- Consumed by frontend views and onboarding flows across modules.

## Scope Outcomes

- Public settings endpoint complete.
- Owner settings read/update complete.
- Validation and propagation behavior complete.
- Settings update audit trail complete.

## Implementation Phases

### Phase 1: Domain and Persistence

- Finalize settings schema and default values.

### Phase 2: Services and Validation

- Build settings service with public/internal projection and validation.

### Phase 3: API and Authorization

- Implement public and owner settings endpoints.

### Phase 4: Frontend UX

- Build owner settings form and public settings consumption wiring.

### Phase 5: Security and Audit

- Audit setting changes and denied mutations.

### Phase 6: Testing and CI

- Add validation, authorization, and propagation tests.

### Phase 7: Documentation and Release

- Publish settings contract and governance notes.

## Exit Criteria

- Public endpoint exposes only approved non-sensitive fields.
- Owner-only update policy is enforced.
- Settings changes propagate correctly to dependent views.
