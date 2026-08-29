"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { CollectionVisibility } from "@/lib/types";

export async function addComment(collectionId: string, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const body = String(formData.get("body") ?? "").trim();
  if (!body) return { error: "Yorum boş olamaz." };

  const { error } = await supabase
    .from("comments")
    .insert({ collection_id: collectionId, user_id: user.id, body });

  if (error) return { error: "Yorum eklenemedi." };

  revalidatePath(`/c/${collectionId}`);
  return { success: true };
}

export async function updateCollection(collectionId: string, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const categoryId = Number(formData.get("category_id"));
  const visibility = String(formData.get("visibility") ?? "public") as CollectionVisibility;

  if (!title) return { error: "Başlık gerekli." };
  if (!categoryId) return { error: "Kategori seç." };

  const { error } = await supabase
    .from("collections")
    .update({
      title,
      description: description || null,
      category_id: categoryId,
      visibility,
    })
    .eq("id", collectionId)
    .eq("owner_id", user.id);

  if (error) return { error: "Güncellenemedi: " + error.message };

  revalidatePath(`/c/${collectionId}`);
  revalidatePath("/");
  redirect(`/c/${collectionId}`);
}

export async function deleteCollection(collectionId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: items } = await supabase
    .from("collection_items")
    .select("image_path")
    .eq("collection_id", collectionId);

  if (items && items.length > 0) {
    await supabase.storage
      .from("collection-images")
      .remove(items.map((i) => i.image_path));
  }

  await supabase.from("collections").delete().eq("id", collectionId).eq("owner_id", user.id);

  revalidatePath("/");
  redirect("/");
}

export async function deleteItem(collectionId: string, itemId: string, imagePath: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  await supabase.from("collection_items").delete().eq("id", itemId);
  await supabase.storage.from("collection-images").remove([imagePath]);

  revalidatePath(`/c/${collectionId}`);
}
