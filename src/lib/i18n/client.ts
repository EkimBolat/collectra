// Client-safe barrel: no next/headers dependency, safe to import from "use client" files.
export { LOCALE_COOKIE, DEFAULT_LOCALE, categoryName } from "./constants";
export type { Locale } from "./constants";
export { timeAgo, collectionTimeLabel } from "./time";
export { dictionaries } from "./dictionaries";
export type { Dictionary } from "./dictionaries";
