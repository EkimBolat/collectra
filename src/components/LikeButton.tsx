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
      className={liked ? "btn bg-danger text-white hover:brightness-110" : "btn btn-secondary"}
    >
      <svg viewBox="0 0 20 20" className="h-4 w-4 fill-current">
        <path d="M10 17.5s-6.5-4-8.5-8A4.5 4.5 0 0110 5.5 4.5 4.5 0 0118.5 9.5c-2 4-8.5 8-8.5 8z" />
      </svg>
      {count}
    </button>
  );
}
