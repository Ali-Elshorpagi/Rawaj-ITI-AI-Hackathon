# Attendance API Documentation

Status: Planned by spec template (partially related behavior exists in auth/session areas)

Base path: /api/v1/attendance

## Endpoints

## POST /api/v1/attendance/checkin

Access:

- ReceptionStaff, Manager, Owner (manual)
- Member (QR self-check-in)

Request (QR):

{
  "qrToken": "guid"
}

Request (manual):

{
  "memberId": "guid",
  "method": "Manual"
}

Success:

- 201 Created

Example response:

{
  "id": "guid",
  "memberId": "guid",
  "checkInTime": "datetime",
  "method": "QR|Manual"
}

Failure:

- 403 Forbidden (expired/suspended membership)
- 409 Conflict (already checked in)

## POST /api/v1/attendance/checkout

Access:

- ReceptionStaff
- Member (own)

Request:

{
  "attendanceId": "guid"
}

Success:

- 200 OK

## GET /api/v1/attendance

Access:

- ReceptionStaff, Manager, Owner

Query params:

- memberId (guid, optional)
- from (date, optional)
- to (date, optional)
- page (int, default 1)
- limit (int, default 20)

Success:

- 200 OK

## GET /api/v1/attendance/today

Access:

- ReceptionStaff, Manager, Owner

Success:

- 200 OK

## GET /api/v1/attendance/member/{memberId}

Access:

- ReceptionStaff and above
- Member (own)

Success:

- 200 OK
