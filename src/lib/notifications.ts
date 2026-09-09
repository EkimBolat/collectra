import type { createClient } from "@/lib/supabase/server";
import type { NotificationType } from "@/lib/types";

export async function createNotification({
  supabase,
  recipientId,
  actorId,
  type,
  collectionId,
}: {
  supabase: Awaited<ReturnType<typeof createClient>>;
  recipientId: string;
  actorId: string;
  type: NotificationType;
  collectionId?: string;
}) {
  if (recipientId === actorId) return;

  await supabase.from("notifications").insert({
    recipient_id: recipientId,
    actor_id: actorId,
    type,
    collection_id: collectionId ?? null,
  });
}
