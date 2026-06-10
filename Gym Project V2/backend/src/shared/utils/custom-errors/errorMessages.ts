export const errorMessages = {
  en: {
    userNotFound: "User doesn't exist.",
    otpNotGenerated: "OTP not generated",
    otpExpired: "OTP expired",
    invalidOtp: "Invalid OTP",
    invalidToken: "Invalid token",
  },
  ar: {
    userNotFound: "المستخدم غير موجود",
    otpNotGenerated: "لا يوجد رمز تحقق مطابق",
    otpExpired: "انتهت صلاحية رمز التحقق",
    invalidOtp: "خطاء في رمز التحقق",
    invalidToken: "الرمز غير صالح",
  },
} as const;

type Language = keyof typeof errorMessages; // "en" | "ar"
type ErrorKey = keyof typeof errorMessages.en; // Keys of the error messages

/**
 * Helper function to get error messages based on language and error key.
 * @param language - The language code (e.g., "en", "ar").
 * @param key - The error key (e.g., "userNotFound").
 * @returns The error message in the specified language, or English as fallback.
 */
export const getErrorMessage = (language: string, key: ErrorKey): string => {
  const messages = errorMessages[language as Language] || errorMessages.en;
  return messages[key];
};
