export function parseValidDMY(dateStr: string) {
  if (typeof dateStr !== "string") return null; // Ensure input is a string

  const parts = dateStr.split("/");
  if (parts.length !== 3) return null; // Ensure correct format (D/M/Y)

  const [day, month, year] = parts.map(Number);
  if (
    !Number.isInteger(day) ||
    !Number.isInteger(month) ||
    !Number.isInteger(year)
  )
    return null; // Ensure numbers

  if (year < 1000 || year > 9999) return null; // Check for reasonable year range

  if (month < 1 || month > 12) return null; // Month must be between 1-12

  // Days in each month (handling leap years for February)
  const daysInMonth = [
    31,
    year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0) ? 29 : 28,
    31,
    30,
    31,
    30,
    31,
    31,
    30,
    31,
    30,
    31,
  ];

  if (day < 1 || day > daysInMonth[month - 1]) return null; // Validate day

  return new Date(Date.UTC(year, month - 1, day)); // Convert to Date object
}
