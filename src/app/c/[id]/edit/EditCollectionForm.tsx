"use client";

import { useActionState } from "react";
import type { Category, Collection } from "@/lib/types";
import { categoryName, type Locale } from "@/lib/i18n/client";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { updateCollection } from "../actions";

export default function EditCollectionForm({
  collection,
  categories,
  locale,
}: {
  collection: Collection;
  categories: Category[];
  locale: Locale;
}) {
  const { t } = useLocale();
  const [state, formAction, pending] = useActionState(
    async (_prev: { error?: string } | undefined, formData: FormData) => {
      return (await updateCollection(collection.id, formData)) ?? {};
    },
    undefined,
  );

  return (
    <form action={formAction} className="card flex flex-col gap-4 p-6">
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium">{t.newCollection.titleLabel}</label>
        <input name="title" required defaultValue={collection.title} className="field" />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium">{t.newCollection.descriptionLabel}</label>
        <textarea
          name="description"
          rows={3}
          defaultValue={collection.description ?? ""}
          className="field resize-none"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium">{t.newCollection.categoryLabel}</label>
        <select name="category_id" defaultValue={collection.category_id} className="field">
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.emoji} {categoryName(c.slug, locale, c.name)}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium">{t.newCollection.visibilityLabel}</label>
        <select name="visibility" defaultValue={collection.visibility} className="field">
          <option value="public">{t.newCollection.visibilityPublic}</option>
          <option value="followers">{t.newCollection.visibilityFollowers}</option>
          <option value="private">{t.newCollection.visibilityPrivate}</option>
        </select>
      </div>

      {state?.error && <p className="text-sm text-danger">{state.error}</p>}

      <button type="submit" disabled={pending} className="btn btn-primary mt-1 w-full">
        {pending ? t.editCollection.savePending : t.editCollection.save}
      </button>
    </form>
  );
}
