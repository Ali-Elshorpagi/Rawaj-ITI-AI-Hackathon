# Feature Specification: Notifications

Feature: 011-notifications
Created: 2026-06-10
Status: Draft

## Overview

Notifications defines user-facing communication flows for manual announcements and automated operational reminders, including channel routing, read-state tracking, and delivery reliability behavior.

## Goals

- Deliver timely and relevant notifications across configured channels.
- Support both manual sends and automated lifecycle triggers.
- Track delivery/read state for operational confidence.
- Prevent duplicate sends from scheduler retries.

## In Scope

- Notification list and read-state APIs.
- Manual send endpoint for manager/owner.
- Automated trigger definitions for expiry, overdue, and class cancellation.

## Out of Scope

- Marketing campaign automation.
- Advanced template designer.
- External CRM synchronization.

## Actors and Permissions

- Authenticated user: view own notifications and mark as read.
- Manager/Owner: manual targeted sends.
- System: scheduled trigger execution.

## User Stories

- As Member, I receive expiry reminders in time to renew.
- As Manager, I can push operational announcements to selected users.
- As Owner, I can rely on notification logs to track communication health.

## Functional Requirements

FR-NOT-001 Inbox listing
- Return paged own notifications with optional read filter.

FR-NOT-002 Read-state update
- Notification owner can mark individual notification as read.

FR-NOT-003 Manual send
- Manager/Owner can send notifications to specific user ids.
- Channels: Email, SMS, Push.

FR-NOT-004 Automated triggers
- Membership expiry reminders at D-7 and D-1.
- Payment overdue reminder at D+1.
- Session cancellation immediate notification.

FR-NOT-005 Delivery reliability
- Failed sends shall be logged.
- Trigger processing must be idempotent across retries.

## API Contract

Base path: /api/v1/notifications

- GET /api/v1/notifications
- PATCH /api/v1/notifications/{id}/read
- POST /api/v1/notifications/send

## Validation Rules

- send payload requires non-empty userIds and message content.
- channel enum must be Email, SMS, or Push.
- owner-only read mutation: user cannot mark others' notifications.

## Audit and Observability

- Log manual send requests with actor, recipients, channel, and outcome.
- Log automated trigger run stats and deduplication events.
- Track delivery failures by channel and reason.

## Non-Functional Requirements

- Inbox list endpoint p95 under 300ms.
- Trigger jobs should complete within operational scheduling windows.
- User-facing message operations are accessible and bilingual-ready.

## Acceptance Criteria

- [ ] Own-notification access and read marking are enforced.
- [ ] Manual send policy restricted to Manager/Owner.
- [ ] Automated trigger schedule behavior is implemented.
- [ ] Retry-safe idempotency behavior is validated.

## Test Scenarios

- Member sees only own notifications.
- Manager sends multi-recipient message successfully.
- Duplicate scheduler run does not create duplicate D-1 reminders.
- Read marking on non-owned notification is forbidden.

