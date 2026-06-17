import { typesCompatible } from "@/lib/prediction/question-types";
import { sharedSignificantWords, tokenize } from "@/lib/prediction/keywords";
import { buildIdf, textSimilarity } from "@/lib/prediction/text-similarity";
import type { QuestionRow } from "@/lib/prediction/db";

export type QuestionCluster = {
  questions: QuestionRow[];
  tokens: string[];
};

const SAME_CHAPTER_WORD_MIN = 3;
const SAME_CHAPTER_SIM_MIN = 0.42;
const CROSS_CHAPTER_WORD_MIN = 4;
const CROSS_CHAPTER_SIM_MIN = 0.52;

function canCluster(
  a: QuestionRow,
  b: QuestionRow,
  idf: Map<string, number>
): boolean {
  if (!typesCompatible(a.question_type, b.question_type)) return false;

  const tokensA = tokenize(a.question_text);
  const tokensB = tokenize(b.question_text);
  const shared = sharedSignificantWords(tokensA, tokensB);
  const sim = textSimilarity(a.question_text, b.question_text, idf);

  if (a.chapter_number === b.chapter_number) {
    return shared >= SAME_CHAPTER_WORD_MIN || sim >= SAME_CHAPTER_SIM_MIN;
  }

  return shared >= CROSS_CHAPTER_WORD_MIN && sim >= CROSS_CHAPTER_SIM_MIN;
}

export function clusterQuestions(questions: QuestionRow[]): QuestionCluster[] {
  const corpus = questions.map((q) => q.question_text);
  const idf = buildIdf(corpus);
  const clusters: QuestionCluster[] = [];
  const assigned = new Set<string>();

  for (const question of questions) {
    if (assigned.has(question.id)) continue;

    const tokens = tokenize(question.question_text);
    const cluster: QuestionCluster = { questions: [question], tokens };
    assigned.add(question.id);

    for (const other of questions) {
      if (assigned.has(other.id)) continue;
      if (!canCluster(question, other, idf)) continue;

      const otherTokens = tokenize(other.question_text);
      cluster.questions.push(other);
      assigned.add(other.id);
      cluster.tokens = [...new Set([...cluster.tokens, ...otherTokens])];
    }

    clusters.push(cluster);
  }

  return clusters;
}

export function pickRepresentative(cluster: QuestionCluster): QuestionRow {
  return cluster.questions.reduce((best, q) => {
    if (q.year > best.year) return q;
    if (
      q.year === best.year &&
      q.question_text.length > best.question_text.length
    ) {
      return q;
    }
    return best;
  }, cluster.questions[0]);
}
