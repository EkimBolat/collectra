"use client";

import { signOut } from "@/app/(auth)/actions";

export default function SignOutButton() {
  return (
    <form action={signOut}>
      <button type="submit" className="btn btn-ghost">
        Çıkış yap
      </button>
    </form>
  );
}
