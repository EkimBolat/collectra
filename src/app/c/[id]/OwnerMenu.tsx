"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { deleteCollection } from "./actions";

export default function OwnerMenu({ collectionId }: { collectionId: string }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="btn btn-secondary !px-2.5"
        aria-label="Koleksiyon menüsü"
      >
        ⋯
      </button>
      {open && (
        <div className="absolute right-0 top-full z-10 mt-2 w-40 overflow-hidden rounded-xl border border-border bg-surface shadow-lg">
          <Link
            href={`/c/${collectionId}/edit`}
            className="block px-4 py-2.5 text-sm hover:bg-black/[.03] dark:hover:bg-white/[.06]"
          >
            Düzenle
          </Link>
          <button
            disabled={pending}
            onClick={() => {
              if (confirm("Bu koleksiyonu silmek istediğine emin misin? Bu işlem geri alınamaz.")) {
                startTransition(() => deleteCollection(collectionId));
              }
            }}
            className="block w-full px-4 py-2.5 text-left text-sm text-danger hover:bg-danger/10 disabled:opacity-50"
          >
            {pending ? "Siliniyor..." : "Sil"}
          </button>
        </div>
      )}
    </div>
  );
}
