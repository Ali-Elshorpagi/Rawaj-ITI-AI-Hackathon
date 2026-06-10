# Feature Specification: Reports and Dashboard

Feature: 012-reports-dashboard
Created: 2026-06-10
Status: Draft

## Overview

Reports and Dashboard provides operational and financial insights for managers and owners. It includes attendance trends, revenue summaries, membership status distributions, class utilization, and export capabilities.

## Goals

- Provide trusted, role-appropriate metrics for decision making.
- Keep dashboard KPIs fresh and easy to interpret.
- Support exportable reporting for offline analysis.

## In Scope

- Report endpoints for attendance, revenue, members, and classes.
- Dashboard-level KPIs and trend views.
- Date range filtering and CSV export behavior.

## Out of Scope

- Advanced BI modeling and forecasting.
- Multi-tenant analytics segmentation.

## Actors and Permissions

- Manager: view operational and financial reports.
- Owner: full analytics access and strategic reporting.

## User Stories

- As Manager, I monitor daily attendance and expired memberships.
- As Manager, I evaluate revenue by payment method.
- As Owner, I review long-range trends to guide strategy.

## Functional Requirements

FR-REP-001 Attendance report
- Return date-bucketed attendance counts by requested range.
- Support CSV response via Accept header.

FR-REP-002 Revenue report
- Return total revenue, method breakdown, and monthly trend series.

FR-REP-003 Member report
- Return total members and status distribution, including plan-level breakdown.

FR-REP-004 Class report
- Return session counts and average utilization by class.

FR-REP-005 Dashboard metrics
- Provide today's check-ins, active count, expired count, and 30-day attendance chart.

FR-REP-006 Date range consistency
- All report endpoints shall validate and apply from/to ranges consistently.

## API Contract

Base path: /api/v1/reports

- GET /api/v1/reports/attendance
- GET /api/v1/reports/revenue
- GET /api/v1/reports/members
- GET /api/v1/reports/classes

## Validation Rules

- from and to dates are required where defined.
- to must be greater than or equal to from.
- invalid range input returns validation error.

## Audit and Observability

- Log report execution metadata: actor, endpoint, range, export mode.
- Track query latency and failure rates for report endpoints.

## Non-Functional Requirements

- p95 latency target under 300ms for cached/standard ranges; document heavy-range behavior.
- Dashboard should render within 2.5 seconds on 4G baseline.
- CSV exports must preserve Arabic text encoding.

## Acceptance Criteria

- [ ] All four report endpoints are available with role controls.
- [ ] Date range validation is consistent across endpoints.
- [ ] CSV export behavior is implemented and verified.
- [ ] Dashboard KPIs align with defined report semantics.

## Test Scenarios

- Attendance report with valid range returns date buckets.
- Revenue report includes method breakdown values.
- Invalid date range returns bad request.
- CSV export returns expected headers and UTF-compatible values.

