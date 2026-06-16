import Link from "next/link";
import { CheckCircle2, Sparkles } from "lucide-react";

export default function ConfirmedPage() {
  return (
    <div className="auth-page relative flex min-h-[calc(100dvh-4.5rem)] flex-1 flex-col items-center justify-center px-5 py-12 md:min-h-[calc(100dvh-4rem)]">
      <div className="auth-blob-bg pointer-events-none absolute inset-0 hidden md:block" aria-hidden />

      <div className="relative flex max-w-md flex-col items-center text-center">
        <div className="animate-scale-in mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-success/15 text-success">
          <CheckCircle2 className="h-14 w-14" strokeWidth={1.5} />
        </div>

        <h1 className="font-heading text-3xl font-bold tracking-tight">
          Email confirmed!
        </h1>
        <p className="mt-4 text-base text-foreground-muted">
          Your account is ready. Let&apos;s find out what&apos;s coming in your
          exam.
        </p>

        <Link
          href="/predict"
          className="pm-btn pm-btn-primary mt-10 min-h-12 w-full max-w-xs text-base md:w-auto md:px-10"
        >
          <Sparkles className="h-4 w-4" />
          Start predicting
        </Link>
      </div>
    </div>
  );
}
