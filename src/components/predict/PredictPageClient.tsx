"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { LoadingOverlay } from "@/components/predict/LoadingOverlay";
import { PredictFormDesktop } from "@/components/predict/PredictFormDesktop";
import { PredictFormMobile } from "@/components/predict/PredictFormMobile";
import { PredictResults } from "@/components/predict/PredictResults";
import {
  LAUNCH_DEFAULTS,
  requiresPartAndStream,
  requiresBoard,
} from "@/components/predict/constants";
import { createClient } from "@/lib/supabase/client";
import { appendPredictionScopeParams } from "@/lib/exam-params";
import { parseUrlSelection } from "@/lib/predict/parse-url-selection";
import { useToast } from "@/components/ui/Toast";
import type {
  ExamPart,
  ExamStream,
  ExamType,
  PredictionsResponse,
  YearRange,
} from "@/lib/types/predict";

function PredictPageContent() {
  const searchParams = useSearchParams();

  const [examType, setExamType] = useState<ExamType>(LAUNCH_DEFAULTS.examType);
  const [boardId, setBoardId] = useState<string | null>(LAUNCH_DEFAULTS.boardId);
  const [part, setPart] = useState<ExamPart | null>(LAUNCH_DEFAULTS.part);
  const [stream, setStream] = useState<ExamStream | null>(LAUNCH_DEFAULTS.stream);
  const [subjectId, setSubjectId] = useState<string | null>(null);
  const [yearRange, setYearRange] = useState<YearRange | null>(10);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<PredictionsResponse | null>(null);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);
  const { success, error: toastError } = useToast();

  useEffect(() => {
    const fromUrl = parseUrlSelection(searchParams);

    const nextExamType = fromUrl.examType;
    const nextNeedsBoard = requiresBoard(nextExamType);
    const nextNeedsPartStream = requiresPartAndStream(nextExamType);

    const t = setTimeout(() => {
      setExamType(nextExamType);
      setBoardId(nextNeedsBoard ? fromUrl.boardId : null);

      if (nextNeedsPartStream) {
        setPart(fromUrl.part);
        setStream(fromUrl.stream);
      } else {
        setPart(null);
        setStream(null);
      }

      setSubjectId(fromUrl.subjectId);
      setResults(null);
      setHydrated(true);
    }, 0);

    return () => clearTimeout(t);
  }, [searchParams]);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_e, session) => {
      setIsLoggedIn(!!session);
    });
    return () => subscription.unsubscribe();
  }, []);

  const needsPartStream = requiresPartAndStream(examType);
  const needsBoard = requiresBoard(examType);
  const isComplete = !!(
    examType &&
    subjectId &&
    yearRange &&
    (!needsBoard || boardId) &&
    (!needsPartStream || (part && stream))
  );

  function handleExamChange(v: ExamType) {
    setExamType(v);
    setBoardId(null);
    setSubjectId(null);
    if (v === "fsc" || v === "matric") {
      setPart(LAUNCH_DEFAULTS.part);
      setStream(LAUNCH_DEFAULTS.stream);
      if (v === "fsc") setBoardId(LAUNCH_DEFAULTS.boardId);
    } else {
      setPart(null);
      setStream(null);
    }
    setResults(null);
  }

  function handleBoardChange(v: string) {
    setBoardId(v);
    setSubjectId(null);
    setResults(null);
  }

  function handlePartChange(v: ExamPart) {
    setPart(v);
    setSubjectId(null);
    setResults(null);
  }

  function handleStreamChange(v: ExamStream) {
    setStream(v);
    setSubjectId(null);
    setResults(null);
  }

  function handleSubjectChange(v: string) {
    setSubjectId(v);
    setResults(null);
  }

  function handleYearRangeChange(v: YearRange) {
    setYearRange(v);
    setResults(null);
  }

  const handleGenerate = useCallback(async () => {
    if (!isComplete) return;
    setIsLoading(true);
    setResults(null);

    const targetYear = new Date().getFullYear() + 1;
    const params = new URLSearchParams({
      subjectId: subjectId!,
      boardId: boardId!,
      targetYear: String(targetYear),
      yearRange: String(yearRange),
      examType: examType,
    });
    appendPredictionScopeParams(params, { examType, part, stream });

    try {
      const res = await fetch(`/api/predictions?${params}`);
      const data: PredictionsResponse = await res.json();
      if (!res.ok && !data.noData) {
        setResults({
          noData: true,
          message: "Failed to load predictions. Please try again.",
          predictions: [],
          meta: {
            papersAnalysed: 0,
            questionsFound: 0,
            yearsCovered: 0,
            chapters: [],
          },
        });
        return;
      }
      setResults(data);
    } catch {
      setResults({
        noData: true,
        message: "Failed to load predictions. Please try again.",
        predictions: [],
        meta: {
          papersAnalysed: 0,
          questionsFound: 0,
          yearsCovered: 0,
          chapters: [],
        },
      });
    } finally {
      setIsLoading(false);
    }
  }, [isComplete, subjectId, boardId, yearRange, examType, part, stream]);

  const handleToggleSave = useCallback(
    async (id: string) => {
      let wasSaved = false;
      setSavedIds((prev) => {
        wasSaved = prev.has(id);
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      });

      try {
        const res = await fetch("/api/save-prediction", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ predictionId: id }),
        });

        if (res.status === 401) return;

        const data = await res.json();
        if (!res.ok) throw new Error();

        setSavedIds((prev) => {
          const next = new Set(prev);
          if (data.saved) next.add(id);
          else next.delete(id);
          return next;
        });
        if (data.saved) success("Question saved");
      } catch {
        setSavedIds((prev) => {
          const next = new Set(prev);
          if (wasSaved) next.add(id);
          else next.delete(id);
          return next;
        });
        toastError("Failed to save question");
      }
    },
    [success, toastError]
  );

  useEffect(() => {
    if (!results?.predictions?.length || !isLoggedIn) return;
    const ids = results.predictions.map((p) => p.id).join(",");
    fetch(`/api/saved?ids=${ids}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.savedIds) setSavedIds(new Set(data.savedIds));
      })
      .catch(() => {});
  }, [results, isLoggedIn]);

  useEffect(() => {
    if (results && resultsRef.current && window.innerWidth < 768) {
      resultsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [results]);

  return (
    <div className="predict-page flex min-h-0 flex-1 flex-col md:flex-row">
      {isLoading && <LoadingOverlay />}

      <PredictFormDesktop
        examType={examType}
        boardId={boardId}
        part={part}
        stream={stream}
        subjectId={subjectId}
        yearRange={yearRange}
        onExamChange={handleExamChange}
        onBoardChange={handleBoardChange}
        onPartChange={handlePartChange}
        onStreamChange={handleStreamChange}
        onSubjectChange={handleSubjectChange}
        onYearRangeChange={handleYearRangeChange}
        onGenerate={handleGenerate}
        isLoading={isLoading}
        isComplete={isComplete}
      />

      <PredictFormMobile
        examType={examType}
        boardId={boardId}
        part={part}
        stream={stream}
        subjectId={subjectId}
        yearRange={yearRange}
        hydrated={hydrated}
        onExamChange={handleExamChange}
        onBoardChange={handleBoardChange}
        onPartChange={handlePartChange}
        onStreamChange={handleStreamChange}
        onSubjectChange={handleSubjectChange}
        onYearRangeChange={handleYearRangeChange}
        onGenerate={handleGenerate}
        isLoading={isLoading}
        isComplete={isComplete}
      />

      <div
        ref={resultsRef}
        className={`flex min-w-0 flex-1 flex-col md:overflow-y-auto ${
          !results && !isLoading ? "hidden md:flex" : "flex"
        }`}
      >
        <div className="hidden border-b border-border px-6 py-5 md:block">
          <h1 className="font-heading text-xl font-bold">Results</h1>
          <p className="mt-0.5 text-sm text-foreground-muted">
            AI-ranked question predictions for your selection
          </p>
        </div>
        <div className="flex flex-1 flex-col px-5 py-5 md:px-6 md:py-6">
          <PredictResults
            data={results}
            isLoading={isLoading}
            savedIds={savedIds}
            isLoggedIn={isLoggedIn}
            onToggleSave={handleToggleSave}
          />
        </div>
      </div>
    </div>
  );
}

export function PredictPageClient() {
  return <PredictPageContent />;
}
