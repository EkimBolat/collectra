"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getDict } from "@/lib/i18n";
import type { CollectionVisibility } from "@/lib/types";

export async function addComment(collectionId: string, formData: FormData) {
  const supabase = await createClient();
  const { t } = await getDict();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const body = String(formData.get("body") ?? "").trim();
  if (!body) return { error: t.collection.commentEmpty };

  const { error } = await supabase
    .from("comments")
    .insert({ collection_id: collectionId, user_id: user.id, body });

  if (error) return { error: t.collection.commentError };

  revalidatePath(`/c/${collectionId}`);
  return { success: true };
}

export async function deleteComment(collectionId: string, commentId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  await supabase.from("comments").delete().eq("id", commentId).eq("user_id", user.id);

  revalidatePath(`/c/${collectionId}`);
}

export async function updateCollection(collectionId: string, formData: FormData) {
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

  if (error) return { error: t.editCollection.errorGeneric + ` (${error.message})` };

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

export async function addCollaborator(collectionId: string, userId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  await supabase.from("collection_collaborators").insert({ collection_id: collectionId, user_id: userId });

  revalidatePath(`/c/${collectionId}`);
}

export async function removeCollaborator(collectionId: string, userId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  await supabase
    .from("collection_collaborators")
    .delete()
    .eq("collection_id", collectionId)
    .eq("user_id", userId);

  revalidatePath(`/c/${collectionId}`);
}

export async function setCoverItem(collectionId: string, itemId: string | null) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  await supabase
    .from("collections")
    .update({ cover_item_id: itemId })
    .eq("id", collectionId)
    .eq("owner_id", user.id);

  revalidatePath(`/c/${collectionId}`);
  revalidatePath("/");
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
