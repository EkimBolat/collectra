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
      className={following ? "btn btn-secondary" : "btn btn-primary"}
    >
      {following ? "Takip ediliyor" : "Takip et"}
    </button>
  );
}
