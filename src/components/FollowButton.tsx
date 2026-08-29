"use client";

import { useTransition } from "react";
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
  const [pending, startTransition] = useTransition();

  return (
    <button
      onClick={() => startTransition(() => toggleFollow(targetUserId, path))}
      disabled={pending}
      className={`rounded-full border px-4 py-1.5 text-sm font-medium disabled:opacity-50 ${
        following
          ? "border-black/15 dark:border-white/20"
          : "border-foreground bg-foreground text-background"
      }`}
    >
      {following ? "Takip ediliyor" : "Takip et"}
    </button>
  );
}
