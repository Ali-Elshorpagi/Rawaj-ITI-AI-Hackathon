# Notifications API Documentation

Status: Planned by spec template (not fully implemented in current controllers)

Base path: /api/v1/notifications

## Endpoints

## GET /api/v1/notifications

Access:

- Authenticated user (own notifications)

Query params:

- read (boolean, optional)
- page (int, default 1)
- limit (int, default 20)

Success:

- 200 OK

## PATCH /api/v1/notifications/{id}/read

Access:

- Notification owner

Success:

- 200 OK

## POST /api/v1/notifications/send

Access:

- Manager, Owner

Request:

{
  "userIds": ["guid"],
  "title": "string",
  "titleAr": "string",
  "message": "string",
  "messageAr": "string",
  "channel": "Email|SMS|Push"
}

Success:

- 202 Accepted or 200 OK

Notes:

- Spec notifications also include automated reminder triggers (expiry and overdue).
