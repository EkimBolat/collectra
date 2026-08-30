"use client";

import { useTransition } from "react";
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
  const [pending, startTransition] = useTransition();

  return (
    <button
      onClick={() => startTransition(() => toggleFollow(targetUserId, path))}
      disabled={pending}
      className={following ? "btn btn-secondary" : "btn btn-primary"}
    >
      {following ? t.profile.unfollow : t.profile.follow}
    </button>
  );
}
