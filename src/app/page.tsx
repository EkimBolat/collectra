import Link from "next/link";
import { getCategories, getFeedCollections } from "@/lib/data";
import { getDict, categoryName } from "@/lib/i18n";
import CollectionCard from "@/components/CollectionCard";

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const [categories, collections, { t, locale }] = await Promise.all([
    getCategories(),
    getFeedCollections(category),
    getDict(),
  ]);

  return (
    <div className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">
      <div className="mb-6 flex flex-wrap gap-2">
        <Link href="/" className={category ? "chip chip-idle" : "chip chip-active"}>
          {t.home.all}
        </Link>
        {categories.map((c) => (
          <Link
            key={c.id}
            href={`/?category=${c.slug}`}
            className={category === c.slug ? "chip chip-active" : "chip chip-idle"}
          >
            {c.emoji} {categoryName(c.slug, locale, c.name)}
          </Link>
        ))}
      </div>

      {collections.length === 0 ? (
        <div className="card flex flex-col items-center gap-2 px-4 py-20 text-center">
          <span className="text-3xl">🗃️</span>
          <p className="text-muted">{t.home.empty}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {collections.map((c) => (
            <CollectionCard key={c.id} collection={c} locale={locale} />
          ))}
        </div>
      )}
    </div>
  );
}
