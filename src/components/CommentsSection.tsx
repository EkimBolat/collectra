"use client";

import { useActionState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { publicImageUrl } from "@/lib/supabase/storage";
import { addComment } from "@/app/c/[id]/actions";

type Comment = {
  id: string;
  body: string;
  created_at: string;
  user: { id: string; username: string; display_name: string; avatar_path: string | null };
};

function timeAgo(iso: string) {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return "az önce";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}dk`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}sa`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}g`;
  return new Date(iso).toLocaleDateString("tr-TR");
}

export default function CommentsSection({
  collectionId,
  comments,
  canComment,
}: {
  collectionId: string;
  comments: Comment[];
  canComment: boolean;
}) {
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
        Yorumlar {comments.length > 0 && `(${comments.length})`}
      </h2>

      {comments.length === 0 ? (
        <p className="text-sm text-muted">Henüz yorum yok.</p>
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
                  <p className="mt-0.5 text-xs text-muted">{timeAgo(c.created_at)}</p>
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
            placeholder="Yorum yaz..."
            required
            maxLength={500}
            className="field flex-1 py-2"
          />
          <button type="submit" disabled={pending} className="btn btn-primary">
            Gönder
          </button>
        </form>
      )}
      {state?.error && <p className="mt-2 text-sm text-danger">{state.error}</p>}
    </div>
  );
}
