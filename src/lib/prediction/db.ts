import { createAdminClient } from "@/lib/supabase/admin";
import { loadScopedQuestions } from "@/lib/prediction/questions-loader";
import {
  getYearWindow,
  type YearWindow,
} from "@/lib/prediction/year-window";
import { enrichPredictionPattern } from "@/lib/prediction/patterns";
import type {
  ExamPart,
  ExamStream,
  ExamType,
  PatternHint,
  QuestionType,
  Trend,
} from "@/lib/types/predict";

/** Full selection used to load past questions for predictions */
export type QuestionScope = {
  examType: ExamType;
  boardId: string;
  subjectId: string;
  part?: ExamPart | null;
  stream?: ExamStream | null;
  /** Slug + resolved UUID — papers may use either */
  boardIds?: string[];
  subjectIds?: string[];
};

export type QuestionRow = {
  id: string;
  subject_id: string;
  board_id: string;
  question_text: string;
  chapter_name: string;
  chapter_number: number;
  question_type: QuestionType;
  year: number;
  marks: number | null;
  is_syllabus_flagged: boolean;
  paper_id: string | null;
};

export type PredictionRow = {
  id: string;
  exam_type?: ExamType | null;
  part?: ExamPart | null;
  stream?: ExamStream | null;
  subject_id: string;
  board_id: string;
  target_year: number;
  year_range?: number | null;
  question_text: string;
  chapter_name: string;
  chapter_number: number;
  question_type: QuestionType;
  probability_score: number;
  frequency_count: number;
  total_years: number;
  years_appeared: number[];
  last_appeared_year: number;
  trend: string;
  is_syllabus_flagged?: boolean;
  syllabus_flagged?: boolean;
  marks: number | null;
  model_answer: string | null;
  model_answer_generated_at: string | null;
  created_at: string;
};

export function mapTrendToUi(trend: string): Trend {
  if (trend === "rising" || trend === "new") return "up";
  if (trend === "falling") return "down";
  return "flat";
}

export function mapPredictionRow(
  row: PredictionRow,
  context?: { targetYear: number; maxYear: number }
) {
  const yearsAppeared = row.years_appeared ?? [];
  const mapped = {
    id: row.id,
    questionText: row.question_text,
    chapterName: row.chapter_name,
    chapterNumber: row.chapter_number,
    questionType: row.question_type,
    probabilityScore: row.probability_score,
    frequencyCount: row.frequency_count,
    totalYears: row.total_years,
    yearsAppeared,
    lastAppearedYear: row.last_appeared_year,
    trend: mapTrendToUi(row.trend),
    isSyllabusFlagged: Boolean(
      row.is_syllabus_flagged ?? row.syllabus_flagged ?? false
    ),
    marks: row.marks ?? defaultMarks(row.question_type),
    patternHint: null as PatternHint | null,
  };

  if (context) {
    mapped.patternHint = enrichPredictionPattern(mapped, context);
  }

  return mapped;
}

export function defaultMarks(type: QuestionType): number {
  if (type === "mcq") return 1;
  if (type === "short") return 2;
  return 5;
}

function uniqueIds(...ids: (string | null | undefined)[]): string[] {
  return [...new Set(ids.filter(Boolean) as string[])];
}

function applyIdFilter<
  T extends {
    eq: (col: string, val: string) => T;
    in: (col: string, vals: string[]) => T;
  },
>(query: T, column: string, primary: string, alternates?: string[]): T {
  const ids = uniqueIds(primary, ...(alternates ?? []));
  if (ids.length <= 1) return query.eq(column, ids[0] ?? primary);
  return query.in(column, ids);
}

function applyPaperScope<T extends { eq: (col: string, val: string) => T; in: (col: string, vals: string[]) => T }>(
  query: T,
  scope: QuestionScope,
  opts?: { includePartStream?: boolean }
): T {
  const includePartStream = opts?.includePartStream !== false;
  let q = applyIdFilter(
    applyIdFilter(query, "board_id", scope.boardId, scope.boardIds),
    "subject_id",
    scope.subjectId,
    scope.subjectIds
  );
  if (includePartStream) {
    if (scope.part) q = q.eq("part", scope.part);
    if (scope.stream) q = q.eq("stream", scope.stream);
  }
  return q;
}

