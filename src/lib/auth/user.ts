import type { User } from "@supabase/supabase-js";

export function getUserFirstName(user: User): string {
  const fullName = user.user_metadata?.full_name as string | undefined;
  if (fullName?.trim()) return fullName.trim().split(/\s+/)[0];
  return user.email?.split("@")[0] ?? "User";
}

export function getUserInitials(user: User): string {
  const fullName = user.user_metadata?.full_name as string | undefined;
  if (fullName?.trim()) {
    const parts = fullName.trim().split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (user.email?.[0] ?? "U").toUpperCase();
}

export function getInitialsFromName(fullName: string, email?: string): string {
  if (fullName?.trim()) {
    const parts = fullName.trim().split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (email?.[0] ?? "U").toUpperCase();
}

export function getOrigin(): string {
  if (typeof window !== "undefined") return window.location.origin;
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}
