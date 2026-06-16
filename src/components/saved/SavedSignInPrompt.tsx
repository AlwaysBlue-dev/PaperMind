import Link from "next/link";
import { Bookmark } from "lucide-react";

export function SavedSignInPrompt() {
  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-5 py-16 text-center">
      <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-primary/10 text-primary">
        <Bookmark className="h-12 w-12" strokeWidth={1.25} />
      </div>
      <h1 className="font-heading text-2xl font-bold tracking-tight">
        Sign in to save questions
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-foreground-muted">
        Bookmark high-probability predictions while you study and track which
        ones you&apos;ve covered — synced across all your devices.
      </p>
      <Link
        href="/auth/login"
        className="pm-btn pm-btn-primary mt-8 min-h-12 w-full max-w-xs rounded-xl text-base font-semibold"
      >
        Sign in
      </Link>
      <p className="mt-4 text-sm text-foreground-muted">
        New here?{" "}
        <Link href="/auth/signup" className="font-medium text-primary">
          Create an account
        </Link>
      </p>
    </div>
  );
}
