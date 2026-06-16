import {
  countPapers,
  fetchQuestionsForScope,
  type QuestionRow,
  type QuestionScope,
} from "@/lib/prediction/db";
import { sharedSignificantWords, tokenize } from "@/lib/prediction/keywords";
import { isYearInRange } from "@/lib/prediction/year-window";
import type {
  ChapterFrequency,
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
};

type QuestionCluster = {
  questions: QuestionRow[];
  tokens: string[];
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

function recencyWeight(years: number[], minYear: number, maxYear: number): number {
  const span = Math.max(maxYear - minYear, 1);
  const weights = years.map((y) => (y - minYear) / span);
  return weights.reduce((a, b) => a + b, 0) / weights.length;
}

function clusterQuestions(questions: QuestionRow[]): QuestionCluster[] {
  const clusters: QuestionCluster[] = [];
  const assigned = new Set<string>();

  for (const question of questions) {
    if (assigned.has(question.id)) continue;

    const tokens = tokenize(question.question_text);
    const cluster: QuestionCluster = { questions: [question], tokens };
    assigned.add(question.id);

    for (const other of questions) {
      if (assigned.has(other.id)) continue;
      const otherTokens = tokenize(other.question_text);
      if (sharedSignificantWords(tokens, otherTokens) >= 3) {
        cluster.questions.push(other);
        assigned.add(other.id);
        cluster.tokens = [...new Set([...cluster.tokens, ...otherTokens])];
      }
    }

    clusters.push(cluster);
  }

  return clusters;
}

function pickRepresentative(cluster: QuestionCluster): QuestionRow {
  return cluster.questions.reduce((best, q) => {
    if (q.year > best.year) return q;
    if (q.year === best.year && q.question_text.length > best.question_text.length) {
      return q;
    }
    return best;
  }, cluster.questions[0]);
}

function scoreCluster(
  cluster: QuestionCluster,
  totalYears: number,
  minYear: number,
  maxYear: number,
  targetYear: number
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

  const raw =
    frequencyScore * 0.4 +
    recency * 0.3 +
    tScore * 0.2 +
    syllabusBonus * 0.15;

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
  };
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
  const { minYear, maxYear } = window;
  const distinctYears = new Set(
    questions
      .map((q) => q.year)
      .filter((y) => isYearInRange(y, minYear, maxYear))
  );

  return {
    questions,
    minYear,
    maxYear,
    totalYears: yearRange,
    yearsWithData: distinctYears.size,
  };
}

export async function getSubjectStats(
  scope: QuestionScope,
  targetYear: number,
  yearRange: number
): Promise<
  Pick<
    PredictionMeta,
    "papersAnalysed" | "questionsFound" | "yearsCovered" | "yearWindow"
  >
> {
  const { questions, minYear, maxYear, yearsWithData } = await loadQuestions(
    scope,
    targetYear,
    yearRange
  );

  const papersAnalysed = await countPapers(scope, minYear, maxYear);

  return {
    papersAnalysed,
    questionsFound: questions.length,
    yearsCovered: yearsWithData,
    yearWindow: { from: minYear, to: maxYear },
  };
}

export async function computeChapterHeatmap(
  scope: QuestionScope,
  targetYear: number,
  yearRange: number
): Promise<ChapterFrequency[]> {
  const { questions } = await loadQuestions(scope, targetYear, yearRange);

  const chapterMap = new Map<
    number,
    { name: string; years: Set<number>; count: number }
  >();

  for (const q of questions) {
    const existing = chapterMap.get(q.chapter_number) ?? {
      name: q.chapter_name,
      years: new Set<number>(),
      count: 0,
    };
    existing.years.add(q.year);
    existing.count += 1;
    chapterMap.set(q.chapter_number, existing);
  }

  const maxFreq = Math.max(
    ...[...chapterMap.values()].map((c) => c.years.size),
    1
  );

  return [...chapterMap.entries()]
    .sort(([a], [b]) => a - b)
    .map(([chapterNumber, data]) => ({
      chapterNumber,
      chapterName: data.name,
      frequency: Math.round((data.years.size / maxFreq) * 100),
    }));
}

export async function generatePredictions(
  scope: QuestionScope,
  targetYear: number,
  yearRange = 10
): Promise<EnginePrediction[]> {
  const { questions, minYear, maxYear, totalYears } = await loadQuestions(
    scope,
    targetYear,
    yearRange
  );

  if (questions.length === 0) return [];

  const clusters = clusterQuestions(questions);
  const scored = clusters.map((c) =>
    scoreCluster(c, totalYears, minYear, maxYear, targetYear)
  );

  return scored
    .sort((a, b) => b.probabilityScore - a.probabilityScore)
    .slice(0, 20);
}
