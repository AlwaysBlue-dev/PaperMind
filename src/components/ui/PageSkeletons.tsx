export function SkeletonBlock({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-muted/60 ${className}`} />;
}

export function HomeLoadingSkeleton() {
  return (
    <div className="flex flex-1 flex-col gap-8 px-5 py-8 md:px-6 md:py-16">
      <SkeletonBlock className="h-6 w-40" />
      <SkeletonBlock className="h-12 w-full max-w-lg" />
      <SkeletonBlock className="h-20 w-full max-w-xl" />
      <div className="flex gap-3">
        <SkeletonBlock className="h-12 w-40 rounded-full" />
        <SkeletonBlock className="h-12 w-40 rounded-full" />
      </div>
      <SkeletonBlock className="mt-4 h-64 w-full max-w-sm" />
    </div>
  );
}

export function PredictLoadingSkeleton() {
  return (
    <div className="flex flex-1 flex-col gap-6 px-5 py-6 md:flex-row md:px-0">
      <div className="hidden w-[360px] shrink-0 space-y-4 border-r border-border p-6 md:block">
        <SkeletonBlock className="h-8 w-32" />
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonBlock key={i} className="h-11 w-full" />
        ))}
      </div>
      <div className="flex-1 space-y-4 p-5 md:p-6">
        <SkeletonBlock className="h-8 w-40" />
        <div className="grid grid-cols-3 gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonBlock key={i} className="h-16" />
          ))}
        </div>
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonBlock key={i} className="h-36 w-full" />
        ))}
      </div>
    </div>
  );
}

export function PapersLoadingSkeleton() {
  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-6 md:px-6 md:py-10">
      <SkeletonBlock className="h-8 w-48" />
      <SkeletonBlock className="mt-2 h-4 w-64" />
      <div className="mt-6 flex gap-2 overflow-hidden">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonBlock key={i} className="h-10 w-28 shrink-0 rounded-full" />
        ))}
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonBlock key={i} className="h-44" />
        ))}
      </div>
    </div>
  );
}

export function SavedLoadingSkeleton() {
  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-6 md:px-6 md:py-10">
      <SkeletonBlock className="h-8 w-32" />
      <SkeletonBlock className="mt-6 h-16 w-full" />
      <div className="mt-6 flex gap-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonBlock key={i} className="h-9 w-24 rounded-full" />
        ))}
      </div>
      <div className="mt-6 space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonBlock key={i} className="h-40" />
        ))}
      </div>
    </div>
  );
}

export function ProfileLoadingSkeleton() {
  return (
    <div className="mx-auto w-full max-w-2xl px-5 py-6 md:px-6 md:py-10">
      <SkeletonBlock className="h-8 w-32" />
      <SkeletonBlock className="mt-6 h-24 w-full" />
      <div className="mt-5 grid grid-cols-3 gap-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonBlock key={i} className="h-20" />
        ))}
      </div>
      <SkeletonBlock className="mt-5 h-40 w-full" />
    </div>
  );
}

export function AuthLoadingSkeleton() {
  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-4 px-5 py-8">
      <SkeletonBlock className="h-8 w-48" />
      <SkeletonBlock className="h-4 w-64" />
      <SkeletonBlock className="mt-4 h-11 w-full" />
      <SkeletonBlock className="h-11 w-full" />
      <SkeletonBlock className="h-11 w-full" />
      <SkeletonBlock className="mt-4 h-12 w-full rounded-xl" />
    </div>
  );
}
