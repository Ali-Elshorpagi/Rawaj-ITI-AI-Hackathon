# Membership Plans API Documentation

Status: Planned by spec template (not fully implemented in current controllers)

Base path: /api/v1/plans

## Endpoints

## GET /api/v1/plans

Access:

- All authenticated users

Success:

- 200 OK

## POST /api/v1/plans

Access:

- Owner

Request:

{
  "name": "string",
  "nameAr": "string",
  "billingCycle": "Monthly|Quarterly|Annual",
  "durationDays": 30,
  "price": 150.00,
  "features": {
    "gym_access": true,
    "locker_access": false,
    "personal_training_sessions": 0
  }
}

Success:

- 201 Created

## PATCH /api/v1/plans/{id}

Access:

- Owner

Success:

- 200 OK

## DELETE /api/v1/plans/{id}

Access:

- Owner

Success:

- 204 No Content (soft delete)
