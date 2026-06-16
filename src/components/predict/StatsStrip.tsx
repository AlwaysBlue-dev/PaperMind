import type { PredictionMeta } from "@/lib/types/predict";

type StatsStripProps = {
  meta: PredictionMeta;
};

export function StatsStrip({ meta }: StatsStripProps) {
  const items = [
    { value: meta.papersAnalysed, label: "Papers analysed" },
    { value: meta.questionsFound, label: "Questions found" },
    { value: meta.yearsCovered, label: "Years covered" },
  ];

  return (
    <div className="flex flex-col gap-2">
      {meta.yearWindow ? (
        <p className="text-center text-xs text-foreground-muted">
          Based on past papers from{" "}
          <span className="font-medium text-foreground">
            {meta.yearWindow.from}–{meta.yearWindow.to}
          </span>
        </p>
      ) : null}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {items.map(({ value, label }) => (
          <div
            key={label}
            className="rounded-xl border border-border bg-muted/40 px-2 py-3 text-center sm:px-3"
          >
            <p className="font-heading text-lg font-bold sm:text-xl">
              {value.toLocaleString()}
            </p>
            <p className="mt-0.5 text-[0.65rem] leading-tight text-foreground-muted sm:text-xs">
              {label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
