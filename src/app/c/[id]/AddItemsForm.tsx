"use client";

import { useActionState, useRef } from "react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { addItems } from "@/app/new/actions";

export default function AddItemsForm({ collectionId }: { collectionId: string }) {
  const { t } = useLocale();
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState(
    async (_prev: { error?: string; success?: boolean } | undefined, formData: FormData) => {
      const result = (await addItems(collectionId, formData)) ?? {};
      if (result.success) formRef.current?.reset();
      return result;
    },
    undefined,
  );

  return (
    <form ref={formRef} action={formAction} className="flex flex-wrap items-center gap-3">
      <input
        name="images"
        type="file"
        accept="image/*"
        multiple
        required
        className="text-sm file:mr-3 file:rounded-full file:border-0 file:bg-accent-soft file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-accent"
      />
      <button type="submit" disabled={pending} className="btn btn-primary">
        {pending ? t.collection.expandPending : t.collection.expandButton}
      </button>
      {state?.error && <p className="w-full text-sm text-danger">{state.error}</p>}
    </form>
  );
}
