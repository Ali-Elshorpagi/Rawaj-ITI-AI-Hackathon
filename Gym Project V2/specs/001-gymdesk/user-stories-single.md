# User Stories Pack: 001-gymdesk

This file separates and expands all user stories from the main spec.

## US-001 - Guest Views Services, Classes, and Pricing

### Story
As a Guest, I want to view the gym's services, classes, and membership pricing so I can decide whether to join.

### Acceptance Criteria
- Public landing page shows available membership plans with prices.
- Class schedule is visible without logging in.
- A clear call-to-action prompts the guest to register or contact the gym.
- Content loads correctly for both English and Arabic views.
- Pricing cards include billing cycle label (Monthly/Quarterly/Annual).

### Edge Cases
- If no classes are currently scheduled, show a friendly empty state.
- If plans are temporarily unavailable, show contact fallback instead of empty page.

### Test Notes
- Verify unauthenticated users can access page.
- Verify no authenticated-only API data appears in guest view.

## US-002 - Member Views Subscription Status

### Story
As a Member, I want to view my current subscription status and expiry date so I know when to renew.

### Acceptance Criteria
- Dashboard shows membership plan name, status (Active/Expired/Frozen), and expiry date.
- A visual warning appears when expiry is within 7 days.
- Status is accurate in real time (no stale cache).
- Status badge color and text are accessible and screen-reader friendly.

### Edge Cases
- Missing subscription record shows a clear support prompt.
- Expiry date in past must always show Expired regardless of cached client state.

### Test Notes
- Validate timezone consistency for expiry display.

## US-003 - Member Checks In with QR

### Story
As a Member, I want to check in using my QR code so I can enter the gym without staff manually searching for me.

### Acceptance Criteria
- Member profile page shows a scannable QR code linked to qr_token.
- QR scan records attendance entry with method = QR and current timestamp.
- If membership is expired or suspended, scan is rejected with clear error message.
- Duplicate check-ins within a short window are prevented.

### Edge Cases
- Invalid or tampered token returns generic invalid-token response.
- Offline scanner sync delay should not create duplicate attendance rows.

### Test Notes
- Verify average check-in request stays below NFR target.

## US-004 - Member Views Personal Attendance History

### Story
As a Member, I want to view my personal attendance history so I can track how often I visit.

### Acceptance Criteria
- Attendance list shows date, check-in time, check-out time, and method.
- History is paginated with 20 entries per page.
- Member can only see their own attendance.
- Sorting by latest first is default.

### Edge Cases
- If no attendance exists, show empty state with guidance.
- Records with missing check-out time are displayed as in-progress/unknown.

### Test Notes
- Add authorization test for cross-member access denial.

## US-005 - Member Gets Subscription Expiry Notifications

### Story
As a Member, I want to receive a notification before my subscription expires so I have time to renew.

### Acceptance Criteria
- Notification sent 7 days before expiry and 1 day before expiry.
- Notification includes plan name, expiry date, and renewal prompt.
- Delivery channel is configurable (Email, SMS, Push).
- Failed delivery attempts are logged for retry.

### Edge Cases
- If multiple channels enabled, avoid duplicate spam for same trigger window.
- If member renews before D-1 reminder, D-1 reminder is canceled.

### Test Notes
- Verify scheduler idempotency for repeated job runs.

## US-006 - Reception Manages Member Profiles

### Story
As Reception Staff, I want to add, edit, search, and deactivate member profiles so I can keep the member directory accurate.

### Acceptance Criteria
- Create form captures name (EN + AR), phone, email, photo, membership plan, join date.
- Search filters by name, status, and plan.
- Edit updates all fields.
- Deactivation sets is_active = false (soft delete).
- Member code is auto-generated and unique.
- Duplicate email or phone conflicts return clear validation errors.

### Edge Cases
- Photo upload failure should not lose already entered form data.
- Deactivated member should remain discoverable in filtered results.

### Test Notes
- Add unique constraint tests for member code/email.

## US-007 - Reception Records Payments

### Story
As Reception Staff, I want to record membership payments so I can track who has paid.

