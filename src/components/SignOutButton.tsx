"use client";

import { signOut } from "@/app/(auth)/actions";

export default function SignOutButton() {
  return (
    <form action={signOut}>
      <button
        type="submit"
        className="text-sm text-black/60 hover:text-black dark:text-white/60 dark:hover:text-white"
      >
        Çıkış yap
      </button>
    </form>
  );
}
