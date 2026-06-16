"use client";

import type { FilterOption, SortOption } from "@/lib/types/predict";

type FilterSortBarProps = {
  sort: SortOption;
  filter: FilterOption;
  onSortChange: (sort: SortOption) => void;
  onFilterChange: (filter: FilterOption) => void;
};

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "probability", label: "Probability" },
  { value: "chapter", label: "Chapter" },
  { value: "recency", label: "Recency" },
];

const FILTER_OPTIONS: { value: FilterOption; label: string }[] = [
  { value: "all", label: "All types" },
  { value: "short", label: "Short" },
  { value: "long", label: "Long" },
  { value: "mcq", label: "MCQ" },
];

export function FilterSortBar({
  sort,
  filter,
  onSortChange,
  onFilterChange,
}: FilterSortBarProps) {
  return (
    <div className="sticky top-0 z-10 -mx-1 space-y-3 border-b border-border bg-background/95 px-1 py-3 backdrop-blur-sm">
      <div className="flex rounded-xl bg-muted p-1">
        {SORT_OPTIONS.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            onClick={() => onSortChange(value)}
            className={`min-h-9 flex-1 rounded-lg px-2 text-xs font-medium transition-all duration-200 sm:text-sm ${
              sort === value
                ? "bg-card text-foreground shadow-sm"
                : "text-foreground-muted hover:text-foreground"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-0.5 [-ms-overflow-style:none] scrollbar-none [&::-webkit-scrollbar]:hidden">
        {FILTER_OPTIONS.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            onClick={() => onFilterChange(value)}
            className={`shrink-0 rounded-full border px-3.5 py-2 text-xs font-medium transition-all duration-200 active:scale-95 ${
              filter === value
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-foreground-muted hover:border-foreground-muted"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
