import Link from "next/link";
import Image from "next/image";
import { publicImageUrl } from "@/lib/supabase/storage";
import { categoryName, type Locale } from "@/lib/i18n/client";
import type { CollectionWithRelations } from "@/lib/types";

export default function CollectionCard({
  collection,
  locale,
}: {
  collection: CollectionWithRelations;
  locale: Locale;
}) {
  const cover = [...collection.items].sort((a, b) => a.position - b.position)[0];
  const coverUrl = publicImageUrl("collection-images", cover?.image_path ?? null);

  return (
    <Link
      href={`/c/${collection.id}`}
      className="card group flex flex-col overflow-hidden transition-shadow hover:shadow-lg hover:shadow-black/5"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-accent-soft">
        {coverUrl ? (
          <Image
            src={coverUrl}
            alt={collection.title}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-4xl">
            {collection.category.emoji}
          </div>
        )}
        {collection.item_count > 1 && (
          <span className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-black/65 px-2 py-1 text-xs font-medium text-white backdrop-blur-sm">
            <svg viewBox="0 0 16 16" className="h-3 w-3 fill-current">
              <rect x="1" y="4" width="10" height="10" rx="1.5" />
              <rect x="5" y="1" width="10" height="10" rx="1.5" opacity="0.6" />
            </svg>
            {collection.item_count}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3.5">
        <p className="line-clamp-1 font-semibold">{collection.title}</p>
        <p className="text-xs text-muted">
          {collection.category.emoji}{" "}
          {categoryName(collection.category.slug, locale, collection.category.name)}
        </p>
        <div className="mt-1.5 flex items-center justify-between text-xs text-muted">
          <span>@{collection.owner.username}</span>
          <span className="flex items-center gap-1">
            <svg viewBox="0 0 20 20" className="h-3.5 w-3.5 fill-current">
              <path d="M10 17.5s-6.5-4-8.5-8A4.5 4.5 0 0110 5.5 4.5 4.5 0 0118.5 9.5c-2 4-8.5 8-8.5 8z" />
            </svg>
            {collection.like_count}
          </span>
        </div>
      </div>
    </Link>
  );
}
