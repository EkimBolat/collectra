export type Locale = "tr" | "en";

export const LOCALE_COOKIE = "collectra_locale";
export const DEFAULT_LOCALE: Locale = "tr";

export const CATEGORY_NAMES: Record<string, { tr: string; en: string }> = {
  lego: { tr: "Lego & Yapı Setleri", en: "Lego & Building Sets" },
  "trading-cards": { tr: "Kartlar", en: "Trading Cards" },
  stamps: { tr: "Pullar", en: "Stamps" },
  coins: { tr: "Paralar & Madeni Para", en: "Coins & Currency" },
  vinyl: { tr: "Plak & Müzik", en: "Vinyl & Music" },
  books: { tr: "Kitaplar", en: "Books" },
  figures: { tr: "Figürler & Oyuncaklar", en: "Figures & Toys" },
  watches: { tr: "Saatler", en: "Watches" },
  sneakers: { tr: "Sneaker & Ayakkabı", en: "Sneakers & Shoes" },
  antiques: { tr: "Antika", en: "Antiques" },
  ephemera: { tr: "Kağıt & Efemera", en: "Paper & Ephemera" },
  minerals: { tr: "Taş & Mineral", en: "Rocks & Minerals" },
  "video-games": { tr: "Video Oyunları", en: "Video Games" },
  art: { tr: "Sanat & Baskı", en: "Art & Prints" },
  other: { tr: "Diğer", en: "Other" },
};

export function categoryName(slug: string, locale: Locale, fallback: string): string {
  return CATEGORY_NAMES[slug]?.[locale] ?? fallback;
}
