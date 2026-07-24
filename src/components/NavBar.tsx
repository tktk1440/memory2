import Link from "next/link";
import { logoutAction } from "@/app/actions/auth";

export function NavBar({ authed, name }: { authed: boolean; name?: string | null }) {
  return (
    <header className="sticky top-0 z-20 border-b border-rose-100 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold text-rose-600">
          <span aria-hidden>💞</span> Kindred
        </Link>
        {authed ? (
          <nav className="flex items-center gap-4 text-sm font-medium text-neutral-600">
            <Link href="/discover" className="hover:text-rose-600">Discover</Link>
            <Link href="/matches" className="hover:text-rose-600">Matches</Link>
            <Link href="/profile" className="hover:text-rose-600">
              {name ? `Hi, ${name.split(" ")[0]}` : "Profile"}
            </Link>
            <form action={logoutAction}>
              <button className="rounded-full border border-neutral-300 px-3 py-1.5 text-neutral-600 hover:bg-neutral-100">
                Log out
              </button>
            </form>
          </nav>
        ) : (
          <nav className="flex items-center gap-3 text-sm font-medium">
            <Link href="/login" className="text-neutral-600 hover:text-rose-600">Log in</Link>
            <Link href="/signup" className="rounded-full bg-rose-600 px-4 py-1.5 text-white hover:bg-rose-700">
              Sign up
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
