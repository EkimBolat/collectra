"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import PasswordField from "@/components/PasswordField";
import { requestPasswordReset, confirmPasswordReset } from "../actions";

export default function ForgotPasswordPage() {
  const { t } = useLocale();
  const [email, setEmail] = useState("");
  const [codeSent, setCodeSent] = useState(false);

  const [requestState, requestAction, requestPending] = useActionState(
    async (_prev: { error?: string } | undefined, formData: FormData) => {
      const result = (await requestPasswordReset(formData)) ?? {};
      if (result.success) {
        setEmail(String(formData.get("email") ?? "").trim());
        setCodeSent(true);
      }
      return result;
    },
    undefined,
  );

  const [confirmState, confirmAction, confirmPending] = useActionState(
    async (_prev: { error?: string } | undefined, formData: FormData) => {
      return (await confirmPasswordReset(formData)) ?? {};
    },
    undefined,
  );

  return (
    <>
      <div className="card p-7">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <h1 className="text-xl font-bold">
            {codeSent ? t.forgotPassword.codeSentTitle : t.forgotPassword.requestTitle}
          </h1>
          <p className="text-sm text-muted">
            {codeSent ? t.forgotPassword.codeSentSubtitle(email) : t.forgotPassword.requestSubtitle}
          </p>
        </div>

        {!codeSent ? (
          <form action={requestAction} className="flex flex-col gap-3">
            <input name="email" type="email" placeholder={t.auth.email} required className="field" />
            {requestState?.error && <p className="text-sm text-danger">{requestState.error}</p>}
            <button type="submit" disabled={requestPending} className="btn btn-primary mt-1 w-full">
              {requestPending ? t.forgotPassword.sendCodePending : t.forgotPassword.sendCode}
            </button>
          </form>
        ) : (
          <form action={confirmAction} className="flex flex-col gap-3">
            <input type="hidden" name="email" value={email} />
            <input
              name="code"
              placeholder={t.forgotPassword.codePlaceholder}
              inputMode="numeric"
              required
              className="field"
            />
            <PasswordField
              name="password"
              placeholder={t.forgotPassword.newPasswordLabel}
              minLength={6}
              required
            />
            <PasswordField
              name="confirmPassword"
              placeholder={t.forgotPassword.confirmPasswordLabel}
              minLength={6}
              required
            />
            {confirmState?.error && <p className="text-sm text-danger">{confirmState.error}</p>}
            <button type="submit" disabled={confirmPending} className="btn btn-primary mt-1 w-full">
              {confirmPending ? t.forgotPassword.resetButtonPending : t.forgotPassword.resetButton}
            </button>
            <button
              type="button"
              onClick={() => setCodeSent(false)}
              className="text-center text-sm text-muted hover:text-foreground"
            >
              {t.forgotPassword.changeEmail}
            </button>
          </form>
        )}
      </div>
      <p className="text-center text-sm text-muted">
        <Link href="/login" className="font-semibold text-accent hover:underline">
          {t.forgotPassword.backToLogin}
        </Link>
      </p>
    </>
  );
}
