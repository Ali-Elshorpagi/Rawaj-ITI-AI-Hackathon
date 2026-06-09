import { BaseError } from "./BaseError";

export class BadRequestError extends BaseError {
  constructor(message = "Bad Request") {
    super(message, 400);
  }
}

export class UnauthorizedError extends BaseError {
  constructor(message = "Unauthorized") {
    super(message, 401);
  }
}

export class NotFoundError extends BaseError {
  constructor(message = "Not Found") {
    super(message, 404);
  }
}

export class InternalServerError extends BaseError {
  constructor(message = "Internal Server Error") {
    super(message, 500);
  }
}

export class ForbiddenError extends BaseError {
  constructor(message = "Forbidden") {
    super(message, 403);
  }
}

export class IncompleteUserData extends BaseError {
  constructor(message = "restireted") {
    super(message, 405);
  }
}

export class ConflictError extends BaseError {
  constructor(message = "Conflict") {
    super(message, 409);
  }
}

export class UnprocessableEntityError extends BaseError {
  constructor(message = "Unprocessable Entity") {
    super(message, 422);
  }
}

export class TooManyRequestsError extends BaseError {
  constructor(message = "Too Many Requests") {
    super(message, 429);
  }
}

export class ServiceUnavailableError extends BaseError {
  constructor(message = "Service Unavailable") {
    super(message, 503);
  }
}

export class GatewayTimeoutError extends BaseError {
  constructor(message = "Gateway Timeout") {
    super(message, 504);
  }
}

export class InvalidCredentialsError extends BaseError {
  constructor(message = "Invalid Credentials") {
    super(message, 401);
  }
}

export class NoRouteFound extends BaseError {
  constructor(message = "Route not found") {
    super(message, 404);
  }
}

export class ValidationError extends BaseError {
  constructor(message: any) {
    super(message, 422);
  }
}

export class InvalidFileTypeError extends BaseError {
  constructor(message = "Invalid File Type") {
    super(message, 400);
  }
}

export class UnverifiedAccount extends BaseError {
  constructor(
    message = "Unverified account, the OTP has been sent to your email"
  ) {
    super(message, 403);
  }
}

export * from "./BaseError";
