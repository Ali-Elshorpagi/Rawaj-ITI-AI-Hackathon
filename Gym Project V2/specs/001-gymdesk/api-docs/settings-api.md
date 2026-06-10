# Settings API Documentation

Status: Planned by spec template (not fully implemented in current controllers)

Base path: /api/v1/settings

## Endpoints

## GET /api/v1/settings/public

Access:

- Public

Purpose:

- Returns non-sensitive settings used by landing pages and guest/member views.

Expected fields:

- gymName
- logoUrl
- workingHours
- currency
- defaultLanguage

Success:

- 200 OK

## GET /api/v1/settings

Access:

- Owner

Success:

- 200 OK

## PATCH /api/v1/settings

Access:

- Owner

Request (example):

{
  "gymName": "GymDesk Fitness",
  "logoUrl": "https://...",
  "hours": "Sat-Thu 6:00-23:00",
  "currency": "EGP",
  "language": "en"
}

Success:

- 200 OK
