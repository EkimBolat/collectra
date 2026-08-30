"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { publicImageUrl } from "@/lib/supabase/storage";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import DeleteItemButton from "./DeleteItemButton";

type Item = {
  id: string;
  image_path: string;
  caption: string | null;
};

export default function PhotoGrid({
  collectionId,
  items,
  isOwner,
  title,
}: {
  collectionId: string;
  items: Item[];
  isOwner: boolean;
  title: string;
}) {
  const { t } = useLocale();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  useEffect(() => {
    for (const item of items) {
      const url = publicImageUrl("collection-images", item.image_path);
      if (!url) continue;
      const img = new window.Image();
      img.src = url;
    }
  }, [items]);

  useEffect(() => {
    if (openIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenIndex(null);
      if (e.key === "ArrowRight") setOpenIndex((i) => (i === null ? i : (i + 1) % items.length));
      if (e.key === "ArrowLeft")
        setOpenIndex((i) => (i === null ? i : (i - 1 + items.length) % items.length));
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [openIndex, items.length]);

  if (items.length === 0) {
    return <p className="py-16 text-center text-muted">{t.collection.noPhotos}</p>;
  }

  const active = openIndex !== null ? items[openIndex] : null;
  const activeUrl = active ? publicImageUrl("collection-images", active.image_path) : null;

  return (
    <>
      <div className="mb-6 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {items.map((item, i) => {
          const url = publicImageUrl("collection-images", item.image_path);
          return (
            <div
              key={item.id}
              className="group relative aspect-square overflow-hidden rounded-xl bg-accent-soft"
            >
              <button
                type="button"
                onClick={() => setOpenIndex(i)}
                className="absolute inset-0 h-full w-full cursor-zoom-in"
                aria-label={t.collection.zoomPhoto}
              >
                {url && (
                  <Image
                    src={url}
                    alt={item.caption ?? title}
                    fill
                    sizes="(max-width: 768px) 50vw, 33vw"
                    className="object-cover transition-transform duration-200 group-hover:scale-105"
                  />
                )}
              </button>
              {isOwner && (
                <DeleteItemButton
                  collectionId={collectionId}
                  itemId={item.id}
                  imagePath={item.image_path}
                />
              )}
            </div>
          );
        })}
      </div>

      {active && activeUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setOpenIndex(null)}
        >
          <button
            type="button"
            onClick={() => setOpenIndex(null)}
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-xl text-white hover:bg-white/20"
            aria-label={t.collection.close}
          >
            ✕
          </button>

          {items.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenIndex((i) => (i === null ? i : (i - 1 + items.length) % items.length));
                }}
                className="absolute left-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-xl text-white hover:bg-white/20 sm:left-4"
                aria-label={t.collection.prevPhoto}
              >
                ‹
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenIndex((i) => (i === null ? i : (i + 1) % items.length));
                }}
                className="absolute right-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-xl text-white hover:bg-white/20 sm:right-4"
                aria-label={t.collection.nextPhoto}
              >
                ›
              </button>
            </>
          )}

          <div
            className="relative flex h-full max-h-[85vh] w-full max-w-3xl items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Plain img (not next/image) so switching photos is instant — it hits the
                Supabase CDN directly instead of round-tripping through the image optimizer. */}
            <img
              src={activeUrl}
              alt={active.caption ?? title}
              className="max-h-full max-w-full object-contain"
            />
          </div>

          {items.length > 1 && (
            <span className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-3 py-1 text-xs text-white">
              {openIndex! + 1} / {items.length}
            </span>
          )}
        </div>
      )}
    </>
  );
}
