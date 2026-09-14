"use server";

import { getFeedCollections } from "@/lib/data";

export async function loadMoreCollections(categorySlug: string | undefined, offset: number) {
  return getFeedCollections(categorySlug, offset);
}
