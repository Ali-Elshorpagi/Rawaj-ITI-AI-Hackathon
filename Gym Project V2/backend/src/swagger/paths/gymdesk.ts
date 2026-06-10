import { commonResponses, success } from "../components";

const bearer = [{ bearerAuth: [] as string[] }];

export const gymdeskPaths = {
  "/api/health": {
    post: {
      tags: ["Health"],
      summary: "Health check",
      responses: {
        "200": success(200, "Server is running"),
        "500": commonResponses.ServerError500,
      },
    },
  },

  "/api/auth/register": {
    post: {
      tags: ["Auth"],
      summary: "Register — sends OTP to email",
      description: "Creates unverified user and emails a 4-digit OTP (15 min expiry).",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/RegisterRequest" },
          },
          "multipart/form-data": {
            schema: { $ref: "#/components/schemas/RegisterRequest" },
          },
        },
      },
      responses: {
        "201": success(201, "User registered"),
        "401": commonResponses.Unauthorized,
        "422": commonResponses.Validation422,
      },
    },
  },
  "/api/auth/verify": {
    post: {
      tags: ["Auth"],
      summary: "Verify email with OTP",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["email", "otp"],
              properties: {
                email: { type: "string", format: "email" },
                otp: { type: "string", minLength: 4, maxLength: 4, example: "1234" },
              },
            },
          },
        },
      },
      responses: {
        "200": success(200, "User verified — returns JWT"),
        "401": commonResponses.Unauthorized,
        "422": commonResponses.Validation422,
      },
    },
  },
  "/api/auth/resend-otp": {
    post: {
      tags: ["Auth"],
      summary: "Resend registration OTP",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["email"],
              properties: { email: { type: "string", format: "email" } },
            },
          },
        },
      },
      responses: {
        "200": success(200, "OTP resent"),
        "401": commonResponses.Unauthorized,
      },
    },
  },
  "/api/auth/login": {
    post: {
      tags: ["Auth"],
      summary: "Login — returns JWT with role claim",
      description: "If account is unverified, resends OTP and returns user without token.",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/LoginRequest" },
          },
        },
      },
      responses: {
        "200": success(200, "Login successful or OTP resent"),
        "401": commonResponses.Unauthorized,
        "404": commonResponses.NotFound,
      },
    },
  },
  "/api/auth/update-password": {
    post: {
      tags: ["Auth"],
      summary: "Change password (authenticated)",
      security: bearer,
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["password", "newPassword"],
              properties: {
                password: { type: "string" },
                newPassword: { type: "string", minLength: 9 },
              },
            },
          },
        },
      },
      responses: {
        "200": success(200, "Password updated"),
        "401": commonResponses.Unauthorized,
      },
    },
  },
  "/api/auth/request-password-reset": {
    post: {
      tags: ["Auth"],
      summary: "Request password reset OTP",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["email"],
              properties: { email: { type: "string", format: "email" } },
            },
          },
        },
      },
      responses: {
        "200": success(200, "Reset OTP sent"),
        "404": commonResponses.NotFound,
      },
    },
  },
  "/api/auth/verify-reset-password-otp": {
    post: {
      tags: ["Auth"],
      summary: "Verify reset OTP — returns temp token",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["email", "otp"],
              properties: {
                email: { type: "string", format: "email" },
                otp: { type: "string", minLength: 4, maxLength: 4 },
              },
            },
          },
        },
      },
      responses: {
        "200": success(200, "OTP verified — returns temp token"),
        "401": commonResponses.Unauthorized,
      },
    },
  },
  "/api/auth/reset-password": {
    post: {
      tags: ["Auth"],
      summary: "Set new password with temp token",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["password", "token"],
              properties: {
                password: { type: "string", minLength: 9 },
                token: { type: "string" },
              },
            },
          },
        },
      },
      responses: {
        "200": success(200, "Password reset"),
        "401": commonResponses.Unauthorized,
      },
    },
  },
  "/api/auth/me": {
    get: {
      tags: ["Auth"],
      summary: "Get current user profile",
      security: bearer,
      responses: {
        "200": success(200, "Profile fetched"),
        "401": commonResponses.Unauthorized,
      },
    },
  },

  "/api/members": {
    get: {
      tags: ["Members"],
      summary: "List members (paginated)",
      security: bearer,
      parameters: [
        { $ref: "#/components/parameters/PaginationPage" },
        { $ref: "#/components/parameters/PaginationLimit" },
        { name: "name", in: "query", schema: { type: "string" } },
        { name: "status", in: "query", schema: { $ref: "#/components/schemas/MembershipStatus" } },
        { name: "planId", in: "query", schema: { $ref: "#/components/schemas/MongoId" } },
      ],
      responses: {
        "200": success(200, "Members fetched"),
        "401": commonResponses.Unauthorized,
      },
    },
    post: {
      tags: ["Members"],
      summary: "Create member (JSON or multipart; photo optional)",
      security: bearer,
      requestBody: {
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["fullName", "email", "phone"],
              properties: {
                fullName: { type: "string" },
                email: { type: "string", format: "email" },
                phone: { type: "string" },
                membershipStatus: { $ref: "#/components/schemas/MembershipStatus" },
                subscriptionPlanId: { $ref: "#/components/schemas/MongoId" },
              },
            },
          },
          "multipart/form-data": {
            schema: {
              type: "object",
              required: ["fullName", "email", "phone"],
              properties: {
                fullName: { type: "string" },
                email: { type: "string", format: "email" },
                phone: { type: "string" },
                membershipStatus: { $ref: "#/components/schemas/MembershipStatus" },
                subscriptionPlanId: { $ref: "#/components/schemas/MongoId" },
                photo: { type: "string", format: "binary" },
              },
            },
          },
        },
      },
      responses: {
        "201": success(201, "Member created"),
        "401": commonResponses.Unauthorized,
        "409": commonResponses.Validation422,
      },
    },
  },
  "/api/members/{id}": {
    get: {
      tags: ["Members"],
      summary: "Get member by id",
      security: bearer,
      parameters: [{ $ref: "#/components/parameters/ResourceId" }],
      responses: {
        "200": success(200, "Member fetched"),
        "401": commonResponses.Unauthorized,
        "404": commonResponses.NotFound,
      },
    },
    put: {
      tags: ["Members"],
      summary: "Update member (replaces Cloudinary photo if provided)",
      security: bearer,
      parameters: [{ $ref: "#/components/parameters/ResourceId" }],
      requestBody: {
        content: {
          "multipart/form-data": {
            schema: {
              type: "object",
              properties: {
                fullName: { type: "string" },
                email: { type: "string" },
                phone: { type: "string" },
                membershipStatus: { $ref: "#/components/schemas/MembershipStatus" },
                subscriptionPlanId: { $ref: "#/components/schemas/MongoId" },
                photo: { type: "string", format: "binary" },
              },
            },
          },
        },
      },
      responses: {
        "200": success(200, "Member updated"),
        "401": commonResponses.Unauthorized,
        "404": commonResponses.NotFound,
      },
    },
    delete: {
      tags: ["Members"],
      summary: "Soft-delete member and remove Cloudinary photo",
      security: bearer,
      parameters: [{ $ref: "#/components/parameters/ResourceId" }],
      responses: {
        "200": success(200, "Member deleted"),
        "401": commonResponses.Unauthorized,
        "404": commonResponses.NotFound,
      },
    },
  },
  "/api/members/{id}/attendance": {
    get: {
      tags: ["Members"],
      summary: "Member attendance history",
      security: bearer,
      parameters: [
        { $ref: "#/components/parameters/ResourceId" },
        { $ref: "#/components/parameters/PaginationPage" },
        { $ref: "#/components/parameters/PaginationLimit" },
      ],
      responses: {
        "200": success(200, "Attendance fetched"),
        "401": commonResponses.Unauthorized,
      },
    },
  },
  "/api/members/{id}/subscription": {
    get: {
      tags: ["Members"],
      summary: "Get member active subscription",
      security: bearer,
      parameters: [{ $ref: "#/components/parameters/ResourceId" }],
      responses: {
        "200": success(200, "Subscription fetched"),
        "401": commonResponses.Unauthorized,
      },
    },
  },

  "/api/plans": {
    get: {
      tags: ["Plans"],
      summary: "List active subscription plans (public)",
      responses: { "200": success(200, "Plans fetched") },
    },
    post: {
      tags: ["Plans"],
      summary: "Create subscription plan",
      security: bearer,
      requestBody: {
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["name", "durationMonths", "price"],
              properties: {
                name: { type: "string" },
                durationMonths: { type: "integer", minimum: 1 },
                price: { type: "number", minimum: 0 },
                description: { type: "string" },
                isActive: { type: "boolean" },
              },
            },
          },
        },
      },
      responses: {
        "201": success(201, "Plan created"),
        "401": commonResponses.Unauthorized,
      },
    },
  },
  "/api/plans/{id}": {
    put: {
      tags: ["Plans"],
      summary: "Update subscription plan",
      security: bearer,
      parameters: [{ $ref: "#/components/parameters/ResourceId" }],
      requestBody: {
        content: { "application/json": { schema: { type: "object" } } },
      },
      responses: {
        "200": success(200, "Plan updated"),
        "401": commonResponses.Unauthorized,
        "404": commonResponses.NotFound,
      },
    },
    delete: {
      tags: ["Plans"],
      summary: "Deactivate subscription plan",
      security: bearer,
      parameters: [{ $ref: "#/components/parameters/ResourceId" }],
      responses: {
        "200": success(200, "Plan deactivated"),
        "401": commonResponses.Unauthorized,
        "404": commonResponses.NotFound,
      },
    },
  },

  "/api/subscriptions": {
    post: {
      tags: ["Subscriptions"],
      summary: "Assign plan to member and create payment",
      security: bearer,
      requestBody: {
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["memberId", "planId"],
              properties: {
                memberId: { $ref: "#/components/schemas/MongoId" },
                planId: { $ref: "#/components/schemas/MongoId" },
                method: { $ref: "#/components/schemas/PaymentMethod" },
              },
            },
          },
        },
      },
      responses: {
        "201": success(201, "Subscription created"),
        "401": commonResponses.Unauthorized,
        "404": commonResponses.NotFound,
      },
    },
  },
  "/api/subscriptions/expiring": {
    get: {
      tags: ["Subscriptions"],
      summary: "Subscriptions expiring within N days",
      security: bearer,
      parameters: [
        { name: "days", in: "query", schema: { type: "integer", default: 7 } },
      ],
      responses: {
        "200": success(200, "Expiring subscriptions fetched"),
        "401": commonResponses.Unauthorized,
      },
    },
  },
  "/api/subscriptions/{id}/renew": {
    put: {
      tags: ["Subscriptions"],
      summary: "Renew subscription and create new payment",
      security: bearer,
      parameters: [{ $ref: "#/components/parameters/ResourceId" }],
      requestBody: {
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                method: { $ref: "#/components/schemas/PaymentMethod" },
              },
            },
          },
        },
      },
      responses: {
        "200": success(200, "Subscription renewed"),
        "401": commonResponses.Unauthorized,
        "404": commonResponses.NotFound,
      },
    },
  },

  "/api/payments": {
    get: {
      tags: ["Payments"],
      summary: "List payments (paginated, filterable)",
      security: bearer,
      parameters: [
        { $ref: "#/components/parameters/PaginationPage" },
        { $ref: "#/components/parameters/PaginationLimit" },
        { name: "memberId", in: "query", schema: { $ref: "#/components/schemas/MongoId" } },
        { name: "status", in: "query", schema: { $ref: "#/components/schemas/PaymentStatus" } },
        { $ref: "#/components/parameters/DateFrom" },
        { $ref: "#/components/parameters/DateTo" },
      ],
      responses: {
        "200": success(200, "Payments fetched"),
        "401": commonResponses.Unauthorized,
      },
    },
    post: {
      tags: ["Payments"],
      summary: "Record a payment",
      security: bearer,
      requestBody: {
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["memberId", "amount", "method", "dueDate"],
              properties: {
                memberId: { $ref: "#/components/schemas/MongoId" },
                subscriptionId: { $ref: "#/components/schemas/MongoId" },
                amount: { type: "number" },
                method: { $ref: "#/components/schemas/PaymentMethod" },
                status: { $ref: "#/components/schemas/PaymentStatus" },
                dueDate: { type: "string", format: "date-time" },
                paidAt: { type: "string", format: "date-time" },
              },
            },
          },
        },
      },
      responses: {
        "201": success(201, "Payment created"),
        "401": commonResponses.Unauthorized,
      },
    },
  },
  "/api/payments/overdue": {
    get: {
      tags: ["Payments"],
      summary: "List overdue payments",
      security: bearer,
      responses: {
        "200": success(200, "Overdue payments fetched"),
        "401": commonResponses.Unauthorized,
      },
    },
  },
  "/api/payments/{id}": {
    put: {
      tags: ["Payments"],
      summary: "Update payment",
      security: bearer,
      parameters: [{ $ref: "#/components/parameters/ResourceId" }],
      requestBody: {
        content: { "application/json": { schema: { type: "object" } } },
      },
      responses: {
        "200": success(200, "Payment updated"),
        "401": commonResponses.Unauthorized,
        "404": commonResponses.NotFound,
      },
    },
  },

  "/api/attendance/checkin": {
    post: {
      tags: ["Attendance"],
      summary: "Check in member by id or QR token",
      security: bearer,
      requestBody: {
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/CheckInRequest" },
          },
        },
      },
      responses: {
        "201": success(201, "Check-in recorded"),
        "401": commonResponses.Unauthorized,
        "403": commonResponses.Forbidden,
        "404": commonResponses.NotFound,
      },
    },
  },
  "/api/attendance/today": {
    get: {
      tags: ["Attendance"],
      summary: "Today's check-ins",
      security: bearer,
      responses: {
        "200": success(200, "Today's attendance fetched"),
        "401": commonResponses.Unauthorized,
      },
    },
  },
  "/api/attendance": {
    get: {
      tags: ["Attendance"],
      summary: "List attendance records",
      security: bearer,
      parameters: [
        { $ref: "#/components/parameters/PaginationPage" },
        { $ref: "#/components/parameters/PaginationLimit" },
        { name: "memberId", in: "query", schema: { $ref: "#/components/schemas/MongoId" } },
        { name: "method", in: "query", schema: { $ref: "#/components/schemas/CheckInMethod" } },
        { name: "date", in: "query", schema: { type: "string", format: "date" } },
      ],
      responses: {
        "200": success(200, "Attendance fetched"),
        "401": commonResponses.Unauthorized,
      },
    },
  },

  "/api/trainers": {
    get: {
      tags: ["Trainers"],
      summary: "List trainers",
      security: bearer,
      responses: {
        "200": success(200, "Trainers fetched"),
        "401": commonResponses.Unauthorized,
      },
    },
    post: {
      tags: ["Trainers"],
      summary: "Create trainer profile",
      security: bearer,
      requestBody: {
        content: {
          "multipart/form-data": {
            schema: {
              type: "object",
              required: ["userId", "specialization"],
              properties: {
                userId: { $ref: "#/components/schemas/MongoId" },
                specialization: { type: "string" },
                bio: { type: "string" },
                photo: { type: "string", format: "binary" },
              },
            },
          },
        },
      },
      responses: {
        "201": success(201, "Trainer created"),
        "401": commonResponses.Unauthorized,
      },
    },
  },
  "/api/trainers/{id}": {
    put: {
      tags: ["Trainers"],
      summary: "Update trainer",
      security: bearer,
      parameters: [{ $ref: "#/components/parameters/ResourceId" }],
      requestBody: {
        content: {
          "multipart/form-data": {
            schema: {
              type: "object",
              properties: {
                specialization: { type: "string" },
                bio: { type: "string" },
                photo: { type: "string", format: "binary" },
              },
            },
          },
        },
      },
      responses: {
        "200": success(200, "Trainer updated"),
        "401": commonResponses.Unauthorized,
        "404": commonResponses.NotFound,
      },
    },
    delete: {
      tags: ["Trainers"],
      summary: "Delete trainer and Cloudinary photo",
      security: bearer,
      parameters: [{ $ref: "#/components/parameters/ResourceId" }],
      responses: {
        "200": success(200, "Trainer deleted"),
        "401": commonResponses.Unauthorized,
        "404": commonResponses.NotFound,
      },
    },
  },
  "/api/trainers/{id}/schedule": {
    get: {
      tags: ["Trainers"],
      summary: "Trainer weekly class schedule",
      security: bearer,
      parameters: [{ $ref: "#/components/parameters/ResourceId" }],
      responses: {
        "200": success(200, "Schedule fetched"),
        "401": commonResponses.Unauthorized,
        "404": commonResponses.NotFound,
      },
    },
  },

  "/api/classes": {
    get: {
      tags: ["Classes"],
      summary: "List fitness classes (public)",
      responses: { "200": success(200, "Classes fetched") },
    },
    post: {
      tags: ["Classes"],
      summary: "Create fitness class",
      security: bearer,
      requestBody: {
        content: {
          "multipart/form-data": {
            schema: {
              type: "object",
              required: ["name", "trainerId", "capacity", "location"],
              properties: {
                name: { type: "string" },
                description: { type: "string" },
                trainerId: { $ref: "#/components/schemas/MongoId" },
                schedule: { type: "string", description: "JSON array of schedule items" },
                capacity: { type: "integer" },
                location: { type: "string" },
                coverImage: { type: "string", format: "binary" },
              },
            },
          },
        },
      },
      responses: {
        "201": success(201, "Class created"),
        "401": commonResponses.Unauthorized,
      },
    },
  },
  "/api/classes/{id}": {
    put: {
      tags: ["Classes"],
      summary: "Update fitness class",
      security: bearer,
      parameters: [{ $ref: "#/components/parameters/ResourceId" }],
      requestBody: {
        content: {
          "multipart/form-data": {
            schema: { type: "object" },
          },
        },
      },
      responses: {
        "200": success(200, "Class updated"),
        "401": commonResponses.Unauthorized,
        "404": commonResponses.NotFound,
      },
    },
    delete: {
      tags: ["Classes"],
      summary: "Delete fitness class",
      security: bearer,
      parameters: [{ $ref: "#/components/parameters/ResourceId" }],
      responses: {
        "200": success(200, "Class deleted"),
        "401": commonResponses.Unauthorized,
        "404": commonResponses.NotFound,
      },
    },
  },
  "/api/classes/{id}/enroll": {
    post: {
      tags: ["Classes"],
      summary: "Enroll member in class",
      security: bearer,
      parameters: [{ $ref: "#/components/parameters/ResourceId" }],
      requestBody: {
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                memberId: { $ref: "#/components/schemas/MongoId" },
              },
            },
          },
        },
      },
      responses: {
        "201": success(201, "Enrolled successfully"),
        "401": commonResponses.Unauthorized,
        "409": commonResponses.Validation422,
      },
    },
  },
  "/api/classes/{id}/participants": {
    get: {
      tags: ["Classes"],
      summary: "List class participants",
      security: bearer,
      parameters: [{ $ref: "#/components/parameters/ResourceId" }],
      responses: {
        "200": success(200, "Participants fetched"),
        "401": commonResponses.Unauthorized,
      },
    },
  },
  "/api/classes/{id}/attendance": {
    post: {
      tags: ["Classes"],
      summary: "Mark session attendance",
      security: bearer,
      parameters: [{ $ref: "#/components/parameters/ResourceId" }],
      requestBody: {
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ClassAttendanceRequest" },
          },
        },
      },
      responses: {
        "200": success(200, "Attendance marked"),
        "401": commonResponses.Unauthorized,
      },
    },
  },

  "/api/notifications": {
    get: {
      tags: ["Notifications"],
      summary: "List unread notifications for current user",
      security: bearer,
      responses: {
        "200": success(200, "Notifications fetched"),
        "401": commonResponses.Unauthorized,
      },
    },
  },
  "/api/notifications/{id}/read": {
    put: {
      tags: ["Notifications"],
      summary: "Mark notification as read",
      security: bearer,
      parameters: [{ $ref: "#/components/parameters/ResourceId" }],
      responses: {
        "200": success(200, "Notification marked as read"),
        "401": commonResponses.Unauthorized,
        "404": commonResponses.NotFound,
      },
    },
  },

  "/api/reports/attendance": {
    get: {
      tags: ["Reports"],
      summary: "Attendance report",
      security: bearer,
      parameters: [
        { $ref: "#/components/parameters/DateFrom" },
        { $ref: "#/components/parameters/DateTo" },
      ],
      responses: {
        "200": success(200, "Attendance report"),
        "401": commonResponses.Unauthorized,
      },
    },
  },
  "/api/reports/revenue": {
    get: {
      tags: ["Reports"],
      summary: "Revenue report",
      security: bearer,
      parameters: [
        { $ref: "#/components/parameters/DateFrom" },
        { $ref: "#/components/parameters/DateTo" },
      ],
      responses: {
        "200": success(200, "Revenue report"),
        "401": commonResponses.Unauthorized,
      },
    },
  },
  "/api/reports/members": {
    get: {
      tags: ["Reports"],
      summary: "Member statistics",
      security: bearer,
      responses: {
        "200": success(200, "Members report"),
        "401": commonResponses.Unauthorized,
      },
    },
  },
  "/api/reports/classes": {
    get: {
      tags: ["Reports"],
      summary: "Class enrollment statistics",
      security: bearer,
      responses: {
        "200": success(200, "Classes report"),
        "401": commonResponses.Unauthorized,
      },
    },
  },

  "/api/files/test-cloudinary": {
    post: {
      tags: ["Files"],
      summary: "Test Cloudinary upload",
      security: bearer,
      requestBody: {
        content: {
          "multipart/form-data": {
            schema: {
              type: "object",
              properties: {
                mainImage: { type: "string", format: "binary" },
                images: { type: "array", items: { type: "string", format: "binary" } },
              },
            },
          },
        },
      },
      responses: {
        "200": { description: "Uploaded file metadata" },
        "401": commonResponses.Unauthorized,
      },
    },
  },
  "/api/files/delete-image/{fileId}": {
    delete: {
      tags: ["Files"],
      summary: "Delete uploaded file from Cloudinary",
      security: bearer,
      parameters: [{ $ref: "#/components/parameters/FileId" }],
      responses: {
        "200": success(200, "File deleted"),
        "401": commonResponses.Unauthorized,
      },
    },
  },
};