export async function fetchLatestPaperYear(
  scope: QuestionScope
): Promise<number | null> {
  const supabase = createAdminClient();
  let query = supabase
    .from("papers")
    .select("year")
    .order("year", { ascending: false })
    .limit(1);

  query = applyPaperScope(query, scope, { includePartStream: false });

  const { data, error } = await query.maybeSingle();
  if (error || !data) return null;
  return data.year ?? null;
}

export async function resolveYearWindow(
  scope: QuestionScope,
  targetYear: number,
  yearRange: number
): Promise<YearWindow> {
  const latestDataYear = await fetchLatestPaperYear(scope);
  return getYearWindow(targetYear, yearRange, latestDataYear);
}

export async function fetchQuestionsForScope(
  scope: QuestionScope,
  targetYear: number,
  yearRange: number
): Promise<{ questions: QuestionRow[]; window: YearWindow }> {
  const window = await resolveYearWindow(scope, targetYear, yearRange);
  const questions = await loadScopedQuestions(scope, window);
  return { questions, window };
}

export async function fetchQuestions(
  scope: QuestionScope,
  yearRange: number,
  targetYear: number
): Promise<QuestionRow[]> {
  const { questions } = await fetchQuestionsForScope(
    scope,
    targetYear,
    yearRange
  );
  return questions;
}

export async function countQuestions(
  scope: QuestionScope,
  yearRange: number,
  targetYear: number
): Promise<number> {
  const { questions } = await fetchQuestionsForScope(
    scope,
    targetYear,
    yearRange
  );
  return questions.length;
}

export async function fetchCachedPredictions(
  scope: QuestionScope,
  targetYear: number,
  yearRange: number
): Promise<PredictionRow[]> {
  const supabase = createAdminClient();
  const sevenDaysAgo = new Date(
    Date.now() - 7 * 24 * 60 * 60 * 1000
  ).toISOString();
  const subjectIds = uniqueIds(scope.subjectId, ...(scope.subjectIds ?? []));
  const boardIds = uniqueIds(scope.boardId, ...(scope.boardIds ?? []));

  async function runScoped(
    includeExamFields: boolean,
    includeYearRange: boolean
  ) {
    let query = supabase
      .from("predictions")
      .select("*")
      .in("board_id", boardIds)
      .in("subject_id", subjectIds)
      .eq("target_year", targetYear)
      .gte("created_at", sevenDaysAgo);

    if (includeYearRange) {
      query = query.eq("year_range", yearRange);
    }

    if (includeExamFields) {
      query = query.eq("exam_type", scope.examType);
      if (scope.part) query = query.eq("part", scope.part);
      if (scope.stream) query = query.eq("stream", scope.stream);
    }

    return query.order("probability_score", { ascending: false });
  }

  let { data, error } = await runScoped(true, true);
  if (error?.message?.includes("year_range")) {
    ({ data, error } = await runScoped(true, false));
  }
  if (error?.message?.includes("column")) {
    ({ data, error } = await runScoped(false, true));
    if (error?.message?.includes("year_range")) {
      ({ data, error } = await runScoped(false, false));
    }
  }
  if (error) throw error;

  const rows = (data ?? []) as PredictionRow[];
  if (rows.length > 0) return rows;

  // Relaxed lookup when scoped columns or legacy subject rows differ.
  const { data: relaxed, error: relaxedError } = await supabase
    .from("predictions")
    .select("*")
    .in("board_id", boardIds)
    .in("subject_id", subjectIds)
    .eq("target_year", targetYear)
    .gte("created_at", sevenDaysAgo)
    .order("probability_score", { ascending: false });

  if (relaxedError) throw relaxedError;
  return (relaxed ?? []) as PredictionRow[];
}

type PredictionInsert = Omit<
  PredictionRow,
  "id" | "model_answer" | "model_answer_generated_at" | "created_at"
> & {
  year_range?: number | null;
};

export function formatDbError(err: unknown): string {
  if (err instanceof Error && err.message) return err.message;
  if (err && typeof err === "object" && "message" in err) {
    const msg = String((err as { message?: string }).message ?? "");
    const hint =
      "hint" in err ? String((err as { hint?: string }).hint ?? "") : "";
    const code =
      "code" in err ? String((err as { code?: string }).code ?? "") : "";
    if (msg) return hint ? `${msg} (${hint})` : msg;
    if (hint) return hint;
    if (code) return `Database error ${code}`;
  }
  return "Unknown database error";
}

