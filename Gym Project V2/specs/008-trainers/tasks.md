# Tasks: 008-trainers — Trainers

Feature: 008-trainers
Input: specs/008-trainers/plan.md

## Phase 1: Domain and Persistence

- [x] T-008-001 Define Trainer entity fields (userId, bio/bioAr, specialty/specialtyAr, hireDate)
- [x] T-008-002 Add DB constraints and indexes for trainer-user mapping
- [x] T-008-003 Add migration and trainer seed fixtures

## Phase 2: Services and Validation

- [x] T-008-004 Create ITrainerService and TrainerService for CRUD-lite operations
- [x] T-008-005 Implement trainer self-update field restriction policy
- [x] T-008-006 Implement validation for hireDate and bilingual profile fields

## Phase 3: API and Authorization

- [x] T-008-007 Implement GET /api/v1/trainers
- [x] T-008-008 Implement POST /api/v1/trainers with manager/owner policy
- [x] T-008-009 Implement GET /api/v1/trainers/{id} with own-record scope support
- [x] T-008-010 Implement PATCH /api/v1/trainers/{id} with self-update restrictions
- [x] T-008-011 Apply authorization policies and safe error handling

## Phase 4: Frontend UX

- [ ] T-008-012 Add trainer models and API methods in Angular
- [ ] T-008-013 Build trainer directory and detail panels
- [ ] T-008-014 Build trainer create/edit forms with EN/AR support
- [ ] T-008-015 Add trainer self-profile view and restricted edit controls

## Phase 5: Security and Audit

- [ ] T-008-016 Emit audit logs for trainer create/update actions
- [ ] T-008-017 Log denied self-update attempts for restricted fields
- [ ] T-008-018 Harden payload validation and response safety

## Phase 6: Testing and CI

- [ ] T-008-019 Unit tests for trainer service and self-scope guards
- [ ] T-008-020 Integration tests for trainer endpoints and role matrix
- [ ] T-008-021 Frontend tests for trainer list/forms/profile edits
- [ ] T-008-022 Add CI stage for trainer module tests

## Phase 7: Documentation and Release

- [ ] T-008-023 Document trainers endpoints and permission behavior
- [ ] T-008-024 Update user-role docs for trainer profile management
- [ ] T-008-025 Add release notes and readiness checklist
