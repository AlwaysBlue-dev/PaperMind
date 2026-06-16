import type { ChapterFrequency } from "@/lib/types/predict";

type ChapterHeatmapProps = {
  chapters: ChapterFrequency[];
};

function opacityClass(frequency: number): string {
  if (frequency >= 80) return "bg-primary";
  if (frequency >= 60) return "bg-primary/80";
  if (frequency >= 40) return "bg-primary/60";
  if (frequency >= 20) return "bg-primary/40";
  return "bg-primary/20";
}

export function ChapterHeatmap({ chapters }: ChapterHeatmapProps) {
  return (
    <div className="pm-card p-4 sm:p-5">
      <h3 className="font-heading text-sm font-semibold sm:text-base">
        Chapter frequency
      </h3>
      <p className="mt-0.5 text-xs text-foreground-muted">
        How often each chapter has been tested
      </p>
      <div className="mt-4 space-y-2.5">
        {chapters.map((ch) => (
          <div key={ch.chapterNumber} className="flex items-center gap-2 sm:gap-3">
            <span className="w-5 shrink-0 text-xs font-medium text-foreground-muted">
              {ch.chapterNumber}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium sm:text-sm">
                {ch.chapterName}
              </p>
              <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${opacityClass(ch.frequency)}`}
                  style={{ width: `${ch.frequency}%` }}
                />
              </div>
            </div>
            <span className="w-8 shrink-0 text-right text-xs text-foreground-muted">
              {ch.frequency}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
