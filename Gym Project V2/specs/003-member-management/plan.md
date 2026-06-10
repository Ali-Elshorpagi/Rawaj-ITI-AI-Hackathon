# Plan: 003-member-management

feature: 003-member-management
created: 2026-06-10
status: Ready for execution

## Summary

Deliver member directory management with secure role-based access, soft deactivation, QR retrieval support, and operationally fast list/search behavior.

## Dependencies

- Requires 001-gymdesk auth and RBAC foundations.
- Requires 002-user-management for user identity linkage and manager/owner policy behavior.

## Scope Outcomes

- Member create/read/update/deactivate workflow complete.
- Search/filter/pagination complete for member directory.
- Ownership-restricted member self-read behavior complete.
- QR retrieval endpoint contract complete.
- Audit and authorization-denial observability complete.

## Implementation Phases

### Phase 1: Domain and Persistence

- Finalize Member entity fields and constraints.
- Implement unique member code generation policy.
- Add migrations, indexes, and soft-delete strategy.

### Phase 2: Services and Business Rules

- Build member service for create/read/update/deactivate.
- Implement search/filter paging service API.
- Add ownership and role rule enforcement.

### Phase 3: API and Authorization

- Implement members endpoints and DTO contracts.
- Apply role/ownership authorization checks.
- Standardize errors and status codes.

### Phase 4: Frontend UX

- Build member list/details/create-edit workflows.
- Add status badges, filter controls, and quick actions.
- Ensure EN/AR fields and responsive layout.

### Phase 5: Security, Audit, Observability

- Emit audit logs for sensitive actions.
- Add structured logging for denied access and conflicts.

### Phase 6: Testing and CI

- Add unit/integration/frontend tests.
- Add CI stage coverage and regression checks.

### Phase 7: Documentation and Release

- Update API docs, permission matrix, and release notes.

## Exit Criteria

- All functional requirements in spec are implemented and tested.
- Authorization matrix passes for Member/Reception/Manager/Owner paths.
- No hard-delete path exists for members.
