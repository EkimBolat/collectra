"use server";

import { randomUUID } from "crypto";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const displayName = String(formData.get("display_name") ?? "").trim();
  const bio = String(formData.get("bio") ?? "").trim();
  const avatarFile = formData.get("avatar");

  if (!displayName) return { error: "Görünen ad boş olamaz." };

  const update: Record<string, string | null> = {
    display_name: displayName,
    bio: bio || null,
  };

  if (avatarFile instanceof File && avatarFile.size > 0) {
    const ext = avatarFile.name.split(".").pop() ?? "jpg";
    const path = `${user.id}/${randomUUID()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(path, avatarFile, { contentType: avatarFile.type, upsert: false });

    if (!uploadError) update.avatar_path = path;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .update(update)
    .eq("id", user.id)
    .select("username")
    .single();

  if (!profile) return { error: "Profil güncellenemedi." };

  revalidatePath(`/u/${profile.username}`);
  redirect(`/u/${profile.username}`);
}
