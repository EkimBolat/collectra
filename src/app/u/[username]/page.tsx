import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getProfileByUsername,
  getProfileCollections,
  getLikedCollections,
  getFollowers,
  getFollowing,
} from "@/lib/data";
import { getCurrentProfile } from "@/lib/auth";
import { publicImageUrl } from "@/lib/supabase/storage";
import { createClient } from "@/lib/supabase/server";
import { getDict } from "@/lib/i18n";
import FollowButton from "@/components/FollowButton";
import ProfileTabs from "./ProfileTabs";
import Image from "next/image";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const profile = await getProfileByUsername(username);
  if (!profile) notFound();

  const [viewer, { t }] = await Promise.all([getCurrentProfile(), getDict()]);
  const isOwnProfile = viewer?.id === profile.id;

  const [collections, liked, followers, following] = await Promise.all([
    getProfileCollections(profile.id),
    isOwnProfile ? getLikedCollections(profile.id) : Promise.resolve([]),
    getFollowers(profile.id),
    getFollowing(profile.id),
  ]);

  let isFollowing = false;
  if (viewer && !isOwnProfile) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("follows")
      .select("follower_id")
      .eq("follower_id", viewer.id)
      .eq("following_id", profile.id)
      .maybeSingle();
    isFollowing = Boolean(data);
  }

  const avatarUrl = publicImageUrl("avatars", profile.avatar_path);
  const profileUrl = `/u/${profile.username}`;

  return (
    <div className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
      <div className="mb-2 flex items-center gap-6">
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
                  path={profileUrl}
                  following={isFollowing}
                />
              )
            )}
          </div>
          <p className="text-sm text-muted">@{profile.username}</p>
          {profile.bio && <p className="mt-2 text-sm">{profile.bio}</p>}
        </div>
      </div>

      <ProfileTabs
        collections={collections}
        liked={liked}
        showLikedTab={isOwnProfile}
        followers={followers}
        following={following}
      />
    </div>
  );
}
