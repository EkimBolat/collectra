"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getDict } from "@/lib/i18n";

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const { t } = await getDict();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const displayName = String(formData.get("display_name") ?? "").trim();
  const bio = String(formData.get("bio") ?? "").trim();
  const avatarPath = formData.get("avatar_path");

  if (!displayName) return { error: t.settings.errorDisplayNameRequired };

  const update: Record<string, string | null> = {
    display_name: displayName,
    bio: bio || null,
  };

  if (typeof avatarPath === "string" && avatarPath) {
    update.avatar_path = avatarPath;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .update(update)
    .eq("id", user.id)
    .select("username")
    .single();

  if (!profile) return { error: t.settings.errorGeneric };

  revalidatePath(`/u/${profile.username}`);
  redirect(`/u/${profile.username}`);
}