### Acceptance Criteria
- Payment form captures member, plan, amount, payment date, due date, method, optional notes.
- Transaction reference is optional but storable.
- Payment appears immediately in member payment history.
- Processed-by field set automatically to logged-in staff user.
- Amount must be positive and currency-consistent.

### Edge Cases
- Backdated payment is allowed but flagged in audit logs.
- Duplicate transaction reference warning is shown if reused.

### Test Notes
- Verify payment method enum validation.

## US-008 - Reception Renews Subscription

### Story
As Reception Staff, I want to renew a member's subscription so their access continues uninterrupted.

### Acceptance Criteria
- Renewal extends expiry_date by plan duration_days from current expiry (not today).
- Renewal creates a new Payment record.
- Membership status changes from Expired to Active upon renewal.
- Renewal operation is atomic (payment + status + expiry).

### Edge Cases
- Renewing an already active member extends from existing future expiry.
- Failed payment persistence must rollback membership update.

### Test Notes
- Add transaction rollback integration test.

## US-009 - Reception Performs Manual Check-In

### Story
As Reception Staff, I want to check in members manually so I can handle cases where QR scanning is not available.

### Acceptance Criteria
- Staff can search by member name or code and log check-in.
- Manual check-in records method = Manual and checked_in_by_user_id.
- Staff cannot check in Expired/Suspended member without warning + override confirmation.
- Override action is auditable with reason.

### Edge Cases
- Ambiguous name search prompts user to choose exact member.
- Multiple check-ins in same day show warning before continue.

### Test Notes
- Validate audit event includes operator id and reason.

## US-010 - Reception Sees Overdue Payments

### Story
As Reception Staff, I want to see a list of overdue payments so I can follow up with members.

### Acceptance Criteria
- Overdue list shows payments with due_date passed and status = Pending.
- List sortable by days overdue.
- Staff can mark payment as Paid directly.
- List supports pagination and keyword filtering.

### Edge Cases
- Same member with multiple overdue invoices grouped or clearly separated.
- Mark-as-paid concurrency conflicts handled gracefully.

### Test Notes
- Verify overdue logic uses server date consistently.

## US-011 - Trainer Views Weekly Schedule

### Story
As a Trainer, I want to view my assigned classes and weekly schedule so I know what sessions I am running.

### Acceptance Criteria
- Trainer dashboard shows weekly calendar of assigned class sessions.
- Each session shows class name, location, start/end time, enrolled/max capacity.
- Past sessions visually distinct from upcoming.
- Calendar supports timezone-aware display.

### Edge Cases
- Trainer with no assignments sees actionable empty state.
- Overlapping assignments are highlighted.

### Test Notes
- Add UI tests for week navigation.

## US-012 - Trainer Views Session Participants

### Story
As a Trainer, I want to view the participant list for each class session so I know who is attending.

### Acceptance Criteria
- Session details list enrolled members with name and profile photo.
- List shows attendance status (Registered/Attended/Absent/Cancelled).
- Search/filter by member name inside session roster.

### Edge Cases
- Missing profile photo falls back to placeholder avatar.
- Canceled members remain visible with canceled badge.

### Test Notes
- Ensure trainer cannot view sessions not assigned to them unless elevated role.

## US-013 - Trainer Marks Session Attendance

### Story
As a Trainer, I want to mark attendance for each session so the system has an accurate record.

### Acceptance Criteria
- Trainer toggles each member to Attended or Absent.
- Marking available for Scheduled sessions or after start time.
- Changes saved immediately.
- Last-updated metadata recorded (who/when).

### Edge Cases
- Session canceled: attendance editing disabled.
- Network retry does not duplicate state transitions.

### Test Notes
- Verify optimistic UI rollback on API failure.

## US-014 - Manager Monitors Daily Operations

### Story
As a Manager, I want to monitor daily attendance and active member count on a dashboard so I can assess gym utilization.

### Acceptance Criteria
- Dashboard shows today's check-ins, active members, expired memberships.
- Attendance chart shows last 30 days.
- Data refreshes automatically every 5 minutes.
- Metric cards include last refresh timestamp.

### Edge Cases
- Partial service failure degrades one widget without breaking whole dashboard.
- No data day still renders chart axes correctly.

