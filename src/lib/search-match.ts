import type { Profile } from "./types";

type ListProfile = Pick<Profile, "id" | "username" | "display_name" | "avatar_path">;

// Case-insensitive substring match against username or display name — an
// empty query matches everyone (used for the collaborator picker's
// client-side search box).
//
// Checked in both plain and Turkish-locale lowercase: JS's locale-agnostic
// toLowerCase() maps "İ" -> "i̇" (with a combining dot, not plain "i"), while
// toLocaleLowerCase("tr") maps plain ASCII "I" -> "ı" (not "i"). Usernames
// are always plain ASCII (enforced at signup), so checking a query typed
// either way against both foldings is what makes "İstanbul" and "KOLEKSIYON"
// both find a user named "istanbul_koleksiyon".
export function matchesProfileQuery(profile: ListProfile, query: string): boolean {
  const q = query.trim();
  if (!q) return true;

  const qLower = q.toLowerCase();
  const qTrLower = q.toLocaleLowerCase("tr");
  const username = profile.username.toLowerCase();
  const nameLower = profile.display_name.toLowerCase();
  const nameTrLower = profile.display_name.toLocaleLowerCase("tr");

  return (
    username.includes(qLower) ||
    username.includes(qTrLower) ||
    nameLower.includes(qLower) ||
    nameTrLower.includes(qTrLower)
  );
}
