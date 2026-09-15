"use server";

import { searchCollections } from "@/lib/data";

export async function loadMoreSearchCollections(query: string, offset: number) {
  return searchCollections(query, offset);
}
