import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCollectionById, getComments } from "@/lib/data";
import { getCurrentProfile } from "@/lib/auth";
import { publicImageUrl } from "@/lib/supabase/storage";
import LikeButton from "@/components/LikeButton";
import FollowButton from "@/components/FollowButton";
import CommentsSection from "@/components/CommentsSection";
import AddItemsForm from "./AddItemsForm";
import DeleteItemButton from "./DeleteItemButton";
import OwnerMenu from "./OwnerMenu";
import { createClient } from "@/lib/supabase/server";

const VISIBILITY_LABEL: Record<string, string> = {
  public: "Herkese açık",
  followers: "Takipçilere özel",
  private: "Gizli",
};

export default async function CollectionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const collection = await getCollectionById(id);
  if (!collection) notFound();

  const profile = await getCurrentProfile();
  const isOwner = profile?.id === collection.owner_id;

  let liked = false;
  let following = false;
  if (profile) {
    const supabase = await createClient();
    const [likeRes, followRes] = await Promise.all([
      supabase
        .from("likes")
        .select("user_id")
        .eq("user_id", profile.id)
        .eq("collection_id", collection.id)
        .maybeSingle(),
      isOwner
        ? Promise.resolve({ data: null })
        : supabase
            .from("follows")
            .select("follower_id")
            .eq("follower_id", profile.id)
            .eq("following_id", collection.owner_id)
            .maybeSingle(),
    ]);
    liked = Boolean(likeRes.data);
    following = Boolean(followRes.data);
  }

  const [items, comments] = await Promise.all([
    Promise.resolve([...collection.items].sort((a, b) => a.position - b.position)),
    getComments(collection.id),
  ]);
  const path = `/c/${collection.id}`;
  const ownerAvatarUrl = publicImageUrl("avatars", collection.owner.avatar_path);

  return (
    <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold">{collection.title}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted">
            <Link href={`/u/${collection.owner.username}`} className="flex items-center gap-1.5 font-medium text-foreground hover:underline">
              <span className="relative h-5 w-5 overflow-hidden rounded-full bg-accent-soft">
                {ownerAvatarUrl && (
                  <Image src={ownerAvatarUrl} alt={collection.owner.username} fill className="object-cover" />
                )}
              </span>
              @{collection.owner.username}
            </Link>
            <span>·</span>
            <span>
              {collection.category.emoji} {collection.category.name}
            </span>
            <span>·</span>
            <span>{VISIBILITY_LABEL[collection.visibility]}</span>
            <span>·</span>
            <span>{collection.item_count} parça</span>
          </div>
          {collection.description && (
            <p className="mt-3 whitespace-pre-wrap text-sm text-foreground/90">{collection.description}</p>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {profile && (
            <LikeButton
              collectionId={collection.id}
              path={path}
              liked={liked}
              count={collection.like_count}
            />
          )}
          {profile && !isOwner && (
            <FollowButton targetUserId={collection.owner_id} path={path} following={following} />
          )}
          {isOwner && <OwnerMenu collectionId={collection.id} />}
        </div>
      </div>

      {isOwner && (
        <div className="card mb-6 border-dashed p-4">
          <p className="mb-2 text-sm font-medium">Koleksiyonu genişlet</p>
          <AddItemsForm collectionId={collection.id} />
        </div>
      )}

      {items.length === 0 ? (
        <p className="py-16 text-center text-muted">Henüz fotoğraf yok.</p>
      ) : (
        <div className="mb-6 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {items.map((item) => {
            const url = publicImageUrl("collection-images", item.image_path);
            return (
              <div
                key={item.id}
                className="group relative aspect-square overflow-hidden rounded-xl bg-accent-soft"
              >
                {url && (
                  <Image
                    src={url}
                    alt={item.caption ?? collection.title}
                    fill
                    sizes="(max-width: 768px) 50vw, 33vw"
                    className="object-cover"
                  />
                )}
                {isOwner && (
                  <DeleteItemButton
                    collectionId={collection.id}
                    itemId={item.id}
                    imagePath={item.image_path}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}

      <CommentsSection collectionId={collection.id} comments={comments} canComment={Boolean(profile)} />
    </div>
  );
}
