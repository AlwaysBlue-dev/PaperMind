"use client";

import { startTransition, useEffect, useState } from "react";
import { filterFallbackBoards } from "@/lib/data/fallback-boards";
import { filterFallbackSubjects } from "@/lib/data/fallback-subjects";
import { appendPredictionScopeParams } from "@/lib/exam-params";
import type { Board, ExamPart, ExamStream, ExamType, Subject } from "@/lib/types/predict";

function mergeBoardsByName(db: Board[], fallback: Board[]): Board[] {
  const byName = new Map<string, Board>();
  for (const board of fallback) byName.set(board.name, board);
  for (const board of db) {
    byName.set(board.name, {
      ...byName.get(board.name),
      ...board,
      is_active: board.is_active ?? byName.get(board.name)?.is_active ?? false,
    });
  }
  return Array.from(byName.values()).sort((a, b) => {
    if (a.name === "BISE Karachi") return -1;
    if (b.name === "BISE Karachi") return 1;
    return a.name.localeCompare(b.name);
  });
}

function mergeSubjectsByName(db: Subject[], fallback: Subject[]): Subject[] {
  const byName = new Map<string, Subject>();
  for (const subject of fallback) byName.set(subject.name, subject);
  for (const subject of db) {
    byName.set(subject.name, {
      ...byName.get(subject.name),
      ...subject,
      is_active:
        subject.is_active ?? byName.get(subject.name)?.is_active ?? false,
    });
  }
  return Array.from(byName.values()).sort((a, b) => {
    if (a.name === "Chemistry") return -1;
    if (b.name === "Chemistry") return 1;
    return a.name.localeCompare(b.name);
  });
}

export function useBoards(
  examType: ExamType | null,
  part?: ExamPart | null,
  stream?: ExamStream | null
) {
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!examType) return;

    let cancelled = false;
    startTransition(() => setLoading(true));

    const params = new URLSearchParams({ examType });
    appendPredictionScopeParams(params, { part, stream });

    fetch(`/api/boards?${params}`)
      .then((r) => r.json())
      .then((data: Board[]) => {
        if (!cancelled) {
          const fallback = filterFallbackBoards({ examType, part, stream });
          setBoards(mergeBoardsByName(Array.isArray(data) ? data : [], fallback));
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setBoards(filterFallbackBoards({ examType, part, stream }));
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [examType, part, stream]);

  return {
    boards: examType ? boards : [],
    loading: !!examType && loading,
  };
}

export function useSubjects(
  examType: ExamType | null,
  boardId: string | null,
  part?: ExamPart | null,
  stream?: ExamStream | null
) {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!examType || (examType !== "mdcat" && !boardId)) return;

    let cancelled = false;
    startTransition(() => setLoading(true));

    const params = new URLSearchParams({ examType });
    if (boardId) params.set("boardId", boardId);
    appendPredictionScopeParams(params, { part, stream });

    fetch(`/api/subjects?${params}`)
      .then((r) => r.json())
      .then((data: Subject[]) => {
        if (!cancelled) {
          const fallback = filterFallbackSubjects({
            examType,
            boardId,
            part,
            stream,
          });
          setSubjects(
            mergeSubjectsByName(Array.isArray(data) ? data : [], fallback)
          );
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setSubjects(
            filterFallbackSubjects({ examType, boardId, part, stream })
          );
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [examType, boardId, part, stream]);

  return {
    subjects: examType && (examType === "mdcat" || boardId) ? subjects : [],
    loading: !!(examType && (examType === "mdcat" || boardId)) && loading,
  };
}

type ScopeOption = { id: string; label: string };

export function useExamScope(
  examType: ExamType | null,
  boardId: string | null,
  part?: ExamPart | null
) {
  const [parts, setParts] = useState<ScopeOption[]>([]);
  const [streams, setStreams] = useState<ScopeOption[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!examType || !boardId) return;

    let cancelled = false;
    startTransition(() => setLoading(true));

    const params = new URLSearchParams({ examType, boardId });
    if (part) params.set("part", part);

    fetch(`/api/exam-scope?${params}`)
      .then((r) => r.json())
      .then((data: { parts?: ScopeOption[]; streams?: ScopeOption[] }) => {
        if (!cancelled) {
          setParts(data.parts ?? []);
          setStreams(data.streams ?? []);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [examType, boardId, part]);

  return {
    parts: examType && boardId ? parts : [],
    streams: examType && boardId ? streams : [],
    loading: !!(examType && boardId) && loading,
  };
}
