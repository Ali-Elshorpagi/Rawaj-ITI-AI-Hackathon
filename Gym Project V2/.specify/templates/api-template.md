# API Contracts: GymDesk REST API

**Base URL:** `/api/v1`
**Auth:** Bearer JWT in `Authorization` header (except `/auth/*` and `/settings/public`)
**Content-Type:** `application/json`

---

## Auth

### POST /auth/login
**Access:** Public

Request:
```json
{ "email": "string", "password": "string" }
```
Response 200:
```json
{
  "accessToken": "string",
  "user": { "id": "uuid", "firstName": "string", "email": "string", "roles": ["string"] }
}
```
Errors: `401` invalid credentials | `422` validation error

---

### POST /auth/refresh
**Access:** Refresh token (httpOnly cookie)

Response 200:
```json
{ "accessToken": "string" }
```

---

### POST /auth/logout
**Access:** Authenticated

Response 204 No Content

---

## Users

### GET /users
**Access:** Manager, Owner
**Query:** `?page=1&limit=20&role=string&isActive=boolean`

Response 200:
```json
{
  "data": [{ "id": "uuid", "firstName": "string", "lastName": "string", "email": "string", "roles": ["string"], "isActive": true }],
  "total": 0, "page": 1, "limit": 20
}
```

### POST /users
**Access:** Manager (ReceptionStaff/Trainer only), Owner (any)

Request:
```json
{ "firstName": "string", "lastName": "string", "email": "string", "password": "string", "roles": ["string"] }
```
Response 201: Created user object

### PATCH /users/:id
**Access:** Owner (any), Manager (non-Owner/Manager users), Self (own profile)

Request: Partial user fields (no password here — use separate endpoint)
Response 200: Updated user object

### POST /users/:id/change-password
**Access:** Self or Owner

Request: `{ "currentPassword": "string", "newPassword": "string" }`
Response 204

---

## Members

### GET /members
**Access:** ReceptionStaff, Manager, Owner
**Query:** `?search=string&status=Active|Expired|Frozen|Suspended&planId=uuid&page=1&limit=20`

Response 200:
```json
{
  "data": [{
    "id": "uuid", "memberCode": "string", "membershipStatus": "string",
    "joinDate": "date", "expiryDate": "date",
    "user": { "firstName": "string", "lastName": "string", "email": "string", "phone": "string" }
  }],
  "total": 0, "page": 1, "limit": 20
}
```

### POST /members
**Access:** ReceptionStaff, Manager, Owner

Request:
```json
{
  "userId": "uuid",
  "planId": "uuid",
  "joinDate": "date",
  "emergencyContact": "string"
}
```
Response 201: Member object with generated `memberCode` and `qrToken`

### GET /members/:id
**Access:** ReceptionStaff+, or Member (own record only)

### PATCH /members/:id
**Access:** ReceptionStaff, Manager, Owner

### DELETE /members/:id
**Access:** Manager, Owner
Response 204 (soft delete — sets isActive = false)

### GET /members/:id/qr
**Access:** ReceptionStaff+, or Member (own)
Response 200: `{ "qrToken": "uuid", "qrImageDataUrl": "data:image/png;base64,..." }`

### POST /members/:id/renew
**Access:** ReceptionStaff, Manager, Owner
Request: `{ "planId": "uuid", "paymentMethod": "Cash|Card|BankTransfer" }`
Response 200: `{ "member": {...}, "payment": {...} }`

---

## Membership Plans

### GET /plans
**Access:** All authenticated

### POST /plans
**Access:** Owner

Request:
```json
{
  "name": "string", "nameAr": "string",
  "billingCycle": "Monthly|Quarterly|Annual",
  "durationDays": 30,
  "price": 150.00,
  "features": { "gym_access": true, "locker_access": false, "personal_training_sessions": 0 }
}
```

### PATCH /plans/:id
**Access:** Owner

### DELETE /plans/:id
**Access:** Owner — soft delete (isActive = false)

---

## Payments

### GET /payments
**Access:** ReceptionStaff, Manager, Owner
**Query:** `?memberId=uuid&status=Paid|Pending|Overdue|Refunded&from=date&to=date&page=1&limit=20`

### POST /payments
**Access:** ReceptionStaff, Manager, Owner

Request:
```json
{
  "memberId": "uuid", "planId": "uuid",
  "amount": 150.00, "paymentDate": "date", "dueDate": "date",
  "method": "Cash", "transactionRef": "string", "notes": "string"
}
```

### PATCH /payments/:id
**Access:** ReceptionStaff, Manager, Owner
Request: `{ "status": "Paid|Refunded" }`

### GET /payments/overdue
**Access:** ReceptionStaff, Manager, Owner
Response: List of payments where `dueDate < today AND status = Pending`

---

## Attendance

### POST /attendance/checkin
**Access:** ReceptionStaff, Manager, Owner (manual) | Member (QR self-checkin)

Request (QR): `{ "qrToken": "uuid" }`
Request (Manual): `{ "memberId": "uuid", "method": "Manual" }`

