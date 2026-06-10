# GymDesk — Project Constitution

> This constitution governs all development decisions for GymDesk.
> Every specification, plan, and implementation must comply with these principles.

---

## Article I: Code Quality Standards

All code must be readable, maintainable, and testable by any developer on the team.

- Functions and methods must do one thing only (Single Responsibility)
- No magic numbers or strings — use named constants and enums
- All public APIs must be documented with JSDoc / XML doc comments
- No commented-out dead code in commits — delete it or open an issue

## Article II: Testing Standards

Testing is non-negotiable and happens before or alongside implementation.

- Minimum 80% unit test coverage for business logic (auth, payments, memberships)
- Every API endpoint must have at least one integration test
- QR check-in engine and notification service require end-to-end tests
- All tests must be runnable with a single command (`npm test` / `dotnet test`)
- No test may depend on external network or shared mutable state

## Article III: User Experience Consistency

The UI must feel like one coherent product across all roles and screens.

- Use a single shared component library — no one-off bespoke UI components
- All forms must have consistent validation feedback (inline, not alert dialogs)
- Loading, empty, and error states are required for every data-fetching view
- Mobile-first: every screen must be fully usable on a 375px wide viewport
- Arabic and English must be visually identical in layout — RTL support is first-class

## Article IV: Performance Requirements

- Initial page load (LCP) must be under 2.5 seconds on a 4G connection
- API responses for list endpoints must return within 300ms at p95
- QR check-in scan-to-confirmation must complete in under 1 second
- Dashboard reports must not block the UI — use background loading

## Article V: Security & Access Control

- RBAC is enforced server-side on every request — never trust client roles
- All passwords must be hashed with bcrypt (cost factor ≥ 12)
- JWT tokens expire in 8 hours; refresh tokens expire in 30 days
- All member PII (name, phone, photo) is only accessible to authorized roles
- Audit log entries are immutable — no UPDATE or DELETE on AuditLogs

## Article VI: Simplicity Over Cleverness

- Solve the stated problem; do not build for imagined future requirements
- Prefer standard library / framework features over third-party packages
- If a solution needs a lengthy comment to explain it, simplify the solution
- Maximum 3 layers of abstraction (controller → service → repository)

## Article VII: Bilingual Requirements

- Every user-facing string must have both English and Arabic variants
- Date, currency, and number formatting must respect `preferred_language`
- RTL layout must be triggered by `dir="rtl"` on the root element — no CSS hacks
- Arabic content must use an Arabic-optimized font (Almarai or IBM Plex Sans Arabic)

## Article VIII: Amendment Process

Changes to this constitution require:

1. A written rationale explaining why the principle needs to change
2. Review by at least one other team member
3. A note in this file with the date and reason for the amendment

---

*Created: 2026-06-09 | Project: GymDesk — Small Gym Management System*
