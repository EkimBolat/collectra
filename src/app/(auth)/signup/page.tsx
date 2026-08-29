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
    <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-4 py-16">
      <div className="card p-7">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent text-xl text-accent-foreground">
            ✺
          </span>
          <h1 className="text-xl font-bold">Collectra&apos;ya katıl</h1>
          <p className="text-sm text-muted">Koleksiyonunu paylaşmaya başla</p>
        </div>
        <form action={formAction} className="flex flex-col gap-3">
          <input name="display_name" placeholder="Görünen ad" required className="field" />
          <input
            name="username"
            placeholder="kullanici_adi"
            pattern="[a-z0-9_]{3,24}"
            required
            className="field"
          />
          <input name="email" type="email" placeholder="E-posta" required className="field" />
          <input
            name="password"
            type="password"
            placeholder="Şifre (en az 6 karakter)"
            minLength={6}
            required
            className="field"
          />
          {state?.error && <p className="text-sm text-danger">{state.error}</p>}
          <button type="submit" disabled={pending} className="btn btn-primary mt-1 w-full">
            {pending ? "Kaydediliyor..." : "Kayıt ol"}
          </button>
        </form>
      </div>
      <p className="mt-5 text-center text-sm text-muted">
        Zaten hesabın var mı?{" "}
        <Link href="/login" className="font-semibold text-accent hover:underline">
          Giriş yap
        </Link>
      </p>
    </div>
  );
}
