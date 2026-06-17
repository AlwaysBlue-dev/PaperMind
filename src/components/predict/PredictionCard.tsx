"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Heart,
  Minus,
  Sparkles,
} from "lucide-react";
import {
  incrementModelAnswerCount,
  isModelAnswerRateLimited,
} from "@/lib/model-answer-rate-limit";
import type { Prediction, Trend, PatternHint } from "@/lib/types/predict";
import { patternHintLabel } from "@/lib/prediction/patterns";
import { MathText } from "@/components/ui/MathText";

type PredictionCardProps = {
  prediction: Prediction;
  index: number;
  isSaved: boolean;
  onToggleSave: (id: string) => void;
  isLoggedIn?: boolean;
  hideSaveButton?: boolean;
  showStudiedToggle?: boolean;
  isStudied?: boolean;
  onToggleStudied?: (studied: boolean) => void;
};

function probabilityBadgeClass(score: number): string {
  if (score >= 75) return "bg-success/15 text-success border-success/30";
  if (score >= 50) return "bg-accent/15 text-accent border-accent/30";
  return "bg-muted text-foreground-muted border-border";
}

function TrendIcon({ trend }: { trend: Trend }) {
  if (trend === "up") return <ArrowUp className="h-3 w-3 text-success" />;
  if (trend === "down") return <ArrowDown className="h-3 w-3 text-red-500" />;
  return <Minus className="h-3 w-3 text-foreground-muted" />;
}

function typeLabel(type: string): string {
  return type.toUpperCase();
}

function patternBadgeClass(hint: PatternHint): string {
  if (hint === "cyclical") {
    return "bg-primary/15 text-primary border-primary/30";
  }
  if (hint === "due") return "bg-accent/15 text-accent border-accent/30";
  return "bg-muted text-foreground-muted border-border";
}

function AnswerSkeleton() {
  return (
    <div className="model-answer-skeleton mt-3 space-y-2" aria-hidden>
      <div className="skeleton-line h-3 w-full" />
      <div className="skeleton-line h-3 w-[88%]" />
      <div className="skeleton-line h-3 w-[72%]" />
    </div>
  );
}

