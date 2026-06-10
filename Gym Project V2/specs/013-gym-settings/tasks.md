# Tasks: 013-gym-settings — Gym Settings

Feature: 013-gym-settings
Input: specs/013-gym-settings/plan.md

## Phase 1: Domain and Persistence

- [ ] T-013-001 Define GymSettings entity fields (gymName, logoUrl, workingHours, currency, defaultLanguage)
- [ ] T-013-002 Add migration and seed default settings record
- [ ] T-013-003 Add indexes/constraints for settings lookup and uniqueness

## Phase 2: Services and Validation

- [ ] T-013-004 Create ISettingsService and SettingsService for public/internal projections
- [ ] T-013-005 Implement validation for currency, language, workingHours format, and logoUrl
- [ ] T-013-006 Implement propagation hooks for settings cache/session defaults

## Phase 3: API and Authorization

- [ ] T-013-007 Implement GET /api/v1/settings/public exposing only safe fields
- [ ] T-013-008 Implement GET /api/v1/settings for owner view
- [ ] T-013-009 Implement PATCH /api/v1/settings with owner-only policy
- [ ] T-013-010 Apply consistent validation and safe error responses

## Phase 4: Frontend UX

- [ ] T-013-011 Add settings models and API client methods in Angular
- [ ] T-013-012 Build owner settings form with clear section grouping and validation feedback
- [ ] T-013-013 Wire public settings consumption for branding/default display
- [ ] T-013-014 Ensure responsive and accessible settings page interactions

## Phase 5: Security and Audit

- [ ] T-013-015 Emit audit logs for owner settings changes with before/after payloads
- [ ] T-013-016 Log forbidden settings mutation attempts
- [ ] T-013-017 Harden payload validation and output projection safety

## Phase 6: Testing and CI

- [ ] T-013-018 Unit tests for settings validation and projection logic
- [ ] T-013-019 Integration tests for public/owner endpoint behavior and authorization
- [ ] T-013-020 Frontend tests for settings form and validation UX
- [ ] T-013-021 Add CI stage for gym-settings module tests

## Phase 7: Documentation and Release

- [ ] T-013-022 Document settings endpoints and field semantics
- [ ] T-013-023 Update operations docs for branding and language defaults
- [ ] T-013-024 Add release notes and readiness checklist
