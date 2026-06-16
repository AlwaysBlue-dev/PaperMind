import { createAdminClient } from "@/lib/supabase/admin";
import { formatDbError } from "@/lib/prediction/db";
import type { QuestionScope } from "@/lib/prediction/db";
import type { QuestionRow } from "@/lib/prediction/db";
import {
  filterByYearRange,
  type YearWindow,
} from "@/lib/prediction/year-window";

type PaperRef = {
  id: string;
  board_id: string;
  subject_id: string;
  year: number;
};

type RawQuestion = {
  id: string;
  paper_id: string | null;
  board_id?: string | null;
  subject_id?: string | null;
  year?: number | null;
  question_text: string;
  chapter_name: string | null;
  chapter_number: number | null;
  question_type: string;
  marks: number | null;
  is_syllabus_flagged?: boolean | null;
  syllabus_flagged?: boolean | null;
};

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

function normalizeQuestionType(raw: string): "mcq" | "short" | "long" | null {
  const normalized = raw.trim().toLowerCase();
  if (normalized === "mcq" || normalized === "multiple_choice") return "mcq";
  if (normalized === "short" || normalized === "short_question") return "short";
  if (normalized === "long" || normalized === "long_question") return "long";
  return null;
}

function mapQuestionRow(q: RawQuestion, paper?: PaperRef): QuestionRow | null {
  const boardId = q.board_id ?? paper?.board_id;
  const subjectId = q.subject_id ?? paper?.subject_id;
  const year = q.year ?? paper?.year;

  if (!boardId || !subjectId || year == null) return null;
  if (!q.question_text?.trim()) return null;

  const qType = normalizeQuestionType(q.question_type);
  if (!qType) return null;

  return {
    id: q.id,
    board_id: boardId,
    subject_id: subjectId,
    question_text: q.question_text,
    chapter_name: q.chapter_name?.trim() || "General",
    chapter_number: q.chapter_number ?? 0,
    question_type: qType,
    year,
    marks: q.marks,
    is_syllabus_flagged: Boolean(
      q.is_syllabus_flagged ?? q.syllabus_flagged ?? false
    ),
    paper_id: q.paper_id,
  };
}

function applyScopeFilters<
  T extends {
    eq: (col: string, val: string) => T;
    in: (col: string, vals: string[]) => T;
    gte: (col: string, val: number) => T;
    lte: (col: string, val: number) => T;
  },
>(
  query: T,
  scope: QuestionScope,
  minYear: number,
  maxYear: number,
  opts?: { includePartStream?: boolean }
): T {
  const includePartStream = opts?.includePartStream !== false;
  let q = applyIdFilter(
    applyIdFilter(query, "board_id", scope.boardId, scope.boardIds),
    "subject_id",
    scope.subjectId,
    scope.subjectIds
  )
    .gte("year", minYear)
    .lte("year", maxYear);

  if (includePartStream) {
    if (scope.part) q = q.eq("part", scope.part);
    if (scope.stream) q = q.eq("stream", scope.stream);
  }

  return q;
}

async function loadPapers(
  scope: QuestionScope,
  minYear: number,
  maxYear: number,
  includePartStream: boolean
): Promise<PaperRef[]> {
  const supabase = createAdminClient();

  let query = supabase
    .from("papers")
    .select("id, board_id, subject_id, year");

  query = applyScopeFilters(query, scope, minYear, maxYear, {
    includePartStream,
  });

  const { data, error } = await query;

  if (error) {
    if (error.message?.includes("column")) {
      if (includePartStream) {
        return loadPapers(scope, minYear, maxYear, false);
      }
      const { data: fallback, error: err2 } = await supabase
        .from("papers")
        .select("id, board_id, subject_id, year")
        .gte("year", minYear)
        .lte("year", maxYear);
      if (err2) throw err2;
      return filterPapersByScope((fallback ?? []) as PaperRef[], scope);
    }
    throw error;
  }

  return (data ?? []) as PaperRef[];
}

function filterPapersByScope(
  papers: PaperRef[],
  scope: QuestionScope
): PaperRef[] {
  const boardIds = uniqueIds(scope.boardId, ...(scope.boardIds ?? []));
  const subjectIds = uniqueIds(scope.subjectId, ...(scope.subjectIds ?? []));
  return papers.filter(
    (p) =>
      boardIds.includes(p.board_id) && subjectIds.includes(p.subject_id)
  );
}

