import { config } from "../shared/config";
import { swaggerComponents } from "./components";
import { swaggerPaths } from "./paths";

function serverOrigin(): string {
  try {
    const u = new URL(config.app.url);
    return `${u.protocol}//${u.host}`;
  } catch {
    return "http://localhost:3000";
  }
}

export const openApiDocument = {
  openapi: "3.0.3",
  info: {
    title: "GymDesk API",
    version: "1.0.0",
    description: [
      "REST API for **GymDesk** — gym membership, attendance, payments, trainers, and fitness classes.",
      "",
      "**Auth flow:** `POST /api/auth/register` → OTP email → `POST /api/auth/verify` → JWT.",
      "Password reset: `request-password-reset` → `verify-reset-password-otp` → `reset-password`.",
      "Send `Authorization: Bearer <token>` on protected routes. Token includes a `role` claim.",
      "",
      "**Roles:**",
      "- `guest` — unauthenticated; public routes only (plans, classes list)",
      "- `member` — self-service check-in, notifications",
      "- `reception` — member CRUD, payments, subscriptions",
      "- `trainer` — class schedule, participants, session attendance",
      "- `manager` / `owner` — reports, staff, plan management",
      "",
      "**Uploads:** Member `photo`, trainer `photo`, and class `coverImage` use `multipart/form-data` with the existing Cloudinary middleware.",
      "",
      "**Success envelope:** `{ success, message, data, statusCode }`",
    ].join("\n"),
  },
  servers: [
    {
      url: serverOrigin(),
      description: "API origin (from `API_URL` / config)",
    },
  ],
  tags: [
    { name: "Health", description: "Service health" },
    { name: "Auth", description: "Registration, login, profile" },
    { name: "Members", description: "Gym member management" },
    { name: "Plans", description: "Subscription plans" },
    { name: "Subscriptions", description: "Member subscriptions" },
    { name: "Payments", description: "Gym payments" },
    { name: "Attendance", description: "Check-in and attendance" },
    { name: "Trainers", description: "Trainer profiles and schedules" },
    { name: "Classes", description: "Fitness classes and enrollment" },
    { name: "Notifications", description: "In-app notifications" },
    { name: "Reports", description: "Analytics and reports" },
    { name: "Files", description: "Cloudinary upload utilities" },
  ],
  paths: swaggerPaths,
  components: swaggerComponents,
} as const;
