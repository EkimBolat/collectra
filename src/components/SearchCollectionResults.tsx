"use client";

import { useState, useTransition } from "react";
import CollectionCard from "./CollectionCard";
import { loadMoreSearchCollections } from "@/app/search/actions";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import type { CollectionWithRelations } from "@/lib/types";
import type { Locale } from "@/lib/i18n/client";

export default function SearchCollectionResults({
  query,
  initialItems,
  initialHasMore,
  locale,
}: {
  query: string;
  initialItems: CollectionWithRelations[];
  initialHasMore: boolean;
  locale: Locale;
}) {
  const { t } = useLocale();
  const [items, setItems] = useState(initialItems);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [pending, startTransition] = useTransition();

  const handleLoadMore = () => {
    startTransition(async () => {
      const next = await loadMoreSearchCollections(query, items.length);
      setItems((prev) => [...prev, ...next.items]);
      setHasMore(next.hasMore);
    });
  };

  return (
    <>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {items.map((c) => (
          <CollectionCard key={c.id} collection={c} locale={locale} />
        ))}
      </div>

      {hasMore && (
        <button
          type="button"
          onClick={handleLoadMore}
          disabled={pending}
          className="btn btn-secondary mx-auto mt-6 block disabled:opacity-50"
        >
          {pending ? t.home.loadingMore : t.home.loadMore}
        </button>
      )}
    </>
  );
}
