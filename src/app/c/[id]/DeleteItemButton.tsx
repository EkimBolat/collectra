"use client";

import { useState, useTransition } from "react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import ConfirmDialog from "@/components/ConfirmDialog";
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
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  return (
    <>
      <button
        onClick={() => setConfirmOpen(true)}
        disabled={pending}
        className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-xs text-white backdrop-blur-sm transition-colors hover:bg-black/80 disabled:opacity-50"
        aria-label={t.collection.removePhoto}
      >
        ✕
      </button>
      {confirmOpen && (
        <ConfirmDialog
          message={t.collection.deleteItemConfirm}
          confirmLabel={t.collection.removePhoto}
          cancelLabel={t.collection.cancel}
          pending={pending}
          onCancel={() => setConfirmOpen(false)}
          onConfirm={() => {
            setConfirmOpen(false);
            startTransition(() => deleteItem(collectionId, itemId, imagePath));
          }}
        />
      )}
    </>
  );
}
