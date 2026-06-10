# Users API Documentation

Base path: /api/v1/users

## Models

### CreateUserDto

{
  "email": "string",
  "password": "string",
  "nameEn": "string|null",
  "nameAr": "string|null",
  "phone": "string|null"
}

### UpdateUserDto

{
  "nameEn": "string|null",
  "nameAr": "string|null",
  "phone": "string|null",
  "isActive": true
}

### RoleRequest

{
  "role": "string"
}

### UserSummaryDto

{
  "id": "guid",
  "email": "string",
  "nameEn": "string|null",
  "nameAr": "string|null",
  "phone": "string|null",
  "isActive": true,
  "createdAt": "datetime"
}

### UserDetailDto

{
  "id": "guid",
  "email": "string",
  "nameEn": "string|null",
  "nameAr": "string|null",
  "phone": "string|null",
  "isActive": true,
  "createdAt": "datetime",
  "updatedAt": "datetime|null",
  "roles": ["manager", "owner"]
}

### PagedUsersResultDto

{
  "page": 1,
  "pageSize": 20,
  "totalCount": 100,
  "items": [UserSummaryDto]
}

## Endpoints

## GET /api/v1/users

Returns paged user list.

Query params:

- page (int, default 1)
- pageSize (int, default 20)
- search (string, optional)
- isActive (bool, optional)

Success:

- 200 OK

Response body: PagedUsersResultDto

## GET /api/v1/users/{id}

Returns one user by id.

Path params:

- id (guid)

Success:

- 200 OK

Response body: UserDetailDto

Failure:

- 404 Not Found

## POST /api/v1/users

Creates a user.

Request body: CreateUserDto

Success:

- 201 Created

Response body: UserDetailDto (created)

Failure:

- 400 Bad Request

## PUT /api/v1/users/{id}

Updates editable user fields.

Path params:

- id (guid)

Request body: UpdateUserDto

Success:

- 200 OK

Response body: UserDetailDto

Failure:

- 404 Not Found

## POST /api/v1/users/{id}/deactivate

Soft-deactivates user.

Path params:

- id (guid)

Success:

- 204 No Content

Failure:

- 404 Not Found

## POST /api/v1/users/{id}/reactivate

Reactivates user.

Path params:

- id (guid)

Success:

- 204 No Content

Failure:

- 404 Not Found

## POST /api/v1/users/{id}/roles

Assigns role to user.

Authorization:

- Requires policy ManagerOrOwner (role manager or owner).

Path params:

- id (guid)

Request body: RoleRequest

Success:

- 204 No Content

Failure:

- 401 Unauthorized
- 403 Forbidden
- 404 Not Found

## DELETE /api/v1/users/{id}/roles/{roleId}

Removes role from user.

Authorization:

- Requires policy ManagerOrOwner (role manager or owner).

Path params:

- id (guid)
- roleId (string)

Success:

- 204 No Content

Failure:

- 401 Unauthorized
- 403 Forbidden
- 404 Not Found
