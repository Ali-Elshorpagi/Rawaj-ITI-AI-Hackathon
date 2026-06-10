import { z } from "zod";

export const stringSchema = (
  fieldName: string,
  required: boolean = true,
  additionalVallidation: ((value: any) => boolean) | undefined = undefined
) => {
  if (required) {
    return z
      .any()
      .refine((value) => value, {
        message: `${fieldName}_missing`,
      })
      .refine((value) => typeof value === "string", {
        message: `${fieldName}_wrong_type`,
      })
      .refine(additionalVallidation ? additionalVallidation : (value) => true, {
        message: `${fieldName}_wrong_format`,
      });
  }
  return z
    .any()
    .refine(
      (value) => {
        if (!value) return true;
        return typeof value === "string";
      },
      {
        message: `${fieldName}_wrong_type`,
      }
    )
    .refine(additionalVallidation ? additionalVallidation : (value) => true, {
      message: `${fieldName}_wrong_format`,
    });
};
