const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;

export function publicImageUrl(bucket: "collection-images" | "avatars", path: string | null) {
  if (!path) return null;
  return `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`;
}
