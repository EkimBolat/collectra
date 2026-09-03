"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { uploadCollectionImages } from "@/lib/supabase/upload";

export default function AddItemsForm({
  collectionId,
  userId,
  startPosition,
}: {
  collectionId: string;
  userId: string;
  startPosition: number;
}) {
  const { t } = useLocale();
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const files = formData
      .getAll("images")
      .filter((f): f is File => f instanceof File && f.size > 0);

    if (files.length === 0) {
      setError(t.collection.errorNoPhotos);
      return;
    }

    setError(null);
    setPending(true);
    try {
      await uploadCollectionImages(userId, collectionId, files, startPosition);
      formRef.current?.reset();
      router.refresh();
    } catch (err) {
      const detail = err instanceof Error ? err.message : String(err);
      setError(`${t.collection.errorUploadFailed} (${detail})`);
    } finally {
      setPending(false);
    }
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="flex flex-wrap items-center gap-3">
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
      {error && <p className="w-full text-sm text-danger">{error}</p>}
    </form>
  );
}
