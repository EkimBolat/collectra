"use server";

import { randomUUID } from "crypto";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { CollectionVisibility } from "@/lib/types";

async function uploadImages(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  collectionId: string,
  files: File[],
) {
  const uploaded: { path: string; position: number }[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (!file || file.size === 0) continue;
    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `${userId}/${collectionId}/${randomUUID()}.${ext}`;

    const { error } = await supabase.storage
      .from("collection-images")
      .upload(path, file, { contentType: file.type, upsert: false });

    if (!error) {
      uploaded.push({ path, position: i });
    }
  }

  return uploaded;
}

export async function createCollection(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const categoryId = Number(formData.get("category_id"));
  const visibility = String(formData.get("visibility") ?? "public") as CollectionVisibility;
  const files = formData.getAll("images").filter((f): f is File => f instanceof File);

  if (!title) return { error: "Başlık gerekli." };
  if (!categoryId) return { error: "Kategori seç." };
  if (files.filter((f) => f.size > 0).length === 0) {
    return { error: "En az bir fotoğraf ekle." };
  }

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
    return { error: "Koleksiyon oluşturulamadı: " + insertError?.message };
  }

  const uploaded = await uploadImages(supabase, user.id, collection.id, files);

  if (uploaded.length > 0) {
    await supabase.from("collection_items").insert(
      uploaded.map((u) => ({
        collection_id: collection.id,
        image_path: u.path,
        position: u.position,
      })),
    );
  }

  revalidatePath("/");
  redirect(`/c/${collection.id}`);
}

export async function addItems(collectionId: string, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const files = formData.getAll("images").filter((f): f is File => f instanceof File);
  if (files.filter((f) => f.size > 0).length === 0) {
    return { error: "En az bir fotoğraf seç." };
  }

  const { count } = await supabase
    .from("collection_items")
    .select("id", { count: "exact", head: true })
    .eq("collection_id", collectionId);

  const startPosition = count ?? 0;
  const uploaded: { path: string; position: number }[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (!file || file.size === 0) continue;
    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `${user.id}/${collectionId}/${randomUUID()}.${ext}`;
    const { error } = await supabase.storage
      .from("collection-images")
      .upload(path, file, { contentType: file.type, upsert: false });
    if (!error) uploaded.push({ path, position: startPosition + i });
  }

  if (uploaded.length > 0) {
    await supabase.from("collection_items").insert(
      uploaded.map((u) => ({
        collection_id: collectionId,
        image_path: u.path,
        position: u.position,
      })),
    );
  }

  revalidatePath(`/c/${collectionId}`);
  return { success: true };
}
