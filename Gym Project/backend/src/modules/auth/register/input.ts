import { z } from "zod";
import { GYM_ROLES } from "../../../shared/constants/gym-roles";
import { emailSchema, passwordSchema } from "../shared/passwordSchema";

export const inputSchema = z.object({
  name: z
    .any()
    .refine((value) => value, { message: "user_name_missing" })
    .refine((value) => typeof value === "string" && value.length > 3, {
      message: "user_name_wrong_type",
    }),
  email: emailSchema,
  password: passwordSchema,
  phone: z
    .any()
    .refine((value) => value, { message: "user_phone_missing" })
    .refine((value) => typeof value === "string" && value.length > 3, {
      message: "user_phone_wrong_type",
    })
    .refine((value) => /^\d+$/.test(value), { message: "user_phone_invalid" }),
  role: z
    .any()
    .refine((value) => value, { message: "user_role_missing" })
    .refine(
      (value) => typeof value === "string" && GYM_ROLES.includes(value as any),
      { message: "user_role_invalid" }
    ),
  address: z
    .any()
    .optional()
    .refine((value) => !value || typeof value === "string", {
      message: "user_address_invalid",
    }),
});

export type Input = z.infer<typeof inputSchema>;
