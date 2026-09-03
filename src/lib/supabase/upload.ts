import { createClient } from "./client";

async function uploadFile(bucket: string, path: string, file: File) {
  const supabase = createClient();
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
  const uploaded: { path: string; position: number }[] = [];
  let position = startPosition;

  for (const file of files) {
    if (!file || file.size === 0) continue;
    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `${userId}/${collectionId}/${crypto.randomUUID()}.${ext}`;
    const uploadedPath = await uploadFile("collection-images", path, file);
    if (uploadedPath) {
      uploaded.push({ path: uploadedPath, position });
      position++;
    }
  }

  if (uploaded.length > 0) {
    const supabase = createClient();
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
  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${userId}/${crypto.randomUUID()}.${ext}`;
  return uploadFile("avatars", path, file);
}
