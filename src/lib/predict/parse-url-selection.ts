import {
  LAUNCH_DEFAULTS,
  parseExamPart,
  parseExamStream,
} from "@/components/predict/constants";
import type { ExamPart, ExamStream, ExamType } from "@/lib/types/predict";

const VALID_EXAMS: ExamType[] = ["matric", "fsc", "css", "mdcat"];

function isExamType(v: string | null): v is ExamType {
  return !!v && VALID_EXAMS.includes(v as ExamType);
}

export type UrlSelection = {
  examType: ExamType;
  boardId: string;
  part: ExamPart;
  stream: ExamStream;
  subjectId: string | null;
};

export function parseUrlSelection(searchParams: URLSearchParams): UrlSelection {
  const examParam = searchParams.get("examType");
  return {
    examType: isExamType(examParam) ? examParam : LAUNCH_DEFAULTS.examType,
    boardId: searchParams.get("boardId") ?? LAUNCH_DEFAULTS.boardId,
    part: parseExamPart(searchParams.get("part")) ?? LAUNCH_DEFAULTS.part,
    stream:
      parseExamStream(searchParams.get("stream")) ?? LAUNCH_DEFAULTS.stream,
    subjectId: searchParams.get("subjectId"),
  };
}
