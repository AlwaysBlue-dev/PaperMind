import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { UserMenu } from "@/components/auth/UserMenu";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/predict", label: "Predict" },
  { href: "/papers", label: "Papers" },
  { href: "/saved", label: "Saved" },
] as const;

export async function TopNav() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="sticky top-0 z-50 hidden border-b border-border bg-nav-bg backdrop-blur-lg md:block">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link
          href="/"
          className="font-heading text-xl font-bold tracking-tight text-foreground transition-opacity hover:opacity-80"
        >
          Paper<span className="text-primary">Mind</span>
        </Link>

        <nav className="flex items-center gap-1" aria-label="Main navigation">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="pm-btn pm-btn-ghost pm-focus-ring min-h-10 px-4 text-sm"
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <UserMenu user={user} />
          ) : (
            <Link href="/auth/login" className="pm-btn pm-btn-primary min-h-10 text-sm">
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
