"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bookmark, LogOut, Settings } from "lucide-react";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { getUserFirstName, getUserInitials } from "@/lib/auth/user";

type UserMenuProps = {
  user: SupabaseUser;
};

export function UserMenu({ user }: UserMenuProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const firstName = getUserFirstName(user);
  const initials = getUserInitials(user);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setOpen(false);
    router.push("/");
    router.refresh();
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="pm-focus-ring flex items-center gap-2.5 rounded-xl px-2 py-1.5 transition-colors hover:bg-muted"
        aria-label={`${firstName} account menu`}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <span className="hidden text-sm font-medium text-foreground lg:inline">
          {firstName}
        </span>
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
          {user.user_metadata?.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.user_metadata.avatar_url}
              alt=""
              className="h-full w-full rounded-full object-cover"
            />
          ) : (
            initials
          )}
        </span>
      </button>

      {open && (
        <div
          className="absolute right-0 top-full z-50 mt-2 w-52 overflow-hidden rounded-xl border border-border bg-card py-1 shadow-(--card-shadow)"
          role="menu"
        >
          <div className="border-b border-border px-4 py-3">
            <p className="truncate text-sm font-medium">{firstName}</p>
            <p className="truncate text-xs text-muted-foreground">{user.email}</p>
          </div>
          <Link
            href="/saved"
            className="flex min-h-11 items-center gap-3 px-4 text-sm text-foreground transition-colors hover:bg-muted"
            role="menuitem"
            onClick={() => setOpen(false)}
          >
            <Bookmark className="h-4 w-4 text-muted-foreground" />
            Saved questions
          </Link>
          <Link
            href="/profile"
            className="flex min-h-11 items-center gap-3 px-4 text-sm text-foreground transition-colors hover:bg-muted"
            role="menuitem"
            onClick={() => setOpen(false)}
          >
            <Settings className="h-4 w-4 text-muted-foreground" />
            Account settings
          </Link>
          <button
            type="button"
            onClick={handleSignOut}
            className="flex min-h-11 w-full items-center gap-3 px-4 text-sm text-foreground transition-colors hover:bg-muted"
            role="menuitem"
          >
            <LogOut className="h-4 w-4 text-muted-foreground" />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
