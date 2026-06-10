# GymDesk API Endpoints

> **Base URL (dev):** `http://localhost:5585/api`  
> **Base URL (prod):** configured in `frontend/src/environments/environment.prod.ts`  
> **Set in frontend:** `environment.apiUrl` — change only this one value to switch environments.

---

## Table of Contents

1. [Authentication](#1-authentication)
2. [Members](#2-members)
3. [Subscription Plans](#3-subscription-plans)
4. [Subscriptions](#4-subscriptions)
5. [Payments](#5-payments)
6. [Attendance](#6-attendance)
7. [Trainers](#7-trainers)
8. [Classes](#8-classes)
9. [Notifications](#9-notifications)
10. [Reports](#10-reports)
11. [Files](#11-files)
12. [Health Check](#12-health-check)

---

## Global Conventions

### Authentication

All protected endpoints require a Bearer token in the `Authorization` header:

```
Authorization: Bearer <token>
```

### Roles

| Role       | Description                        |
|------------|------------------------------------|
| `member`   | Gym member (customer)              |
| `reception`| Front-desk staff                   |
| `trainer`  | Fitness trainer                    |
| `manager`  | Gym manager                        |
| `owner`    | Gym owner (full access)            |

### Standard Response Shape

```json
{
  "success": true,
  "message": "Human-readable message",
  "data": { }
}
```

### Paginated Response Shape

```json
{
  "success": true,
  "message": "...",
  "data": {
    "items": [ ],
    "pagination": {
      "total": 100,
      "page": 1,
      "limit": 10
    }
  }
}
```

### Pagination Query Parameters

Endpoints that use pagination accept: `page` (default 1), `limit` (default 10).

### Language Header

Pass `Accept-Language: ar` to get Arabic error messages; defaults to English.

---

## 1. Authentication

Base path: `/api/auth`

---

### 1.1 Register

`POST /api/auth/register`

**Auth:** None (public)  
**Content-Type:** `multipart/form-data` or `application/json`

**Request Body:**

| Field     | Type   | Required | Notes                                  |
|-----------|--------|----------|----------------------------------------|
| `name`    | string | Yes      | Min 4 characters                       |
| `email`   | string | Yes      | Valid email format                     |
| `password`| string | Yes      | See [Password Rules](#password-rules)  |
| `phone`   | string | Yes      | Digits only, min 4 chars               |
| `role`    | string | Yes      | One of: `member` `reception` `trainer` `manager` `owner` |
| `address` | string | No       | Optional address string                |

**Response:** `201`

```json
{
  "success": true,
  "message": "User created",
  "data": { "id": "...", "email": "...", "name": "..." }
}
```

> **Note:** Registration sends a 4-digit OTP to the provided email. Call `/verify` next.

---

### 1.2 Verify Email (OTP)

`POST /api/auth/verify`

**Auth:** None (public)  
**Content-Type:** `multipart/form-data` or `application/json`

**Request Body:**

| Field  | Type   | Required | Notes               |
|--------|--------|----------|---------------------|
| `email`| string | Yes      | Registered email    |
| `otp`  | string | Yes      | Exactly **4 digits** |

**Response:** `200`

```json
{
  "success": true,
  "message": "User verified",
  "data": { "token": "<jwt>", "user": { } }
}
```

---

### 1.3 Resend OTP

`POST /api/auth/resend-otp`

**Auth:** None (public)  
**Content-Type:** `multipart/form-data` or `application/json`

**Request Body:**

| Field  | Type   | Required |
|--------|--------|----------|
| `email`| string | Yes      |

**Response:** `200`

---

### 1.4 Login

`POST /api/auth/login`

**Auth:** None (public)  
**Content-Type:** `multipart/form-data` or `application/json`

**Request Body:**

| Field     | Type   | Required | Notes                                    |
|-----------|--------|----------|------------------------------------------|
| `email`   | string | Yes      |                                          |
| `password`| string | Yes      |                                          |
| `role`    | string | Yes      | Must match the role used at registration |

**Response:** `200`

If email is verified:
```json
{
  "success": true,
  "message": "Login successful",
  "data": { "token": "<jwt>", "user": { } }
}
```

If email is **not** verified (OTP not confirmed):
```json
{
  "success": true,
  "message": "Email not verified",
  "data": { "verified": false, "email": "..." }
}
```

> **IMPORTANT:** `role` is required in the login body. Login fails without it.

---

### 1.5 Get Current User

`GET /api/auth/me`

**Auth:** Required (Bearer token)

**Response:** `200`

```json
{
  "success": true,
  "message": "User fetched",
  "data": {
    "id": "...",
    "name": "...",
    "email": "...",
    "phone": "...",
    "role": "owner",
    "address": "..."
  }
}
```

---

### 1.6 Update Password (Authenticated)

`POST /api/auth/update-password`

**Auth:** Required (Bearer token)

**Request Body:**

```json
{
  "data": {
    "password": "currentPassword123!",
    "newPassword": "newPassword456@"
  }
}
```

| Field             | Type   | Required | Notes                                 |
|-------------------|--------|----------|---------------------------------------|
| `data.password`   | string | Yes      | Current password                      |
| `data.newPassword`| string | Yes      | See [Password Rules](#password-rules) |

**Response:** `200`

---

### 1.7 Request Password Reset

`POST /api/auth/request-password-reset`

**Auth:** None (public)

**Request Body:**

| Field  | Type   | Required |
|--------|--------|----------|
| `email`| string | Yes      |

**Response:** `200`

> Sends a 4-digit OTP to the email. Use the OTP in the next step.

---

### 1.8 Verify Reset OTP

`POST /api/auth/verify-reset-password-otp`

**Auth:** None (public)

**Request Body:**

| Field  | Type   | Required | Notes                |
|--------|--------|----------|----------------------|
| `email`| string | Yes      |                      |
| `otp`  | string | Yes      | Exactly **4 digits** |

**Response:** `200`

```json
{
  "success": true,
  "message": "OTP verified",
  "data": { "token": "<reset-token>" }
}
```

> Save the `token` from the response — it is required for the next step.

---

### 1.9 Reset Password

`POST /api/auth/reset-password`

**Auth:** None (public)

**Request Body:**

| Field     | Type   | Required | Notes                                      |
|-----------|--------|----------|--------------------------------------------|
| `password`| string | Yes      | New password — see [Password Rules](#password-rules) |
| `token`   | string | Yes      | Token returned by verify-reset-password-otp |

**Response:** `200`

---

### Password Rules

Passwords must satisfy **all** of the following:
- Longer than 8 characters (i.e. at least 9)
- Contains at least one **uppercase** letter
- Contains at least one **lowercase** letter
- Contains at least one **number**
- Contains at least one **special character** (non-alphanumeric)

---

## 2. Members

Base path: `/api/members`  
**Auth:** Required for all endpoints  
**Allowed roles:** `reception`, `manager`, `owner`

---

### 2.1 List Members

`GET /api/members`

**Query Parameters:**

| Param    | Type   | Notes                             |
|----------|--------|-----------------------------------|
| `name`   | string | Filter by name (partial match)    |
| `status` | string | `active` \| `expired` \| `suspended` |
| `planId` | string | Filter by subscription plan ID    |
| `page`   | number | Default: 1                        |
| `limit`  | number | Default: 10                       |

**Response:** `200` — paginated list

---

### 2.2 Create Member

`POST /api/members`

**Content-Type:** `multipart/form-data`

**Request Body:**

| Field                | Type   | Required | Notes                             |
|----------------------|--------|----------|-----------------------------------|
| `fullName`           | string | Yes      | Min 2 characters                  |
| `email`              | string | Yes      |                                   |
| `phone`              | string | Yes      | Min 8 characters                  |
| `membershipStatus`   | string | No       | `active` \| `expired` \| `suspended` — default: `active` |
| `subscriptionPlanId` | string | No       | MongoDB ObjectId of a plan        |
| `photo`              | file   | No       | Image upload                      |

**Response:** `201`

---

### 2.3 Get Member

`GET /api/members/:id`

**Response:** `200` — single member object

---

### 2.4 Update Member

`PUT /api/members/:id`

**Content-Type:** `multipart/form-data`

Same fields as [Create Member](#22-create-member) — all optional.

**Response:** `200`

---

### 2.5 Delete Member

`DELETE /api/members/:id`

**Response:** `200`

---

### 2.6 Get Member Attendance

`GET /api/members/:id/attendance`

**Query Parameters:** `page`, `limit`

**Response:** `200` — paginated attendance records

---

### 2.7 Get Member Subscription

`GET /api/members/:id/subscription`

**Response:** `200` — current subscription (or null)

---

## 3. Subscription Plans

Base path: `/api/plans`

---

### 3.1 List Plans

`GET /api/plans`

**Auth:** None (public)

**Response:** `200`

```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "name": "Gold",
      "durationMonths": 3,
      "price": 150,
      "description": "...",
      "isActive": true
    }
  ]
}
```

> **IMPORTANT:** Duration field is `durationMonths` (not `durationDays`).

---

### 3.2 Create Plan

`POST /api/plans`

**Auth:** Required — `manager`, `owner`

**Request Body:**

| Field           | Type   | Required | Notes     |
|-----------------|--------|----------|-----------|
| `name`          | string | Yes      |           |
| `durationMonths`| number | Yes      | Min 1     |
| `price`         | number | Yes      | Min 0     |
| `description`   | string | No       |           |

**Response:** `201`

---

### 3.3 Update Plan

`PUT /api/plans/:id`

**Auth:** Required — `manager`, `owner`

Same fields as Create Plan — all optional.

**Response:** `200`

---

### 3.4 Deactivate Plan

`DELETE /api/plans/:id`

**Auth:** Required — `manager`, `owner`

> Soft-deletes by setting `isActive: false`.

**Response:** `200`

---

## 4. Subscriptions

Base path: `/api/subscriptions`  
**Auth:** Required for all  
**Allowed roles:** `reception`, `manager`, `owner`

---

### 4.1 Get Expiring Subscriptions

`GET /api/subscriptions/expiring`

**Query Parameters:**

| Param | Type   | Notes            |
|-------|--------|------------------|
| `days`| number | Default: `7`     |

**Response:** `200` — list of subscriptions expiring within N days

---

### 4.2 Create Subscription

`POST /api/subscriptions`

**Request Body:**

| Field      | Type   | Required | Notes                                     |
|------------|--------|----------|-------------------------------------------|
| `memberId` | string | Yes      | MongoDB ObjectId                          |
| `planId`   | string | Yes      | MongoDB ObjectId                          |
| `startDate`| string | Yes      | ISO date string                           |
| `endDate`  | string | Yes      | ISO date string                           |
| `status`   | string | No       | `active` \| `expired` \| `cancelled` — default: `active` |
| `paymentId`| string | No       | MongoDB ObjectId (optional link to payment) |

**Response:** `201`

---

### 4.3 Renew Subscription

`PUT /api/subscriptions/:id/renew`

**Request Body:** Same fields as Create Subscription (all optional).

**Response:** `200`

---

## 5. Payments

Base path: `/api/payments`  
**Auth:** Required for all  
**Allowed roles:** `reception`, `manager`, `owner`

---

### 5.1 Get Overdue Payments

`GET /api/payments/overdue`

**Response:** `200` — list of overdue payments

---

### 5.2 List Payments

`GET /api/payments`

**Query Parameters:** `page`, `limit` (and any additional filter fields passed via `req.query`)

**Response:** `200` — paginated payments

---

### 5.3 Create Payment

`POST /api/payments`

**Request Body:**

| Field            | Type   | Required | Notes                                         |
|------------------|--------|----------|-----------------------------------------------|
| `memberId`       | string | Yes      | MongoDB ObjectId                              |
| `subscriptionId` | string | No       | MongoDB ObjectId                              |
| `amount`         | number | Yes      | Min 0                                         |
| `method`         | string | Yes      | `cash` \| `card` \| `bank_transfer` \| `online` |
| `status`         | string | No       | `paid` \| `pending` \| `overdue` — default: `pending` |
| `paidAt`         | string | No       | ISO date (set when marking as paid)           |
| `dueDate`        | string | Yes      | ISO date                                      |

**Response:** `201`

---

### 5.4 Update Payment

`PUT /api/payments/:id`

Same fields as Create Payment — all optional.

**Response:** `200`

---

## 6. Attendance

Base path: `/api/attendance`  
**Auth:** Required for all  
**Allowed roles:** `member`, `reception`, `manager`, `owner`

---

### 6.1 Check In

`POST /api/attendance/checkin`

**Request Body:**

| Field      | Type   | Required | Notes              |
|------------|--------|----------|--------------------|
| `memberId` | string | Yes      | MongoDB ObjectId   |
| `method`   | string | Yes      | `qr` \| `manual`  |

**Response:** `201`

---

### 6.2 Get Today's Attendance

`GET /api/attendance/today`

**Response:** `200` — list of today's check-ins

---

### 6.3 List Attendance

`GET /api/attendance`

**Query Parameters:** `page`, `limit`

**Response:** `200` — paginated attendance records

---

## 7. Trainers

Base path: `/api/trainers`

---

### 7.1 List Trainers

`GET /api/trainers`

**Auth:** Required — `trainer`, `manager`, `owner`

**Response:** `200` — list of trainers

---

### 7.2 Create Trainer

`POST /api/trainers`

**Auth:** Required — `manager`, `owner`  
**Content-Type:** `multipart/form-data`

**Request Body:**

| Field            | Type   | Required | Notes                      |
|------------------|--------|----------|----------------------------|
| `userId`         | string | Yes      | MongoDB ObjectId of a User |
| `specialization` | string | Yes      |                            |
| `bio`            | string | No       |                            |
| `photo`          | file   | No       | Image upload               |

**Response:** `201`

---

### 7.3 Update Trainer

`PUT /api/trainers/:id`

**Auth:** Required — `manager`, `owner`  
**Content-Type:** `multipart/form-data`

Same fields as Create Trainer — all optional.

**Response:** `200`

---

### 7.4 Delete Trainer

`DELETE /api/trainers/:id`

**Auth:** Required — `manager`, `owner`

**Response:** `200`

---

### 7.5 Get Trainer Schedule

`GET /api/trainers/:id/schedule`

**Auth:** Required — `trainer`, `manager`, `owner`

**Response:** `200` — trainer's class schedule

---

## 8. Classes

Base path: `/api/classes`

---

### 8.1 List Classes

`GET /api/classes`

**Auth:** None (public)

**Response:** `200`

```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "name": "Morning Yoga",
      "description": "...",
      "trainerId": { "_id": "...", "specialization": "..." },
      "schedule": [
        { "dayOfWeek": 1, "startTime": "07:00", "endTime": "08:00" }
      ],
      "capacity": 20,
      "location": "Studio A",
      "coverImage": "https://...",
      "isDeleted": false
    }
  ]
}
```

> `dayOfWeek`: 0 = Sunday, 1 = Monday … 6 = Saturday

---

### 8.2 Create Class

`POST /api/classes`

**Auth:** Required — `manager`, `owner`  
**Content-Type:** `multipart/form-data`

**Request Body:**

| Field        | Type   | Required | Notes                                                         |
|--------------|--------|----------|---------------------------------------------------------------|
| `name`       | string | Yes      |                                                               |
| `description`| string | No       |                                                               |
| `trainerId`  | string | Yes      | MongoDB ObjectId of a Trainer                                 |
| `schedule`   | array  | No       | Array of `{ dayOfWeek: 0-6, startTime: "HH:MM", endTime: "HH:MM" }` |
| `capacity`   | number | Yes      | Min 1                                                         |
| `location`   | string | Yes      |                                                               |
| `coverImage` | file   | No       | Image upload                                                  |

**Response:** `201`

---

### 8.3 Update Class

`PUT /api/classes/:id`

**Auth:** Required — `manager`, `owner`  
**Content-Type:** `multipart/form-data`

Same fields as Create Class — all optional.

**Response:** `200`

---

### 8.4 Delete Class

`DELETE /api/classes/:id`

**Auth:** Required — `manager`, `owner`

**Response:** `200`

---

### 8.5 Enroll in Class

`POST /api/classes/:id/enroll`

**Auth:** Required — `member`, `reception`, `manager`, `owner`

**Request Body:**

| Field      | Type   | Required | Notes                                                     |
|------------|--------|----------|-----------------------------------------------------------|
| `memberId` | string | Conditional | Required if caller's role is NOT `member`. If role is `member`, the member ID is resolved automatically from the JWT. |

**Response:** `201`

---

### 8.6 Get Class Participants

`GET /api/classes/:id/participants`

**Auth:** Required — `trainer`, `member`, `manager`, `owner`

**Response:** `200` — list of enrolled members

---

### 8.7 Mark Class Attendance

`POST /api/classes/:id/attendance`

**Auth:** Required — `trainer`, `manager`, `owner`

> Trainer is automatically resolved from the authenticated user's `userId`. The caller must have a Trainer record linked to their user account.

**Request Body:** attendance data (member IDs / present flags — check service for current schema)

**Response:** `200`

---

## 9. Notifications

Base path: `/api/notifications`  
**Auth:** Required for all — any role

---

### 9.1 List Unread Notifications

`GET /api/notifications`

**Response:** `200`

```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "title_en": "Subscription Expiring",
      "message_en": "...",
      "title_ar": "...",
      "message_ar": "...",
      "type": "subscription-expiry",
      "isRead": false,
      "data": { }
    }
  ]
}
```

Notification types: `subscription-expiry` | `overdue-payment` | `general`

---

### 9.2 Mark Notification as Read

`PUT /api/notifications/:id/read`

**Response:** `200`

---

## 10. Reports

Base path: `/api/reports`  
**Auth:** Required for all  
**Allowed roles:** `manager`, `owner`

---

### 10.1 Attendance Report

`GET /api/reports/attendance`

**Query Parameters:**

| Param | Type   | Notes       |
|-------|--------|-------------|
| `from`| string | ISO date    |
| `to`  | string | ISO date    |

**Response:** `200`

---

### 10.2 Revenue Report

`GET /api/reports/revenue`

**Query Parameters:**

| Param | Type   | Notes       |
|-------|--------|-------------|
| `from`| string | ISO date    |
| `to`  | string | ISO date    |

**Response:** `200`

---

### 10.3 Members Report

`GET /api/reports/members`

**Response:** `200` — membership stats snapshot

---

### 10.4 Classes Report

`GET /api/reports/classes`

**Response:** `200` — class utilization stats

---

## 11. Files

Base path: `/api/files`  
**Auth:** Required for all

---

### 11.1 Upload to Cloudinary (Test)

`POST /api/files/test-cloudinary`

**Content-Type:** `multipart/form-data`

**Form fields:**

| Field       | Max count | Notes       |
|-------------|-----------|-------------|
| `mainImage` | 1         | Primary image |
| `images`    | 6         | Additional images |

**Response:** `200` — processed image URLs

---

### 11.2 Delete File

`DELETE /api/files/delete-image/:fileId`

**Response:** `200`

---

## 12. Health Check

`POST /api/health`

**Auth:** None (public)

**Response:** `200`

```json
{ "success": true, "message": "Server is running", "data": { } }
```

---

## Common Frontend Mistakes to Avoid

| Wrong (old frontend calls)                    | Correct                                       |
|-----------------------------------------------|-----------------------------------------------|
| `POST /auth/logout`                           | No logout endpoint — just clear the token client-side |
| `POST /auth/refresh`                          | No token refresh endpoint                     |
| `POST /auth/forgot-password`                  | `POST /auth/request-password-reset`           |
| `POST /auth/otp/send-register`                | OTP is sent automatically on `/auth/register` |
| `POST /auth/otp/verify-register`              | `POST /auth/verify`                           |
| `POST /auth/otp/send-reset`                   | `POST /auth/request-password-reset`           |
| `POST /auth/otp/verify-reset`                 | `POST /auth/verify-reset-password-otp`        |
| `POST /auth/otp/reset-password`               | `POST /auth/reset-password`                   |
| `PATCH /auth/change-password`                 | `POST /auth/update-password`                  |
| `GET /auth/verify-email`                      | `POST /auth/verify`                           |
| OTP length = 6                                | OTP length = **4**                            |
| `firstName` / `lastName` in register body     | `name` (single field) in register body        |
| `durationDays` in plan                        | `durationMonths`                              |
| Login without `role` field                    | Login **requires** `role` in body             |
