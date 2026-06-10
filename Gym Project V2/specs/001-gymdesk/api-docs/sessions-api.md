# Sessions API Documentation

Status: Planned by spec template (not fully implemented in current controllers)

Base path: /api/v1/sessions

## Endpoints

## GET /api/v1/sessions/{id}

Access:

- Manager, Owner, Trainer (own sessions)

Success:

- 200 OK

## PATCH /api/v1/sessions/{id}

Access:

- Manager, Owner, Trainer (own sessions)

Request:

{
  "status": "Cancelled"
}

Success:

- 200 OK

Notes:

- Cancel status should trigger member notifications.

## GET /api/v1/sessions/{id}/enrollments

Access:

- Manager, Owner, Trainer (own sessions)

Success:

- 200 OK

## PATCH /api/v1/sessions/{id}/attendance

Access:

- Trainer (own sessions), Manager, Owner

Request:

{
  "updates": [
    {
      "enrollmentId": "guid",
      "status": "Attended|Absent"
    }
  ]
}

Success:

- 200 OK
