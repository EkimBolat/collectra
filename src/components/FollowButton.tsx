"use client";

import { useOptimistic, useTransition } from "react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { toggleFollow } from "@/app/social-actions";

export default function FollowButton({
  targetUserId,
  path,
  following,
}: {
  targetUserId: string;
  path: string;
  following: boolean;
}) {
  const { t } = useLocale();
  const [, startTransition] = useTransition();
  const [optimisticFollowing, setOptimisticFollowing] = useOptimistic(
    following,
    (_state, next: boolean) => next,
  );

  const handleClick = () => {
    startTransition(async () => {
      setOptimisticFollowing(!optimisticFollowing);
      await toggleFollow(targetUserId, path);
    });
  };

  return (
    <button
      onClick={handleClick}
      className={optimisticFollowing ? "btn btn-secondary" : "btn btn-primary"}
    >
      {optimisticFollowing ? t.profile.unfollow : t.profile.follow}
    </button>
  );
}
