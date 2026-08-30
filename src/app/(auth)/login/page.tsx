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
    <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-4 py-16">
      <div className="card p-7">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <span className="logo-mark flex h-11 w-11 items-center justify-center rounded-2xl text-xl text-accent-foreground">
            ✺
          </span>
          <h1 className="text-xl font-bold">Tekrar hoş geldin</h1>
          <p className="text-sm text-muted">Koleksiyonlarına giriş yap</p>
        </div>
        <form action={formAction} className="flex flex-col gap-3">
          <input name="email" type="email" placeholder="E-posta" required className="field" />
          <input
            name="password"
            type="password"
            placeholder="Şifre"
            required
            className="field"
          />
          {state?.error && <p className="text-sm text-danger">{state.error}</p>}
          <button type="submit" disabled={pending} className="btn btn-primary mt-1 w-full">
            {pending ? "Giriş yapılıyor..." : "Giriş yap"}
          </button>
        </form>
      </div>
      <p className="mt-5 text-center text-sm text-muted">
        Hesabın yok mu?{" "}
        <Link href="/signup" className="font-semibold text-accent hover:underline">
          Kayıt ol
        </Link>
      </p>
    </div>
  );
}
