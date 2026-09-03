"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import ConfirmDialog from "@/components/ConfirmDialog";
import { deleteCollection } from "./actions";

export default function OwnerMenu({ collectionId }: { collectionId: string }) {
  const { t } = useLocale();
  const [open, setOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="btn btn-secondary !px-2.5"
        aria-label={t.collection.menu}
      >
        ⋯
      </button>
      {open && (
        <div className="absolute right-0 top-full z-10 mt-2 w-40 overflow-hidden rounded-xl border border-border bg-surface shadow-lg">
          <Link
            href={`/c/${collectionId}/edit`}
            className="block px-4 py-2.5 text-sm hover:bg-black/[.03] dark:hover:bg-white/[.06]"
          >
            {t.collection.edit}
          </Link>
          <button
            disabled={pending}
            onClick={() => {
              setOpen(false);
              setConfirmOpen(true);
            }}
            className="block w-full px-4 py-2.5 text-left text-sm text-danger hover:bg-danger/10 disabled:opacity-50"
          >
            {pending ? t.collection.deletePending : t.collection.delete}
          </button>
        </div>
      )}
      {confirmOpen && (
        <ConfirmDialog
          message={t.collection.deleteConfirm}
          confirmLabel={t.collection.delete}
          cancelLabel={t.collection.cancel}
          pending={pending}
          onCancel={() => setConfirmOpen(false)}
          onConfirm={() => {
            setConfirmOpen(false);
            startTransition(() => deleteCollection(collectionId));
          }}
        />
      )}
    </div>
  );
}
