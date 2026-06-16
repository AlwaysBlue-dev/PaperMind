import { NextResponse } from "next/server";
import { filterFallbackSubjects } from "@/lib/data/fallback-subjects";
import { parseExamPartParam, parseExamStreamParam } from "@/lib/exam-params";
import { isUuid, resolveBoardId } from "@/lib/prediction/resolve-ids";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ExamType, Subject } from "@/lib/types/predict";

const VALID_EXAMS: ExamType[] = ["matric", "fsc", "css", "mdcat"];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const examType = searchParams.get("examType") as ExamType | null;
  const boardIdParam = searchParams.get("boardId");
  const part = parseExamPartParam(searchParams.get("part"));
  const stream = parseExamStreamParam(searchParams.get("stream"));

  if (!examType || !VALID_EXAMS.includes(examType)) {
    return NextResponse.json(
      { error: "examType is required (matric, fsc, css, mdcat)" },
      { status: 400 }
    );
  }

  if (!boardIdParam && examType !== "mdcat") {
    return NextResponse.json(
      { error: "boardId is required" },
      { status: 400 }
    );
  }

  if (process.env.SUPABASE_SERVICE_KEY) {
    try {
      const supabase = createAdminClient();

      if (examType === "mdcat") {
        const { data, error } = await supabase
          .from("subjects")
          .select("id, name, exam_type, class_level, part, stream, is_active")
          .eq("exam_type", "mdcat")
          .is("board_id", null)
          .order("name");

        if (!error && data && data.length > 0) {
          return NextResponse.json(data as Subject[]);
        }
      } else if (boardIdParam) {
      const boardId = isUuid(boardIdParam)
        ? boardIdParam
        : await resolveBoardId(boardIdParam);

      async function queryScoped(includeScopeCols: boolean) {
        let q = supabase
          .from("subjects")
          .select(
            includeScopeCols
              ? "id, name, board_id, exam_type, part, stream, is_active"
              : "id, name, exam_type, class_level, is_active"
          )
          .eq("exam_type", examType)
          .order("name");

        if (includeScopeCols) {
          q = q.eq("board_id", boardId);
          if (part) q = q.eq("part", part);
          if (stream) q = q.eq("stream", stream);
        }

        return q;
      }

      let { data, error } = await queryScoped(true);
      if (error?.message?.includes("column")) {
        ({ data, error } = await queryScoped(false));
      }

      if (!error && data && data.length > 0) {
        return NextResponse.json(
          data.map((row) => ({
            ...row,
            board_id: (row as Subject).board_id ?? boardId,
            part: (row as Subject).part ?? part,
            stream: (row as Subject).stream ?? stream,
            is_active: (row as Subject).is_active,
          })) as Subject[]
        );
      }
      }
    } catch {
      // fall through to fallback
    }
  }

  return NextResponse.json(
    filterFallbackSubjects({ examType, boardId: boardIdParam, part, stream })
  );
}
