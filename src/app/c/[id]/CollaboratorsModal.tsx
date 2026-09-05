"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { publicImageUrl } from "@/lib/supabase/storage";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { addCollaborator, removeCollaborator } from "./actions";
import type { Profile } from "@/lib/types";

type ListProfile = Pick<Profile, "id" | "username" | "display_name" | "avatar_path">;

function matchesQuery(profile: ListProfile, query: string) {
  const q = query.trim().toLocaleLowerCase("tr");
  if (!q) return true;
  return (
    profile.username.toLocaleLowerCase("tr").includes(q) ||
    profile.display_name.toLocaleLowerCase("tr").includes(q)
  );
}

function ProfileRow({ profile }: { profile: ListProfile }) {
  const avatarUrl = publicImageUrl("avatars", profile.avatar_path);
  return (
    <span className="flex min-w-0 items-center gap-2.5">
      <span className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full bg-accent-soft">
        {avatarUrl && <Image src={avatarUrl} alt={profile.username} fill className="object-cover" />}
      </span>
      <span className="min-w-0">
        <span className="block truncate text-sm font-medium">{profile.display_name}</span>
        <span className="block truncate text-xs text-muted">@{profile.username}</span>
      </span>
    </span>
  );
}

export default function CollaboratorsModal({
  collectionId,
  collaborators,
  candidates,
  onClose,
}: {
  collectionId: string;
  collaborators: ListProfile[];
  candidates: ListProfile[];
  onClose: () => void;
}) {
  const { t } = useLocale();
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const filteredCandidates = candidates.filter((p) => matchesQuery(p, query));

  const handleAdd = async (userId: string) => {
    setPendingId(userId);
    await addCollaborator(collectionId, userId);
    router.refresh();
    setPendingId(null);
  };

  const handleRemove = async (userId: string) => {
    setPendingId(userId);
    await removeCollaborator(collectionId, userId);
    router.refresh();
    setPendingId(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 bg-black/60"
        aria-label={t.collection.close}
      />
      <div className="card relative flex max-h-[80vh] w-full max-w-sm flex-col overflow-hidden">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="font-semibold">{t.collaborators.title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-muted hover:bg-black/[.03] hover:text-foreground dark:hover:bg-white/[.06]"
            aria-label={t.collection.close}
          >
            ✕
          </button>
        </div>
        <div className="overflow-y-auto">
          <div className="px-5 pt-4">
            <p className="mb-1 text-xs font-medium text-muted">{t.collaborators.current}</p>
            {collaborators.length === 0 ? (
              <p className="py-3 text-sm text-muted">{t.collaborators.noCurrent}</p>
            ) : (
              <ul>
                {collaborators.map((p) => (
                  <li key={p.id} className="flex items-center justify-between gap-3 py-2">
                    <ProfileRow profile={p} />
                    <button
                      type="button"
                      disabled={pendingId === p.id}
                      onClick={() => handleRemove(p.id)}
                      className="shrink-0 text-xs font-medium text-danger hover:underline disabled:opacity-50"
                    >
                      {t.collaborators.remove}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="border-t border-border px-5 py-4">
            <p className="mb-1 text-xs font-medium text-muted">{t.collaborators.add}</p>
            {candidates.length === 0 ? (
              <p className="py-3 text-sm text-muted">{t.collaborators.noCandidates}</p>
            ) : (
              <>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t.collaborators.searchPlaceholder}
                  className="field mb-1 py-2 text-sm"
                />
                {filteredCandidates.length === 0 ? (
                  <p className="py-3 text-sm text-muted">{t.collaborators.noSearchResults}</p>
                ) : (
                  <ul>
                    {filteredCandidates.map((p) => (
                      <li key={p.id} className="flex items-center justify-between gap-3 py-2">
                        <ProfileRow profile={p} />
                        <button
                          type="button"
                          disabled={pendingId === p.id}
                          onClick={() => handleAdd(p.id)}
                          className="shrink-0 text-xs font-medium text-accent hover:underline disabled:opacity-50"
                        >
                          {t.collaborators.addAction}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
