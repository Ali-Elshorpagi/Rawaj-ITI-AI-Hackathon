# Members API Documentation

Status: Planned by spec template (not fully implemented in current controllers)

Base path: /api/v1/members

## Endpoints

## GET /api/v1/members

Access:

- ReceptionStaff, Manager, Owner

Query params:

- search (string, optional)
- status (Active|Expired|Frozen|Suspended, optional)
- planId (guid, optional)
- page (int, default 1)
- limit (int, default 20)

Success:

- 200 OK

## POST /api/v1/members

Access:

- ReceptionStaff, Manager, Owner

Request:

{
  "userId": "guid",
  "planId": "guid",
  "joinDate": "date",
  "emergencyContact": "string"
}

Success:

- 201 Created

Notes:

- memberCode auto-generated and unique
- qrToken generated for check-in

## GET /api/v1/members/{id}

Access:

- ReceptionStaff and above
- Member (own record only)

Success:

- 200 OK

Failure:

- 404 Not Found

## PATCH /api/v1/members/{id}

Access:

- ReceptionStaff, Manager, Owner

Success:

- 200 OK

## DELETE /api/v1/members/{id}

Access:

- Manager, Owner

Success:

- 204 No Content (soft delete)

## GET /api/v1/members/{id}/qr

Access:

- ReceptionStaff and above
- Member (own record only)

Success:

- 200 OK

Example:

{
  "qrToken": "guid",
  "qrImageDataUrl": "data:image/png;base64,..."
}

## POST /api/v1/members/{id}/renew

Access:

- ReceptionStaff, Manager, Owner

Request:

{
  "planId": "guid",
  "paymentMethod": "Cash|Card|BankTransfer"
}

Success:

- 200 OK

Notes:

- Renewal extends expiry from current expiry date per spec.
