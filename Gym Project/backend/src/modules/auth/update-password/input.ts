import { z } from "zod";
import { mongoIdSchema } from "../../../shared/utils/custom-checckers";
import { passwordSchema } from "../shared/passwordSchema";

export const inputSchema = z.object({
  data: z.object({
    password: z.any().refine((value) => value, {
      message: "user_password_missing",
    }),
    newPassword: passwordSchema,
  }),
  userId: mongoIdSchema,
});

export type Input = z.infer<typeof inputSchema>;
