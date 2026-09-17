import { describe, expect, it } from "vitest";
import { timeAgo, collectionTimeLabel } from "./time";

function isoSecondsAgo(seconds: number): string {
  return new Date(Date.now() - seconds * 1000).toISOString();
}

describe("timeAgo", () => {
  it("shows 'just now' / 'az önce' under a minute", () => {
    const iso = isoSecondsAgo(10);
    expect(timeAgo(iso, "en")).toBe("just now");
    expect(timeAgo(iso, "tr")).toBe("az önce");
  });

  it("formats minutes, with English pluralization", () => {
    expect(timeAgo(isoSecondsAgo(60), "en")).toBe("1 minute ago");
    expect(timeAgo(isoSecondsAgo(60), "tr")).toBe("1 dakika önce");
    expect(timeAgo(isoSecondsAgo(5 * 60), "en")).toBe("5 minutes ago");
    expect(timeAgo(isoSecondsAgo(5 * 60), "tr")).toBe("5 dakika önce");
  });

  it("formats hours", () => {
    expect(timeAgo(isoSecondsAgo(60 * 60), "en")).toBe("1 hour ago");
    expect(timeAgo(isoSecondsAgo(3 * 60 * 60), "en")).toBe("3 hours ago");
    expect(timeAgo(isoSecondsAgo(3 * 60 * 60), "tr")).toBe("3 saat önce");
  });

  it("formats days", () => {
    expect(timeAgo(isoSecondsAgo(24 * 60 * 60), "en")).toBe("1 day ago");
    expect(timeAgo(isoSecondsAgo(2 * 24 * 60 * 60), "tr")).toBe("2 gün önce");
  });

  it("formats months", () => {
    expect(timeAgo(isoSecondsAgo(35 * 24 * 60 * 60), "en")).toBe("1 month ago");
    expect(timeAgo(isoSecondsAgo(70 * 24 * 60 * 60), "tr")).toBe("2 ay önce");
  });

  it("formats years", () => {
    expect(timeAgo(isoSecondsAgo(400 * 24 * 60 * 60), "en")).toBe("1 year ago");
    expect(timeAgo(isoSecondsAgo(800 * 24 * 60 * 60), "tr")).toBe("2 yıl önce");
  });
});

describe("collectionTimeLabel", () => {
  it("says 'shared' when updated_at tracks created_at closely (initial upload window)", () => {
    const created = isoSecondsAgo(3 * 60 * 60);
    const updated = new Date(new Date(created).getTime() + 60 * 1000).toISOString(); // +1 min
    expect(collectionTimeLabel(created, updated, "en")).toBe("shared 3 hours ago");
    expect(collectionTimeLabel(created, updated, "tr")).toBe("3 saat önce paylaşıldı");
  });

  it("says 'updated' once the gap exceeds the initial-upload threshold", () => {
    const created = isoSecondsAgo(3 * 60 * 60);
    const updated = isoSecondsAgo(60 * 60); // edited an hour ago, 2h after creation
    expect(collectionTimeLabel(created, updated, "en")).toBe("updated 1 hour ago");
    expect(collectionTimeLabel(created, updated, "tr")).toBe("1 saat önce güncellendi");
  });
});
