import { z } from "zod";
import { mongoIdSchema } from "../../../shared/utils/custom-checckers";

export const inputSchema = z.object({
  fileIds: z.array(mongoIdSchema),
  userId: mongoIdSchema,
});

export type Input = { fileIds: string[]; userId: string };
