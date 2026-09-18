import type { MetadataRoute } from "next";
import { getPublicCollectionUrls, getAllUsernames } from "@/lib/data";
import { SITE_URL } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [collections, profiles] = await Promise.all([
    getPublicCollectionUrls(),
    getAllUsernames(),
  ]);

  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 1,
    },
    ...collections.map((c) => ({
      url: `${SITE_URL}/c/${c.id}`,
      lastModified: new Date(c.updated_at),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...profiles.map((p) => ({
      url: `${SITE_URL}/u/${p.username}`,
      lastModified: new Date(p.created_at),
      changeFrequency: "weekly" as const,
      priority: 0.5,
    })),
  ];
}
