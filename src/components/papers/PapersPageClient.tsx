"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { Download, FileText, Sparkles } from "lucide-react";
import { usePapers } from "@/components/papers/usePapers";
import { EXAM_OPTIONS } from "@/components/predict/constants";
import { useBoards, useSubjects } from "@/components/predict/usePredictData";
import type { ExamType } from "@/lib/types/predict";
import type { Paper } from "@/lib/types/papers";

const YEAR_OPTIONS = ["all", "2024", "2023", "2022", "2021", "2020", "2019", "2018"];

export function PapersPageClient() {
  const [examType, setExamType] = useState<ExamType | "all">("all");
  const [boardId, setBoardId] = useState("all");
  const [subjectId, setSubjectId] = useState("all");
  const [year, setYear] = useState("all");

  const boardExam = examType === "all" ? null : examType;
  const { boards } = useBoards(boardExam);
  const subjectBoard = boardId === "all" ? null : boardId;
  const { subjects } = useSubjects(boardExam, subjectBoard);

  const { papers, loading, loadingMore, hasMore, loadMore } = usePapers({
    examType,
    boardId,
    subjectId,
    year,
  });

  function handleExamChange(v: ExamType | "all") {
    setExamType(v);
    setBoardId("all");
    setSubjectId("all");
  }

  function handleBoardChange(v: string) {
    setBoardId(v);
    setSubjectId("all");
  }

  const predictHref = useCallback((paper: Paper) => {
    const params = new URLSearchParams({
      examType: paper.examType,
      boardId: paper.boardId,
      subjectId: paper.subjectId,
    });

    if (
      (paper.examType === "fsc" || paper.examType === "matric") &&
      paper.part &&
      paper.stream
    ) {
      params.set("part", paper.part);
      params.set("stream", paper.stream);
    }

    return `/predict?${params}`;
  }, []);

  const filterPills = useMemo(
    () => [
      {
        id: "exam",
        value: examType,
        onChange: (v: string) => handleExamChange(v as ExamType | "all"),
        options: [
          { value: "all", label: "All exams" },
          ...EXAM_OPTIONS.map((e) => ({ value: e.type, label: e.label })),
        ],
      },
      {
        id: "board",
        value: boardId,
        onChange: handleBoardChange,
        options: [
          { value: "all", label: "All boards" },
          ...boards.map((b) => ({ value: b.id, label: b.name })),
        ],
        disabled: examType === "all",
      },
      {
        id: "subject",
        value: subjectId,
        onChange: setSubjectId,
        options: [
          { value: "all", label: "All subjects" },
          ...subjects.map((s) => ({ value: s.id, label: s.name })),
        ],
        disabled: boardId === "all",
      },
      {
        id: "year",
        value: year,
        onChange: setYear,
        options: YEAR_OPTIONS.map((y) => ({
          value: y,
          label: y === "all" ? "All years" : y,
        })),
      },
    ],
    [examType, boardId, subjectId, year, boards, subjects]
  );

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-5 py-6 md:px-6 md:py-10">
      <h1 className="font-heading text-2xl font-bold md:text-3xl">Past Papers</h1>
      <p className="mt-1 text-sm text-foreground-muted">
        Browse archived exam papers across Pakistani boards
      </p>

      <div className="papers-filter-bar sticky top-0 z-20 -mx-5 mt-6 border-b border-border bg-background/95 px-5 py-3 backdrop-blur-sm md:top-16 md:mx-0 md:rounded-xl md:border md:px-4">
        <div className="flex gap-2 overflow-x-auto pb-0.5 [-ms-overflow-style:none] scrollbar-none md:flex-wrap md:overflow-visible [&::-webkit-scrollbar]:hidden">
          {filterPills.map((pill) => (
            <select
              key={pill.id}
              value={pill.value}
              onChange={(e) => pill.onChange(e.target.value)}
              disabled={pill.disabled}
              aria-label={`Filter by ${pill.id}`}
              className="predict-select pm-focus-ring shrink-0 min-h-10 rounded-full border border-border bg-card px-3.5 text-xs font-medium disabled:opacity-50 md:text-sm"
            >
              {pill.options.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="pm-card h-44 animate-pulse bg-muted/50" />
          ))}
        </div>
      ) : papers.length === 0 ? (
        <div className="mt-12 flex flex-col items-center justify-center rounded-xl border border-dashed border-border px-6 py-16 text-center">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <FileText className="h-10 w-10" strokeWidth={1.25} />
          </div>
          <h2 className="font-heading text-lg font-semibold">No papers found</h2>
          <p className="mt-2 max-w-sm text-sm text-foreground-muted">
            Try adjusting your filters — we&apos;re adding more papers from BISE
            and FBISE boards regularly.
          </p>
        </div>
      ) : (
        <>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {papers.map((paper) => (
              <article key={paper.id} className="pm-card flex flex-col p-5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-heading text-xl font-bold leading-tight">
                      {paper.boardName}
                    </p>
                    <p className="text-2xl font-bold text-primary">{paper.year}</p>
                  </div>
                  {paper.downloadUrl && (
                    <a
                      href={paper.downloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="pm-focus-ring flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      aria-label={`Download ${paper.subjectName} ${paper.year} paper`}
                    >
                      <Download className="h-4 w-4" />
                    </a>
                  )}
                </div>
                <p className="mt-3 text-sm font-medium">{paper.subjectName}</p>
                <p className="text-xs text-foreground-muted">
                  {paper.part && paper.stream
                    ? `${paper.examType} ${paper.part.replace(/^part/, "part ")} - ${paper.stream}`
                    : paper.classLevel}
                </p>
                <p className="mt-2 text-xs text-foreground-muted">
                  {paper.questionCount} questions
                </p>
                <Link
                  href={predictHref(paper)}
                  className="pm-btn pm-btn-primary pm-focus-ring mt-4 min-h-11 w-full rounded-xl text-sm"
                >
                  <Sparkles className="h-4 w-4" />
                  View predictions
                </Link>
              </article>
            ))}
          </div>

          {hasMore && (
            <button
              type="button"
              disabled={loadingMore}
              onClick={loadMore}
              className="pm-btn pm-btn-ghost pm-focus-ring mx-auto mt-8 min-h-11 w-full max-w-xs rounded-xl border border-border"
            >
              {loadingMore ? "Loading…" : "Load more"}
            </button>
          )}
        </>
      )}
    </div>
  );
}
