import type { PatternHint } from "@/lib/types/predict";

export type PatternSignals = {
  overdueScore: number;
  regularityScore: number;
  gapYears: number | null;
  yearsSinceLast: number;
  patternHint: PatternHint | null;
};

const PATTERN_LABELS: Record<PatternHint, string> = {
  due: "Due — skipped longer than usual",
  cyclical: "Cyclical — repeats on a steady interval",
  regular: "Regular — consistent appearance gaps",
};

export function patternHintLabel(hint: PatternHint | null | undefined): string | null {
  if (!hint) return null;
  return PATTERN_LABELS[hint];
}

/** Analyse year-to-year gaps to detect overdue and cyclical topics. */
export function analyzeAppearancePattern(
  yearsAppeared: number[],
  maxYear: number,
  targetYear: number
): PatternSignals {
  const sorted = [...new Set(yearsAppeared)].sort((a, b) => a - b);

  if (sorted.length === 0) {
    return {
      overdueScore: 0,
      regularityScore: 0,
      gapYears: null,
      yearsSinceLast: 0,
      patternHint: null,
    };
  }

  if (sorted.length === 1) {
    const yearsSinceLast = maxYear - sorted[0];
    const overdueScore = Math.min(yearsSinceLast / 2, 1);
    return {
      overdueScore,
      regularityScore: 0,
      gapYears: null,
      yearsSinceLast,
      patternHint: yearsSinceLast >= 2 ? "due" : null,
    };
  }

  const gaps: number[] = [];
  for (let i = 1; i < sorted.length; i++) {
    gaps.push(sorted[i] - sorted[i - 1]);
  }

  const avgGap = gaps.reduce((sum, gap) => sum + gap, 0) / gaps.length;
  const variance =
    gaps.reduce((sum, gap) => sum + (gap - avgGap) ** 2, 0) / gaps.length;
  const stdDev = Math.sqrt(variance);
  const regularityScore =
    avgGap > 0 ? Math.max(0, Math.min(1, 1 - stdDev / avgGap)) : 0;

  const lastYear = sorted[sorted.length - 1];
  const yearsSinceLast = Math.max(0, maxYear - lastYear);
  const overdueRatio = avgGap > 0 ? yearsSinceLast / avgGap : 0;

  const roundedGap = Math.max(1, Math.round(avgGap));
  const expectedNext = lastYear + roundedGap;
  const alignsWithTarget = Math.abs(expectedNext - targetYear) <= 1;

  let overdueScore = Math.min(overdueRatio, 1);
  if (yearsSinceLast === 0) {
    overdueScore *= 0.35;
  } else if (overdueRatio >= 1) {
    overdueScore = Math.min(1, 0.55 + (overdueRatio - 1) * 0.25);
  }

  if (alignsWithTarget && regularityScore >= 0.55) {
    overdueScore = Math.min(1, overdueScore + 0.3);
  } else if (alignsWithTarget) {
    overdueScore = Math.min(1, overdueScore + 0.12);
  }

  let patternHint: PatternHint | null = null;
  if (regularityScore >= 0.65 && avgGap >= 1 && alignsWithTarget) {
    patternHint = "cyclical";
  } else if (overdueScore >= 0.65 && yearsSinceLast >= 1) {
    patternHint = "due";
  } else if (regularityScore >= 0.5 && avgGap >= 1) {
    patternHint = "regular";
  }

  return {
    overdueScore,
    regularityScore,
    gapYears: Math.round(avgGap * 10) / 10,
    yearsSinceLast,
    patternHint,
  };
}

export function enrichPredictionPattern(
  prediction: {
    yearsAppeared: number[];
    lastAppearedYear: number;
    patternHint?: PatternHint | null;
  },
  context: { targetYear: number; maxYear: number }
): PatternHint | null {
  const signals = analyzeAppearancePattern(
    prediction.yearsAppeared.length > 0
      ? prediction.yearsAppeared
      : [prediction.lastAppearedYear],
    context.maxYear,
    context.targetYear
  );
  return signals.patternHint;
}
