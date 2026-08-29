"use client";

import { useActionState, useRef } from "react";
import { addItems } from "@/app/new/actions";

export default function AddItemsForm({ collectionId }: { collectionId: string }) {
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
        className="text-sm file:mr-3 file:rounded file:border-0 file:bg-black/5 file:px-2 file:py-1 dark:file:bg-white/10"
      />
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-foreground px-3 py-1.5 text-sm font-medium text-background disabled:opacity-50"
      >
        {pending ? "Yükleniyor..." : "Koleksiyonu genişlet"}
      </button>
      {state?.error && <p className="w-full text-sm text-red-600">{state.error}</p>}
    </form>
  );
}
