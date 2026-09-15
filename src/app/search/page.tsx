import Link from "next/link";
import Image from "next/image";
import { searchProfiles, searchCollections } from "@/lib/data";
import { getDict } from "@/lib/i18n";
import { publicImageUrl } from "@/lib/supabase/storage";
import SearchCollectionResults from "@/components/SearchCollectionResults";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = (q ?? "").trim();
  const { t, locale } = await getDict();

  const [profiles, collectionResults] = query
    ? await Promise.all([searchProfiles(query), searchCollections(query)])
    : [[], { items: [], hasMore: false }];

  const hasResults = profiles.length > 0 || collectionResults.items.length > 0;

  return (
    <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
      <form action="/search" className="mb-8 flex gap-2">
        <input
          type="text"
          name="q"
          defaultValue={query}
          placeholder={t.search.placeholder}
          autoFocus
          className="field flex-1 py-3"
        />
        <button type="submit" className="btn btn-primary">
          {t.nav.search}
        </button>
      </form>

      {!query ? (
        <p className="py-16 text-center text-muted">{t.search.prompt}</p>
      ) : !hasResults ? (
        <p className="py-16 text-center text-muted">{t.search.empty(query)}</p>
      ) : (
        <div className="flex flex-col gap-8">
          {profiles.length > 0 && (
            <section>
              <h2 className="mb-3 text-sm font-semibold text-muted">{t.search.people}</h2>
              <div className="card divide-y divide-border overflow-hidden">
                {profiles.map((p) => {
                  const avatarUrl = publicImageUrl("avatars", p.avatar_path);
                  return (
                    <Link
                      key={p.id}
                      href={`/u/${p.username}`}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-black/[.03] dark:hover:bg-white/[.06]"
                    >
                      <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-accent-soft">
                        {avatarUrl && (
                          <Image src={avatarUrl} alt={p.username} fill className="object-cover" />
                        )}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium">{p.display_name}</span>
                        <span className="block truncate text-xs text-muted">@{p.username}</span>
                      </span>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}

          {collectionResults.items.length > 0 && (
            <section>
              <h2 className="mb-3 text-sm font-semibold text-muted">{t.search.collections}</h2>
              <SearchCollectionResults
                key={query}
                query={query}
                initialItems={collectionResults.items}
                initialHasMore={collectionResults.hasMore}
                locale={locale}
              />
            </section>
          )}
        </div>
      )}
    </div>
  );
}
