# Trainers API Documentation

Status: Planned by spec template (not fully implemented in current controllers)

Base path: /api/v1/trainers

## Endpoints

## GET /api/v1/trainers

Access:

- All authenticated users

Success:

- 200 OK

## POST /api/v1/trainers

Access:

- Manager, Owner

Request:

{
  "userId": "guid",
  "bio": "string",
  "bioAr": "string",
  "specialty": "string",
  "specialtyAr": "string",
  "hireDate": "date"
}

Success:

- 201 Created

## GET /api/v1/trainers/{id}

Access:

- Manager, Owner, Trainer (own)

Success:

- 200 OK

## PATCH /api/v1/trainers/{id}

Access:

- Manager, Owner, Trainer (own profile subset)

Success:

- 200 OK