function toInsertRow(
  row: PredictionInsert,
  useSyllabusFlagged = false,
  includeYearRange = true
) {
  const flagged = row.is_syllabus_flagged;
  return {
    exam_type: row.exam_type,
    part: row.part,
    stream: row.stream,
    subject_id: row.subject_id,
    board_id: row.board_id,
    target_year: row.target_year,
    ...(includeYearRange && row.year_range != null
      ? { year_range: row.year_range }
      : {}),
    question_text: row.question_text,
    chapter_name: row.chapter_name,
    chapter_number: row.chapter_number,
    question_type: row.question_type,
    probability_score: row.probability_score,
    frequency_count: row.frequency_count,
    total_years: row.total_years,
    years_appeared: row.years_appeared,
    last_appeared_year: row.last_appeared_year,
    trend: row.trend,
    ...(useSyllabusFlagged
      ? { syllabus_flagged: flagged }
      : { is_syllabus_flagged: flagged }),
    marks: row.marks,
  };
}

export async function savePredictions(
  rows: PredictionInsert[]
): Promise<PredictionRow[]> {
  const supabase = createAdminClient();
  const payload = rows.map((r) => toInsertRow(r, false, true));

  let { data, error } = await supabase.from("predictions").insert(payload).select("*");

  if (error?.message?.includes("year_range")) {
    const noRangePayload = rows.map((r) => toInsertRow(r, false, false));
    ({ data, error } = await supabase
      .from("predictions")
      .insert(noRangePayload)
      .select("*"));
  }

  if (error?.message?.includes("syllabus_flagged")) {
    const altPayload = rows.map((r) => toInsertRow(r, true));
    ({ data, error } = await supabase
      .from("predictions")
      .insert(altPayload)
      .select("*"));
  }

  if (error?.message?.includes("column")) {
    const minimal = rows.map((r) => ({
      subject_id: r.subject_id,
      board_id: r.board_id,
      target_year: r.target_year,
      question_text: r.question_text,
      chapter_name: r.chapter_name,
      chapter_number: r.chapter_number,
      question_type: r.question_type,
      probability_score: r.probability_score,
      frequency_count: r.frequency_count,
      years_appeared: r.years_appeared,
      last_appeared_year: r.last_appeared_year,
      trend: r.trend,
      is_syllabus_flagged: r.is_syllabus_flagged,
      marks: r.marks,
    }));
    ({ data, error } = await supabase.from("predictions").insert(minimal).select("*"));
    if (error?.message?.includes("is_syllabus_flagged")) {
      const altMinimal = rows.map((r) => ({
        subject_id: r.subject_id,
        board_id: r.board_id,
        target_year: r.target_year,
        question_text: r.question_text,
        chapter_name: r.chapter_name,
        chapter_number: r.chapter_number,
        question_type: r.question_type,
        probability_score: r.probability_score,
        frequency_count: r.frequency_count,
        years_appeared: r.years_appeared,
        last_appeared_year: r.last_appeared_year,
        trend: r.trend,
        syllabus_flagged: r.is_syllabus_flagged,
        marks: r.marks,
      }));
      ({ data, error } = await supabase
        .from("predictions")
        .insert(altMinimal)
        .select("*"));
    }
  }

  if (error) throw error;
  return (data ?? []) as PredictionRow[];
}

export async function fetchPredictionById(
  id: string
): Promise<PredictionRow | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("predictions")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data as PredictionRow | null;
}

export async function updatePredictionModelAnswer(
  id: string,
  modelAnswer: string
): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("predictions")
    .update({
      model_answer: modelAnswer,
      model_answer_generated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) throw error;
}

export async function countPapers(
  scope: QuestionScope,
  minYear: number,
  maxYear: number
): Promise<number> {
  const supabase = createAdminClient();
  let query = supabase
    .from("papers")
    .select("*", { count: "exact", head: true })
    .gte("year", minYear)
    .lte("year", maxYear);

  query = applyPaperScope(query, scope, { includePartStream: false });

  const { count, error } = await query;

  if (error) return 0;
  return count ?? 0;
}

export async function fetchSubjectName(
  subjectId: string
): Promise<string> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("subjects")
    .select("name")
    .eq("id", subjectId)
    .maybeSingle();

  return data?.name ?? "Unknown subject";
}
