# Feature Specification: Payments

Feature: 006-payments
Created: 2026-06-10
Status: Draft

## Overview

Payments captures membership-related transactions, state progression, and overdue tracking. It supports revenue visibility and operational follow-up without online gateway processing.

## Goals

- Record payment events with full operational context.
- Enforce payment status lifecycle and overdue detection.
- Provide efficient overdue follow-up operations for staff.

## In Scope

- Payment create/list/update endpoints.
- Status transitions to Paid/Refunded.
- Overdue list retrieval and mark-as-paid flow.

## Out of Scope

- Card processor integration.
- Invoice tax engine.
- Automatic refund settlement.

## Actors and Permissions

- ReceptionStaff, Manager, Owner: create/update/list payments.
- Member: no direct mutation path.

## User Stories

- As ReceptionStaff, I can register a payment quickly while serving a member.
- As Manager, I can monitor and resolve overdue payments.
- As Owner, I can trust revenue reporting by method.

## Functional Requirements

FR-PAY-001 Payment creation
- Capture memberId, planId, amount, paymentDate, dueDate, method, optional transactionRef and notes.
- processedBy shall be derived from authenticated actor.

FR-PAY-002 Payment status model
- Status values: Pending, Paid, Overdue, Refunded.

FR-PAY-003 Status updates
- Patch endpoint allows business-approved status transitions.

FR-PAY-004 Overdue logic
- Overdue rule: dueDate < today and status = Pending.
- Overdue endpoint returns sorted/filterable data.

FR-PAY-005 List and filtering
- Support filters by member, status, and date range with pagination.

## API Contract

Base path: /api/v1/payments

- GET /api/v1/payments
- POST /api/v1/payments
- PATCH /api/v1/payments/{id}
- GET /api/v1/payments/overdue

## Validation Rules

- Amount must be positive.
- Method enum: Cash, Card, BankTransfer.
- dueDate cannot be before paymentDate unless marked by explicit policy.

## Audit and Observability

- Log create and status-change events with actor id and record diff.
- Log overdue resolution actions.

## Non-Functional Requirements

- List and overdue endpoints p95 under 300ms.
- Payment create/update operations under 1 second for normal load.
- CSV/report compatibility for downstream reporting.

## Acceptance Criteria

- [ ] Payment lifecycle states and transitions are enforced.
- [ ] Overdue endpoint follows declared overdue rule exactly.
- [ ] Authorized roles can create and update payments.
- [ ] Payment actions are auditable.

## Test Scenarios

- Create payment with valid payload returns created record.
- Invalid method enum is rejected.
- Overdue list includes only pending past-due records.
- Marking overdue payment as paid updates visibility in overdue list.