Response 201:
```json
{ "id": "uuid", "memberId": "uuid", "checkInTime": "datetime", "method": "QR|Manual" }
```
Errors: `409` member already checked in today | `403` membership expired/suspended

### POST /attendance/checkout
**Access:** ReceptionStaff, Member (own)
Request: `{ "attendanceId": "uuid" }`
Response 200: Updated attendance record

### GET /attendance
**Access:** ReceptionStaff+
**Query:** `?memberId=uuid&from=date&to=date&page=1&limit=20`

### GET /attendance/today
**Access:** ReceptionStaff, Manager, Owner
Response: All check-ins from midnight to now, with member details

### GET /attendance/member/:memberId
**Access:** ReceptionStaff+, or Member (own)

---

## Trainers

### GET /trainers
**Access:** All authenticated

### POST /trainers
**Access:** Manager, Owner
Request: `{ "userId": "uuid", "bio": "string", "bioAr": "string", "specialty": "string", "specialtyAr": "string", "hireDate": "date" }`

### GET /trainers/:id
### PATCH /trainers/:id
**Access:** Manager, Owner, Trainer (own profile)

---

## Classes

### GET /classes
**Access:** All authenticated

### POST /classes
**Access:** Manager, Owner
Request: `{ "name": "string", "nameAr": "string", "category": "string", "location": "string", "durationMinutes": 60, "trainerId": "uuid" }`

### PATCH /classes/:id
**Access:** Manager, Owner

### GET /classes/:id/sessions
**Query:** `?from=date&to=date&status=Scheduled|Completed|Cancelled`

### POST /classes/:id/sessions
**Access:** Manager, Owner
Request: `{ "startTime": "datetime", "endTime": "datetime", "maxCapacity": 20 }`

---

## Sessions

### GET /sessions/:id
### PATCH /sessions/:id
**Access:** Manager, Owner, Trainer (own sessions)
Request: `{ "status": "Cancelled" }` — triggers member notifications

### GET /sessions/:id/enrollments
**Access:** Manager, Owner, Trainer (own sessions)

### PATCH /sessions/:id/attendance
**Access:** Trainer (own sessions), Manager, Owner
Request: `{ "updates": [{ "enrollmentId": "uuid", "status": "Attended|Absent" }] }`

---

## Notifications

### GET /notifications
**Access:** Authenticated (own notifications only)
**Query:** `?read=boolean&page=1&limit=20`

### PATCH /notifications/:id/read
**Access:** Owner of the notification
Response 200: Updated notification

### POST /notifications/send
**Access:** Manager, Owner
Request: `{ "userIds": ["uuid"], "title": "string", "titleAr": "string", "message": "string", "messageAr": "string", "channel": "Email|SMS|Push" }`

---

## Reports

### GET /reports/attendance
**Access:** Manager, Owner
**Query:** `?from=date&to=date`
Response: `{ "data": [{ "date": "date", "count": 0 }] }`
Supports CSV: `Accept: text/csv`

### GET /reports/revenue
**Access:** Manager, Owner
**Query:** `?from=date&to=date`
Response: `{ "total": 0, "byMethod": {...}, "monthly": [{ "month": "string", "total": 0 }] }`

### GET /reports/members
**Access:** Manager, Owner
Response: `{ "total": 0, "byStatus": {...}, "byPlan": [...] }`

### GET /reports/classes
**Access:** Manager, Owner
Response: `{ "data": [{ "classId": "uuid", "name": "string", "sessions": 0, "avgUtilization": 0.0 }] }`

---

## Settings

### GET /settings/public
**Access:** Public (returns non-sensitive settings: gym name, logo, hours, currency, language)

### GET /settings
**Access:** Owner

### PATCH /settings
**Access:** Owner

### POST /settings/logo
**Access:** Owner
Content-Type: `multipart/form-data`
Response: `{ "logoUrl": "string" }`

---

## Audit Logs

### GET /audit-logs
**Access:** Manager, Owner
**Query:** `?entityName=string&entityId=uuid&userId=uuid&action=Create|Update|Delete&from=date&to=date&page=1&limit=50`

Response:
```json
{
  "data": [{
    "id": "uuid", "entityName": "string", "action": "string",
    "oldValues": {}, "newValues": {},
    "user": { "id": "uuid", "firstName": "string" },
    "createdAt": "datetime"
  }]
}
```

---

## Error Response Format

All errors follow this shape:
```json
{
  "error": {
    "code": "MEMBER_NOT_FOUND",
    "message": "Member with id X was not found",
    "statusCode": 404
  }
}
```

## HTTP Status Codes Used

| Code | Meaning |
|------|---------|
| 200 | OK |
| 201 | Created |
| 204 | No Content |
| 400 | Bad Request (malformed input) |
| 401 | Unauthorized (missing/invalid token) |
| 403 | Forbidden (valid token, insufficient role) |
| 404 | Not Found |
| 409 | Conflict (duplicate, capacity exceeded) |
| 422 | Unprocessable Entity (validation error) |
| 500 | Internal Server Error |
