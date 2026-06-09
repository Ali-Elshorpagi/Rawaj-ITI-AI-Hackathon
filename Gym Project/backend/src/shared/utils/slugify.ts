export const slugify = (input: string) => {
  // Check if the string contains Arabic characters
  const isArabic = /[\u0600-\u06FF]/.test(input);

  if (isArabic) {
    // Process Arabic string
    return input
      .toLowerCase()
      .replace(/[^\d\u0621-\u064A]+/g, "-")
      .replace(/^-|-$/g, "");
  } else {
    // Process English string
    return input
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }
};
