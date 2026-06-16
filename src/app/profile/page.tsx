"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Trash2 } from "lucide-react";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { EXAM_OPTIONS } from "@/components/predict/constants";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { getInitialsFromName } from "@/lib/auth/user";
import { useToast } from "@/components/ui/Toast";
import type { ExamType } from "@/lib/types/predict";
import type { ProfileData } from "@/lib/types/saved";

export default function ProfilePage() {
  const router = useRouter();
  const { success, error: toastError } = useToast();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [signOutOpen, setSignOutOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => {
        if (r.status === 401) {
          router.replace("/auth/login");
          return null;
        }
        return r.json();
      })
      .then((data) => {
        if (data) setProfile(data);
      })
      .finally(() => setLoading(false));
  }, [router]);

  const handleExamTypeChange = useCallback(async (examType: ExamType) => {
    setProfile((p) => (p ? { ...p, examType } : p));
    await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ examType }),
    });
  }, []);

  async function handleSignOut() {
    setActionLoading(true);
    const supabase = (await import("@/lib/supabase/client")).createClient();
    await supabase.auth.signOut();
    setActionLoading(false);
    setSignOutOpen(false);
    success("Signed out successfully");
    router.push("/");
    router.refresh();
  }

  async function handleDeleteAccount() {
    setActionLoading(true);
    try {
      const res = await fetch("/api/profile", { method: "DELETE" });
      if (!res.ok) throw new Error();
      const supabase = (await import("@/lib/supabase/client")).createClient();
      await supabase.auth.signOut();
      success("Account deleted");
      router.push("/");
      router.refresh();
    } catch {
      toastError("Failed to delete account");
    } finally {
      setActionLoading(false);
      setDeleteOpen(false);
    }
  }

  const memberDate = profile?.memberSince
    ? new Date(profile.memberSince).toLocaleDateString("en-PK", {
        month: "long",
        year: "numeric",
      })
    : "";

  return (
    <AuthGuard requireAuth>
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-5 py-6 md:px-6 md:py-10">
        <h1 className="font-heading text-2xl font-bold md:text-3xl">Profile</h1>

        {loading ? (
          <div className="flex flex-1 items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : profile ? (
          <div className="mt-6 flex flex-col gap-5">
            <div className="pm-card flex items-center gap-4 p-5 md:p-6">
              <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
                {getInitialsFromName(profile.fullName, profile.email)}
              </span>
              <div className="min-w-0">
                <p className="truncate font-heading text-lg font-semibold">
                  {profile.fullName}
                </p>
                <p className="truncate text-sm text-foreground-muted">
                  {profile.email}
                </p>
                <p className="mt-1 text-xs text-foreground-muted">
                  Member since {memberDate}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {[
                { value: profile.stats.saved, label: "questions saved" },
                { value: profile.stats.studied, label: "questions studied" },
                {
                  value: profile.stats.predictionsViewed,
                  label: "predictions viewed",
                },
              ].map(({ value, label }) => (
                <div
                  key={label}
                  className="rounded-xl border border-border bg-muted/40 px-2 py-3 text-center sm:px-3"
                >
                  <p className="font-heading text-xl font-bold sm:text-2xl">
                    {value}
                  </p>
                  <p className="mt-0.5 text-[0.65rem] leading-tight text-foreground-muted sm:text-xs">
                    {label}
                  </p>
                </div>
              ))}
            </div>

            <div className="pm-card p-5 md:p-6">
              <h2 className="font-heading text-base font-semibold">
                Preferences
              </h2>
              <p className="mt-1 text-sm text-foreground-muted">
                Your preferred exam type personalises the home page
              </p>
              <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {EXAM_OPTIONS.map(({ type, label, enabled }) => (
                  <button
                    key={type}
                    type="button"
                    disabled={!enabled}
                    onClick={() => enabled && handleExamTypeChange(type)}
                    className={`min-h-11 rounded-xl border px-3 text-sm font-medium transition-all duration-200 ${
                      !enabled
                        ? "cursor-not-allowed border-border opacity-60"
                        : "active:scale-95"
                    } ${
                      profile.examType === type
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-foreground hover:bg-muted"
                    }`}
                  >
                    {label}
                    {!enabled && (
                      <span className="mt-0.5 block text-[0.65rem] text-foreground-muted">
                        Soon
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSignOutOpen(true)}
              className="pm-btn pm-focus-ring flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 text-sm font-semibold text-red-600 transition-colors hover:bg-red-500/15 dark:text-red-400"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>

            <button
              type="button"
              onClick={() => setDeleteOpen(true)}
              className="mx-auto mt-2 flex items-center gap-1.5 text-xs text-foreground-muted transition-colors hover:text-red-500"
            >
              <Trash2 className="h-3 w-3" />
              Delete account
            </button>
          </div>
        ) : null}

        <ConfirmDialog
          open={signOutOpen}
          title="Sign out?"
          description="You'll need to sign in again to access your saved questions."
          confirmLabel="Sign out"
          variant="danger"
          isLoading={actionLoading}
          onConfirm={handleSignOut}
          onCancel={() => setSignOutOpen(false)}
        />

        <ConfirmDialog
          open={deleteOpen}
          title="Delete your account?"
          description="This is permanent. All your saved questions, study progress, and preferences will be deleted and cannot be recovered."
          confirmLabel="Delete permanently"
          variant="danger"
          isLoading={actionLoading}
          onConfirm={handleDeleteAccount}
          onCancel={() => setDeleteOpen(false)}
        />
      </div>
    </AuthGuard>
  );
}