async function resolvePapers(
  scope: QuestionScope,
  minYear: number,
  maxYear: number
): Promise<PaperRef[]> {
  let papers = await loadPapers(scope, minYear, maxYear, true);
  if (papers.length === 0 && (scope.part || scope.stream)) {
    papers = await loadPapers(scope, minYear, maxYear, false);
  }
  return papers;
}

async function loadViaPapers(
  scope: QuestionScope,
  minYear: number,
  maxYear: number
): Promise<QuestionRow[]> {
  const papers = await resolvePapers(scope, minYear, maxYear);
  if (papers.length === 0) return [];

  const paperMap = new Map(papers.map((p) => [p.id, p]));
  const paperIds = papers.map((p) => p.id);
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("questions")
    .select(
      "id, paper_id, board_id, subject_id, year, question_text, chapter_name, chapter_number, question_type, marks, is_syllabus_flagged"
    )
    .in("paper_id", paperIds);

  if (error) {
    if (error.message?.includes("column")) {
      const { data: fallback, error: err2 } = await supabase
        .from("questions")
        .select(
          "id, paper_id, question_text, chapter_name, chapter_number, question_type, marks"
        )
        .in("paper_id", paperIds);
      if (err2) throw err2;
      return (fallback ?? [])
        .map((q) =>
          mapQuestionRow(
            q as RawQuestion,
            q.paper_id ? paperMap.get(q.paper_id) : undefined
          )
        )
        .filter((q): q is QuestionRow => q !== null);
    }
    throw error;
  }

  return (data ?? [])
    .map((q) =>
      mapQuestionRow(
        q as RawQuestion,
        q.paper_id ? paperMap.get(q.paper_id) : undefined
      )
    )
    .filter((q): q is QuestionRow => q !== null);
}

async function loadDirect(
  scope: QuestionScope,
  minYear: number,
  maxYear: number,
  includePartStream: boolean,
  includeExamType = true
): Promise<QuestionRow[]> {
  const supabase = createAdminClient();

  let query = supabase.from("questions").select(
    "id, subject_id, board_id, question_text, chapter_name, chapter_number, question_type, year, marks, is_syllabus_flagged, paper_id"
  );

  if (includeExamType) {
    query = query.eq("exam_type", scope.examType);
  }
  query = applyScopeFilters(query, scope, minYear, maxYear, {
    includePartStream,
  });

  const { data, error } = await query;

  if (error) throw error;

  return (data ?? [])
    .map((q) => mapQuestionRow(q as RawQuestion))
    .filter((q): q is QuestionRow => q !== null);
}

async function loadQuestionsRelaxed(
  scope: QuestionScope,
  minYear: number,
  maxYear: number
): Promise<QuestionRow[]> {
  try {
    let rows = await loadDirect(scope, minYear, maxYear, false, false);
    if (rows.length > 0) return rows;
    rows = await loadDirect(scope, minYear, maxYear, true, false);
    return rows;
  } catch (err) {
    const msg = formatDbError(err);
    if (
      msg.includes("column") ||
      msg.includes("exam_type") ||
      msg.includes("42703")
    ) {
      return [];
    }
    throw err;
  }
}

export async function loadScopedQuestions(
  scope: QuestionScope,
  window: YearWindow
): Promise<QuestionRow[]> {
  const { minYear, maxYear } = window;

  let rows: QuestionRow[] = [];

  try {
    let direct = await loadDirect(scope, minYear, maxYear, true);
    if (direct.length === 0 && (scope.part || scope.stream)) {
      direct = await loadDirect(scope, minYear, maxYear, false);
    }
    if (direct.length > 0) rows = direct;
  } catch (err) {
    const msg = formatDbError(err);
    if (
      !msg.includes("column") &&
      !msg.includes("exam_type") &&
      !msg.includes("42703")
    ) {
      throw err;
    }
  }

  if (rows.length === 0) {
    rows = await loadViaPapers(scope, minYear, maxYear);
  }
  if (rows.length === 0) {
    rows = await loadQuestionsRelaxed(scope, minYear, maxYear);
  }

  return filterByYearRange(rows, minYear, maxYear);
}
