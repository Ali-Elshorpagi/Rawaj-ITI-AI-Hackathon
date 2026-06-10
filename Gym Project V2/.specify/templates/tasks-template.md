---

## description: "Task list template for GymDesk feature implementation"

# Tasks: [FEATURE NAME]

**Input**: Design documents from `/specs/[###-feature-name]/`

**Prerequisites**:

* plan.md (required)
* spec.md (required)
* research.md
* data-model.md
* contracts/
* quickstart.md

**Tests**:

Tests are optional and should only be included when explicitly requested by the feature specification.

**Organization**:

Tasks are grouped by user story so that each story can be implemented, tested, and deployed independently.

---

# Format: `[ID] [P?] [Story] Description`

* **[P]** = Can run in parallel
* **[Story]** = User Story identifier (US1, US2, US3...)
* Always include exact file paths
* Follow Clean Architecture boundaries
* Use CQRS for business operations
* Use Angular feature-based structure

---

# Project Structure

## Backend

```text
backend/
└── src/
    ├── GymDesk.API/
    ├── GymDesk.Application/
    ├── GymDesk.Domain/
    ├── GymDesk.Infrastructure/
    └── GymDesk.Persistence/
```

## Frontend

```text
frontend/
└── src/
    ├── app/
    │   ├── core/
    │   ├── shared/
    │   ├── features/
    │   └── layouts/
```

## Tests

```text
tests/
├── unit/
├── integration/
└── contract/
```

---

# Phase 1: Setup

## Purpose

Initialize feature structure.

* [x] T001 Create feature folder structure
* [x] T002 Create specification documentation
* [x] T003 Configure required environment variables
* [x] T004 [P] Configure Angular feature module
* [x] T005 [P] Configure backend feature folders
* [x] T006 Update OpenAPI documentation structure

---

# Phase 2: Foundational Infrastructure

## Purpose

Build shared infrastructure required by all user stories.

⚠️ No user story implementation begins until this phase is complete.

### Backend Foundation

* [x] T007 Create domain entities in backend/src/GymDesk.Domain/Entities
* [x] T008 Configure EF Core entity mappings
* [x] T009 Create database migration
* [x] T010 Configure repositories
* [x] T011 Configure Unit of Work integration
* [x] T012 Configure MediatR handlers
* [x] T013 Configure FluentValidation validators
* [x] T014 Configure AutoMapper profiles
* [x] T015 Configure authorization policies
* [x] T016 Configure audit logging support
* [x] T017 Configure localization resources
* [x] T018 Configure error handling

### Frontend Foundation

* [x] T019 Create Angular feature routing
* [x] T020 Configure feature services
* [x] T021 Configure translation resources (EN/AR)
* [x] T022 Configure route guards
* [x] T023 Configure shared UI components

**Checkpoint:** Foundation complete. User stories may begin.

---

# Phase 3: User Story 1 - [TITLE] (Priority: P1) 🎯 MVP

## Goal

[Describe business value]

## Independent Test

[Describe how the feature can be tested independently]

### Tests (Only If Requested)

* [x] T024 [P] [US1] Create contract tests in tests/contract/
* [x] T025 [P] [US1] Create integration tests in tests/integration/
* [x] T026 [P] [US1] Create unit tests in tests/unit/

### Backend - Domain Layer

* [x] T027 [P] [US1] Create domain entities
* [x] T028 [P] [US1] Create value objects
* [x] T029 [US1] Configure entity relationships

### Backend - Application Layer

* [x] T030 [US1] Create commands
* [x] T031 [US1] Create command handlers
* [x] T032 [US1] Create queries
* [x] T033 [US1] Create query handlers
* [x] T034 [US1] Create DTOs
* [x] T035 [US1] Create validators

### Backend - Infrastructure Layer

* [x] T036 [US1] Implement repositories
* [x] T037 [US1] Implement persistence logic

### Backend - API Layer

* [x] T038 [US1] Create API endpoints
* [x] T039 [US1] Configure authorization
* [x] T040 [US1] Configure OpenAPI documentation

### Frontend

* [x] T041 [P] [US1] Create Angular models
* [x] T042 [P] [US1] Create Angular services
* [x] T043 [P] [US1] Create Angular pages
* [x] T044 [P] [US1] Create Angular components
* [x] T045 [US1] Implement forms and validation
* [x] T046 [US1] Integrate API communication
* [x] T047 [US1] Add Arabic translations
* [x] T048 [US1] Add English translations

