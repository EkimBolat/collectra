"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { publicImageUrl } from "@/lib/supabase/storage";
import type { Category, Profile } from "@/lib/types";
import { categoryName, type Locale } from "@/lib/i18n/client";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { uploadCollectionImages } from "@/lib/supabase/upload";
import { addCollaborator } from "@/app/c/[id]/actions";
import { createCollection } from "./actions";

type ListProfile = Pick<Profile, "id" | "username" | "display_name" | "avatar_path">;

export default function NewCollectionForm({
  categories,
  locale,
  userId,
  candidates,
}: {
  categories: Category[];
  locale: Locale;
  userId: string;
  candidates: ListProfile[];
}) {
  const { t } = useLocale();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggleCollaborator = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const files = formData
      .getAll("images")
      .filter((f): f is File => f instanceof File && f.size > 0);

    if (files.length === 0) {
      setError(t.newCollection.errorNoPhotos);
      return;
    }

    setError(null);
    setPending(true);

    try {
      const result = await createCollection(formData);
      if (result.error || !result.id) {
        setError(result.error ?? t.newCollection.errorGeneric);
        setPending(false);
        return;
      }

      await uploadCollectionImages(userId, result.id, files);
      if (selected.size > 0) {
        await Promise.all(
          Array.from(selected).map((collaboratorId) => addCollaborator(result.id, collaboratorId)),
        );
      }
      router.push(`/c/${result.id}`);
    } catch (err) {
      const detail = err instanceof Error ? err.message : String(err);
      setError(`${t.newCollection.errorGeneric} (${detail})`);
      setPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card flex flex-col gap-4 p-6">
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium">{t.newCollection.titleLabel}</label>
        <input
          name="title"
          required
          placeholder={t.newCollection.titlePlaceholder}
          className="field"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium">{t.newCollection.descriptionLabel}</label>
        <textarea
          name="description"
          rows={3}
          placeholder={t.newCollection.descriptionPlaceholder}
          className="field resize-none"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium">{t.newCollection.categoryLabel}</label>
        <select name="category_id" required defaultValue="" className="field">
          <option value="" disabled>
            {t.newCollection.categorySelect}
          </option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.emoji} {categoryName(c.slug, locale, c.name)}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium">{t.newCollection.visibilityLabel}</label>
        <select name="visibility" defaultValue="public" className="field">
          <option value="public">{t.newCollection.visibilityPublic}</option>
          <option value="followers">{t.newCollection.visibilityFollowers}</option>
          <option value="private">{t.newCollection.visibilityPrivate}</option>
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium">{t.newCollection.photosLabel}</label>
        <input
          name="images"
          type="file"
          accept="image/*"
          multiple
          required
          className="field file:mr-3 file:rounded-full file:border-0 file:bg-accent-soft file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-accent"
        />
        <p className="text-xs text-muted">{t.newCollection.photosHint}</p>
      </div>

      {candidates.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">{t.collaborators.optionalLabel}</label>
          <p className="text-xs text-muted">{t.collaborators.optionalHint}</p>
          <ul className="mt-1 flex flex-col gap-1 rounded-xl border border-border p-1.5">
            {candidates.map((p) => {
              const avatarUrl = publicImageUrl("avatars", p.avatar_path);
              const checked = selected.has(p.id);
              return (
                <li key={p.id}>
                  <label className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 hover:bg-black/[.03] dark:hover:bg-white/[.06]">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleCollaborator(p.id)}
                      className="h-4 w-4 shrink-0 accent-accent"
                    />
                    <span className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full bg-accent-soft">
                      {avatarUrl && (
                        <Image src={avatarUrl} alt={p.username} fill className="object-cover" />
                      )}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium">{p.display_name}</span>
                      <span className="block truncate text-xs text-muted">@{p.username}</span>
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {error && <p className="text-sm text-danger">{error}</p>}

      <button type="submit" disabled={pending} className="btn btn-primary mt-1 w-full">
        {pending ? t.newCollection.submitPending : t.newCollection.submit}
      </button>
    </form>
  );
}
