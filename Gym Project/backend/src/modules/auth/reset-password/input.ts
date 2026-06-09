import { z } from "zod";
import { emailSchema, passwordSchema } from "../shared/passwordSchema";

export const requestResetPasswordInputSchema = z.object({
  email: emailSchema,
});

export const otpVerifyInputSchema = z.object({
  email: emailSchema,
  otp: z
    .any()
    .refine((value) => value, { message: "user_otp_missing" })
    .refine((value) => typeof value === "string" && value.length === 4, {
      message: "user_otp_wrong_type",
    }),
});

export const resetPasswordInputSchema = z.object({
  password: passwordSchema,
  token: z.any().refine((value) => value && typeof value === "string", {
    message: "user_token_missing",
  }),
});

export type RequestResetInput = z.infer<typeof requestResetPasswordInputSchema>;
export type OtpVerifyInput = z.infer<typeof otpVerifyInputSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordInputSchema>;
