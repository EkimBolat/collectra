"use client";

import { useActionState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { publicImageUrl } from "@/lib/supabase/storage";
import { timeAgo } from "@/lib/i18n/client";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { addComment } from "@/app/c/[id]/actions";

type Comment = {
  id: string;
  body: string;
  created_at: string;
  user: { id: string; username: string; display_name: string; avatar_path: string | null };
};

export default function CommentsSection({
  collectionId,
  comments,
  canComment,
}: {
  collectionId: string;
  comments: Comment[];
  canComment: boolean;
}) {
  const { t, locale } = useLocale();
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState(
    async (_prev: { error?: string; success?: boolean } | undefined, formData: FormData) => {
      const result = (await addComment(collectionId, formData)) ?? {};
      if (result.success) formRef.current?.reset();
      return result;
    },
    undefined,
  );

  return (
    <div className="card p-5">
      <h2 className="mb-4 text-sm font-semibold text-muted">
        {t.collection.comments} {comments.length > 0 && `(${comments.length})`}
      </h2>

      {comments.length === 0 ? (
        <p className="text-sm text-muted">{t.collection.noComments}</p>
      ) : (
        <ul className="mb-4 flex flex-col gap-3.5">
          {comments.map((c) => {
            const avatarUrl = publicImageUrl("avatars", c.user.avatar_path);
            return (
              <li key={c.id} className="flex items-start gap-2.5">
                <span className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full bg-accent-soft">
                  {avatarUrl && (
                    <Image src={avatarUrl} alt={c.user.username} fill className="object-cover" />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm">
                    <Link href={`/u/${c.user.username}`} className="font-semibold hover:underline">
                      {c.user.username}
                    </Link>{" "}
                    <span className="whitespace-pre-wrap">{c.body}</span>
                  </p>
                  <p className="mt-0.5 text-xs text-muted">{timeAgo(c.created_at, locale)}</p>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {canComment && (
        <form ref={formRef} action={formAction} className="flex items-center gap-2 border-t border-border pt-4">
          <input
            name="body"
            placeholder={t.collection.commentPlaceholder}
            required
            maxLength={500}
            className="field flex-1 py-2"
          />
          <button type="submit" disabled={pending} className="btn btn-primary">
            {t.collection.send}
          </button>
        </form>
      )}
      {state?.error && <p className="mt-2 text-sm text-danger">{state.error}</p>}
    </div>
  );
}
