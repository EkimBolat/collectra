"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signUp } from "../actions";

export default function SignupPage() {
  const [state, formAction, pending] = useActionState(
    async (_prev: { error?: string } | undefined, formData: FormData) => {
      return (await signUp(formData)) ?? {};
    },
    undefined,
  );

  return (
    <div className="mx-auto flex max-w-sm flex-1 flex-col justify-center px-4 py-16">
      <h1 className="mb-6 text-2xl font-semibold">Kayıt ol</h1>
      <form action={formAction} className="flex flex-col gap-4">
        <input
          name="display_name"
          placeholder="Görünen ad"
          required
          className="rounded-md border border-black/10 px-3 py-2 outline-none focus:border-black/30 dark:border-white/15 dark:focus:border-white/40"
        />
        <input
          name="username"
          placeholder="kullanici_adi"
          pattern="[a-z0-9_]{3,24}"
          required
          className="rounded-md border border-black/10 px-3 py-2 outline-none focus:border-black/30 dark:border-white/15 dark:focus:border-white/40"
        />
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
          placeholder="Şifre (en az 6 karakter)"
          minLength={6}
          required
          className="rounded-md border border-black/10 px-3 py-2 outline-none focus:border-black/30 dark:border-white/15 dark:focus:border-white/40"
        />
        {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-foreground px-3 py-2 font-medium text-background disabled:opacity-50"
        >
          {pending ? "Kaydediliyor..." : "Kayıt ol"}
        </button>
      </form>
      <p className="mt-4 text-sm text-black/60 dark:text-white/60">
        Zaten hesabın var mı?{" "}
        <Link href="/login" className="font-medium underline">
          Giriş yap
        </Link>
      </p>
    </div>
  );
}
