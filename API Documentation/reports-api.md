# Reports API Documentation

Status: Planned by spec template (not fully implemented in current controllers)

Base path: /api/v1/reports

## Endpoints

## GET /api/v1/reports/attendance

Access:

- Manager, Owner

Query params:

- from (date)
- to (date)

Success:

- 200 OK

Example:

{
  "data": [
    {
      "date": "2026-06-10",
      "count": 42
    }
  ]
}

CSV export:

- Set Accept: text/csv

## GET /api/v1/reports/revenue

Access:

- Manager, Owner

Query params:

- from (date)
- to (date)

Success:

- 200 OK

Example:

{
  "total": 10000,
  "byMethod": {
    "Cash": 4000,
    "Card": 5000,
    "BankTransfer": 1000
  },
  "monthly": [
    {
      "month": "2026-06",
      "total": 10000
    }
  ]
}

## GET /api/v1/reports/members

Access:

- Manager, Owner

Success:

- 200 OK

Example:

{
  "total": 320,
  "byStatus": {
    "Active": 250,
    "Expired": 40,
    "Frozen": 20,
    "Suspended": 10
  },
  "byPlan": []
}

## GET /api/v1/reports/classes

Access:

- Manager, Owner

Success:

- 200 OK

Example:

{
  "data": [
    {
      "classId": "guid",
      "name": "Yoga",
      "sessions": 18,
      "avgUtilization": 0.72
    }
  ]
}
