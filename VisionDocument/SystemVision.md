# GymDesk System Vision Document

Version: 1.0
Date: 2026-06-10
Status: Draft for alignment and execution

## 1. Vision Statement

GymDesk will be the trusted operating system for small and mid-sized gyms, replacing fragmented manual workflows with a secure, bilingual, role-aware digital platform that makes daily operations faster, clearer, and more profitable.

## 2. Mission

Deliver a modern web platform that helps gym teams run memberships, attendance, payments, classes, notifications, and reporting from one reliable source of truth, while providing members with transparent self-service access to their own status and activity.

## 3. Problem and Opportunity

### Current Problems

- Manual tracking of memberships and renewals leads to errors and missed revenue.
- Attendance logging is inconsistent and difficult to audit.
- Payment status is hard to monitor, especially overdue accounts.
- Trainer schedules and class attendance are difficult to coordinate.
- Management lacks timely, actionable metrics.
- Bilingual operations are often poorly supported by existing tools.

### Opportunity

- Standardize core gym operations in a single platform.
- Reduce operational friction through role-specific workflows.
- Improve revenue capture through renewal and overdue visibility.
- Increase member satisfaction with faster check-in and self-visibility.
- Enable data-driven decisions with built-in analytics and exports.

## 4. Product Vision Pillars

### Pillar 1: Operational Clarity

Every critical process should be explicit, traceable, and auditable.

### Pillar 2: Secure Role-Driven Access

Access and actions are controlled by server-enforced RBAC with clear boundaries.

### Pillar 3: Fast Frontline Workflows

Reception and trainer flows prioritize speed, low friction, and minimal clicks.

### Pillar 4: Member Transparency

Members can always view their own status, attendance, and key reminders.

### Pillar 5: Bilingual by Design

English and Arabic support, including RTL behavior, is a first-class requirement.

### Pillar 6: Insight to Action

Managers and owners get operational and financial signals that drive decisions.

## 5. Strategic Outcomes

### Business Outcomes

- Reduce avoidable membership churn from missed renewal follow-ups.
- Increase on-time collections and overdue recovery.
- Improve staff productivity by digitizing repetitive admin work.
- Improve retention through consistent member communication.

### Operational Outcomes

- Establish one source of truth for members, payments, and attendance.
- Reduce manual reconciliation between paper, spreadsheets, and ad hoc tools.
- Improve accountability through audit logs and action history.

### Experience Outcomes

- Front desk check-in experience feels near-instant.
- Staff can complete common actions in predictable flows.
- Members trust the platform as the current record for their activity.

## 6. Personas and Core Needs

### Guest

- Needs pricing and class visibility before joining.
- Needs simple call-to-action to convert.

### Member

- Needs real-time subscription status and expiry awareness.
- Needs easy check-in and personal attendance history.
- Needs timely, non-spam reminder notifications.

### ReceptionStaff

- Needs rapid member search and profile updates.
- Needs payment entry and overdue follow-up tools.
- Needs manual check-in fallback when scanning is unavailable.

### Trainer

- Needs clear weekly session schedule.
- Needs roster visibility and fast attendance marking.

### Manager

- Needs live operational dashboard and staffing controls.
- Needs class scheduling, cancellation, and reporting.

### Owner

- Needs full control over plans, settings, users, and analytics.
- Needs confidence in governance, security, and business metrics.

## 7. Product Scope Direction

### In Scope (Current Product Direction)

- Authentication, sessions, password flows, and token security.
- User management and role administration.
- Member lifecycle, plan assignment, and renewal.
- Payment tracking with overdue logic.
- Attendance check-in/checkout (QR and manual).
- Trainer, class, session, and session attendance workflows.
- Notifications (manual and automated triggers).
- Reports, exports, and owner analytics views.
- Public and owner-controlled settings.

### Out of Scope (Current MVP Direction)

- Native mobile applications.
- Multi-branch or franchise hierarchy support.
- Equipment inventory and maintenance workflows.
- Online payment gateway processing.
- Member self-booking for classes.
- MFA and social login.

## 8. System Capability Map

### Platform Foundation

- Identity and access management.
- Session lifecycle control.
- Audit logging and structured operational logs.

### Core Operations

- User and role administration.
- Member and membership operations.
- Payment lifecycle operations.
- Attendance operations.
- Scheduling and class operations.

### Engagement and Communication

- Direct and automated notifications.
- Public profile and branded settings.

### Intelligence Layer

- Attendance, revenue, member, and utilization reports.
- Dashboard metrics and trend visualization.

## 9. Guiding Principles

