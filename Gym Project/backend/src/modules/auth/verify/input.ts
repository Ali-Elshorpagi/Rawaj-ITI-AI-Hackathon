import { z } from "zod";
import { emailSchema } from "../shared/passwordSchema";

export const verifyInputSchema = z.object({
  otp: z
    .any()
    .refine((value) => value, { message: "user_otp_missing" })
    .refine((value) => typeof value === "string" && value.length === 4, {
      message: "user_otp_wrong_type",
    }),
  email: emailSchema,
});

export const resendOtpInputSchema = z.object({
  email: emailSchema,
});

export type VerifyInput = z.infer<typeof verifyInputSchema>;
export type ResendOtpInput = z.infer<typeof resendOtpInputSchema>;
