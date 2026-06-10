import { z } from "zod";
import { mongoIdSchema } from "../../../shared/utils/custom-checckers";

export const querySchema = z.object({
  name: z.string().optional(),
  status: z.enum(["active", "expired", "suspended"]).optional(),
  planId: mongoIdSchema.optional(),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    skip: z.number(),
  }),
});

export type QueryInput = z.infer<typeof querySchema>;
