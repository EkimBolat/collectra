"use client";

import { useActionState } from "react";
import type { Category } from "@/lib/types";
import { categoryName, type Locale } from "@/lib/i18n/client";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { createCollection } from "./actions";

export default function NewCollectionForm({
  categories,
  locale,
}: {
  categories: Category[];
  locale: Locale;
}) {
  const { t } = useLocale();
  const [state, formAction, pending] = useActionState(
    async (_prev: { error?: string } | undefined, formData: FormData) => {
      return (await createCollection(formData)) ?? {};
    },
    undefined,
  );

  return (
    <form action={formAction} className="card flex flex-col gap-4 p-6">
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

      {state?.error && <p className="text-sm text-danger">{state.error}</p>}

      <button type="submit" disabled={pending} className="btn btn-primary mt-1 w-full">
        {pending ? t.newCollection.submitPending : t.newCollection.submit}
      </button>
    </form>
  );
}
