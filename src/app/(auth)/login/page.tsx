"use client";

import { useActionState } from "react";
import Link from "next/link";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import PasswordField from "@/components/PasswordField";
import StarMark from "@/components/StarMark";
import { signIn } from "../actions";

export default function LoginPage() {
  const { t } = useLocale();
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
          <span className="logo-mark flex h-11 w-11 items-center justify-center rounded-2xl">
            <StarMark className="h-6 w-6" />
          </span>
          <h1 className="text-xl font-bold">{t.auth.loginTitle}</h1>
          <p className="text-sm text-muted">{t.auth.loginSubtitle}</p>
        </div>
        <form action={formAction} className="flex flex-col gap-3">
          <input name="email" type="email" placeholder={t.auth.email} required className="field" />
          <PasswordField name="password" placeholder={t.auth.password} required />
          {state?.error && <p className="text-sm text-danger">{state.error}</p>}
          <button type="submit" disabled={pending} className="btn btn-primary mt-1 w-full">
            {pending ? t.auth.loginButtonPending : t.auth.loginButton}
          </button>
        </form>
      </div>
      <p className="mt-5 text-center text-sm text-muted">
        {t.auth.noAccount}{" "}
        <Link href="/signup" className="font-semibold text-accent hover:underline">
          {t.nav.signup}
        </Link>
      </p>
    </div>
  );
}
