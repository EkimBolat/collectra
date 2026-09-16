import type { CollectionItem, CollectionWithRelations } from "./types";

export function getCoverItem(collection: CollectionWithRelations): CollectionItem | undefined {
  const sorted = [...collection.items].sort((a, b) => a.position - b.position);
  return (
    (collection.cover_item_id && sorted.find((i) => i.id === collection.cover_item_id)) ||
    sorted[0]
  );
}
