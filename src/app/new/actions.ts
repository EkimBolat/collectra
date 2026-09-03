"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getDict } from "@/lib/i18n";
import type { CollectionVisibility } from "@/lib/types";

export async function createCollection(formData: FormData) {
  const supabase = await createClient();
  const { t } = await getDict();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const categoryId = Number(formData.get("category_id"));
  const visibility = String(formData.get("visibility") ?? "public") as CollectionVisibility;

  if (!title) return { error: t.newCollection.errorTitleRequired };
  if (!categoryId) return { error: t.newCollection.errorCategoryRequired };

  const { data: collection, error: insertError } = await supabase
    .from("collections")
    .insert({
      owner_id: user.id,
      title,
      description: description || null,
      category_id: categoryId,
      visibility,
    })
    .select("id")
    .single();

  if (insertError || !collection) {
    return { error: t.newCollection.errorGeneric + (insertError ? ` (${insertError.message})` : "") };
  }

  revalidatePath("/");
  return { id: collection.id as string };
}
