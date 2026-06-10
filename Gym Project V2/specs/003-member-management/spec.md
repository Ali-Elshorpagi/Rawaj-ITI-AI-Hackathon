# Feature Specification: Member Management

Feature: 003-member-management
Created: 2026-06-10
Status: Draft

## Overview

Member Management defines the operational lifecycle of member profiles used by reception staff and management. It governs member identity, profile maintenance, searchability, operational status, and safe deactivation without deleting business history.

## Goals

- Keep a complete and accurate member directory with bilingual profile fields.
- Enable fast intake and profile updates for front-desk workflows.
- Preserve historical records through soft deactivation instead of hard deletion.
- Enforce strict role and ownership access controls for profile data.

## In Scope

- Member profile create, read, update, deactivate flows.
- Search/filter/sort directory behavior.
- Member code generation and uniqueness constraints.
- Member QR token retrieval endpoint contract.
- Audit events for sensitive profile changes.

## Out of Scope

- Membership plan pricing administration.
- Payment transactions and overdue logic.
- Multi-branch member tenancy.

## Actors and Permissions

- Member: view own profile and own QR only.
- ReceptionStaff: create/update/search members, retrieve QR, initiate renewal.
- Manager: all ReceptionStaff actions plus deactivation authority.
- Owner: full control.

## User Stories

- As ReceptionStaff, I can create member profiles quickly with required contact and bilingual name fields.
- As ReceptionStaff, I can search members by code, name, plan, and status.
- As Manager, I can deactivate problematic or inactive member profiles without data loss.
- As Member, I can access only my own profile and QR details.

## Functional Requirements

FR-MEM-001 Profile creation
- System shall create member records with: user reference, join date, plan reference, and emergency contact.
- Member code shall be auto-generated and unique.
- QR token shall be generated on creation.

FR-MEM-002 Profile listing and filtering
- System shall support paged member listing.
- Filters: search term, status (Active, Expired, Frozen, Suspended), plan id.
- Default page size shall be 20.

FR-MEM-003 Member detail access
- ReceptionStaff/Manager/Owner can view any member.
- Member role can view own member record only.

FR-MEM-004 Profile updates
- Authorized staff can patch editable fields with validation.
- Updates shall preserve immutable identity keys.

FR-MEM-005 Deactivation
- Deletion endpoint shall perform soft delete only.
- Soft deleted members remain visible in audit/report contexts.

FR-MEM-006 QR retrieval
- System shall provide QR token and image payload for authorized requesters.

FR-MEM-007 Renewal handoff
- Renewal invocation from member context shall call membership renewal flow.

## API Contract

Base path: /api/v1/members

- GET /api/v1/members
- POST /api/v1/members
- GET /api/v1/members/{id}
- PATCH /api/v1/members/{id}
- DELETE /api/v1/members/{id}
- GET /api/v1/members/{id}/qr
- POST /api/v1/members/{id}/renew

## Validation Rules

- Email and phone uniqueness must align with user identity policy.
- Member code uniqueness is mandatory.
- Join date cannot be in the future.
- Status transitions must be explicitly allowed by role policy.

## Audit and Observability

- Log create/update/deactivate operations with actor, member id, before/after payload.
- Log forbidden access attempts for cross-member access.

## Non-Functional Requirements

- p95 list API latency under 300ms for standard filtered queries.
- Member lookup actions should complete under 1 second in normal load.
- UI supports EN/AR labels and keyboard-only form interaction.

## Acceptance Criteria

- [ ] Member CRUD endpoints are documented and implemented.
- [ ] Soft deletion behavior is verified and no hard delete path exists.
- [ ] Ownership and role checks pass authorization matrix tests.
- [ ] QR retrieval respects role and ownership access.
- [ ] Audit logs are emitted for all sensitive actions.

## Test Scenarios

- Create member succeeds with valid payload and generates member code + qr token.
- Duplicate member code collision is handled safely.
- Member cannot fetch another member profile.
- Deactivate operation hides member from default active views.