### Finalization

* [x] T049 [US1] Add audit logging
* [x] T050 [US1] Update documentation

**Checkpoint:** User Story 1 independently deployable and testable.

---

# Phase 4: User Story 2 - [TITLE] (Priority: P2)

## Goal

[Describe business value]

## Independent Test

[Describe independent validation]

### Tests (Only If Requested)

* [x] T051 [P] [US2] Contract tests
* [x] T052 [P] [US2] Integration tests

### Implementation

* [x] T053 [P] [US2] Create domain entities
* [x] T054 [US2] Create CQRS commands and queries
* [x] T055 [US2] Implement repositories
* [x] T056 [US2] Create API endpoints
* [x] T057 [US2] Create Angular pages
* [x] T058 [US2] Create Angular components
* [x] T059 [US2] Integrate API communication
* [x] T060 [US2] Add localization support
* [x] T061 [US2] Add audit logging

**Checkpoint:** User Story 2 independently functional.

---

# Phase 5: User Story 3 - [TITLE] (Priority: P3)

## Goal

[Describe business value]

## Independent Test

[Describe independent validation]

### Tests (Only If Requested)

* [x] T062 [P] [US3] Contract tests
* [x] T063 [P] [US3] Integration tests

### Implementation

* [x] T064 [P] [US3] Create domain entities
* [x] T065 [US3] Create CQRS commands and queries
* [x] T066 [US3] Implement repositories
* [x] T067 [US3] Create API endpoints
* [x] T068 [US3] Create Angular pages
* [x] T069 [US3] Create Angular components
* [x] T070 [US3] Integrate API communication
* [x] T071 [US3] Add localization support
* [x] T072 [US3] Add audit logging

**Checkpoint:** User Story 3 independently functional.

---

# Final Phase: Polish & Cross-Cutting Concerns

## Purpose

System-wide improvements and production readiness.

* [x] T073 Review RBAC permissions
* [x] T074 Review audit logging coverage
* [x] T075 Review localization coverage
* [x] T076 Security hardening
* [x] T077 Performance optimization
* [x] T078 Code cleanup and refactoring
* [x] T079 Update API documentation
* [x] T080 Update quickstart.md
* [x] T081 Run full integration validation
* [x] T082 Run UAT validation
* [x] T083 Production readiness review

---

# Dependencies & Execution Order

## Phase Dependencies

* Setup → Foundation
* Foundation → User Stories
* User Stories → Polish

## Story Dependencies

* US1 begins after Foundation
* US2 begins after Foundation
* US3 begins after Foundation

User stories should remain independently deployable.

---

# Parallel Opportunities

## Backend

Can run in parallel:

* Domain Entities
* DTOs
* Validators
* Commands
* Queries

## Frontend

Can run in parallel:

* Models
* Services
* Components
* Translation files

## Testing

Can run in parallel:

* Contract tests
* Integration tests
* Unit tests

---

# GymDesk Development Standards

Every generated feature MUST:

* Follow Clean Architecture
* Follow CQRS with MediatR
* Use ASP.NET Core Web API
* Use PostgreSQL via EF Core
* Use UUID identifiers
* Use JWT Authentication
* Use RBAC Authorization
* Generate Audit Logs
* Support Arabic and English
* Include created_at and updated_at fields
* Include validation using FluentValidation
* Include OpenAPI documentation
* Follow Angular feature-based architecture

Constitution Alignment (every feature):

- [x] `Specification-First`: Link to a versioned spec in `/specs/` and include spec metadata.
- [x] `Reusable Components`: Tasks identify items that belong in `shared/` and create documentation stubs.
- [x] `Test-First`: Add tasks for contract/integration tests before implementation tasks where applicable.
- [x] `Integration & Observability`: Include logging/audit tasks and integration test tasks for cross-service boundaries.
- [x] `Simplicity & Compatibility`: Note any backward-incompatible changes and reference semantic versioning actions.

---

# Definition of Done

A task is complete only when:

* Code builds successfully
* Tests pass
* Validation rules are implemented
* Authorization rules are enforced
* Audit logs are generated
* API documentation is updated
* Localization is complete
* Feature is independently testable
* Documentation is updated
* Code review requirements are satisfied
