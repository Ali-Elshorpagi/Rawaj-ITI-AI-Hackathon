import { z } from "zod";
import { mongoIdSchema } from "../../../shared/utils/custom-checckers";
import { emptyToUndefined } from "../../../shared/utils/gym/form.utils";

export const inputSchema = z.object({
  fullName: z.preprocess(
    emptyToUndefined,
    z.string({ required_error: "user_name_missing" }).min(2)
  ),
  email: z.preprocess(
    emptyToUndefined,
    z.string({ required_error: "user_email_missing" }).email({
      message: "user_email_invalid",
    })
  ),
  phone: z.preprocess(
    emptyToUndefined,
    z.string({ required_error: "user_phone_missing" }).min(8)
  ),
  membershipStatus: z.preprocess(
    emptyToUndefined,
    z.enum(["active", "expired", "suspended"]).optional().default("active")
  ),
  subscriptionPlanId: z.preprocess(
    emptyToUndefined,
    mongoIdSchema.optional()
  ),
  photo: z.array(z.any()).optional(),
});

export type Input = z.infer<typeof inputSchema>;
