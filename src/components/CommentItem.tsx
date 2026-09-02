"use client";

import { useOptimistic, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { publicImageUrl } from "@/lib/supabase/storage";
import { timeAgo } from "@/lib/i18n/client";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { toggleCommentLike } from "@/app/social-actions";
import { deleteComment } from "@/app/c/[id]/actions";
import ReportButton from "./ReportButton";
import type { CommentWithLikes } from "@/lib/data";

export default function CommentItem({
  collectionId,
  comment,
  path,
  isOwn,
  canReport,
}: {
  collectionId: string;
  comment: CommentWithLikes;
  path: string;
  isOwn: boolean;
  canReport: boolean;
}) {
  const { t, locale } = useLocale();
  const [, startLikeTransition] = useTransition();
  const [deletePending, startDeleteTransition] = useTransition();
  const [optimistic, setOptimistic] = useOptimistic(
    { liked: comment.liked_by_viewer, count: comment.like_count },
    (_state, next: { liked: boolean; count: number }) => next,
  );

  const avatarUrl = publicImageUrl("avatars", comment.user.avatar_path);

  const handleLike = () => {
    startLikeTransition(async () => {
      setOptimistic({
        liked: !optimistic.liked,
        count: optimistic.liked ? optimistic.count - 1 : optimistic.count + 1,
      });
      await toggleCommentLike(comment.id, path);
    });
  };

  return (
    <li className="flex items-start gap-2.5">
      <span className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full bg-accent-soft">
        {avatarUrl && (
          <Image src={avatarUrl} alt={comment.user.username} fill className="object-cover" />
        )}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm">
          <Link href={`/u/${comment.user.username}`} className="font-semibold hover:underline">
            {comment.user.username}
          </Link>{" "}
          <span className="whitespace-pre-wrap">{comment.body}</span>
        </p>
        <div className="mt-0.5 flex items-center gap-3 text-xs text-muted">
          <span suppressHydrationWarning>{timeAgo(comment.created_at, locale)}</span>
          {isOwn && (
            <button
              type="button"
              onClick={() => startDeleteTransition(() => deleteComment(collectionId, comment.id))}
              disabled={deletePending}
              className="hover:text-danger disabled:opacity-50"
            >
              {t.collection.delete}
            </button>
          )}
          {canReport && (
            <ReportButton targetType="comment" targetId={comment.id} variant="text" path={path} />
          )}
        </div>
      </div>
      <button
        type="button"
        onClick={handleLike}
        className={`flex shrink-0 items-center gap-1 pt-0.5 text-xs transition-colors ${
          optimistic.liked ? "text-danger" : "text-muted hover:text-foreground"
        }`}
      >
        <svg viewBox="0 0 20 20" className="h-3.5 w-3.5 fill-current">
          <path d="M10 17.5s-6.5-4-8.5-8A4.5 4.5 0 0110 5.5 4.5 4.5 0 0118.5 9.5c-2 4-8.5 8-8.5 8z" />
        </svg>
        {optimistic.count > 0 && optimistic.count}
      </button>
    </li>
  );
}
