import { notFound } from "next/navigation";
import { getProfileByUsername, getProfileCollections, getFollowCounts } from "@/lib/data";
import { getCurrentProfile } from "@/lib/auth";
import { publicImageUrl } from "@/lib/supabase/storage";
import { createClient } from "@/lib/supabase/server";
import CollectionCard from "@/components/CollectionCard";
import FollowButton from "@/components/FollowButton";
import Image from "next/image";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const profile = await getProfileByUsername(username);
  if (!profile) notFound();

  const viewer = await getCurrentProfile();
  const isOwnProfile = viewer?.id === profile.id;

  const [collections, counts] = await Promise.all([
    getProfileCollections(profile.id),
    getFollowCounts(profile.id),
  ]);

  let following = false;
  if (viewer && !isOwnProfile) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("follows")
      .select("follower_id")
      .eq("follower_id", viewer.id)
      .eq("following_id", profile.id)
      .maybeSingle();
    following = Boolean(data);
  }

  const avatarUrl = publicImageUrl("avatars", profile.avatar_path);

  return (
    <div className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
      <div className="mb-8 flex items-center gap-6">
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
          {avatarUrl && (
            <Image src={avatarUrl} alt={profile.username} fill className="object-cover" />
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold">{profile.display_name}</h1>
            {viewer && !isOwnProfile && (
              <FollowButton
                targetUserId={profile.id}
                path={`/u/${profile.username}`}
                following={following}
              />
            )}
          </div>
          <p className="text-sm text-black/50 dark:text-white/50">@{profile.username}</p>
          {profile.bio && <p className="mt-2 text-sm">{profile.bio}</p>}
          <div className="mt-2 flex gap-4 text-sm text-black/60 dark:text-white/60">
            <span>
              <strong className="text-foreground">{collections.length}</strong> koleksiyon
            </span>
            <span>
              <strong className="text-foreground">{counts.followers}</strong> takipçi
            </span>
            <span>
              <strong className="text-foreground">{counts.following}</strong> takip
            </span>
          </div>
        </div>
      </div>

      {collections.length === 0 ? (
        <p className="py-16 text-center text-black/50 dark:text-white/50">
          Henüz koleksiyon paylaşılmamış.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {collections.map((c) => (
            <CollectionCard key={c.id} collection={c} />
          ))}
        </div>
      )}
    </div>
  );
}
