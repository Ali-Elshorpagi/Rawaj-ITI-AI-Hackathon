import crypto from "crypto";

/**
 * Generate a unique QR check-in token for a gym member.
 */
export const generateQrCode = (): string => {
  return crypto.randomUUID();
};
