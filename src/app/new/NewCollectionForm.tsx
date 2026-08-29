"use client";

import { useActionState } from "react";
import type { Category } from "@/lib/types";
import { createCollection } from "./actions";

export default function NewCollectionForm({ categories }: { categories: Category[] }) {
  const [state, formAction, pending] = useActionState(
    async (_prev: { error?: string } | undefined, formData: FormData) => {
      return (await createCollection(formData)) ?? {};
    },
    undefined,
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium">Başlık</label>
        <input
          name="title"
          required
          placeholder="Örn: Lego Uzay Koleksiyonum"
          className="rounded-md border border-black/10 px-3 py-2 outline-none focus:border-black/30 dark:border-white/15 dark:focus:border-white/40"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium">Açıklama</label>
        <textarea
          name="description"
          rows={3}
          placeholder="Koleksiyonun hakkında birkaç cümle..."
          className="rounded-md border border-black/10 px-3 py-2 outline-none focus:border-black/30 dark:border-white/15 dark:focus:border-white/40"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium">Kategori</label>
        <select
          name="category_id"
          required
          defaultValue=""
          className="rounded-md border border-black/10 px-3 py-2 outline-none focus:border-black/30 dark:border-white/15 dark:focus:border-white/40"
        >
          <option value="" disabled>
            Seç
          </option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.emoji} {c.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium">Görünürlük</label>
        <select
          name="visibility"
          defaultValue="public"
          className="rounded-md border border-black/10 px-3 py-2 outline-none focus:border-black/30 dark:border-white/15 dark:focus:border-white/40"
        >
          <option value="public">Herkese açık</option>
          <option value="followers">Sadece takipçilerim</option>
          <option value="private">Gizli (sadece ben)</option>
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium">Fotoğraflar</label>
        <input
          name="images"
          type="file"
          accept="image/*"
          multiple
          required
          className="rounded-md border border-black/10 px-3 py-2 file:mr-3 file:rounded file:border-0 file:bg-black/5 file:px-2 file:py-1 dark:border-white/15 dark:file:bg-white/10"
        />
        <p className="text-xs text-black/50 dark:text-white/50">
          Birden fazla fotoğraf seçebilirsin. Koleksiyonuna sonradan da parça ekleyebilirsin.
        </p>
      </div>

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 rounded-md bg-foreground px-3 py-2 font-medium text-background disabled:opacity-50"
      >
        {pending ? "Yükleniyor..." : "Koleksiyonu paylaş"}
      </button>
    </form>
  );
}