### Test Notes
- Add contract tests for dashboard aggregates.

## US-015 - Manager Manages Class Scheduling

### Story
As a Manager, I want to manage trainer schedules and class assignments so operations run smoothly.

### Acceptance Criteria
- Manager can create, edit, and cancel class sessions.
- Manager can assign/reassign trainer to any class.
- Canceling session sets status = Cancelled and notifies enrolled members.
- Conflict warning shown for double-booked trainers.

### Edge Cases
- Reassigning close to session start triggers confirmation.
- Canceled session cannot be marked attended.

### Test Notes
- Verify notification trigger on cancellation.

## US-016 - Manager Views Revenue and Subscription Reports

### Story
As a Manager, I want to view revenue and subscription reports so I can understand financial performance.

### Acceptance Criteria
- Monthly revenue report shows total collected by payment method.
- Subscription report shows active/expired/frozen counts by plan.
- Reports exportable as CSV.
- Date-range filters apply consistently across report widgets.

### Edge Cases
- No transactions in range still exports valid CSV headers.
- Large dataset export remains performant.

### Test Notes
- Validate CSV encoding supports Arabic text.

## US-017 - Manager Manages Staff Accounts and Roles

### Story
As a Manager, I want to manage staff accounts and roles so access stays appropriate.

### Acceptance Criteria
- Manager can create ReceptionStaff and Trainer accounts.
- Manager can deactivate accounts but cannot hard delete.
- Manager cannot create or modify Manager/Owner accounts.
- All role changes are audited.

### Edge Cases
- Attempted privilege escalation returns forbidden with safe message.
- Deactivating currently logged-in staff invalidates active sessions.

### Test Notes
- Add authorization matrix tests by role.

## US-018 - Owner Has Full Platform Access

### Story
As an Owner, I want full access to all features so I can oversee the entire operation.

### Acceptance Criteria
- Owner can perform all actions available to all other roles.
- Owner can see/manage all user accounts including Managers.
- Owner access policy is enforced server-side only (not UI-only).

### Edge Cases
- Owner account lockout prevention policy defined (at least one owner remains active).

### Test Notes
- Add full-access regression suite for owner role.

## US-019 - Owner Configures Membership Plans and Pricing

### Story
As an Owner, I want to configure membership plans and pricing so I can adjust offerings as the business evolves.

### Acceptance Criteria
- Owner can create, edit, deactivate membership plans.
- Plan changes do not retroactively modify active memberships.
- Plan features JSON supports gym_access, locker_access, personal_training_sessions.
- Validation prevents invalid durations/prices.

### Edge Cases
- Deactivating a plan used by active members keeps historical references intact.
- Price updates include effective date for audit clarity.

### Test Notes
- Add migration-safe serialization tests for plan features JSON.

## US-020 - Owner Views Platform Analytics

### Story
As an Owner, I want to view platform-wide analytics so I can track business performance over time.

### Acceptance Criteria
- Analytics includes total revenue trend, member growth, attendance rate, class utilization.
- Date range filters: last 30/90/365 days or custom.
- Key metrics exportable.
- Dashboard supports both English and Arabic labels.

### Edge Cases
- Custom range validation blocks end date before start date.
- Sparse periods still compute utilization safely (no divide-by-zero).

### Test Notes
- Validate metric definitions against report queries.

## US-021 - Owner Configures Gym Settings

### Story
As an Owner, I want to configure gym settings (name, logo, hours, currency, language) so the platform reflects my gym's identity.

### Acceptance Criteria
- Settings page edits all GymSettings fields.
- Logo upload stores URL and displays on all pages.
- Default language preference applies to new user sessions.
- Changes are versioned/audited.

### Edge Cases
- Invalid logo format/size rejected with clear guidance.
- Hours validation prevents overlapping or malformed schedule windows.

### Test Notes
- Verify cache invalidation for global settings updates.

## Cross-Story Additions

- Accessibility baseline: all forms and controls must support keyboard navigation and clear labels.
- Localization baseline: all user-facing copy should be translatable (EN/AR) and RTL-safe.
- Security baseline: role checks are server-enforced; UI checks are convenience only.
- Observability baseline: sensitive operations should write structured audit logs.
