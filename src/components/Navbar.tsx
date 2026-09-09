import Link from "next/link";
import Image from "next/image";
import { getCurrentProfile } from "@/lib/auth";
import { getUnreadNotificationCount } from "@/lib/data";
import { publicImageUrl } from "@/lib/supabase/storage";
import { getDict } from "@/lib/i18n";
import SignOutButton from "./SignOutButton";
import LanguageToggle from "./LanguageToggle";
import StarMark from "./StarMark";

export default async function Navbar() {
  const [profile, { t }] = await Promise.all([getCurrentProfile(), getDict()]);
  const avatarUrl = profile ? publicImageUrl("avatars", profile.avatar_path) : null;
  const unreadCount = profile ? await getUnreadNotificationCount(profile.id) : 0;

  return (
    <header className="sticky top-0 z-10 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-3 sm:px-4">
        <Link href="/" className="flex shrink-0 items-center gap-2 text-lg font-extrabold tracking-tight">
          <span className="logo-mark flex h-8 w-8 shrink-0 items-center justify-center rounded-xl">
            <StarMark className="h-[19px] w-[19px]" />
          </span>
          <span className="hidden sm:inline">Collectra</span>
        </Link>
        <nav className="flex items-center gap-1 sm:gap-1.5">
          <Link href="/" className="btn btn-ghost hidden sm:inline-flex">
            {t.nav.explore}
          </Link>
          <Link
            href="/search"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full hover:bg-black/[.03] dark:hover:bg-white/[.06]"
            aria-label={t.nav.search}
            title={t.nav.search}
          >
            <svg viewBox="0 0 20 20" className="h-5 w-5 fill-current">
              <path
                fillRule="evenodd"
                d="M13 8.5a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zm-1.06 4.55a6 6 0 111.06-1.06l3.5 3.5a.75.75 0 11-1.06 1.06l-3.5-3.5z"
                clipRule="evenodd"
              />
            </svg>
          </Link>
          {profile ? (
            <>
              <Link href="/new" className="btn btn-primary">
                <span className="text-base leading-none">+</span>
                <span className="hidden sm:inline">{t.nav.newCollection}</span>
              </Link>
              <Link
                href="/notifications"
                className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full hover:bg-black/[.03] dark:hover:bg-white/[.06]"
                aria-label={t.nav.notifications}
                title={t.nav.notifications}
              >
                <svg viewBox="0 0 20 20" className="h-5 w-5 fill-current">
                  <path d="M10 1.5a5.5 5.5 0 00-5.5 5.5v2.6c0 .55-.2 1.08-.56 1.5l-1.02 1.18c-.68.79-.13 2.02.9 2.02h12.36c1.03 0 1.58-1.23.9-2.02l-1.02-1.18a2.3 2.3 0 01-.56-1.5V7A5.5 5.5 0 0010 1.5zM8.1 17.1a1.9 1.9 0 003.8 0H8.1z" />
                </svg>
                {unreadCount > 0 && (
                  <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-semibold leading-none text-white">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </Link>
              <Link
                href={`/u/${profile.username}`}
                className="ml-1 flex items-center gap-2 rounded-full py-1 pl-1 pr-3 hover:bg-black/[.03] dark:hover:bg-white/[.06]"
              >
                <span className="relative h-7 w-7 overflow-hidden rounded-full bg-accent-soft">
                  {avatarUrl && (
                    <Image src={avatarUrl} alt={profile.username} fill className="object-cover" />
                  )}
                </span>
                <span className="hidden text-sm font-medium sm:inline">{profile.username}</span>
              </Link>
              <SignOutButton />
            </>
          ) : (
            <>
              <Link href="/login" className="btn btn-ghost">
                {t.nav.login}
              </Link>
              <Link href="/signup" className="btn btn-primary">
                {t.nav.signup}
              </Link>
            </>
          )}
          <LanguageToggle />
        </nav>
      </div>
    </header>
  );
}
