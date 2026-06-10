import { z } from "zod";

export const passwordSchema = z
  .any()
  .refine((value) => value, { message: "user_password_missing" })
  .refine((value) => typeof value === "string" && value.length > 8, {
    message: "user_password_too_short",
  })
  .refine((value) => /[A-Z]/.test(value), {
    message: "user_password_missing_uppercase",
  })
  .refine((value) => /[a-z]/.test(value), {
    message: "user_password_missing_lowercase",
  })
  .refine((value) => /[0-9]/.test(value), {
    message: "user_password_missing_number",
  })
  .refine((value) => /[^A-Za-z0-9]/.test(value), {
    message: "user_password_missing_special_char",
  });

export const emailSchema = z
  .any()
  .refine((value) => value, { message: "user_email_missing" })
  .refine((value) => typeof value === "string" && value.length > 3, {
    message: "user_email_wrong_type",
  })
  .refine((value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value), {
    message: "user_email_invalid",
  });
