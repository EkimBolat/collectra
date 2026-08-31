"use client";

import Link from "next/link";
import Image from "next/image";
import { publicImageUrl } from "@/lib/supabase/storage";
import type { Profile } from "@/lib/types";

type ListProfile = Pick<Profile, "id" | "username" | "display_name" | "avatar_path">;

export default function FollowListModal({
  title,
  people,
  emptyText,
  onClose,
}: {
  title: string;
  people: ListProfile[];
  emptyText: string;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 bg-black/60"
        aria-label="Close"
      />
      <div className="card relative flex max-h-[80vh] w-full max-w-sm flex-col overflow-hidden">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="font-semibold">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-muted hover:bg-black/[.03] hover:text-foreground dark:hover:bg-white/[.06]"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <div className="overflow-y-auto">
          {people.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-muted">{emptyText}</p>
          ) : (
            <ul>
              {people.map((p) => {
                const avatarUrl = publicImageUrl("avatars", p.avatar_path);
                return (
                  <li key={p.id}>
                    <Link
                      href={`/u/${p.username}`}
                      onClick={onClose}
                      className="flex items-center gap-3 px-5 py-3 hover:bg-black/[.03] dark:hover:bg-white/[.06]"
                    >
                      <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-accent-soft">
                        {avatarUrl && (
                          <Image src={avatarUrl} alt={p.username} fill className="object-cover" />
                        )}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium">{p.display_name}</span>
                        <span className="block truncate text-xs text-muted">@{p.username}</span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
