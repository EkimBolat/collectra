"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createNotification } from "@/lib/notifications";

export async function toggleLike(collectionId: string, path: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: existing } = await supabase
    .from("likes")
    .select("user_id")
    .eq("user_id", user.id)
    .eq("collection_id", collectionId)
    .maybeSingle();

  if (existing) {
    await supabase
      .from("likes")
      .delete()
      .eq("user_id", user.id)
      .eq("collection_id", collectionId);
  } else {
    await supabase.from("likes").insert({ user_id: user.id, collection_id: collectionId });

    const { data: collection } = await supabase
      .from("collections")
      .select("owner_id")
      .eq("id", collectionId)
      .single();
    if (collection) {
      await createNotification({
        supabase,
        recipientId: collection.owner_id,
        actorId: user.id,
        type: "like",
        collectionId,
      });
    }
  }

  revalidatePath(path);
}

export async function toggleCommentLike(commentId: string, path: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: existing } = await supabase
    .from("comment_likes")
    .select("user_id")
    .eq("user_id", user.id)
    .eq("comment_id", commentId)
    .maybeSingle();

  if (existing) {
    await supabase
      .from("comment_likes")
      .delete()
      .eq("user_id", user.id)
      .eq("comment_id", commentId);
  } else {
    await supabase.from("comment_likes").insert({ user_id: user.id, comment_id: commentId });
  }

  revalidatePath(path);
}

export async function toggleFollow(targetUserId: string, path: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  if (user.id === targetUserId) return;

  const { data: existing } = await supabase
    .from("follows")
    .select("follower_id")
    .eq("follower_id", user.id)
    .eq("following_id", targetUserId)
    .maybeSingle();

  if (existing) {
    await supabase
      .from("follows")
      .delete()
      .eq("follower_id", user.id)
      .eq("following_id", targetUserId);
  } else {
    await supabase.from("follows").insert({ follower_id: user.id, following_id: targetUserId });
    await createNotification({
      supabase,
      recipientId: targetUserId,
      actorId: user.id,
      type: "follow",
    });
  }

  revalidatePath(path);
}
