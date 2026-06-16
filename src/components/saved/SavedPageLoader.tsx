"use client";

import { useEffect, useState } from "react";
import { SavedPageContent } from "@/components/saved/SavedPageContent";
import type { SavedPredictionItem } from "@/lib/types/saved";

export function SavedPageLoader() {
  const [data, setData] = useState<{
    items: SavedPredictionItem[];
    subjects: { id: string; name: string }[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/saved")
      .then((r) => r.json())
      .then((json) => {
        setData({
          items: json.items ?? [],
          subjects: json.subjects ?? [],
        });
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <SavedPageContent
      initialItems={data.items}
      initialSubjects={data.subjects}
    />
  );
}
