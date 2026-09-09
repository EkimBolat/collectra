import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";
import { getNotifications, type NotificationWithRelations } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";
import { publicImageUrl } from "@/lib/supabase/storage";
import { getDict, timeAgo } from "@/lib/i18n";

function notificationText(
  n: NotificationWithRelations,
  t: Awaited<ReturnType<typeof getDict>>["t"],
) {
  const name = n.actor.display_name;
  const title = n.collection?.title ?? "";
  switch (n.type) {
    case "follow":
      return t.notifications.follow(name);
    case "like":
      return t.notifications.like(name, title);
    case "comment":
      return t.notifications.comment(name, title);
    case "collaborator_add":
      return t.notifications.collaboratorAdd(name, title);
  }
}

function notificationHref(n: NotificationWithRelations) {
  if (n.type === "follow") return `/u/${n.actor.username}`;
  if (n.collection_id) return `/c/${n.collection_id}`;
  return `/u/${n.actor.username}`;
}

export default async function NotificationsPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  const [notifications, { t, locale }] = await Promise.all([
    getNotifications(profile.id),
    getDict(),
  ]);

  const supabase = await createClient();
  await supabase
    .from("notifications")
    .update({ read: true })
    .eq("recipient_id", profile.id)
    .eq("read", false);

  return (
    <div className="mx-auto w-full max-w-2xl flex-1 px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">{t.notifications.title}</h1>

      {notifications.length === 0 ? (
        <p className="py-16 text-center text-muted">{t.notifications.empty}</p>
      ) : (
        <ul className="card flex flex-col divide-y divide-border overflow-hidden">
          {notifications.map((n) => {
            const avatarUrl = publicImageUrl("avatars", n.actor.avatar_path);
            return (
              <li key={n.id}>
                <Link
                  href={notificationHref(n)}
                  className={`flex items-center gap-3 px-4 py-3.5 hover:bg-black/[.03] dark:hover:bg-white/[.06] ${
                    n.read ? "" : "bg-accent-soft/40"
                  }`}
                >
                  <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-accent-soft">
                    {avatarUrl && (
                      <Image src={avatarUrl} alt={n.actor.username} fill className="object-cover" />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm">{notificationText(n, t)}</span>
                    <span className="mt-0.5 block text-xs text-muted" suppressHydrationWarning>
                      {timeAgo(n.created_at, locale)}
                    </span>
                  </span>
                  {!n.read && <span className="h-2 w-2 shrink-0 rounded-full bg-accent" />}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
