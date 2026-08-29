"use client";

import { useTransition } from "react";
import { toggleLike } from "@/app/social-actions";

export default function LikeButton({
  collectionId,
  path,
  liked,
  count,
}: {
  collectionId: string;
  path: string;
  liked: boolean;
  count: number;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      onClick={() => startTransition(() => toggleLike(collectionId, path))}
      disabled={pending}
      className={`rounded-full border px-4 py-1.5 text-sm font-medium disabled:opacity-50 ${
        liked
          ? "border-red-500 bg-red-500 text-white"
          : "border-black/15 dark:border-white/20"
      }`}
    >
      {liked ? "♥" : "♡"} {count}
    </button>
  );
}
