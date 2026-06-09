import { z } from "zod";

function luhnCheck(id: string): boolean {
  let sum = 0;
  let shouldDouble = false;

  // Loop through the digits starting from the right
  for (let i = id.length - 1; i >= 0; i--) {
    let digit = parseInt(id[i]);

    // Double every second digit
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9; // If the result is greater than 9, subtract 9
      }
    }

    sum += digit;
    shouldDouble = !shouldDouble; // Alternate between doubling and not doubling
  }

  // Check if the sum is divisible by 10
  return sum % 10 === 0;
}

// Zod schema to validate the ID number
export const identityNumberSchema = z
  .any()
  .refine((value) => value, {
    message: "id_number_missing",
  })
  .refine(
    (val) => {
      if (typeof val !== "string") return false;
      const regex = /^\d{10}$/;
      return regex.test(val);
    },
    {
      message: "invalid_id_number",
    }
  );
