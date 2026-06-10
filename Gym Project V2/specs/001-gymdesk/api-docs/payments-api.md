# Payments API Documentation

Status: Planned by spec template (not fully implemented in current controllers)

Base path: /api/v1/payments

## Endpoints

## GET /api/v1/payments

Access:

- ReceptionStaff, Manager, Owner

Query params:

- memberId (guid, optional)
- status (Paid|Pending|Overdue|Refunded, optional)
- from (date, optional)
- to (date, optional)
- page (int, default 1)
- limit (int, default 20)

Success:

- 200 OK

## POST /api/v1/payments

Access:

- ReceptionStaff, Manager, Owner

Request:

{
  "memberId": "guid",
  "planId": "guid",
  "amount": 150.00,
  "paymentDate": "date",
  "dueDate": "date",
  "method": "Cash|Card|BankTransfer",
  "transactionRef": "string",
  "notes": "string"
}

Success:

- 201 Created

## PATCH /api/v1/payments/{id}

Access:

- ReceptionStaff, Manager, Owner

Request:

{
  "status": "Paid|Refunded"
}

Success:

- 200 OK

## GET /api/v1/payments/overdue

Access:

- ReceptionStaff, Manager, Owner

Success:

- 200 OK

Notes:

- Overdue filter rule: dueDate < today AND status = Pending.
