# Feature Specification: Trainers

Feature: 008-trainers
Created: 2026-06-10
Status: Draft

## Overview

Trainers defines trainer profile management and access boundaries required for scheduling, roster visibility, and trainer self-service profile maintenance.

## Goals

- Maintain complete trainer operational profiles.
- Support manager/owner governance and safe trainer self-service updates.
- Provide assignment-ready trainer data for class scheduling.

## In Scope

- Trainer create/list/read/update endpoints.
- Profile fields for bio, specialty, bilingual content, and hire date.
- Access policy for own-profile update scope.

## Out of Scope

- Payroll and compensation management.
- Trainer certification external integrations.

## Actors and Permissions

- Trainer: view own trainer profile and update permitted fields.
- Manager/Owner: full trainer management.
- Authenticated users: trainer listing read access (as currently planned).

## User Stories

- As Manager, I can onboard a trainer profile linked to a user account.
- As Trainer, I can maintain my profile details for display and scheduling context.
- As Owner, I can monitor trainer roster and keep assignment data clean.

## Functional Requirements

FR-TRN-001 Trainer creation
- Manager/Owner can create trainer records linked to user id.

FR-TRN-002 Trainer listing
- Authenticated users can list trainer records.

FR-TRN-003 Trainer detail
- Manager/Owner can access any trainer detail.
- Trainer can access own record.

FR-TRN-004 Trainer updates
- Manager/Owner can update all editable trainer fields.
- Trainer self-update restricted to approved subset.

FR-TRN-005 Assignment readiness
- Trainer records must remain valid targets for class assignment.

## API Contract

Base path: /api/v1/trainers

- GET /api/v1/trainers
- POST /api/v1/trainers
- GET /api/v1/trainers/{id}
- PATCH /api/v1/trainers/{id}

## Validation Rules

- userId must reference eligible user account.
- hireDate cannot be in the future.
- bilingual text fields must support EN/AR values.

## Audit and Observability

- Log create/update actions with actor and field diff.
- Log denied trainer self-update attempts outside permitted fields.

## Non-Functional Requirements

- Trainer list and detail p95 under 300ms.
- Profile update actions under 1 second.
- Profile UI remains accessible and bilingual-ready.

## Acceptance Criteria

- [ ] Manager/Owner and trainer self-access policies are enforced.
- [ ] Trainer create/update/list flows are documented and tested.
- [ ] Trainer update scope restrictions are verified.
- [ ] Audit logs capture sensitive changes.

## Test Scenarios

- Manager creates trainer with valid user id.
- Trainer updates allowed fields successfully.
- Trainer update to restricted field is rejected.
- Non-privileged actor cannot create trainer profile.

