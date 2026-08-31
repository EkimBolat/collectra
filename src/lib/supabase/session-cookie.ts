// @supabase/ssr hard-codes a ~400-day maxAge on every auth cookie it writes
// (see DEFAULT_COOKIE_OPTIONS), so a signed-in session survives closing the
// browser entirely. Stripping maxAge/expires here turns those into session
// cookies that the browser clears once it's closed — without touching the
// maxAge:0 writes the library uses to delete a cookie on sign-out.
export function toSessionCookie<T extends { maxAge?: number; expires?: Date }>(
  options: T,
): Omit<T, "maxAge" | "expires"> & { maxAge?: number; expires?: Date } {
  if (options.maxAge === 0) return options;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { maxAge, expires, ...rest } = options;
  return rest;
}
