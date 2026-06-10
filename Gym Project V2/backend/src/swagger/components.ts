export const swaggerComponents = {
  securitySchemes: {
    bearerAuth: {
      type: "http" as const,
      scheme: "bearer",
      bearerFormat: "JWT",
      description:
        "Send `Authorization: Bearer <token>` from `POST /api/auth/login`. JWT includes a `role` claim.",
    },
  },
  schemas: {
    ApiSuccess: {
      type: "object",
      required: ["success", "message", "statusCode"],
      properties: {
        success: { type: "boolean", example: true },
        message: { type: "string" },
        data: {},
        statusCode: { type: "integer", example: 200 },
      },
    },
    ApiError: {
      type: "object",
      required: ["success", "message", "statusCode"],
      properties: {
        success: { type: "boolean", example: false },
        message: { type: "string" },
        statusCode: { type: "integer", example: 404 },
      },
    },
    MongoId: {
      type: "string",
      pattern: "^[a-fA-F0-9]{24}$",
      example: "507f1f77bcf86cd799439011",
    },
    GymRole: {
      type: "string",
      enum: ["member", "reception", "trainer", "manager", "owner"],
    },
    MembershipStatus: {
      type: "string",
      enum: ["active", "expired", "suspended"],
    },
    PaymentStatus: {
      type: "string",
      enum: ["paid", "pending", "overdue"],
    },
    PaymentMethod: {
      type: "string",
      enum: ["cash", "card", "bank_transfer", "online"],
    },
    CheckInMethod: {
      type: "string",
      enum: ["qr", "manual"],
    },
    LoginRequest: {
      type: "object",
      required: ["email", "password", "role"],
      properties: {
        email: { type: "string", format: "email", example: "owner@gymdesk.local" },
        password: { type: "string", example: "Password123!" },
        role: { $ref: "#/components/schemas/GymRole" },
      },
    },
    RegisterRequest: {
      type: "object",
      required: ["name", "email", "phone", "password", "role"],
      properties: {
        name: { type: "string", example: "Jane Manager", minLength: 4 },
        email: { type: "string", format: "email" },
        phone: { type: "string", example: "966501234567", pattern: "^\\d+$" },
        password: {
          type: "string",
          example: "Password123!",
          description: "Min 9 chars, upper, lower, digit, special",
        },
        role: { $ref: "#/components/schemas/GymRole" },
        address: { type: "string" },
      },
    },
    CheckInRequest: {
      type: "object",
      properties: {
        memberId: { $ref: "#/components/schemas/MongoId" },
        qrToken: { type: "string", description: "Member QR code token" },
        method: { $ref: "#/components/schemas/CheckInMethod" },
      },
    },
    ClassAttendanceRequest: {
      type: "object",
      required: ["sessionDate", "records"],
      properties: {
        sessionDate: { type: "string", format: "date-time" },
        records: {
          type: "array",
          items: {
            type: "object",
            required: ["memberId", "present"],
            properties: {
              memberId: { $ref: "#/components/schemas/MongoId" },
              present: { type: "boolean" },
            },
          },
        },
      },
    },
  },
  parameters: {
    AcceptLanguage: {
      name: "Accept-Language",
      in: "header",
      schema: { type: "string", enum: ["en", "ar"], default: "en" },
    },
    PaginationPage: {
      name: "page",
      in: "query",
      schema: { type: "integer", minimum: 1, default: 1 },
    },
    PaginationLimit: {
      name: "limit",
      in: "query",
      schema: { type: "integer", minimum: 1, default: 10 },
    },
    ResourceId: {
      name: "id",
      in: "path",
      required: true,
      schema: { $ref: "#/components/schemas/MongoId" },
    },
    FileId: {
      name: "fileId",
      in: "path",
      required: true,
      schema: { $ref: "#/components/schemas/MongoId" },
    },
    DateFrom: {
      name: "from",
      in: "query",
      schema: { type: "string", format: "date" },
    },
    DateTo: {
      name: "to",
      in: "query",
      schema: { type: "string", format: "date" },
    },
  },
};

export const commonResponses = {
  Unauthorized: {
    description: "Missing or invalid JWT, or insufficient role.",
    content: {
      "application/json": {
        schema: { $ref: "#/components/schemas/ApiError" },
      },
    },
  },
  Forbidden: {
    description: "Forbidden — e.g. expired/suspended membership at check-in.",
    content: {
      "application/json": {
        schema: { $ref: "#/components/schemas/ApiError" },
      },
    },
  },
  NotFound: {
    description: "Resource not found.",
    content: {
      "application/json": {
        schema: { $ref: "#/components/schemas/ApiError" },
      },
    },
  },
  Validation422: {
    description: "Zod validation failed.",
    content: {
      "application/json": {
        schema: { $ref: "#/components/schemas/ApiError" },
      },
    },
  },
  ServerError500: {
    description: "Unhandled server error.",
    content: {
      "application/json": {
        schema: { $ref: "#/components/schemas/ApiError" },
      },
    },
  },
};

const ok = (status: number, description: string) => ({
  description,
  content: {
    "application/json": {
      schema: { $ref: "#/components/schemas/ApiSuccess" },
    },
  },
});

export const success = ok;
