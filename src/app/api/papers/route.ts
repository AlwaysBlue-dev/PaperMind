import { NextResponse } from "next/server";
import { FALLBACK_PAPERS } from "@/lib/data/fallback-papers";
import { createAdminClient } from "@/lib/supabase/admin";
import { firstRelation } from "@/lib/supabase/relation";
import type { ExamPart, ExamStream, ExamType } from "@/lib/types/predict";
import type { Paper, PapersResponse } from "@/lib/types/papers";

const PAGE_SIZE = 20;
const VALID_EXAMS: ExamType[] = ["matric", "fsc", "css", "mdcat"];

type RelationRef = { id: string; name: string };

type RawPaperRow = {
  id: string;
  board_id: string;
  subject_id: string;
  year: number;
  exam_type: ExamType;
  part: string | null;
  stream: string | null;
  class_level: string | null;
  question_count: number | null;
  pdf_path: string | null;
  boards: RelationRef | RelationRef[] | null;
  subjects: RelationRef | RelationRef[] | null;
};

type PaperRow = Omit<RawPaperRow, "boards" | "subjects"> & {
  boards: RelationRef | null;
  subjects: RelationRef | null;
};

function normalizePaperRow(row: RawPaperRow): PaperRow {
  return {
    ...row,
    boards: firstRelation(row.boards),
    subjects: firstRelation(row.subjects),
  };
}

async function getSignedUrl(path: string): Promise<string | null> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase.storage
      .from("papers")
      .createSignedUrl(path, 3600);
    if (error) return null;
    return data.signedUrl;
  } catch {
    return null;
  }
}

function mapRow(row: PaperRow, downloadUrl: string | null): Paper {
  return {
    id: row.id,
    boardId: row.board_id,
    boardName: row.boards?.name ?? "Unknown board",
    subjectId: row.subject_id,
    subjectName: row.subjects?.name ?? "Unknown subject",
    examType: row.exam_type,
    part: row.part as ExamPart | null,
    stream: row.stream as ExamStream | null,
    classLevel: row.class_level ?? "—",
    year: row.year,
    questionCount: row.question_count ?? 0,
    pdfPath: row.pdf_path,
    downloadUrl,
  };
}

function filterFallback(
  examType: string | null,
  boardId: string | null,
  subjectId: string | null,
  year: string | null
): Paper[] {
  return FALLBACK_PAPERS.filter((p) => {
    if (examType && examType !== "all" && p.examType !== examType) return false;
    if (boardId && boardId !== "all" && p.boardId !== boardId) return false;
    if (subjectId && subjectId !== "all" && p.subjectId !== subjectId) return false;
    if (year && year !== "all" && p.year !== parseInt(year, 10)) return false;
    return true;
  });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const examType = searchParams.get("examType");
  const boardId = searchParams.get("boardId");
  const subjectId = searchParams.get("subjectId");
  const year = searchParams.get("year");
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));

  if (process.env.SUPABASE_SERVICE_KEY) {
    try {
      const supabase = createAdminClient();
      let query = supabase
        .from("papers")
        .select(
          `
          id, board_id, subject_id, year, exam_type, part, stream, class_level, question_count, pdf_path,
          boards ( id, name ),
          subjects ( id, name )
        `,
          { count: "exact" }
        )
        .order("year", { ascending: false });

      if (examType && examType !== "all" && VALID_EXAMS.includes(examType as ExamType)) {
        query = query.eq("exam_type", examType);
      }
      if (boardId && boardId !== "all") query = query.eq("board_id", boardId);
      if (subjectId && subjectId !== "all") query = query.eq("subject_id", subjectId);
      if (year && year !== "all") query = query.eq("year", parseInt(year, 10));

      const from = (page - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (!error && data && data.length > 0) {
        const papers = await Promise.all(
          (data as unknown as RawPaperRow[]).map(async (raw) => {
            const row = normalizePaperRow(raw);
            const downloadUrl = row.pdf_path
              ? await getSignedUrl(row.pdf_path)
              : null;
            return mapRow(row, downloadUrl);
          })
        );

        const total = count ?? papers.length;
        const response: PapersResponse = {
          papers,
          total,
          page,
          hasMore: from + papers.length < total,
        };
        return NextResponse.json(response);
      }
    } catch {
      // fall through
    }
  }

  const filtered = filterFallback(examType, boardId, subjectId, year);
  const from = (page - 1) * PAGE_SIZE;
  const slice = filtered.slice(from, from + PAGE_SIZE);

  const response: PapersResponse = {
    papers: slice,
    total: filtered.length,
    page,
    hasMore: from + slice.length < filtered.length,
  };

  return NextResponse.json(response);
}
