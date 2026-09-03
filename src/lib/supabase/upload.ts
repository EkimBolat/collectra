import { createClient } from "./client";

type SupabaseClient = ReturnType<typeof createClient>;

async function uploadFile(supabase: SupabaseClient, bucket: string, path: string, file: File) {
  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, file, { contentType: file.type, upsert: false });
  return error ? null : path;
}

export async function uploadCollectionImages(
  userId: string,
  collectionId: string,
  files: File[],
  startPosition = 0,
) {
  const supabase = createClient();
  const validFiles = files.filter((f) => f && f.size > 0);

  const results = await Promise.all(
    validFiles.map(async (file, index) => {
      const ext = file.name.split(".").pop() ?? "jpg";
      const path = `${userId}/${collectionId}/${crypto.randomUUID()}.${ext}`;
      const uploadedPath = await uploadFile(supabase, "collection-images", path, file);
      return uploadedPath ? { path: uploadedPath, position: startPosition + index } : null;
    }),
  );

  const uploaded = results.filter((r): r is { path: string; position: number } => r !== null);

  if (uploaded.length > 0) {
    const { error } = await supabase.from("collection_items").insert(
      uploaded.map((u) => ({
        collection_id: collectionId,
        image_path: u.path,
        position: u.position,
      })),
    );
    if (error) throw error;
  }

  return uploaded;
}

export async function uploadAvatar(userId: string, file: File) {
  const supabase = createClient();
  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${userId}/${crypto.randomUUID()}.${ext}`;
  return uploadFile(supabase, "avatars", path, file);
}
