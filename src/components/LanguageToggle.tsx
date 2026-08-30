"use client";

import { useLocale } from "@/lib/i18n/LocaleProvider";

export default function LanguageToggle() {
  const { locale, setLocale, pending } = useLocale();

  return (
    <div className="ml-0.5 flex shrink-0 items-center overflow-hidden rounded-full border border-border text-xs font-semibold">
      <button
        type="button"
        disabled={pending}
        onClick={() => setLocale("tr")}
        className={`px-2 py-1 transition-colors disabled:opacity-50 ${
          locale === "tr" ? "bg-accent text-accent-foreground" : "text-muted hover:text-foreground"
        }`}
      >
        TR
      </button>
      <button
        type="button"
        disabled={pending}
        onClick={() => setLocale("en")}
        className={`px-2 py-1 transition-colors disabled:opacity-50 ${
          locale === "en" ? "bg-accent text-accent-foreground" : "text-muted hover:text-foreground"
        }`}
      >
        EN
      </button>
    </div>
  );
}
