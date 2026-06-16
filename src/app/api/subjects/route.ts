import { NextResponse } from "next/server";
import { filterFallbackSubjects } from "@/lib/data/fallback-subjects";
import { parseExamPartParam, parseExamStreamParam } from "@/lib/exam-params";
import { isUuid, resolveBoardId } from "@/lib/prediction/resolve-ids";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ExamType, Subject } from "@/lib/types/predict";

const VALID_EXAMS: ExamType[] = ["matric", "fsc", "css", "mdcat"];

type SubjectRow = {
  id: string;
  name: string;
  exam_type: ExamType;
  board_id?: string | null;
  class_level?: string | null;
  part?: Subject["part"];
  stream?: Subject["stream"];
  is_active?: boolean | null;
};

function mapSubjectRow(
  row: SubjectRow,
  defaults: { boardId: string; part: Subject["part"]; stream: Subject["stream"] }
): Subject {
  return {
    id: row.id,
    name: row.name,
    board_id: row.board_id ?? defaults.boardId,
    exam_type: row.exam_type,
    part: row.part ?? defaults.part ?? null,
    stream: row.stream ?? defaults.stream ?? null,
    is_active: row.is_active ?? undefined,
  };
}

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
          const rows = data as unknown as SubjectRow[];
          return NextResponse.json(
            rows.map((row) =>
              mapSubjectRow(row, { boardId: "", part: null, stream: null })
            )
          );
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
        const rows = data as unknown as SubjectRow[];
        return NextResponse.json(
          rows.map((row) =>
            mapSubjectRow(row, { boardId, part, stream })
          )
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
