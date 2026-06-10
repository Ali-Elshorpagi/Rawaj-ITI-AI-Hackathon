import { z } from "zod";
import { mongoIdSchema } from "../../../shared/utils/custom-checckers";
import { emptyToUndefined } from "../../../shared/utils/gym/form.utils";

export const inputSchema = z.object({
  id: mongoIdSchema,
  data: z.object({
    fullName: z.preprocess(emptyToUndefined, z.string().min(2).optional()),
    email: z.preprocess(
      emptyToUndefined,
      z.string().email({ message: "user_email_invalid" }).optional()
    ),
    phone: z.preprocess(emptyToUndefined, z.string().min(8).optional()),
    membershipStatus: z.preprocess(
      emptyToUndefined,
      z.enum(["active", "expired", "suspended"]).optional()
    ),
    subscriptionPlanId: z.preprocess(
      emptyToUndefined,
      mongoIdSchema.optional()
    ),
    photo: z.array(z.any()).optional(),
  }),
});

export type Input = z.infer<typeof inputSchema>;
