import { createClient } from "@/lib/supabase/server";
import type { CollectionWithRelations, Category } from "@/lib/types";

const COLLECTION_SELECT = `
  *,
  owner:profiles!collections_owner_id_fkey(id, username, display_name, avatar_path),
  category:categories(slug, name, emoji),
  items:collection_items(id, image_path, caption, position, created_at, collection_id)
`;

export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("categories").select("*").order("sort_order");
  return data ?? [];
}

export async function getFeedCollections(categorySlug?: string) {
  const supabase = await createClient();
  let query = supabase
    .from("collections")
    .select(COLLECTION_SELECT)
    .order("created_at", { ascending: false })
    .limit(30);

  if (categorySlug) {
    const { data: category } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", categorySlug)
      .single();
    if (!category) return [];
    query = query.eq("category_id", category.id);
  }

  const { data, error } = await query;
  if (error) {
    console.error(error);
    return [];
  }

  return (data ?? []) as unknown as CollectionWithRelations[];
}

export async function getCollectionById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("collections")
    .select(COLLECTION_SELECT)
    .eq("id", id)
    .single();

  if (error) return null;
  return data as unknown as CollectionWithRelations;
}

export async function getProfileByUsername(username: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .single();
  return data;
}

export async function getProfileCollections(ownerId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("collections")
    .select(COLLECTION_SELECT)
    .eq("owner_id", ownerId)
    .order("created_at", { ascending: false });

  if (error) return [];
  return (data ?? []) as unknown as CollectionWithRelations[];
}

export async function getLikedCollections(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("likes")
    .select(`created_at, collection:collections(${COLLECTION_SELECT})`)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) return [];
  return ((data ?? []) as unknown as { collection: CollectionWithRelations | null }[])
    .map((row) => row.collection)
    .filter((c): c is CollectionWithRelations => c !== null);
}

export async function getFollowCounts(profileId: string) {
  const supabase = await createClient();
  const [followers, following] = await Promise.all([
    supabase
      .from("follows")
      .select("follower_id", { count: "exact", head: true })
      .eq("following_id", profileId),
    supabase
      .from("follows")
      .select("following_id", { count: "exact", head: true })
      .eq("follower_id", profileId),
  ]);
  return {
    followers: followers.count ?? 0,
    following: following.count ?? 0,
  };
}

export async function isFollowing(followerId: string, followingId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("follows")
    .select("follower_id")
    .eq("follower_id", followerId)
    .eq("following_id", followingId)
    .maybeSingle();
  return Boolean(data);
}

export async function getComments(collectionId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("comments")
    .select("id, body, created_at, user:profiles(id, username, display_name, avatar_path)")
    .eq("collection_id", collectionId)
    .order("created_at", { ascending: true });

  if (error) return [];
  return data as unknown as {
    id: string;
    body: string;
    created_at: string;
    user: { id: string; username: string; display_name: string; avatar_path: string | null };
  }[];
}

export async function hasLiked(userId: string, collectionId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("likes")
    .select("user_id")
    .eq("user_id", userId)
    .eq("collection_id", collectionId)
    .maybeSingle();
  return Boolean(data);
}
