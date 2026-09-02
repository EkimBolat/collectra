"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import PasswordField from "@/components/PasswordField";
import { signUp } from "../actions";

export default function SignupPage() {
  const { t } = useLocale();
  const [username, setUsername] = useState("");
  const [state, formAction, pending] = useActionState(
    async (_prev: { error?: string } | undefined, formData: FormData) => {
      return (await signUp(formData)) ?? {};
    },
    undefined,
  );

  return (
    <>
      <div className="card p-7">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <h1 className="text-xl font-bold">{t.auth.signupTitle}</h1>
          <p className="text-sm text-muted">{t.auth.signupSubtitle}</p>
        </div>
        <form action={formAction} className="flex flex-col gap-3">
          <input
            name="username"
            value={username}
            onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
            placeholder={t.auth.username}
            pattern="[a-z0-9_]{3,24}"
            required
            className="field"
          />
          <input name="email" type="email" placeholder={t.auth.email} required className="field" />
          <PasswordField name="password" placeholder={t.auth.passwordHint} minLength={6} required />
          {state?.error && <p className="text-sm text-danger">{state.error}</p>}
          <button type="submit" disabled={pending} className="btn btn-primary mt-1 w-full">
            {pending ? t.auth.signupButtonPending : t.auth.signupButton}
          </button>
        </form>
      </div>
      <p className="text-center text-sm text-muted">
        {t.auth.hasAccount}{" "}
        <Link href="/login" className="font-semibold text-accent hover:underline">
          {t.nav.login}
        </Link>
      </p>
    </>
  );
}
