"use client";

import { useEffect } from "react";

export default function RouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-5 py-16 text-center">
      <h2 className="font-heading text-xl font-semibold">
        Something went wrong
      </h2>
      <p className="mt-2 text-sm text-foreground-muted">
        We hit an unexpected error. Please try again.
      </p>
      <button
        type="button"
        onClick={reset}
        className="pm-btn pm-btn-primary pm-focus-ring mt-8 min-h-12 rounded-xl px-8"
      >
        Try again
      </button>
    </div>
  );
}
