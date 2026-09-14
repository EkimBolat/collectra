import { getCategories, getFeedCollections } from "@/lib/data";
import { getDict } from "@/lib/i18n";
import ExploreFeed from "@/components/ExploreFeed";
import CategoryScroller from "@/components/CategoryScroller";

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const [categories, feed, { t, locale }] = await Promise.all([
    getCategories(),
    getFeedCollections(category),
    getDict(),
  ]);

  return (
    <div className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">
      <CategoryScroller
        categories={categories}
        activeSlug={category}
        allLabel={t.home.all}
        locale={locale}
      />

      {feed.items.length === 0 ? (
        <div className="card flex flex-col items-center gap-2 px-4 py-20 text-center">
          <span className="text-3xl">🗃️</span>
          <p className="text-muted">{t.home.empty}</p>
        </div>
      ) : (
        <ExploreFeed
          key={category ?? "all"}
          initialItems={feed.items}
          initialHasMore={feed.hasMore}
          categorySlug={category}
          locale={locale}
        />
      )}
    </div>
  );
}
