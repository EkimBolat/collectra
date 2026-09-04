export type CollectionVisibility = "public" | "followers" | "private";

export type ReportTargetType = "collection" | "comment";
export type ReportReason = "inappropriate" | "off_topic" | "harassment" | "other";

export type Category = {
  id: number;
  slug: string;
  name: string;
  emoji: string;
  sort_order: number;
};

export type Profile = {
  id: string;
  username: string;
  display_name: string;
  bio: string | null;
  avatar_path: string | null;
  created_at: string;
};

export type Collection = {
  id: string;
  owner_id: string;
  title: string;
  description: string | null;
  category_id: number;
  visibility: CollectionVisibility;
  cover_item_id: string | null;
  item_count: number;
  like_count: number;
  created_at: string;
  updated_at: string;
};

export type CollectionItem = {
  id: string;
  collection_id: string;
  image_path: string;
  caption: string | null;
  position: number;
  created_at: string;
};

export type CollectionWithRelations = Collection & {
  owner: Pick<Profile, "id" | "username" | "display_name" | "avatar_path">;
  category: Pick<Category, "slug" | "name" | "emoji">;
  items: CollectionItem[];
};
