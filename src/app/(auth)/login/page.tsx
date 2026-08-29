"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signIn } from "../actions";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(
    async (_prev: { error?: string } | undefined, formData: FormData) => {
      return (await signIn(formData)) ?? {};
    },
    undefined,
  );

  return (
    <div className="mx-auto flex max-w-sm flex-1 flex-col justify-center px-4 py-16">
      <h1 className="mb-6 text-2xl font-semibold">Giriş yap</h1>
      <form action={formAction} className="flex flex-col gap-4">
        <input
          name="email"
          type="email"
          placeholder="E-posta"
          required
          className="rounded-md border border-black/10 px-3 py-2 outline-none focus:border-black/30 dark:border-white/15 dark:focus:border-white/40"
        />
        <input
          name="password"
          type="password"
          placeholder="Şifre"
          required
          className="rounded-md border border-black/10 px-3 py-2 outline-none focus:border-black/30 dark:border-white/15 dark:focus:border-white/40"
        />
        {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-foreground px-3 py-2 font-medium text-background disabled:opacity-50"
        >
          {pending ? "Giriş yapılıyor..." : "Giriş yap"}
        </button>
      </form>
      <p className="mt-4 text-sm text-black/60 dark:text-white/60">
        Hesabın yok mu?{" "}
        <Link href="/signup" className="font-medium underline">
          Kayıt ol
        </Link>
      </p>
    </div>
  );
}
