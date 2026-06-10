# Tasks: 007-attendance — Attendance

Feature: 007-attendance
Input: specs/007-attendance/plan.md

## Phase 1: Domain and Persistence

- [x] T-007-001 Define Attendance entity (memberId, checkIn, checkOut, method, checkedInBy)
- [x] T-007-002 Add unique/open-attendance constraints to prevent duplicate active check-ins
- [x] T-007-003 Add indexes for member/date-range/today queries
- [x] T-007-004 Add migration and test fixtures for QR/manual scenarios

## Phase 2: Services and Rules

- [x] T-007-005 Create IAttendanceService and AttendanceService for checkin/checkout/list/today
- [x] T-007-006 Implement eligibility guard using membership status
- [x] T-007-007 Implement duplicate open-attendance detection and conflict responses
- [x] T-007-008 Implement member ownership checks for member history endpoint

## Phase 3: API and Authorization

- [x] T-007-009 Implement POST /api/v1/attendance/checkin for QR and manual payloads
- [x] T-007-010 Implement POST /api/v1/attendance/checkout
- [x] T-007-011 Implement GET /api/v1/attendance and GET /api/v1/attendance/today
- [x] T-007-012 Implement GET /api/v1/attendance/member/{memberId} ownership-scoped access
- [x] T-007-013 Apply role policies for ReceptionStaff/Manager/Owner and member self flows

## Phase 4: Frontend UX

- [x] T-007-014 Add attendance models and API client methods
- [x] T-007-015 Build check-in UI for QR token/manual member selection
- [x] T-007-016 Build attendance list with filters and date controls
- [x] T-007-017 Build member attendance history view with pagination
- [x] T-007-018 Add clear conflict/forbidden state messaging and retry affordances

## Phase 5: Security and Audit

- [x] T-007-019 Emit audit logs for manual check-in/checkout and override actions
- [x] T-007-020 Log duplicate-checkin conflicts and denied access attempts
- [x] T-007-021 Harden check-in payload validation and error safety

## Phase 6: Testing and CI

- [x] T-007-022 Unit tests for eligibility, duplicate, and checkout rules
- [x] T-007-023 Integration tests for all attendance endpoints and role matrix
- [x] T-007-024 Frontend tests for check-in/check-out/history UX
- [x] T-007-025 Add CI execution for attendance module tests

## Phase 7: Documentation and Release

- [x] T-007-026 Document attendance endpoint contracts and examples
- [x] T-007-027 Update operations runbook for front-desk check-in procedures
- [x] T-007-028 Add release notes and go-live checklist
