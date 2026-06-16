import Link from "next/link";
import { FileQuestion } from "lucide-react";

export default function NotFound() {
  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-5 py-16 text-center">
      <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-primary/10 text-primary">
        <FileQuestion className="h-12 w-12" strokeWidth={1.25} />
      </div>
      <h1 className="font-heading text-4xl font-bold">404</h1>
      <p className="mt-2 text-lg font-medium">Page not found</p>
      <p className="mt-2 text-sm text-foreground-muted">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/"
        className="pm-btn pm-btn-primary pm-focus-ring mt-8 min-h-12 rounded-xl px-8"
      >
        Back to home
      </Link>
    </div>
  );
}
