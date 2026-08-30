import type { Locale } from "./constants";

export function timeAgo(iso: string, locale: Locale): string {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);

  if (seconds < 60) return locale === "tr" ? "az önce" : "just now";

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return locale === "tr"
      ? `${minutes} dakika önce`
      : `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return locale === "tr" ? `${hours} saat önce` : `${hours} hour${hours > 1 ? "s" : ""} ago`;
  }

  const days = Math.floor(hours / 24);
  if (days < 30) {
    return locale === "tr" ? `${days} gün önce` : `${days} day${days > 1 ? "s" : ""} ago`;
  }

  const months = Math.floor(days / 30);
  if (months < 12) {
    return locale === "tr" ? `${months} ay önce` : `${months} month${months > 1 ? "s" : ""} ago`;
  }

  const years = Math.floor(months / 12);
  return locale === "tr" ? `${years} yıl önce` : `${years} year${years > 1 ? "s" : ""} ago`;
}

// A collection's updated_at also gets bumped by the item-count trigger right after
// creation (as the initial photos are inserted), so only treat it as a genuine later
// edit once the gap is bigger than that upload window.
const UPDATED_THRESHOLD_MS = 5 * 60 * 1000;

export function collectionTimeLabel(
  createdAt: string,
  updatedAt: string,
  locale: Locale,
): string {
  const wasUpdated =
    new Date(updatedAt).getTime() - new Date(createdAt).getTime() > UPDATED_THRESHOLD_MS;
  const ago = timeAgo(wasUpdated ? updatedAt : createdAt, locale);

  if (locale === "tr") return wasUpdated ? `${ago} güncellendi` : `${ago} paylaşıldı`;
  return wasUpdated ? `updated ${ago}` : `shared ${ago}`;
}
