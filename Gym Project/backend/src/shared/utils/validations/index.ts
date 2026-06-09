export const isValidEmail = (email: string) => {
  if (typeof email !== "string") {
    return false;
  }
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};

export const isValidPhone = (phone: string) => {
  if (typeof phone !== "string") {
    return false;
  }
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  return phoneRegex.test(phone);
};

export const isValidURL = (url: string) => {
  if (typeof url !== "string") {
    return false;
  }
  const urlRegex =
    /^(https?:\/\/)?([\w.-]+)\.([a-zA-Z]{2,})(:[0-9]{1,5})?(\/[^\s]*)?$/;

  return urlRegex.test(url);
};

export function validateSaudiIBAN(iban: string): boolean {
  // Check length and country code
  if (!/^SA\d{22}$/.test(iban)) return false;

  // Rearrange IBAN for validation
  let rearranged = iban.slice(4) + "2710"; // 'S' -> 27, 'A' -> 10

  // Convert to integer string
  let numericIBAN = rearranged.replace(/[A-Z]/g, (char) =>
    (char.charCodeAt(0) - 55).toString()
  );

  // Mod 97 check
  let remainder = BigInt(numericIBAN) % 97n;
  return remainder === 1n;
}
