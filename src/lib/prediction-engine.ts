import {
  countPapersInYears,
  fetchQuestionsForScope,
  type QuestionRow,
  type QuestionScope,
} from "@/lib/prediction/db";
import { chapterScoreMap, scoreChapters } from "@/lib/prediction/chapter-scoring";
import {
  clusterQuestions,
  pickRepresentative,
  type QuestionCluster,
} from "@/lib/prediction/clustering";
import { analyzeAppearancePattern } from "@/lib/prediction/patterns";
import type {
  ChapterFrequency,
  PatternHint,
  PredictionMeta,
  QuestionType,
} from "@/lib/types/predict";

export type EngineTrend = "rising" | "falling" | "stable" | "new";

export type EnginePrediction = {
  questionText: string;
  chapterName: string;
  chapterNumber: number;
  questionType: QuestionType;
  probabilityScore: number;
  frequencyCount: number;
  totalYears: number;
  yearsAppeared: number[];
  lastAppearedYear: number;
  trend: EngineTrend;
  isSyllabusFlagged: boolean;
  marks: number;
  subject_id: string;
  board_id: string;
  target_year: number;
  patternHint: PatternHint | null;
};

/** Total predictions returned (≈ full paper size). */
export const PREDICTION_LIMIT = 36;
const TOP_CHAPTERS = 8;
const CLUSTERS_PER_CHAPTER = 3;

const TYPE_QUOTAS: Record<QuestionType, number> = {
  mcq: 12,
  short: 12,
  long: 12,
};

function classifyTrend(
  years: number[],
  minYear: number,
  maxYear: number
): EngineTrend {
  const sorted = [...new Set(years)].sort((a, b) => a - b);
  if (sorted.length === 0) return "stable";

  const recentThreshold = maxYear - 1;
  const recentOnly = sorted.every((y) => y >= recentThreshold);
  if (sorted.length <= 2 && recentOnly) return "new";

  const midpoint = minYear + (maxYear - minYear) / 2;
  const firstHalf = sorted.filter((y) => y < midpoint).length;
  const secondHalf = sorted.filter((y) => y >= midpoint).length;

  if (secondHalf > firstHalf * 1.3) return "rising";
  if (firstHalf > secondHalf * 1.3) return "falling";
  return "stable";
}

function trendScore(trend: EngineTrend): number {
  switch (trend) {
    case "rising":
      return 0.9;
    case "new":
      return 0.75;
    case "stable":
      return 0.55;
    case "falling":
      return 0.25;
  }
}

function recencyWeight(
  years: number[],
  minYear: number,
  maxYear: number
): number {
  const span = Math.max(maxYear - minYear, 1);
  const weights = years.map((y) => (y - minYear) / span);
  return weights.reduce((a, b) => a + b, 0) / weights.length;
}

function scoreCluster(
  cluster: QuestionCluster,
  totalYears: number,
  minYear: number,
  maxYear: number,
  targetYear: number,
  chapterBoost: number
): EnginePrediction {
  const representative = pickRepresentative(cluster);
  const yearsAppeared = [
    ...new Set(cluster.questions.map((q) => q.year)),
  ]
    .filter((y) => y >= minYear && y <= maxYear)
    .sort((a, b) => a - b);
  const frequencyCount = yearsAppeared.length;
  const frequencyScore = Math.min(frequencyCount / Math.max(totalYears, 1), 1);
  const recency = recencyWeight(yearsAppeared, minYear, maxYear);
  const trend = classifyTrend(yearsAppeared, minYear, maxYear);
  const tScore = trendScore(trend);
  const syllabusBonus = cluster.questions.some((q) => q.is_syllabus_flagged)
    ? 1
    : 0;
  const pattern = analyzeAppearancePattern(
    yearsAppeared,
    maxYear,
    targetYear
  );

  const onlyLastYear =
    yearsAppeared.length > 0 &&
    yearsAppeared.every((y) => y === maxYear);
  const rotationPenalty = onlyLastYear ? 0.08 : 0;

  const avgMarks =
    cluster.questions.reduce((s, q) => s + (q.marks ?? 1), 0) /
    cluster.questions.length;
  const marksBoost = Math.min(avgMarks / 10, 0.12);

  const raw =
    frequencyScore * 0.24 +
    recency * 0.2 +
    tScore * 0.12 +
    syllabusBonus * 0.08 +
    pattern.overdueScore * 0.1 +
    pattern.regularityScore * 0.06 +
    chapterBoost * 0.12 +
    marksBoost -
    rotationPenalty;

  const probabilityScore = Math.min(99, Math.max(1, Math.round(raw * 100)));

  const marks =
    representative.marks ??
    (representative.question_type === "mcq"
      ? 1
      : representative.question_type === "short"
        ? 2
        : 5);

  return {
    questionText: representative.question_text,
    chapterName: representative.chapter_name,
    chapterNumber: representative.chapter_number,
    questionType: representative.question_type,
    probabilityScore,
    frequencyCount,
    totalYears,
    yearsAppeared,
    lastAppearedYear: yearsAppeared[yearsAppeared.length - 1] ?? maxYear,
    trend,
    isSyllabusFlagged: cluster.questions.some((q) => q.is_syllabus_flagged),
    marks,
    subject_id: representative.subject_id,
    board_id: representative.board_id,
    target_year: targetYear,
    patternHint: pattern.patternHint,
  };
}

