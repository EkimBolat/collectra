import Link from "next/link";
import { getCategories, getFeedCollections } from "@/lib/data";
import CollectionCard from "@/components/CollectionCard";

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const [categories, collections] = await Promise.all([
    getCategories(),
    getFeedCollections(category),
  ]);

  return (
    <div className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">
      <div className="mb-6 flex flex-wrap gap-2">
        <Link
          href="/"
          className={`rounded-full border px-3 py-1.5 text-sm ${
            !category
              ? "border-foreground bg-foreground text-background"
              : "border-black/10 dark:border-white/15"
          }`}
        >
          Tümü
        </Link>
        {categories.map((c) => (
          <Link
            key={c.id}
            href={`/?category=${c.slug}`}
            className={`rounded-full border px-3 py-1.5 text-sm ${
              category === c.slug
                ? "border-foreground bg-foreground text-background"
                : "border-black/10 dark:border-white/15"
            }`}
          >
            {c.emoji} {c.name}
          </Link>
        ))}
      </div>

      {collections.length === 0 ? (
        <p className="py-16 text-center text-black/50 dark:text-white/50">
          Henüz bu kategoride koleksiyon yok. İlk paylaşan sen ol!
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {collections.map((c) => (
            <CollectionCard key={c.id} collection={c} />
          ))}
        </div>
      )}
    </div>
  );
}
