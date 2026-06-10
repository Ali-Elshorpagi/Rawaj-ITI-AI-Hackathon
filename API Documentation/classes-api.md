# Classes API Documentation

Status: Planned by spec template (not fully implemented in current controllers)

Base path: /api/v1/classes

## Endpoints

## GET /api/v1/classes

Access:

- All authenticated users

Success:

- 200 OK

## POST /api/v1/classes

Access:

- Manager, Owner

Request:

{
  "name": "string",
  "nameAr": "string",
  "category": "string",
  "location": "string",
  "durationMinutes": 60,
  "trainerId": "guid"
}

Success:

- 201 Created

## PATCH /api/v1/classes/{id}

Access:

- Manager, Owner

Success:

- 200 OK

## GET /api/v1/classes/{id}/sessions

Access:

- Manager, Owner, Trainer (scope by assignment), Member (as allowed)

Query params:

- from (date, optional)
- to (date, optional)
- status (Scheduled|Completed|Cancelled, optional)

Success:

- 200 OK

## POST /api/v1/classes/{id}/sessions

Access:

- Manager, Owner

Request:

{
  "startTime": "datetime",
  "endTime": "datetime",
  "maxCapacity": 20
}

Success:

- 201 Created
