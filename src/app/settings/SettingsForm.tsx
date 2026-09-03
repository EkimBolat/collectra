"use client";

import { useState } from "react";
import Image from "next/image";
import { publicImageUrl } from "@/lib/supabase/storage";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { uploadAvatar } from "@/lib/supabase/upload";
import type { Profile } from "@/lib/types";
import { updateProfile } from "./actions";

export default function SettingsForm({ profile }: { profile: Profile }) {
  const { t } = useLocale();
  const [preview, setPreview] = useState<string | null>(
    publicImageUrl("avatars", profile.avatar_path),
  );
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setPending(true);

    const formData = new FormData(e.currentTarget);
    formData.delete("avatar");

    if (avatarFile) {
      try {
        const path = await uploadAvatar(profile.id, avatarFile);
        if (path) formData.set("avatar_path", path);
      } catch {
        setError(t.settings.errorGeneric);
        setPending(false);
        return;
      }
    }

    const result = (await updateProfile(formData)) ?? {};
    if (result.error) {
      setError(result.error);
      setPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card flex flex-col gap-4 p-6">
      <div className="flex items-center gap-4">
        <span className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full bg-accent-soft">
          {preview && <Image src={preview} alt="Avatar" fill className="object-cover" />}
        </span>
        <label className="btn btn-secondary cursor-pointer">
          {t.settings.chooseFile}
          <input
            name="avatar"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                setAvatarFile(file);
                setPreview(URL.createObjectURL(file));
              }
            }}
          />
        </label>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium">{t.settings.displayNameLabel}</label>
        <input
          name="display_name"
          required
          defaultValue={profile.display_name}
          className="field"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium">{t.settings.bioLabel}</label>
        <textarea
          name="bio"
          rows={3}
          maxLength={300}
          defaultValue={profile.bio ?? ""}
          placeholder={t.settings.bioPlaceholder}
          className="field resize-none"
        />
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}

      <button type="submit" disabled={pending} className="btn btn-primary mt-1 w-full">
        {pending ? t.settings.savePending : t.settings.save}
      </button>
    </form>
  );
}
