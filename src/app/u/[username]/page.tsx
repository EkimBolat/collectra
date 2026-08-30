import Link from "next/link";
import { notFound } from "next/navigation";
import { getProfileByUsername, getProfileCollections, getFollowCounts } from "@/lib/data";
import { getCurrentProfile } from "@/lib/auth";
import { publicImageUrl } from "@/lib/supabase/storage";
import { createClient } from "@/lib/supabase/server";
import { getDict } from "@/lib/i18n";
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

  const [viewer, { t, locale }] = await Promise.all([getCurrentProfile(), getDict()]);
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
        <span className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full bg-accent-soft ring-2 ring-border">
          {avatarUrl && (
            <Image src={avatarUrl} alt={profile.username} fill className="object-cover" />
          )}
        </span>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold">{profile.display_name}</h1>
            {isOwnProfile ? (
              <Link href="/settings" className="btn btn-secondary">
                {t.profile.editProfile}
              </Link>
            ) : (
              viewer && (
                <FollowButton
                  targetUserId={profile.id}
                  path={`/u/${profile.username}`}
                  following={following}
                />
              )
            )}
          </div>
          <p className="text-sm text-muted">@{profile.username}</p>
          {profile.bio && <p className="mt-2 text-sm">{profile.bio}</p>}
          <div className="mt-3 flex gap-5 text-sm text-muted">
            <span>
              <strong className="text-foreground">{collections.length}</strong> {t.profile.collections}
            </span>
            <span>
              <strong className="text-foreground">{counts.followers}</strong> {t.profile.followers}
            </span>
            <span>
              <strong className="text-foreground">{counts.following}</strong> {t.profile.following}
            </span>
          </div>
        </div>
      </div>

      {collections.length === 0 ? (
        <div className="card flex flex-col items-center gap-2 px-4 py-20 text-center">
          <span className="text-3xl">🗃️</span>
          <p className="text-muted">{t.profile.empty}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {collections.map((c) => (
            <CollectionCard key={c.id} collection={c} locale={locale} />
          ))}
        </div>
      )}
    </div>
  );
}
