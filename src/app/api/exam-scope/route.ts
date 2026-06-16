import { NextResponse } from "next/server";
import {
  FALLBACK_PARTS,
  fallbackPartsFor,
  fallbackStreamsFor,
  partLabel,
  streamLabel,
} from "@/lib/data/exam-scope";
import { parseExamPartParam } from "@/lib/exam-params";
import { isUuid, resolveBoardId } from "@/lib/prediction/resolve-ids";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ExamPart, ExamStream, ExamType } from "@/lib/types/predict";

const VALID_EXAMS: ExamType[] = ["matric", "fsc", "css", "mdcat"];
const VALID_STREAMS: ExamStream[] = [
  "pre_engineering",
  "pre_medical",
  "commerce",
  "arts",
  "computer_science",
  "biology",
];

function toPartOption(id: ExamPart) {
  return { id, label: partLabel(id) };
}

function toStreamOption(id: ExamStream) {
  return { id, label: streamLabel(id) };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const examType = searchParams.get("examType") as ExamType | null;
  const boardIdParam = searchParams.get("boardId");
  const part = parseExamPartParam(searchParams.get("part"));

  if (!examType || !VALID_EXAMS.includes(examType)) {
    return NextResponse.json(
      { error: "examType is required (matric, fsc, css, mdcat)" },
      { status: 400 }
    );
  }

  if (examType !== "matric" && examType !== "fsc") {
    return NextResponse.json({ parts: [], streams: [] });
  }

  let parts: ExamPart[] = fallbackPartsFor(examType);
  let streams: ExamStream[] = part ? fallbackStreamsFor(examType, part) : [];

  if (process.env.SUPABASE_SERVICE_KEY && boardIdParam) {
    try {
      const boardId = isUuid(boardIdParam)
        ? boardIdParam
        : await resolveBoardId(boardIdParam);

      const supabase = createAdminClient();

      const { data: partRows, error: partErr } = await supabase
        .from("subjects")
        .select("part")
        .eq("exam_type", examType)
        .eq("board_id", boardId)
        .not("part", "is", null);

      if (!partErr && partRows?.length) {
        const distinct = [
          ...new Set(
            partRows
              .map((r) => r.part as ExamPart)
              .filter((p) => p === "part1" || p === "part2")
          ),
        ].sort();
        if (distinct.length) parts = distinct;
      }

      if (part) {
        const { data: streamRows, error: streamErr } = await supabase
          .from("subjects")
          .select("stream")
          .eq("exam_type", examType)
          .eq("board_id", boardId)
          .eq("part", part)
          .not("stream", "is", null);

        if (!streamErr && streamRows?.length) {
          const distinct = [
            ...new Set(
              streamRows
                .map((r) => r.stream as string)
                .filter((s): s is ExamStream =>
                  VALID_STREAMS.includes(s as ExamStream)
                )
            ),
          ];
          if (distinct.length) streams = distinct;
        }
      }
    } catch {
      // use fallback
    }
  }

  if (!parts.length) parts = [...FALLBACK_PARTS];

  if (part && !streams.length) {
    streams = fallbackStreamsFor(examType, part);
  }

  return NextResponse.json({
    parts: parts.map(toPartOption),
    streams: streams.map(toStreamOption),
  });
}
