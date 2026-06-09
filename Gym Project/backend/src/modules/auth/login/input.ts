import { z } from "zod";
import { GYM_ROLES } from "../../../shared/constants/gym-roles";
import { emailSchema } from "../shared/passwordSchema";

export const inputSchema = z.object({
  email: emailSchema,
  password: z.any().refine((value) => value, {
    message: "user_password_missing",
  }),
  role: z
    .any()
    .refine((value) => value, { message: "user_role_missing" })
    .refine(
      (value) => typeof value === "string" && GYM_ROLES.includes(value as any),
      { message: "user_role_invalid" }
    ),
});

export type Input = z.infer<typeof inputSchema>;
