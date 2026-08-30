"use client";

import { createContext, useContext, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { dictionaries, LOCALE_COOKIE, type Locale } from "./client";

type Ctx = {
  locale: Locale;
  t: (typeof dictionaries)[Locale];
  setLocale: (locale: Locale) => void;
  pending: boolean;
};

const LocaleContext = createContext<Ctx | null>(null);

export function LocaleProvider({
  initialLocale,
  children,
}: {
  initialLocale: Locale;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [locale, setLocaleState] = useState(initialLocale);
  const [pending, startTransition] = useTransition();

  const setLocale = (next: Locale) => {
    document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000; SameSite=Lax`;
    setLocaleState(next);
    startTransition(() => router.refresh());
  };

  return (
    <LocaleContext.Provider value={{ locale, t: dictionaries[locale], setLocale, pending }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used within LocaleProvider");
  return ctx;
}
