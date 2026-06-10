# GymDesk API Documentation

This folder contains the current API documentation for GymDesk backend endpoints.

## Base Information

- Base URL (local): http://localhost:5164
- API version prefix: /api/v1
- OpenAPI JSON (development): /openapi/v1.json

## Docs Index

- conventions.md: authentication, headers, rate limits, response conventions
- auth-api.md: /api/v1/auth endpoints (implemented)
- users-api.md: /api/v1/users endpoints (implemented)
- members-api.md: /api/v1/members endpoints (planned from spec/template)
- plans-api.md: /api/v1/plans endpoints (planned from spec/template)
- payments-api.md: /api/v1/payments endpoints (planned from spec/template)
- attendance-api.md: /api/v1/attendance endpoints (planned from spec/template)
- trainers-api.md: /api/v1/trainers endpoints (planned from spec/template)
- classes-api.md: /api/v1/classes endpoints (planned from spec/template)
- sessions-api.md: /api/v1/sessions endpoints (planned from spec/template)
- notifications-api.md: /api/v1/notifications endpoints (planned from spec/template)
- reports-api.md: /api/v1/reports endpoints (planned from spec/template)
- settings-api.md: /api/v1/settings endpoints (planned from spec/template)

## Scope

Implemented controllers in GymDesk.API:

- AuthController
- UsersController

The rest of module files are included to match full spec and api-template scope so you can implement them module-by-module without redrafting API docs.
