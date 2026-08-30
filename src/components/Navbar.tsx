import Link from "next/link";
import Image from "next/image";
import { getCurrentProfile } from "@/lib/auth";
import { publicImageUrl } from "@/lib/supabase/storage";
import { getDict } from "@/lib/i18n";
import SignOutButton from "./SignOutButton";
import LanguageToggle from "./LanguageToggle";

export default async function Navbar() {
  const [profile, { t }] = await Promise.all([getCurrentProfile(), getDict()]);
  const avatarUrl = profile ? publicImageUrl("avatars", profile.avatar_path) : null;

  return (
    <header className="sticky top-0 z-10 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-3 sm:px-4">
        <Link href="/" className="flex shrink-0 items-center gap-2 text-lg font-extrabold tracking-tight">
          <span className="logo-mark flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-accent-foreground">
            ✺
          </span>
          <span className="hidden sm:inline">Collectra</span>
        </Link>
        <nav className="flex items-center gap-1 sm:gap-1.5">
          <Link href="/" className="btn btn-ghost hidden sm:inline-flex">
            {t.nav.explore}
          </Link>
          {profile ? (
            <>
              <Link href="/new" className="btn btn-primary">
                <span className="text-base leading-none">+</span>
                <span className="hidden sm:inline">{t.nav.newCollection}</span>
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
