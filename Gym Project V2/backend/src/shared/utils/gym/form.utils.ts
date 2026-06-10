/** Treat empty multipart form values as undefined. */
export const emptyToUndefined = (val: unknown): unknown =>
  val === "" || val === null || val === undefined ? undefined : val;
