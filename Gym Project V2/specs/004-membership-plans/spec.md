# Feature Specification: Membership Plans

Feature: 004-membership-plans
Created: 2026-06-10
Status: Draft

## Overview

Membership Plans defines the catalog of offerings that members can subscribe to, including billing cycle, duration, pricing, and optional plan features. The feature is owner-governed and must preserve historical consistency for existing memberships.

## Goals

- Allow owners to manage plan catalog safely.
- Keep plan price and duration definitions consistent.
- Prevent retroactive disruption of active memberships.

## In Scope

- Plan create/list/update/deactivate endpoints.
- Feature JSON structure and validation.
- Ownership-only administration policy.

## Out of Scope

- Payment processing and settlement.
- Renewal transaction posting.
- Promotions or coupon engine.

## Actors and Permissions

- Owner: full create/edit/deactivate control.
- Authenticated users: read-only plan listing.

## User Stories

- As Owner, I can define monthly, quarterly, and annual plans.
- As Owner, I can update pricing for future assignments without mutating active memberships.
- As staff, I can list available plans to assign members correctly.

## Functional Requirements

FR-PLAN-001 Plan listing
- All authenticated users can list active and visible plans.

FR-PLAN-002 Plan creation
- Owner can create plan with bilingual names, billing cycle, duration days, price, features.

FR-PLAN-003 Plan updates
- Owner can patch plan fields with validation.
- System shall preserve historical references for existing memberships.

FR-PLAN-004 Plan deactivation
- Owner can soft deactivate plan.
- Deactivated plans cannot be assigned to new memberships.

FR-PLAN-005 Feature schema
- Features JSON supports gym_access, locker_access, personal_training_sessions.

## API Contract

Base path: /api/v1/plans

- GET /api/v1/plans
- POST /api/v1/plans
- PATCH /api/v1/plans/{id}
- DELETE /api/v1/plans/{id}

## Validation Rules

- Billing cycle enum: Monthly, Quarterly, Annual.
- Duration days must be positive.
- Price must be positive decimal.
- Name and nameAr cannot both be empty.

## Audit and Observability

- Log plan creation, updates, and deactivation with actor and diff payload.
- Log forbidden non-owner attempts.

## Non-Functional Requirements

- Plan list endpoint p95 under 300ms.
- Update actions complete under 1 second in normal load.
- Bilingual fields display correctly in EN/AR views.

## Acceptance Criteria

- [ ] Owner-only policy enforced for mutating endpoints.
- [ ] Plan update does not retroactively alter active membership records.
- [ ] Feature schema validation rejects malformed payloads.
- [ ] Soft-deactivated plan is not assignable.

## Test Scenarios

- Create valid annual plan succeeds.
- Non-owner create attempt returns forbidden.
- Plan deactivation prevents new assignment.
- Existing memberships keep original plan snapshot semantics.

