"use client";

import { useActionState } from "react";
import Image from "next/image";
import { useState } from "react";
import { publicImageUrl } from "@/lib/supabase/storage";
import type { Profile } from "@/lib/types";
import { updateProfile } from "./actions";

export default function SettingsForm({ profile }: { profile: Profile }) {
  const [preview, setPreview] = useState<string | null>(
    publicImageUrl("avatars", profile.avatar_path),
  );
  const [state, formAction, pending] = useActionState(
    async (_prev: { error?: string } | undefined, formData: FormData) => {
      return (await updateProfile(formData)) ?? {};
    },
    undefined,
  );

  return (
    <form action={formAction} className="card flex flex-col gap-4 p-6">
      <div className="flex items-center gap-4">
        <span className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full bg-accent-soft">
          {preview && <Image src={preview} alt="Avatar" fill className="object-cover" />}
        </span>
        <label className="btn btn-secondary cursor-pointer">
          Fotoğraf seç
          <input
            name="avatar"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) setPreview(URL.createObjectURL(file));
            }}
          />
        </label>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium">Görünen ad</label>
        <input
          name="display_name"
          required
          defaultValue={profile.display_name}
          className="field"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium">Bio</label>
        <textarea
          name="bio"
          rows={3}
          maxLength={300}
          defaultValue={profile.bio ?? ""}
          placeholder="Koleksiyonun hakkında birkaç cümle..."
          className="field resize-none"
        />
      </div>

      {state?.error && <p className="text-sm text-danger">{state.error}</p>}

      <button type="submit" disabled={pending} className="btn btn-primary mt-1 w-full">
        {pending ? "Kaydediliyor..." : "Kaydet"}
      </button>
    </form>
  );
}
