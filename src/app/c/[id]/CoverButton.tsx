"use client";

import { useTransition } from "react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { setCoverItem } from "./actions";

export default function CoverButton({
  collectionId,
  itemId,
  isCover,
}: {
  collectionId: string;
  itemId: string;
  isCover: boolean;
}) {
  const { t } = useLocale();
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      onClick={() => startTransition(() => setCoverItem(collectionId, isCover ? null : itemId))}
      disabled={pending}
      className={`absolute left-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full backdrop-blur-sm transition-colors disabled:opacity-50 ${
        isCover ? "bg-accent text-white" : "bg-black/60 text-white hover:bg-black/80"
      }`}
      aria-label={isCover ? t.collection.removeCover : t.collection.setCover}
      title={isCover ? t.collection.removeCover : t.collection.setCover}
    >
      <svg
        viewBox="0 0 20 20"
        className="h-3.5 w-3.5"
        fill={isCover ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={isCover ? 0 : 1.5}
        strokeLinejoin="round"
      >
        <path d="M10 2l2.47 5.27 5.53.66-4.1 3.9 1.09 5.67L10 14.6l-4.99 2.9 1.09-5.67-4.1-3.9 5.53-.66z" />
      </svg>
    </button>
  );
}
