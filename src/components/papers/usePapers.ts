"use client";

import { startTransition, useCallback, useEffect, useState } from "react";
import type { ExamType } from "@/lib/types/predict";
import type { Paper, PapersResponse } from "@/lib/types/papers";

type PaperFilters = {
  examType: ExamType | "all";
  boardId: string;
  subjectId: string;
  year: string;
};

function buildParams(filters: PaperFilters, page: number) {
  const params = new URLSearchParams({ page: String(page) });
  if (filters.examType !== "all") params.set("examType", filters.examType);
  if (filters.boardId !== "all") params.set("boardId", filters.boardId);
  if (filters.subjectId !== "all") params.set("subjectId", filters.subjectId);
  if (filters.year !== "all") params.set("year", filters.year);
  return params;
}

export function usePapers(filters: PaperFilters) {
  const [papers, setPapers] = useState<Paper[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const { examType, boardId, subjectId, year } = filters;

  useEffect(() => {
    let cancelled = false;
    startTransition(() => setLoading(true));

    fetch(`/api/papers?${buildParams({ examType, boardId, subjectId, year }, 1)}`)
      .then((r) => r.json())
      .then((data: PapersResponse) => {
        if (!cancelled) {
          setPapers(data.papers);
          setHasMore(data.hasMore);
          setPage(1);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setPapers([]);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [examType, boardId, subjectId, year]);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const data: PapersResponse = await fetch(
        `/api/papers?${buildParams({ examType, boardId, subjectId, year }, page + 1)}`
      ).then((r) => r.json());
      setPapers((prev) => [...prev, ...data.papers]);
      setHasMore(data.hasMore);
      setPage((p) => p + 1);
    } catch {
      // keep existing papers
    } finally {
      setLoadingMore(false);
    }
  }, [examType, boardId, subjectId, year, page, hasMore, loadingMore]);

  return { papers, loading, loadingMore, hasMore, loadMore };
}
