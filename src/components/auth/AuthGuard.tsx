"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Mail } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Session } from "@supabase/supabase-js";

type AuthGuardProps = {
  children: ReactNode;
  requireAuth?: boolean;
  fallback?: ReactNode;
};

export function AuthGuard({
  children,
  requireAuth = false,
  fallback,
}: AuthGuardProps) {
  const router = useRouter();
  const [session, setSession] = useState<Session | null | undefined>(undefined);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getSession().then(({ data: { session: current } }) => {
      setSession(current);
      if (requireAuth && !current && !fallback) {
        router.replace("/auth/login");
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, current) => {
      setSession(current);
      if (requireAuth && !current && !fallback) {
        router.replace("/auth/login");
      }
    });

    return () => subscription.unsubscribe();
  }, [requireAuth, fallback, router]);

  if (session === undefined) {
    return (
      <div className="flex flex-1 items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!session) {
    if (fallback) return <>{fallback}</>;
    if (requireAuth) return null;
  }

  const emailUnconfirmed =
    session?.user && !session.user.email_confirmed_at;

  return (
    <>
      {emailUnconfirmed && (
        <div className="border-b border-accent/30 bg-accent/10 px-4 py-3 text-center text-sm text-foreground">
          <span className="inline-flex items-center justify-center gap-2">
            <Mail className="h-4 w-4 shrink-0 text-accent" />
            Please confirm your email to save predictions
          </span>
        </div>
      )}
      {children}
    </>
  );
}
