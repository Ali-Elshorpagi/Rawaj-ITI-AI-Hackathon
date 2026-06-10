import { z } from "zod";
import mongoose from "mongoose";

// Custom MongoId checker
export const mongoIdSchema = z.union([
  z
    .string()
    .refine((id) => /^[a-f\d]{24}$/i.test(id), {
      message: "invalid_mongo_id",
    })
    .transform(
      (id: string) =>
        new mongoose.Types.ObjectId(
          id
        ) as unknown as mongoose.Schema.Types.ObjectId
    ),
  z
    .any()
    .refine((id) => mongoose.Types.ObjectId.isValid(id), {
      message: "invalid_mongo_id",
    })
    .transform(
      (id: any) =>
        new mongoose.Types.ObjectId(
          id.toString() as string
        ) as unknown as mongoose.Schema.Types.ObjectId
    ),
]);

export const mongoIdSchemaSpecialMessage = (message: string) =>
  z.union([
    z
      .string()
      .refine((id) => /^[a-f\d]{24}$/i.test(id), {
        message,
      })
      .transform(
        (id: string) =>
          new mongoose.Types.ObjectId(
            id
          ) as unknown as mongoose.Schema.Types.ObjectId
      ),
    z
      .any()
      .refine((id) => mongoose.Types.ObjectId.isValid(id), {
        message,
      })
      .transform(
        (id: any) =>
          new mongoose.Types.ObjectId(
            id.toString() as string
          ) as unknown as mongoose.Schema.Types.ObjectId
      ),
  ]);
