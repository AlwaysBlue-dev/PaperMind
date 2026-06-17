import { analyzeAppearancePattern } from "@/lib/prediction/patterns";
import type { QuestionRow } from "@/lib/prediction/db";

export type ChapterScore = {
  chapterNumber: number;
  chapterName: string;
  score: number;
  yearsAppeared: number[];
  coOccurrenceBoost: number;
};

type ChapterAccumulator = {
  name: string;
  years: Set<number>;
  questionCount: number;
  totalMarks: number;
};

export function scoreChapters(
  questions: QuestionRow[],
  minYear: number,
  maxYear: number,
  targetYear: number,
  windowYears: number
): ChapterScore[] {
  const byChapter = new Map<number, ChapterAccumulator>();

  for (const q of questions) {
    const acc = byChapter.get(q.chapter_number) ?? {
      name: q.chapter_name,
      years: new Set<number>(),
      questionCount: 0,
      totalMarks: 0,
    };
    acc.years.add(q.year);
    acc.questionCount += 1;
    acc.totalMarks += q.marks ?? 1;
    byChapter.set(q.chapter_number, acc);
  }

  const coOccurrence = buildCoOccurrence(questions);

  return [...byChapter.entries()]
    .map(([chapterNumber, data]) => {
      const yearsAppeared = [...data.years].sort((a, b) => a - b);
      const frequencyScore = Math.min(
        yearsAppeared.length / Math.max(windowYears, 1),
        1
      );

      const span = Math.max(maxYear - minYear, 1);
      const recency =
        yearsAppeared.reduce((s, y) => s + (y - minYear) / span, 0) /
        Math.max(yearsAppeared.length, 1);

      const pattern = analyzeAppearancePattern(
        yearsAppeared,
        maxYear,
        targetYear
      );

      const momentum =
        yearsAppeared.includes(maxYear) && yearsAppeared.includes(maxYear - 1)
          ? 1
          : yearsAppeared.includes(maxYear)
            ? 0.55
            : 0.2;

      const onlyLastYear =
        yearsAppeared.length === 1 && yearsAppeared[0] === maxYear;
      const rotationPenalty = onlyLastYear ? 0.15 : 0;

      const avgMarks = data.totalMarks / Math.max(data.questionCount, 1);
      const marksBoost = Math.min(avgMarks / 10, 0.25);

      const coOccurrenceBoost = coOccurrence.get(chapterNumber) ?? 0;

      const raw =
        frequencyScore * 0.28 +
        recency * 0.22 +
        momentum * 0.15 +
        pattern.overdueScore * 0.12 +
        pattern.regularityScore * 0.08 +
        marksBoost +
        coOccurrenceBoost * 0.1 -
        rotationPenalty;

      return {
        chapterNumber,
        chapterName: data.name,
        score: Math.max(0, Math.min(1, raw)),
        yearsAppeared,
        coOccurrenceBoost,
      };
    })
    .sort((a, b) => b.score - a.score);
}

function buildCoOccurrence(questions: QuestionRow[]): Map<number, number> {
  const yearChapters = new Map<number, Set<number>>();

  for (const q of questions) {
    const set = yearChapters.get(q.year) ?? new Set<number>();
    set.add(q.chapter_number);
    yearChapters.set(q.year, set);
  }

  const pairCounts = new Map<string, number>();
  for (const chapters of yearChapters.values()) {
    const list = [...chapters];
    for (let i = 0; i < list.length; i++) {
      for (let j = i + 1; j < list.length; j++) {
        const key = [list[i], list[j]].sort((a, b) => a - b).join(":");
        pairCounts.set(key, (pairCounts.get(key) ?? 0) + 1);
      }
    }
  }

  const chapterFreq = new Map<number, number>();
  for (const chapters of yearChapters.values()) {
    for (const ch of chapters) {
      chapterFreq.set(ch, (chapterFreq.get(ch) ?? 0) + 1);
    }
  }

  const chapterBoost = new Map<number, number>();
  const maxFreq = Math.max(...chapterFreq.values(), 1);

  for (const [ch] of chapterFreq) {
    let buddyScore = 0;
    for (const [key, count] of pairCounts) {
      const [a, b] = key.split(":").map(Number);
      if (a === ch || b === ch) {
        const buddy = a === ch ? b : a;
        const buddyFreq = (chapterFreq.get(buddy) ?? 0) / maxFreq;
        buddyScore += (count / yearChapters.size) * buddyFreq;
      }
    }
    chapterBoost.set(ch, Math.min(buddyScore, 1));
  }

  return chapterBoost;
}

export function chapterScoreMap(
  scores: ChapterScore[]
): Map<number, number> {
  return new Map(scores.map((c) => [c.chapterNumber, c.score]));
}
