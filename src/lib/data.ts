import { createClient } from "@/lib/supabase/server";
import type { CollectionWithRelations, Category } from "@/lib/types";

const COLLECTION_SELECT = `
  *,
  owner:profiles!collections_owner_id_fkey(id, username, display_name, avatar_path),
  category:categories(slug, name, emoji),
  items:collection_items!collection_items_collection_id_fkey(id, image_path, caption, position, created_at, collection_id)
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

type FollowListProfile = Pick<
  import("@/lib/types").Profile,
  "id" | "username" | "display_name" | "avatar_path"
>;

export async function getFollowers(profileId: string): Promise<FollowListProfile[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("follows")
    .select("follower:profiles!follows_follower_id_fkey(id, username, display_name, avatar_path)")
    .eq("following_id", profileId)
    .order("created_at", { ascending: false });

  if (error) return [];
  return (data as unknown as { follower: FollowListProfile }[])
    .map((row) => row.follower)
    .filter(Boolean);
}

export async function getFollowing(profileId: string): Promise<FollowListProfile[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("follows")
    .select(
      "following:profiles!follows_following_id_fkey(id, username, display_name, avatar_path)",
    )
    .eq("follower_id", profileId)
    .order("created_at", { ascending: false });

  if (error) return [];
  return (data as unknown as { following: FollowListProfile }[])
    .map((row) => row.following)
    .filter(Boolean);
}

export async function getCollaborators(collectionId: string): Promise<FollowListProfile[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("collection_collaborators")
    .select("user:profiles!collection_collaborators_user_id_fkey(id, username, display_name, avatar_path)")
    .eq("collection_id", collectionId);

  if (error) return [];
  return (data as unknown as { user: FollowListProfile }[])
    .map((row) => row.user)
    .filter(Boolean);
}

export async function getCollaborationCandidates(
  ownerId: string,
  excludeIds: string[],
): Promise<FollowListProfile[]> {
  const [followers, following] = await Promise.all([
    getFollowers(ownerId),
    getFollowing(ownerId),
  ]);
  const exclude = new Set([ownerId, ...excludeIds]);
  const byId = new Map<string, FollowListProfile>();
  for (const p of [...followers, ...following]) {
    if (!exclude.has(p.id)) byId.set(p.id, p);
  }
  return Array.from(byId.values());
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

export type CommentWithLikes = {
  id: string;
  body: string;
  created_at: string;
  user: { id: string; username: string; display_name: string; avatar_path: string | null };
  like_count: number;
  liked_by_viewer: boolean;
};

export async function getComments(
  collectionId: string,
  viewerId?: string,
): Promise<CommentWithLikes[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("comments")
    .select(
      "id, body, created_at, user:profiles!comments_user_id_fkey(id, username, display_name, avatar_path), comment_likes(count)",
    )
    .eq("collection_id", collectionId)
    .order("created_at", { ascending: true });

  if (error) return [];

  const comments = data as unknown as (Omit<CommentWithLikes, "like_count" | "liked_by_viewer"> & {
    comment_likes: { count: number }[];
  })[];

  let likedIds = new Set<string>();
  if (viewerId && comments.length > 0) {
    const { data: likedRows } = await supabase
      .from("comment_likes")
      .select("comment_id")
      .eq("user_id", viewerId)
      .in(
        "comment_id",
        comments.map((c) => c.id),
      );
    likedIds = new Set((likedRows ?? []).map((r) => r.comment_id));
  }

  return comments.map(({ comment_likes, ...c }) => ({
    ...c,
    like_count: comment_likes?.[0]?.count ?? 0,
    liked_by_viewer: likedIds.has(c.id),
  }));
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
