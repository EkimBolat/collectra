"use client";

import { useActionState } from "react";
import type { Category, Collection } from "@/lib/types";
import { updateCollection } from "../actions";

export default function EditCollectionForm({
  collection,
  categories,
}: {
  collection: Collection;
  categories: Category[];
}) {
  const [state, formAction, pending] = useActionState(
    async (_prev: { error?: string } | undefined, formData: FormData) => {
      return (await updateCollection(collection.id, formData)) ?? {};
    },
    undefined,
  );

  return (
    <form action={formAction} className="card flex flex-col gap-4 p-6">
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium">Başlık</label>
        <input name="title" required defaultValue={collection.title} className="field" />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium">Açıklama</label>
        <textarea
          name="description"
          rows={3}
          defaultValue={collection.description ?? ""}
          className="field resize-none"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium">Kategori</label>
        <select name="category_id" defaultValue={collection.category_id} className="field">
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.emoji} {c.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium">Görünürlük</label>
        <select name="visibility" defaultValue={collection.visibility} className="field">
          <option value="public">Herkese açık</option>
          <option value="followers">Sadece takipçilerim</option>
          <option value="private">Gizli (sadece ben)</option>
        </select>
      </div>

      {state?.error && <p className="text-sm text-danger">{state.error}</p>}

      <button type="submit" disabled={pending} className="btn btn-primary mt-1 w-full">
        {pending ? "Kaydediliyor..." : "Kaydet"}
      </button>
    </form>
  );
}
