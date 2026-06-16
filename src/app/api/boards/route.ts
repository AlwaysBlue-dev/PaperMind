import { NextResponse } from "next/server";
import { filterFallbackBoards } from "@/lib/data/fallback-boards";
import { parseExamPartParam, parseExamStreamParam } from "@/lib/exam-params";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Board, ExamType } from "@/lib/types/predict";

const VALID_EXAMS: ExamType[] = ["matric", "fsc", "css", "mdcat"];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const examType = searchParams.get("examType") as ExamType | null;
  const part = parseExamPartParam(searchParams.get("part"));
  const stream = parseExamStreamParam(searchParams.get("stream"));

  if (!examType || !VALID_EXAMS.includes(examType)) {
    return NextResponse.json(
      { error: "examType is required (matric, fsc, css, mdcat)" },
      { status: 400 }
    );
  }

  if (examType === "mdcat") {
    return NextResponse.json([]);
  }

  if (process.env.SUPABASE_SERVICE_KEY) {
    try {
      const supabase = createAdminClient();
      const { data, error } = await supabase
        .from("boards")
        .select("id, name, exam_type, is_active")
        .eq("exam_type", examType)
        .order("name");

      if (!error && data && data.length > 0) {
        return NextResponse.json(data as Board[]);
      }
    } catch {
      // fall through to fallback
    }
  }

  const boards = filterFallbackBoards({ examType, part, stream });

  return NextResponse.json(boards);
}
