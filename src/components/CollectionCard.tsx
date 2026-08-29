import Link from "next/link";
import Image from "next/image";
import { publicImageUrl } from "@/lib/supabase/storage";
import type { CollectionWithRelations } from "@/lib/types";

export default function CollectionCard({
  collection,
}: {
  collection: CollectionWithRelations;
}) {
  const cover = [...collection.items].sort((a, b) => a.position - b.position)[0];
  const coverUrl = publicImageUrl("collection-images", cover?.image_path ?? null);

  return (
    <Link
      href={`/c/${collection.id}`}
      className="group flex flex-col overflow-hidden rounded-lg border border-black/10 dark:border-white/10"
    >
      <div className="relative aspect-square w-full bg-black/5 dark:bg-white/5">
        {coverUrl ? (
          <Image
            src={coverUrl}
            alt={collection.title}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-3xl">
            {collection.category.emoji}
          </div>
        )}
        {collection.item_count > 1 && (
          <span className="absolute right-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-xs text-white">
            {collection.item_count} parça
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3">
        <p className="line-clamp-1 font-medium">{collection.title}</p>
        <p className="text-xs text-black/50 dark:text-white/50">
          {collection.category.emoji} {collection.category.name}
        </p>
        <p className="mt-1 text-xs text-black/50 dark:text-white/50">
          @{collection.owner.username} · {collection.like_count} beğeni
        </p>
      </div>
    </Link>
  );
}
