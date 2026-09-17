import { describe, expect, it } from "vitest";
import { matchesProfileQuery } from "./search-match";

// Usernames are always plain lowercase ASCII (enforced by the signup regex
// ^[a-z0-9_]{3,24}$), but display names can contain any Turkish character.
const profile = {
  id: "1",
  username: "kemalkoleksiyon",
  display_name: "Kemal Öztürk",
  avatar_path: null,
};

describe("matchesProfileQuery", () => {
  it("matches everyone when the query is empty or whitespace", () => {
    expect(matchesProfileQuery(profile, "")).toBe(true);
    expect(matchesProfileQuery(profile, "   ")).toBe(true);
  });

  it("matches a substring of the username, case-insensitively", () => {
    expect(matchesProfileQuery(profile, "kemal")).toBe(true);
    // Plain (non-Turkish) uppercasing of "I" is "i", so this must still find
    // a username that only ever contains plain ASCII letters.
    expect(matchesProfileQuery(profile, "KOLEKSIYON")).toBe(true);
  });

  it("matches a substring of the display name", () => {
    expect(matchesProfileQuery(profile, "öztürk")).toBe(true);
    expect(matchesProfileQuery(profile, "Kemal Öz")).toBe(true);
  });

  it("is Turkish-locale aware for names with a dotted capital İ", () => {
    // toLocaleLowerCase("tr") folds "İ" -> "i" cleanly; the locale-agnostic
    // toLowerCase() instead produces "i" + a combining dot above, which
    // would silently break a search for an otherwise-plain "i".
    const withCapitalI = { ...profile, display_name: "İbrahim Kaya" };
    expect(matchesProfileQuery(withCapitalI, "ibrahim")).toBe(true);
    // And the reverse: typing the query with the Turkish İ should still
    // find a name folded the same way.
    expect(matchesProfileQuery(withCapitalI, "İbrahim")).toBe(true);
  });

  it("does not match unrelated queries", () => {
    expect(matchesProfileQuery(profile, "nazli")).toBe(false);
  });
});