export function PredictionCard({
  prediction,
  index,
  isSaved,
  onToggleSave,
  isLoggedIn = true,
  hideSaveButton = false,
  showStudiedToggle = false,
  isStudied = false,
  onToggleStudied,
}: PredictionCardProps) {
  const [answerState, setAnswerState] = useState<
    "idle" | "loading" | "done" | "rate_limited" | "error"
  >("idle");
  const [modelAnswer, setModelAnswer] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showSignInPopover, setShowSignInPopover] = useState(false);

  async function handleModelAnswer() {
    if (modelAnswer) {
      setAnswerState("done");
      return;
    }

    if (isModelAnswerRateLimited()) {
      setAnswerState("rate_limited");
      return;
    }

    setAnswerState("loading");
    setErrorMsg(null);

    try {
      const res = await fetch("/api/model-answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ predictionId: prediction.id }),
      });

      const data = await res.json();

      if (!res.ok) {
        setAnswerState("error");
        setErrorMsg(data.error ?? "Failed to generate answer");
        return;
      }

      if (!data.cached) {
        incrementModelAnswerCount();
      }
      setModelAnswer(data.modelAnswer);
      setAnswerState("done");
    } catch {
      setAnswerState("error");
      setErrorMsg("Network error. Please try again.");
    }
  }

  function handleSaveClick() {
    if (!isLoggedIn) {
      setShowSignInPopover(true);
      setTimeout(() => setShowSignInPopover(false), 4000);
      return;
    }
    onToggleSave(prediction.id);
  }

  const showAnswer = answerState === "done" && modelAnswer;
  const isExpanded =
    answerState === "loading" ||
    showAnswer ||
    answerState === "rate_limited" ||
    answerState === "error";

  return (
    <article
      className="predict-card-enter pm-card relative flex flex-col gap-3 p-4 sm:p-5"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {!hideSaveButton && (
        <div className="absolute right-3 top-3">
          <button
            type="button"
            onClick={handleSaveClick}
            className="pm-focus-ring flex h-10 w-10 items-center justify-center rounded-full transition-colors duration-200 hover:bg-muted"
            aria-label={isSaved ? "Unsave question" : "Save question"}
          >
            <Heart
              className={`h-4 w-4 transition-colors duration-200 ${
                isSaved ? "fill-primary text-primary" : "text-muted-foreground"
              }`}
            />
          </button>
          {showSignInPopover && (
            <div className="absolute right-0 top-full z-20 mt-1 w-56 rounded-xl border border-border bg-card p-3 shadow-(--card-shadow)">
              <p className="text-xs text-foreground-muted">
                Sign in to save questions for later
              </p>
              <Link
                href="/auth/login"
                className="mt-2 inline-block text-xs font-semibold text-primary"
              >
                Sign in
              </Link>
            </div>
          )}
        </div>
      )}

      <div className={`flex flex-wrap items-center gap-2 ${hideSaveButton ? "pr-12" : "pr-10"}`}>
        <span
          className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-bold ${probabilityBadgeClass(prediction.probabilityScore)}`}
        >
          {prediction.probabilityScore}% likely
        </span>
        <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-foreground-muted">
          {typeLabel(prediction.questionType)}
        </span>
      </div>

      <div>
        <p className="text-xs font-medium text-primary">
          Ch. {prediction.chapterNumber}: {prediction.chapterName}
        </p>
        <MathText
          as="p"
          text={prediction.questionText}
          className="mt-2 text-sm leading-relaxed text-foreground sm:text-base"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2 text-xs text-foreground-muted">
        <span className="rounded-full bg-muted px-2.5 py-1">
          Appeared {prediction.frequencyCount}/{prediction.totalYears} years
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1">
          <TrendIcon trend={prediction.trend} />
          Trend
        </span>
        <span className="rounded-full bg-muted px-2.5 py-1">
          Last seen {prediction.lastAppearedYear}
        </span>
        {prediction.patternHint ? (
          <span
            className={`rounded-full border px-2.5 py-1 ${patternBadgeClass(prediction.patternHint)}`}
            title={patternHintLabel(prediction.patternHint) ?? undefined}
          >
            {prediction.patternHint === "due"
              ? "Due"
              : prediction.patternHint === "cyclical"
                ? "Cyclical"
                : "Regular"}
          </span>
        ) : null}
      </div>

      {showStudiedToggle && (
        <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border border-border bg-muted/30 px-3 py-2">
          <input
            type="checkbox"
            checked={isStudied}
            onChange={(e) => onToggleStudied?.(e.target.checked)}
            className="h-4 w-4 rounded border-border text-primary accent-primary"
          />
          <span className="text-sm font-medium">Mark as studied</span>
        </label>
      )}

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <button
          type="button"
          onClick={handleModelAnswer}
          disabled={answerState === "loading"}
          className="pm-btn min-h-11 flex-1 rounded-xl border border-border bg-transparent text-sm font-medium text-foreground transition-colors duration-200 hover:bg-muted disabled:opacity-60"
        >
          {answerState === "loading"
            ? "Generating answer…"
            : modelAnswer
              ? "Show model answer"
              : "Get model answer"}
        </button>
      </div>

      <div
        className={`model-answer-panel overflow-hidden transition-all duration-300 ease-out ${
          isExpanded ? "max-h-[800px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        {answerState === "loading" && (
          <div className="rounded-xl bg-primary/5 px-4 py-3">
            <p className="text-xs font-medium text-foreground-muted">
              Generating answer…
            </p>
            <AnswerSkeleton />
          </div>
        )}

        {answerState === "rate_limited" && (
          <p className="rounded-xl bg-accent/10 px-4 py-3 text-sm text-foreground">
            You&apos;ve used today&apos;s free answers. Come back tomorrow!
          </p>
        )}

        {answerState === "error" && errorMsg && (
          <p className="rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400">
            {errorMsg}
          </p>
        )}

        {showAnswer && (
          <div className="rounded-xl bg-primary/8 px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">
              Model answer
            </p>
            <MathText
              as="p"
              text={modelAnswer ?? ""}
              className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-foreground"
            />
            <p className="mt-3 flex items-center gap-1 text-[0.65rem] text-foreground-muted">
              <Sparkles className="h-3 w-3 text-primary" />
              Generated by AI
            </p>
          </div>
        )}
      </div>
    </article>
  );
}
