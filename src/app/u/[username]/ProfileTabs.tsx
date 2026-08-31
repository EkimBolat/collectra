"use client";

import { useState } from "react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import CollectionCard from "@/components/CollectionCard";
import FollowListModal from "@/components/FollowListModal";
import type { CollectionWithRelations, Profile } from "@/lib/types";

type ListProfile = Pick<Profile, "id" | "username" | "display_name" | "avatar_path">;

export default function ProfileTabs({
  collections,
  liked,
  showLikedTab,
  followers,
  following,
}: {
  collections: CollectionWithRelations[];
  liked: CollectionWithRelations[];
  showLikedTab: boolean;
  followers: ListProfile[];
  following: ListProfile[];
}) {
  const { t, locale } = useLocale();
  const [tab, setTab] = useState<"collections" | "likes">("collections");
  const [panel, setPanel] = useState<null | "followers" | "following">(null);

  const showLiked = showLikedTab && tab === "likes";
  const visible = showLiked ? liked : collections;

  return (
    <>
      <div className="mt-3 flex gap-5 text-sm text-muted">
        <span>
          <strong className="text-foreground">{collections.length}</strong> {t.profile.collections}
        </span>
        <button
          type="button"
          onClick={() => setPanel("followers")}
          className="hover:text-foreground hover:underline"
        >
          <strong className="text-foreground">{followers.length}</strong> {t.profile.followers}
        </button>
        <button
          type="button"
          onClick={() => setPanel("following")}
          className="hover:text-foreground hover:underline"
        >
          <strong className="text-foreground">{following.length}</strong> {t.profile.following}
        </button>
      </div>

      {showLikedTab && (
        <div className="mb-6 mt-8 flex gap-2">
          <button
            type="button"
            onClick={() => setTab("collections")}
            className={tab === "collections" ? "chip chip-active" : "chip chip-idle"}
          >
            {t.profile.collectionsTab}
          </button>
          <button
            type="button"
            onClick={() => setTab("likes")}
            className={tab === "likes" ? "chip chip-active" : "chip chip-idle"}
          >
            ♥ {t.profile.likedTab}
          </button>
        </div>
      )}
      {!showLikedTab && <div className="mt-8" />}

      {visible.length === 0 ? (
        <div className="card flex flex-col items-center gap-2 px-4 py-20 text-center">
          <span className="text-3xl">{showLiked ? "♡" : "🗃️"}</span>
          <p className="text-muted">{showLiked ? t.profile.emptyLiked : t.profile.empty}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {visible.map((c) => (
            <CollectionCard key={c.id} collection={c} locale={locale} />
          ))}
        </div>
      )}

      {panel === "followers" && (
        <FollowListModal
          title={t.profile.followersTitle}
          people={followers}
          emptyText={t.profile.noFollowers}
          onClose={() => setPanel(null)}
        />
      )}
      {panel === "following" && (
        <FollowListModal
          title={t.profile.followingTitle}
          people={following}
          emptyText={t.profile.noFollowing}
          onClose={() => setPanel(null)}
        />
      )}
    </>
  );
}
