"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { categoryName, type Locale } from "@/lib/i18n/client";
import type { Category } from "@/lib/types";

export default function CategoryScroller({
  categories,
  activeSlug,
  allLabel,
  locale,
}: {
  categories: Category[];
  activeSlug?: string;
  allLabel: string;
  locale: Locale;
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateArrows = () => {
    const el = scrollerRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  };

  useEffect(() => {
    updateArrows();
    window.addEventListener("resize", updateArrows);
    return () => window.removeEventListener("resize", updateArrows);
  }, [categories]);

  const scroll = (direction: 1 | -1) => {
    scrollerRef.current?.scrollBy({ left: direction * 240, behavior: "smooth" });
  };

  return (
    <div className="mb-6 flex items-center gap-1">
      <button
        type="button"
        onClick={() => scroll(-1)}
        disabled={!canScrollLeft}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-surface text-muted transition-opacity hover:text-foreground disabled:pointer-events-none disabled:opacity-0"
        aria-label="Scroll left"
      >
        ‹
      </button>

      <div
        ref={scrollerRef}
        onScroll={updateArrows}
        className="no-scrollbar flex gap-2 overflow-x-auto scroll-smooth"
      >
        <Link href="/" className={`chip shrink-0 ${!activeSlug ? "chip-active" : "chip-idle"}`}>
          {allLabel}
        </Link>
        {categories.map((c) => (
          <Link
            key={c.id}
            href={`/?category=${c.slug}`}
            className={`chip shrink-0 ${activeSlug === c.slug ? "chip-active" : "chip-idle"}`}
          >
            {c.emoji} {categoryName(c.slug, locale, c.name)}
          </Link>
        ))}
      </div>

      <button
        type="button"
        onClick={() => scroll(1)}
        disabled={!canScrollRight}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-surface text-muted transition-opacity hover:text-foreground disabled:pointer-events-none disabled:opacity-0"
        aria-label="Scroll right"
      >
        ›
      </button>
    </div>
  );
}