- Security first: authorization and token safety are non-negotiable.
- Server is source of truth: business rules and access checks are enforced backend-first.
- Audit by default: sensitive operations are logged with actor and change context.
- Performance for frontline tasks: check-in and common list views must remain fast.
- Progressive extensibility: architecture should enable future modules without rewrites.
- Practical elegance: UI should be polished, accessible, and predictable.

## 10. Success Metrics and KPIs

### Product and Adoption

- Active gyms onboarded and retained.
- Weekly active staff users by role.
- Member portal usage for status and attendance views.

### Operational Efficiency

- Median time to perform manual check-in.
- Median time to record payment.
- Share of overdue payments resolved within defined period.

### Reliability and Quality

- API p95 latency for list endpoints.
- Check-in transaction completion time.
- Failed notification rate and retry success rate.

### Business Impact

- Renewal completion rate before and after expiry reminder automation.
- Revenue trend accuracy and reporting trust from leadership users.
- Reduction in data correction incidents over time.

## 11. Target Architecture Direction

### Technology Direction

- Backend: .NET API with explicit module boundaries.
- Frontend: Angular web application with responsive design.
- Persistence: relational schema with explicit status/lifecycle fields.

### Architectural Expectations

- API-first contracts with stable module boundaries.
- Clear separation of domain logic, transport models, and persistence concerns.
- Test-first behavior for critical flows and role matrix scenarios.
- Observability hooks for security and audit-sensitive operations.

## 12. Security and Trust Commitments

- Enforce HTTPS in production.
- Hash passwords with strong work factor.
- Use short-lived access tokens and rotating refresh tokens.
- Store refresh token hashes, never raw token material.
- Enforce CSRF controls for cookie-based refresh/logout flows when enabled.
- Apply least-privilege data access by role and use case.

## 13. Experience and Design Direction

- Visual identity follows established palette and polished presentation goals.
- Bilingual support includes full RTL behavior for Arabic.
- Accessibility baseline targets WCAG 2.1 AA for public/member-facing surfaces.
- Interface patterns prioritize readability, speed, and low cognitive overhead.

## 14. Delivery Phasing Vision

### Phase A: Foundation and Trust

- Authentication, sessions, core RBAC, and user management.

### Phase B: Revenue and Access Operations

- Members, plans, payments, and attendance workflows.

### Phase C: Program and Staff Coordination

- Trainers, classes, sessions, and session attendance.

### Phase D: Intelligence and Governance

- Reporting, analytics, settings, and expanded observability.

## 15. Risks and Mitigations

### Risk: Requirement Drift Across Modules

- Mitigation: maintain one consolidated requirement baseline and trace stories to APIs.

### Risk: Authorization Regressions

- Mitigation: enforce role matrix integration tests and policy-level checks.

### Risk: Notification Noise or Duplicates

- Mitigation: idempotent scheduling and channel governance.

### Risk: Performance Degradation Under Growth

- Mitigation: monitor p95 latencies and optimize hot list/check-in paths first.

### Risk: Data Inconsistency in Renewal/Payment Flows

- Mitigation: transaction boundaries and rollback-safe operations.

## 16. Assumptions

- Gym operations are primarily single-branch for current product scope.
- Staff and members have stable internet access for web workflows.
- Email/SMS/Push channels are available through configured providers.
- Organization is committed to bilingual data and content governance.

## 17. Governance and Decision Model

- Product leadership owns scope and outcome prioritization.
- Engineering leadership owns architecture and quality gates.
- Security and audit requirements are release-blocking for sensitive modules.
- Requirement and API contract updates must stay synchronized.

## 18. Vision Validation Checklist

- The system meaningfully reduces manual operational burden.
- Frontline workflows are faster than current manual alternatives.
- Role boundaries are enforced and auditable.
- Management decisions can be made using in-system reports.
- Bilingual and accessibility expectations are met in production flows.

## 19. Traceability References

This vision aligns with the current specification and requirement artifacts:

- specs/001-gymdesk/spec.md
- specs/001-gymdesk/authentication-spec.md
- specs/001-gymdesk/user-stories-single.md
- specs/001-gymdesk/api-docs/README.md
- specs/001-gymdesk/api-docs/conventions.md
- RequirementSpecs.md

## 20. Long-Term Vision Extensions

Potential future evolution areas after core direction stabilizes:

- Multi-branch operations and cross-branch analytics.
- Member self-booking and waitlist management.
- Native mobile apps for members and staff.
- Integrated online billing and payment reconciliation.
- Advanced forecasting and retention intelligence.
