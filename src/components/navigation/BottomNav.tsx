"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  BookOpen,
  Bookmark,
  Home,
  Sparkles,
  User,
} from "lucide-react";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { getUserInitials } from "@/lib/auth/user";

const navItems = [
  { href: "/", label: "Home", icon: Home, authOnly: false },
  { href: "/predict", label: "Predict", icon: Sparkles, authOnly: false },
  { href: "/papers", label: "Papers", icon: BookOpen, authOnly: false },
  { href: "/saved", label: "Saved", icon: Bookmark, authOnly: false },
  { href: "/profile", label: "Profile", icon: User, authOnly: false },
] as const;

export function BottomNav() {
  const pathname = usePathname();
  const [user, setUser] = useState<SupabaseUser | null>(null);

  const isAuthRoute = pathname.startsWith("/auth");

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data: { user: current } }) => {
      setUser(current);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (isAuthRoute) return null;

  const profileHref = user ? "/profile" : "/auth/login";

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-nav-bg backdrop-blur-lg md:hidden"
      aria-label="Main navigation"
    >
      <div
        className="mx-auto flex max-w-lg items-stretch justify-around px-2"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        {navItems.map(({ href, label, icon: Icon }) => {
          const linkHref = href === "/profile" ? profileHref : href;
          const isActive =
            href === "/"
              ? pathname === "/"
              : href === "/profile"
                ? pathname === "/profile"
                : pathname.startsWith(href);

          return (
            <Link
              key={href}
              href={linkHref}
              className={`pm-focus-ring flex min-h-11 min-w-11 flex-1 flex-col items-center justify-center gap-0.5 px-1 py-2 text-xs font-medium transition-colors duration-200 ${
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              aria-current={isActive ? "page" : undefined}
            >
              {href === "/profile" && user && !user.user_metadata?.avatar_url ? (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[0.5rem] font-bold text-primary-foreground">
                  {getUserInitials(user)}
                </span>
              ) : (
                <Icon
                  className="h-5 w-5 transition-transform duration-200"
                  strokeWidth={isActive ? 2.25 : 1.75}
                />
              )}
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
