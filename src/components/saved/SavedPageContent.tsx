"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Bookmark } from "lucide-react";
import { PredictionCard } from "@/components/predict/PredictionCard";
import { useToast } from "@/components/ui/Toast";
import type { SavedPredictionItem, StudiedFilter } from "@/lib/types/saved";

type SavedPageContentProps = {
  initialItems: SavedPredictionItem[];
  initialSubjects: { id: string; name: string }[];
};

type RemovedItem = {
  item: SavedPredictionItem;
  timer: ReturnType<typeof setTimeout>;
};

export function SavedPageContent({
  initialItems,
  initialSubjects,
}: SavedPageContentProps) {
  const { toast, success } = useToast();
  const [items, setItems] = useState(initialItems);
  const [studiedFilter, setStudiedFilter] = useState<StudiedFilter>("all");
  const [subjectFilter, setSubjectFilter] = useState<string>("all");
  const pendingRemoveRef = useRef<RemovedItem | null>(null);

  const studiedCount = items.filter((i) => i.isStudied).length;
  const totalCount = items.length;
  const progress = totalCount > 0 ? (studiedCount / totalCount) * 100 : 0;

  const filtered = useMemo(() => {
    return items.filter((item) => {
      if (subjectFilter !== "all" && item.subjectId !== subjectFilter) {
        return false;
      }
      if (studiedFilter === "studied") return item.isStudied;
      if (studiedFilter === "not_studied") return !item.isStudied;
      return true;
    });
  }, [items, studiedFilter, subjectFilter]);

  const handleToggleStudied = useCallback(
    async (savedId: string, isStudied: boolean) => {
      setItems((prev) =>
        prev.map((i) => (i.savedId === savedId ? { ...i, isStudied } : i))
      );

      try {
        const res = await fetch("/api/saved/studied", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ savedId, isStudied }),
        });
        if (!res.ok) throw new Error();
        if (isStudied) success("Marked as studied");
      } catch {
        setItems((prev) =>
          prev.map((i) =>
            i.savedId === savedId ? { ...i, isStudied: !isStudied } : i
          )
        );
        toast({ message: "Failed to update status", type: "error" });
      }
    },
    [success, toast]
  );

  const handleUndo = useCallback(async () => {
    const pending = pendingRemoveRef.current;
    if (!pending) return;
    clearTimeout(pending.timer);
    setItems((prev) => [pending.item, ...prev]);
    pendingRemoveRef.current = null;

    try {
      await fetch("/api/save-prediction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ predictionId: pending.item.id }),
      });
      success("Question restored");
    } catch {
      toast({ message: "Failed to restore question", type: "error" });
    }
  }, [success, toast]);

  const handleRemove = useCallback(
    (item: SavedPredictionItem) => {
      setItems((prev) => prev.filter((i) => i.savedId !== item.savedId));

      toast({
        message: "Removed",
        type: "info",
        actionLabel: "Undo",
        onAction: handleUndo,
        duration: 5000,
      });

      const timer = setTimeout(async () => {
        try {
          await fetch("/api/saved/remove", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ savedId: item.savedId }),
          });
        } catch {
          // silent
        }
        pendingRemoveRef.current = null;
      }, 5000);

      pendingRemoveRef.current = { item, timer };
    },
    [toast, handleUndo]
  );

  useEffect(() => {
    return () => {
      if (pendingRemoveRef.current) {
        clearTimeout(pendingRemoveRef.current.timer);
      }
    };
  }, []);

  const filterPills: { value: StudiedFilter; label: string }[] = [
    { value: "all", label: "All" },
    { value: "not_studied", label: "Not studied" },
    { value: "studied", label: "Studied" },
  ];

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-5 py-6 md:px-6 md:py-10">
      <h1 className="font-heading text-2xl font-bold md:text-3xl">Saved</h1>
      <p className="mt-1 text-sm text-foreground-muted">
        Your bookmarked predictions
      </p>

      {totalCount > 0 && (
        <div className="mt-6 pm-card p-4 md:p-5">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-medium">
              {studiedCount}/{totalCount} questions studied
            </span>
            <span className="text-foreground-muted">
              {Math.round(progress)}%
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2 overflow-x-auto pb-0.5 [-ms-overflow-style:none] scrollbar-none [&::-webkit-scrollbar]:hidden">
          {filterPills.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => setStudiedFilter(value)}
              className={`shrink-0 rounded-full border px-3.5 py-2 text-xs font-medium transition-all duration-200 active:scale-95 ${
                studiedFilter === value
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-foreground-muted"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {initialSubjects.length > 0 && (
          <select
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            aria-label="Filter by subject"
            className="predict-select min-h-10 w-full rounded-xl border border-border bg-card px-3 text-sm sm:w-48"
          >
            <option value="all">All subjects</option>
            {initialSubjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="mt-6 space-y-3">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
            <Bookmark className="mb-4 h-10 w-10 text-muted-foreground" />
            <p className="font-medium">
              {totalCount === 0
                ? "No saved questions yet"
                : "No questions match this filter"}
            </p>
            <p className="mt-1 max-w-xs text-sm text-foreground-muted">
              {totalCount === 0
                ? "Tap the heart on any prediction to save it for later."
                : "Try a different filter or subject."}
            </p>
          </div>
        ) : (
          filtered.map((item, index) => (
            <div key={item.savedId} className="relative">
              <button
                type="button"
                onClick={() => handleRemove(item)}
                className="pm-focus-ring absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                aria-label="Remove saved question"
              >
                <span className="text-lg leading-none" aria-hidden>
                  &times;
                </span>
              </button>
              <PredictionCard
                prediction={item}
                index={index}
                isSaved
                hideSaveButton
                showStudiedToggle
                isStudied={item.isStudied}
                onToggleStudied={(studied) =>
                  handleToggleStudied(item.savedId, studied)
                }
                onToggleSave={() => {}}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
