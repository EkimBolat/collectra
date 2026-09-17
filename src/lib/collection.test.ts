import { describe, expect, it } from "vitest";
import { getCoverItem } from "./collection";
import type { CollectionItem, CollectionWithRelations } from "./types";

function makeItem(overrides: Partial<CollectionItem> & { id: string; position: number }): CollectionItem {
  return {
    collection_id: "collection-1",
    image_path: `${overrides.id}.jpg`,
    caption: null,
    created_at: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

function makeCollection(
  items: CollectionItem[],
  coverItemId: string | null,
): CollectionWithRelations {
  return {
    id: "collection-1",
    owner_id: "owner-1",
    title: "Test Collection",
    description: null,
    category_id: 1,
    visibility: "public",
    cover_item_id: coverItemId,
    item_count: items.length,
    like_count: 0,
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
    owner: { id: "owner-1", username: "owner", display_name: "Owner", avatar_path: null },
    category: { slug: "lego", name: "Lego", emoji: "🧱" },
    items,
  };
}

describe("getCoverItem", () => {
  it("returns the explicitly chosen cover item regardless of position", () => {
    const items = [
      makeItem({ id: "a", position: 0 }),
      makeItem({ id: "b", position: 1 }),
      makeItem({ id: "c", position: 2 }),
    ];
    const collection = makeCollection(items, "b");
    expect(getCoverItem(collection)?.id).toBe("b");
  });

  it("falls back to the first item by position when no cover is set", () => {
    // Deliberately out of order to make sure it sorts before picking.
    const items = [
      makeItem({ id: "c", position: 2 }),
      makeItem({ id: "a", position: 0 }),
      makeItem({ id: "b", position: 1 }),
    ];
    const collection = makeCollection(items, null);
    expect(getCoverItem(collection)?.id).toBe("a");
  });

  it("falls back to the first item when cover_item_id points at a deleted item", () => {
    const items = [makeItem({ id: "a", position: 0 }), makeItem({ id: "b", position: 1 })];
    const collection = makeCollection(items, "deleted-item-id");
    expect(getCoverItem(collection)?.id).toBe("a");
  });

  it("returns undefined for a collection with no items", () => {
    const collection = makeCollection([], null);
    expect(getCoverItem(collection)).toBeUndefined();
  });
});
