"use client";

import { useMemo, useState } from "react";
import { AlertCircle, Sparkles } from "lucide-react";
import { ChapterHeatmap } from "@/components/predict/ChapterHeatmap";
import { FilterSortBar } from "@/components/predict/FilterSortBar";
import { LoadingOverlay } from "@/components/predict/LoadingOverlay";
import { PredictionCard } from "@/components/predict/PredictionCard";
import { StatsStrip } from "@/components/predict/StatsStrip";
import type {
  FilterOption,
  Prediction,
  PredictionsResponse,
  SortOption,
} from "@/lib/types/predict";

type PredictResultsProps = {
  data: PredictionsResponse | null;
  isLoading: boolean;
  savedIds: Set<string>;
  isLoggedIn?: boolean;
  onToggleSave: (id: string) => void;
};

function sortPredictions(
  items: Prediction[],
  sort: SortOption
): Prediction[] {
  const copy = [...items];
  switch (sort) {
    case "chapter":
      return copy.sort((a, b) => a.chapterNumber - b.chapterNumber);
    case "recency":
      return copy.sort((a, b) => b.lastAppearedYear - a.lastAppearedYear);
    default:
      return copy.sort((a, b) => b.probabilityScore - a.probabilityScore);
  }
}

function filterPredictions(
  items: Prediction[],
  filter: FilterOption
): Prediction[] {
  if (filter === "all") return items;
  return items.filter((p) => p.questionType === filter);
}

export function PredictResults({
  data,
  isLoading,
  savedIds,
  isLoggedIn = false,
  onToggleSave,
}: PredictResultsProps) {
  const [sort, setSort] = useState<SortOption>("probability");
  const [filter, setFilter] = useState<FilterOption>("all");

  const filtered = useMemo(() => {
    if (!data?.predictions) return [];
    return filterPredictions(
      sortPredictions(data.predictions, sort),
      filter
    );
  }, [data, sort, filter]);

  return (
    <div className="relative flex min-h-[320px] flex-1 flex-col md:min-h-[480px]">
      {isLoading && <LoadingOverlay contained />}

      {!data && !isLoading && (
        <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-border px-6 py-16 text-center">
          <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Sparkles className="h-7 w-7" />
          </span>
          <h2 className="font-heading text-lg font-semibold">
            Your predictions will appear here
          </h2>
          <p className="mt-2 max-w-xs text-sm text-foreground-muted">
            Select your exam, board, subject, and year range — then hit
            Generate predictions.
          </p>
        </div>
      )}

      {data?.noData && !isLoading && (
        <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-border bg-muted/30 px-6 py-16 text-center">
          <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/15 text-accent">
            <AlertCircle className="h-7 w-7" />
          </span>
          <h2 className="font-heading text-lg font-semibold">
            Not enough data yet
          </h2>
          <p className="mt-2 max-w-sm text-sm text-foreground-muted">
            {data.message ??
              "We're still building our database for this subject."}
          </p>
        </div>
      )}

      {data && !data.noData && !isLoading && data.meta && (
        <div className="flex flex-col gap-5">
          <StatsStrip meta={data.meta} />
          <ChapterHeatmap chapters={data.meta.chapters ?? []} />

          <div>
            <FilterSortBar
              sort={sort}
              filter={filter}
              onSortChange={setSort}
              onFilterChange={setFilter}
            />

            <div className="mt-4 space-y-3">
              {filtered.length === 0 ? (
                <p className="py-8 text-center text-sm text-foreground-muted">
                  No questions match this filter.
                </p>
              ) : (
                filtered.map((prediction, index) => (
                  <PredictionCard
                    key={prediction.id}
                    prediction={prediction}
                    index={index}
                    isSaved={savedIds.has(prediction.id)}
                    isLoggedIn={isLoggedIn}
                    onToggleSave={onToggleSave}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
