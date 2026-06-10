# Feature Specification: Gym Settings

Feature: 013-gym-settings
Created: 2026-06-10
Status: Draft

## Overview

Gym Settings defines public-facing and owner-managed configuration for gym identity, branding, operational defaults, and localization preferences consumed across the platform.

## Goals

- Provide safe public access to non-sensitive gym metadata.
- Allow owners to manage brand and configuration values centrally.
- Ensure setting updates propagate consistently through UI and APIs.

## In Scope

- Public settings endpoint.
- Owner settings read/update endpoints.
- Core fields: gym name, logo URL, working hours, currency, default language.

## Out of Scope

- File storage backend implementation details for media uploads.
- Multi-brand tenant profile support.

## Actors and Permissions

- Guest: read public settings only.
- Owner: full settings read/update control.
- Other authenticated roles: no mutation rights.

## User Stories

- As Guest, I can view gym identity and operating information.
- As Owner, I can update branding and language defaults.
- As Staff, I see consistent settings application across pages.

## Functional Requirements

FR-SET-001 Public settings read
- Public endpoint returns non-sensitive fields for landing/member-facing surfaces.

FR-SET-002 Owner settings read
- Owner endpoint returns full configurable settings payload.

FR-SET-003 Owner settings update
- Owner can patch gymName, logoUrl, hours, currency, and language fields.

FR-SET-004 Propagation behavior
- Updates should propagate to relevant pages and new sessions.

FR-SET-005 Localization default
- Default language applies to new user sessions.

## API Contract

Base path: /api/v1/settings

- GET /api/v1/settings/public
- GET /api/v1/settings
- PATCH /api/v1/settings

## Validation Rules

- language enum constrained to supported languages.
- currency code must be valid configured code.
- logoUrl must be valid URL format where required.
- working hours format must pass business validation.

## Audit and Observability

- Log owner settings updates with actor and before/after snapshot.
- Log invalid update attempts and authorization denials.

## Non-Functional Requirements

- Settings read endpoints p95 under 300ms.
- Settings updates should be reflected without full application restart.
- All settings forms must be keyboard accessible and EN/AR ready.

## Acceptance Criteria

- [ ] Public endpoint exposes only approved non-sensitive fields.
- [ ] Owner-only policy enforced for update endpoint.
- [ ] Settings updates persist and propagate correctly.
- [ ] Update actions are audited.

## Test Scenarios

- Guest can fetch public settings without authentication.
- Non-owner patch attempt returns forbidden.
- Owner updates default language and new session receives new default.
- Invalid currency code or malformed logo URL is rejected.

