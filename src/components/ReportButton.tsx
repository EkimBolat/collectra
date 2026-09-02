"use client";

import { useState, useTransition } from "react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { submitReport } from "@/app/report-actions";
import type { ReportReason, ReportTargetType } from "@/lib/types";

const REASONS: ReportReason[] = ["inappropriate", "off_topic", "harassment", "other"];

export default function ReportButton({
  targetType,
  targetId,
  variant = "icon",
}: {
  targetType: ReportTargetType;
  targetId: string;
  variant?: "icon" | "text";
}) {
  const { t } = useLocale();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<ReportReason>("inappropriate");
  const [details, setDetails] = useState("");
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<{
    error?: string;
    success?: boolean;
    alreadyReported?: boolean;
  } | null>(null);

  const reasonLabels: Record<ReportReason, string> = {
    inappropriate: t.report.reasonInappropriate,
    off_topic: t.report.reasonOffTopic,
    harassment: t.report.reasonHarassment,
    other: t.report.reasonOther,
  };

  const close = () => {
    setOpen(false);
    setResult(null);
    setReason("inappropriate");
    setDetails("");
  };

  const handleSubmit = () => {
    startTransition(async () => {
      const res = await submitReport(targetType, targetId, reason, details);
      setResult(res);
    });
  };

  return (
    <>
      {variant === "icon" ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="btn btn-secondary !px-2.5"
          aria-label={t.report.action}
          title={t.report.action}
        >
          <svg viewBox="0 0 20 20" className="h-4 w-4 fill-current">
            <path d="M4 2.5a.75.75 0 00-.75.75v14a.75.75 0 001.5 0V11h9.577a.75.75 0 00.6-1.2l-2.2-2.8 2.2-2.8a.75.75 0 00-.6-1.2H4.75V3.25A.75.75 0 004 2.5z" />
          </svg>
        </button>
      ) : (
        <button type="button" onClick={() => setOpen(true)} className="hover:text-danger">
          {t.report.action}
        </button>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            onClick={close}
            className="absolute inset-0 bg-black/60"
            aria-label={t.collection.close}
          />
          <div className="card relative w-full max-w-sm p-5">
            <h2 className="mb-4 font-semibold">
              {targetType === "collection" ? t.report.collectionTitle : t.report.commentTitle}
            </h2>

            {result?.success ? (
              <div>
                <p className="text-sm text-foreground/90">
                  {result.alreadyReported ? t.report.alreadyReported : t.report.success}
                </p>
                <button type="button" onClick={close} className="btn btn-secondary mt-4 w-full">
                  {t.collection.close}
                </button>
              </div>
            ) : (
              <>
                <fieldset className="flex flex-col gap-2">
                  <legend className="mb-1 text-sm font-medium text-muted">{t.report.reasonLabel}</legend>
                  {REASONS.map((r) => (
                    <label key={r} className="flex items-center gap-2 text-sm">
                      <input
                        type="radio"
                        name="report-reason"
                        checked={reason === r}
                        onChange={() => setReason(r)}
                      />
                      {reasonLabels[r]}
                    </label>
                  ))}
                </fieldset>

                <label className="mt-4 block text-sm font-medium text-muted" htmlFor="report-details">
                  {t.report.detailsLabel}
                </label>
                <textarea
                  id="report-details"
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder={t.report.detailsPlaceholder}
                  maxLength={500}
                  rows={3}
                  className="field mt-1 w-full"
                />

                {result?.error && <p className="mt-2 text-sm text-danger">{result.error}</p>}

                <div className="mt-4 flex gap-2">
                  <button type="button" onClick={close} className="btn btn-secondary flex-1">
                    {t.report.cancel}
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={pending}
                    className="btn btn-primary flex-1"
                  >
                    {pending ? t.report.submitPending : t.report.submit}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
