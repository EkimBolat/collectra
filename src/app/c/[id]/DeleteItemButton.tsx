"use client";

import { useTransition } from "react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { deleteItem } from "./actions";

export default function DeleteItemButton({
  collectionId,
  itemId,
  imagePath,
}: {
  collectionId: string;
  itemId: string;
  imagePath: string;
}) {
  const { t } = useLocale();
  const [pending, startTransition] = useTransition();

  return (
    <button
      onClick={() => {
        if (confirm(t.collection.deleteItemConfirm)) {
          startTransition(() => deleteItem(collectionId, itemId, imagePath));
        }
      }}
      disabled={pending}
      className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-xs text-white backdrop-blur-sm transition-colors hover:bg-black/80 disabled:opacity-50"
      aria-label={t.collection.removePhoto}
    >
      ✕
    </button>
  );
}
