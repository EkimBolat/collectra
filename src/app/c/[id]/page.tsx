import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCollectionById } from "@/lib/data";
import { getCurrentProfile } from "@/lib/auth";
import { publicImageUrl } from "@/lib/supabase/storage";
import LikeButton from "@/components/LikeButton";
import FollowButton from "@/components/FollowButton";
import AddItemsForm from "./AddItemsForm";
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

  const items = [...collection.items].sort((a, b) => a.position - b.position);
  const path = `/c/${collection.id}`;

  return (
    <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{collection.title}</h1>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-black/60 dark:text-white/60">
            <Link href={`/u/${collection.owner.username}`} className="font-medium hover:underline">
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
            <p className="mt-3 whitespace-pre-wrap text-sm">{collection.description}</p>
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
        </div>
      </div>

      {isOwner && (
        <div className="mb-6 rounded-lg border border-dashed border-black/15 p-4 dark:border-white/20">
          <p className="mb-2 text-sm font-medium">Koleksiyonu genişlet</p>
          <AddItemsForm collectionId={collection.id} />
        </div>
      )}

      {items.length === 0 ? (
        <p className="py-16 text-center text-black/50 dark:text-white/50">Henüz fotoğraf yok.</p>
      ) : (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {items.map((item) => {
            const url = publicImageUrl("collection-images", item.image_path);
            return (
              <div key={item.id} className="relative aspect-square overflow-hidden rounded-md bg-black/5 dark:bg-white/5">
                {url && (
                  <Image
                    src={url}
                    alt={item.caption ?? collection.title}
                    fill
                    sizes="(max-width: 768px) 50vw, 33vw"
                    className="object-cover"
                  />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
