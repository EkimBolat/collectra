import { cookies } from "next/headers";
import { LOCALE_COOKIE, DEFAULT_LOCALE, type Locale } from "./constants";

export { LOCALE_COOKIE, DEFAULT_LOCALE, CATEGORY_NAMES, categoryName } from "./constants";
export type { Locale } from "./constants";

export async function getLocale(): Promise<Locale> {
  const store = await cookies();
  const value = store.get(LOCALE_COOKIE)?.value;
  return value === "en" ? "en" : DEFAULT_LOCALE;
}
