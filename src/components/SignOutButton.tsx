"use client";

import { signOut } from "@/app/(auth)/actions";
import { useLocale } from "@/lib/i18n/LocaleProvider";

export default function SignOutButton() {
  const { t } = useLocale();

  return (
    <form action={signOut}>
      <button type="submit" className="btn btn-ghost">
        {t.nav.signOut}
      </button>
    </form>
  );
}
