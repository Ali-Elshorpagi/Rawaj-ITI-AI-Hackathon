# Tasks: 002-user-management — User Management

**Feature:** User Management
**Input:** `specs/002-user-management/plan.md`

## Phase 1: Domain & Persistence

* [x] T-USER-001 Expand `User` entity fields for management use (display name(s), phone, status flags, timestamps)
* [x] T-USER-002 Add/update DB constraints and indexes for unique identity fields (email, optional username/phone policy)
* [x] T-USER-003 Add EF Core migration(s) for user-management schema updates
* [x] T-USER-004 Add seed/dev fixtures for role-aware user management testing

## Phase 2: Application Services

* [x] T-USER-005 Create `IUserService` and `UserService` for CRUD, activation/deactivation, and profile updates
* [x] T-USER-006 Create `IRoleService` and `RoleService` for role assignment/removal with policy checks
* [x] T-USER-007 Add validation rules for create/update payloads (email, phone, required names, status transitions)
* [x] T-USER-008 Add conflict handling and domain-level error contracts (duplicate email, invalid role, forbidden change)

## Phase 3: API & Authorization

* [x] T-USER-009 Implement `GET /api/v1/users` with pagination, filtering, and sorting
* [x] T-USER-010 Implement `GET /api/v1/users/:id` for user details
* [x] T-USER-011 Implement `POST /api/v1/users` for authorized user creation
* [x] T-USER-012 Implement `PUT /api/v1/users/:id` for profile updates
* [x] T-USER-013 Implement `POST /api/v1/users/:id/deactivate` and `/reactivate`
* [x] T-USER-014 Implement `POST /api/v1/users/:id/roles` and `DELETE /api/v1/users/:id/roles/:roleId`
* [x] T-USER-015 Apply RBAC policies so only authorized roles manage users/roles

## Phase 4: Frontend (Angular) User Management

* [x] T-USER-016 Create user-management data models and API client methods in Angular
* [x] T-USER-017 Build `UsersList` UI with search, filters, pagination, and status chips
* [x] T-USER-018 Build `UserForm` for create/edit with validation feedback
* [x] T-USER-019 Build role-management controls in user details view
* [x] T-USER-020 Add deactivate/reactivate actions with confirmations and optimistic refresh
* [x] T-USER-021 Protect user-management routes via auth guard + role guard

## Phase 5: Security, Audit & Observability

* [x] T-USER-022 Add audit logs for create/update/deactivate/reactivate and role changes
* [x] T-USER-023 Add structured logs for denied authorization attempts on user management endpoints
* [x] T-USER-024 Add endpoint protections (input hardening, safe error messages, request throttling where needed)

## Phase 6: Tests & CI

* [x] T-USER-025 Unit tests for `UserService` and `RoleService`
* [x] T-USER-026 API integration tests for user CRUD + role assignment authorization matrix
* [x] T-USER-027 Frontend unit tests for user list/filter/forms/role actions
* [x] T-USER-028 Add CI steps for user-management test suites

## Phase 7: Documentation & Release

* [x] T-USER-029 Document user-management endpoints in API docs/OpenAPI notes
* [x] T-USER-030 Update project docs with user-management flows and permissions matrix
* [x] T-USER-031 Add release notes for user-management feature delivery

## Notes
- Follow existing auth and RBAC conventions from `001-gymdesk` implementation.
- UI styling direction: use `#618764`, `#2B5748`, and black (`#000000`) with a polished, fancy, and accessible design.
