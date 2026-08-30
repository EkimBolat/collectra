import { dictionaries } from "./dictionaries";
import { getLocale } from "./locale";

export { LOCALE_COOKIE, DEFAULT_LOCALE, getLocale, categoryName } from "./locale";
export type { Locale } from "./locale";
export { timeAgo, collectionTimeLabel } from "./time";
export type { Dictionary } from "./dictionaries";

export async function getDict() {
  const locale = await getLocale();
  return { locale, t: dictionaries[locale] };
}
