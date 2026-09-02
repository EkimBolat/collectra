"use client";

import { useActionState, useRef } from "react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { addComment } from "@/app/c/[id]/actions";
import type { CommentWithLikes } from "@/lib/data";
import CommentItem from "./CommentItem";

export default function CommentsSection({
  collectionId,
  comments,
  canComment,
  viewerId,
}: {
  collectionId: string;
  comments: CommentWithLikes[];
  canComment: boolean;
  viewerId?: string;
}) {
  const { t } = useLocale();
  const path = `/c/${collectionId}`;
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
          {comments.map((c) => (
            <CommentItem
              key={c.id}
              collectionId={collectionId}
              comment={c}
              path={path}
              isOwn={viewerId === c.user.id}
              canReport={Boolean(viewerId) && viewerId !== c.user.id}
            />
          ))}
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
