"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

const baseLinks = [
  { href: "/predict", label: "Predict" },
  { href: "/papers", label: "Papers" },
] as const;

export function LandingFooter() {
  const [user, setUser] = useState<SupabaseUser | null>(null);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data: { user: current } }) => {
      setUser(current);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const links = useMemo(() => {
    const authLink = user
      ? { href: "/profile", label: "Profile" }
      : { href: "/auth/login", label: "Sign in" };
    return [...baseLinks, authLink];
  }, [user]);

  return (
    <footer className="landing-footer border-t border-border bg-background px-5 py-10 md:px-6">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 text-center md:flex-row md:justify-between md:text-left">
        <Link href="/" className="font-heading text-lg font-bold tracking-tight">
          Paper<span className="text-primary">Mind</span>
        </Link>

        <nav
          className="flex flex-wrap items-center justify-center gap-6"
          aria-label="Footer"
        >
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="min-h-11 flex items-center text-sm text-foreground-muted transition-colors duration-200 hover:text-foreground"
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>

      <p className="mx-auto mt-8 max-w-6xl text-center text-xs text-foreground-muted md:text-left">
        Not affiliated with any exam board. BISE, FBISE, and FPSC are
        independent organisations.
      </p>
    </footer>
  );
}
