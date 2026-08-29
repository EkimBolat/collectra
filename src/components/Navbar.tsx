import Link from "next/link";
import { getCurrentProfile } from "@/lib/auth";
import SignOutButton from "./SignOutButton";

export default async function Navbar() {
  const profile = await getCurrentProfile();

  return (
    <header className="sticky top-0 z-10 border-b border-black/10 bg-background/80 backdrop-blur dark:border-white/10">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-lg font-bold tracking-tight">
          Collectra
        </Link>
        <nav className="flex items-center gap-4">
          <Link href="/" className="text-sm hover:underline">
            Keşfet
          </Link>
          {profile ? (
            <>
              <Link href="/new" className="text-sm hover:underline">
                Yeni koleksiyon
              </Link>
              <Link href={`/u/${profile.username}`} className="text-sm hover:underline">
                {profile.username}
              </Link>
              <SignOutButton />
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm hover:underline">
                Giriş yap
              </Link>
              <Link
                href="/signup"
                className="rounded-md bg-foreground px-3 py-1.5 text-sm font-medium text-background"
              >
                Kayıt ol
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