function predictionKey(p: EnginePrediction): string {
  return `${p.chapterNumber}:${p.questionType}:${p.questionText.slice(0, 80)}`;
}

function selectChapterFirstPredictions(
  scored: EnginePrediction[],
  topChapterNumbers: Set<number>
): EnginePrediction[] {
  const selected: EnginePrediction[] = [];
  const seen = new Set<string>();

  function add(p: EnginePrediction) {
    const key = predictionKey(p);
    if (seen.has(key) || selected.length >= PREDICTION_LIMIT) return;
    seen.add(key);
    selected.push(p);
  }

  const byChapter = new Map<number, EnginePrediction[]>();
  for (const p of scored) {
    const list = byChapter.get(p.chapterNumber) ?? [];
    list.push(p);
    byChapter.set(p.chapterNumber, list);
  }
  for (const list of byChapter.values()) {
    list.sort((a, b) => b.probabilityScore - a.probabilityScore);
  }

  for (const chapterNumber of topChapterNumbers) {
    const list = byChapter.get(chapterNumber) ?? [];
    for (const p of list.slice(0, CLUSTERS_PER_CHAPTER)) {
      add(p);
    }
  }

  const typeCounts: Record<QuestionType, number> = {
    mcq: 0,
    short: 0,
    long: 0,
  };
  for (const p of selected) typeCounts[p.questionType] += 1;

  const pool = [...scored].sort(
    (a, b) => b.probabilityScore - a.probabilityScore
  );

  for (const type of ["mcq", "short", "long"] as QuestionType[]) {
    while (
      typeCounts[type] < TYPE_QUOTAS[type] &&
      selected.length < PREDICTION_LIMIT
    ) {
      const next = pool.find(
        (p) => p.questionType === type && !seen.has(predictionKey(p))
      );
      if (!next) break;
      add(next);
      typeCounts[type] += 1;
    }
  }

  for (const p of pool) {
    if (selected.length >= PREDICTION_LIMIT) break;
    add(p);
  }

  return selected.sort((a, b) => b.probabilityScore - a.probabilityScore);
}

async function loadQuestions(
  scope: QuestionScope,
  targetYear: number,
  yearRange: number
) {
  const { questions, window } = await fetchQuestionsForScope(
    scope,
    targetYear,
    yearRange
  );
  const { minYear, maxYear, yearsWithData, excludedYears } = window;
  const yearCount = yearsWithData.length;

  return {
    questions,
    minYear,
    maxYear,
    excludedYears,
    totalYears: yearCount,
    yearsWithData: yearCount,
    yearsWithDataList: yearsWithData,
  };
}

export async function getSubjectStats(
  scope: QuestionScope,
  targetYear: number,
  yearRange: number
): Promise<
  Pick<
    PredictionMeta,
    | "papersAnalysed"
    | "questionsFound"
    | "yearsCovered"
    | "yearWindow"
    | "excludedYears"
  >
> {
  const { questions, window } = await fetchQuestionsForScope(
    scope,
    targetYear,
    yearRange
  );
  const { minYear, maxYear, yearsWithData, excludedYears } = window;

  const papersAnalysed = await countPapersInYears(scope, yearsWithData);

  return {
    papersAnalysed,
    questionsFound: questions.length,
    yearsCovered: yearsWithData.length,
    yearWindow: { from: minYear, to: maxYear },
    excludedYears,
  };
}

export async function computeChapterHeatmap(
  scope: QuestionScope,
  targetYear: number,
  yearRange: number
): Promise<ChapterFrequency[]> {
  const { questions, minYear, maxYear, yearsWithData } = await loadQuestions(
    scope,
    targetYear,
    yearRange
  );

  const chapterScores = scoreChapters(
    questions,
    minYear,
    maxYear,
    targetYear,
    yearsWithData
  );

  return chapterScores.map((ch) => ({
    chapterNumber: ch.chapterNumber,
    chapterName: ch.chapterName,
    yearsAppeared: ch.yearsAppeared.length,
    windowYears: Math.max(yearsWithData, 1),
    rate: Math.round(
      (ch.yearsAppeared.length / Math.max(yearsWithData, 1)) * 100
    ),
  }));
}

export async function generatePredictions(
  scope: QuestionScope,
  targetYear: number,
  yearRange = 10
): Promise<EnginePrediction[]> {
  const { questions, minYear, maxYear, totalYears, yearsWithData } =
    await loadQuestions(scope, targetYear, yearRange);

  if (questions.length === 0) return [];

  const chapterScores = scoreChapters(
    questions,
    minYear,
    maxYear,
    targetYear,
    yearsWithData
  );
  const chBoost = chapterScoreMap(chapterScores);
  const topChapterNumbers = new Set(
    chapterScores.slice(0, TOP_CHAPTERS).map((c) => c.chapterNumber)
  );

  const clusters = clusterQuestions(questions);
  const scored = clusters.map((c) => {
    const rep = pickRepresentative(c);
    const boost = chBoost.get(rep.chapter_number) ?? 0;
    return scoreCluster(
      c,
      totalYears,
      minYear,
      maxYear,
      targetYear,
      boost
    );
  });

  return selectChapterFirstPredictions(scored, topChapterNumbers);
}
